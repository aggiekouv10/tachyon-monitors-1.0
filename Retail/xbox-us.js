const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.XBOXUS2);
const CHANNEL = discordBot.channels.XBOXUS2;
const helper = require('../helper');
const DATABASE_TABLE = 'xboxus1';
const { v4 } = require('uuid');
let totalData = 0;

let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[XBOX] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    let pluses = ''
    let random = Math.floor(Math.random() * 50)
    for (let i = 0; i < random; i++) {
        pluses += '-'
    }
    for (let i = 0; i < random; i++) {
        pluses += '_'
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://inv.mp.microsoft.com/v2.0/inventory/US/${sku + pluses}`, {
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let status = productCache.status
        let stock = body.availableLots['0001-01-01T00:00:00.0000000Z']['9000000013'].inStock.toString().trim()
        let stock1 = body.availableLots['0001-01-01T00:00:00.0000000Z']['9000000012'].inStock.toString().trim()
        if (body.availableLots)
            if (stock === 'True' || stock1 === 'True') {
                let id = body.productId
                const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${id}&market=US&languages=en-US&MS-CV=DGU1mcuYo0`, {
                    'headers': {
                        'User-Agent': randomUseragent.getRandom(),
                    },
                    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
                }).then(async response => {
        clearTimeout(timeoutId)
                    let body2 = await response.text();
                    body2 = JSON.parse(body2);
                    status = productCache.status
                    let title = body2.Products[0].LocalizedProperties[0].ProductTitle
                    let image = body2.Products[0].DisplaySkuAvailabilities[0].Sku.LocalizedProperties[0].Images[0].Uri
                    let price = body2.Products[0].DisplaySkuAvailabilities[0].Availabilities[0].OrderManagementData.Price.ListPrice + ' USD'
                    let url = `https://www.xbox.com/en-us/configure/${id}`
                    if (id === '90Z8K1DBJ8ZD') {
                        url = 'https://www.xbox.com/en-us/accessories/controllers/elite-wireless-controller-series-2-halo-infinite'
                    }
                    if (status !== "In-Stock") {
                        await postRestockWebhook(url, title, id, price, image);
                        console.log(`[XBOX-2] In Stock! ${sku}`)
                        PRODUCTS[sku].status = 'In-Stock'
                        database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    }
                })
            } else {
                if (status !== "Out-of-Stock") {
                    console.log(`[XBOX-2] OOS! ${sku}`)
                    PRODUCTS[sku].status = 'Out-of-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                }
            }
        await helper.sleep(productCache.waittime);
        monitor(sku);

    }).catch(async err => {
        console.log("***********XBOX-2-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });

}

async function postRestockWebhook(url, title, id, price, image) {
    let checkout = url
    let cart = url
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.xbox.com', '', 'https://www.xbox.com')
        .addField("**Sku**", id, true)
        .addField("**Price**", price, true)
        .addField("**Links**", '[Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Xbox US | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
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
                console.log("*********XBOX-2-SKU-ERROR*********");
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
            embed.setTitle(`XBOX-2 Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku} - ${row.waittime}ms`);
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