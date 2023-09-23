const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const got = require('got')
const { firefox } = require('playwright');
const HTTPSProxyAgent = require('https-proxy-agent')
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');

const { v4 } = require('uuid');
const { default: axios } = require('axios');
const helper = require('../helper');

const DistributeManager = require('../Webhook-Manager/manager')
const SITENAME = 'CORSAIR'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'corsair';
let PRODUCTS = {}
let stats;
// ^^ THESE

const archook = new webhook.Webhook('https://discord.com/api/webhooks/917276646220898314/EJYXmrqQxNrF5oLHUzFTGeiEAErz2f_Kfdvvyktqf08Qn0u7N5cihKgEsQkM2tUtoAr1')

const distributor = new DistributeManager(SITENAME); //this

startMonitoring();
async function startMonitoring() {
    await distributor.connect() //this
    stats = await helper.manageStats(SITENAME) //this

    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status,
            lastMonitor: 0
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
        // break;
    }
    console.log('[CORSAIR] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    let credentials = proxy.split("@")[0].replace("http://", "").split(":")
    let server = proxy.split("@")[1]
    const browser = await firefox.launch({
        headless: true,
        proxy: {
            server: `http://${server}`,
            username: credentials[0],
            password: credentials[1]
        },
        userAgent: randomUseragent.getRandom()
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`https://www.corsair.com/us/en/p/json/${sku}`, { waitUntil: 'networkidle' });
    let body = await page.textContent('pre')
    body = JSON.parse(body.trim());
    let status = productCache.status
    stats.success++
    if (body.stock.stockLevel > 0) {
        let url = `https://www.corsair.com/us/en/Categories/Products/tachyon/p/${sku}`
        let stock = body.stock.stockLevel
        let title = body.name
        let price = body.price.formattedValue
        let image = 'http://proxy.hawkaio.com/https://www.corsair.com' + body.images[0].url
        if (status !== "In-Stock") {
            postRestockWebhook(url, title, sku, price, image, stock);
            console.log(`[CORSAIR] In Stock! ${sku}`)
            PRODUCTS[sku].status = 'In-Stock'
            database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
        }
    } else {
        if (status !== "Out-of-Stock") {
            console.log(`[CORSAIR] OOS! ${sku}`)
            PRODUCTS[sku].status = 'Out-of-Stock'
            database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
        }
    }

    // console.log('Good', sku, Date.now()
    await helper.sleep(productCache.waittime);
    await page.close()
    monitor(sku);
}

async function postRestockWebhook(url, title, sku, price, image, stock) {

    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.corsair.com', '', 'https://www.corsair.com')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Corsair US | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    archook.send(webhookMessage);

}
discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }

    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
        let args = msg.content.split(" ");
        if (args.length !== 3) {
            discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
            return;
        }
        let sku = args[1];
        let waitTime = args[2];
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length > 0) {
            PRODUCTS[sku] = null
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCTS[sku] = {
            sku: sku,
            waittime: waitTime,
            status: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
        monitor(sku);
        // console.log("added " + sku)
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
        let splits = msg.content.split(" ")
        if (splits.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        let args = splits[1].split('\n');
        if (!args || args.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        // console.log(args)
        let waitTime = parseInt(args[0].trim());
        let skus = args.splice(1);
        let monitoringSKUs = [];
        let notMonitoringSKUs = [];
        let errorSKUs = [];
        let tempSKUs = [];
        for (let sku of skus) {
            if (!tempSKUs.includes(sku))
                tempSKUs.push(sku);
        }
        skus = tempSKUs;
        // console.log(skus);
        for (let sku of skus) {
            sku = sku.trim();
            // console.log(sku);
            try {
                if (sku === '')
                    continue;
                let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
                if (query.rows.length > 0) {
                    PRODUCTS[sku] = null
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCTS[sku] = {
                    sku: sku,
                    waittime: waitTime,
                    status: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********CORSAIR-SKU-ERROR*********");
                console.log("SKU: " + sku);
                console.log(err);
            }
        }
        // console.log(notMonitoringSKUs.length)
        const monitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('Now monitoring')
            .setDescription(monitoringSKUs.join('\n'))
        if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
        const notMonitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('NOW NOT monitoring')
            .setDescription(notMonitoringSKUs.join('\n'))
        if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
        const monitoringErrorMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('ERROR monitoring')
            .setDescription(errorSKUs.join('\n'))
        if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === CHANNEL) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`WALMART v2 Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku}`);
                }
                embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
        }
    }

});
module.exports = {
    totalData: function () {
        return totalData;
    }
}