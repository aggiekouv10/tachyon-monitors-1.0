const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const AbortController = require('abort-controller');

const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.TOYSRUSCA);
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/902319495379570700/Nh64P0Yzyxq3KPn3-oumxW0cJFbilCqz-9STIdSZ339srViwtex62jOS_M0VETFqQTay');
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904868817019224074/YAQSBlGXcmhI-RoEdMQb0ATudI4jkFHDH0cgv4YiJIW8KVPdOjdy2UL5rFrwN1RNg0d-');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/904819935610560522/7Ag9IW84znJNvziPzdOjhiENkB1JF_-rSJAYQkJapHNBBKRpEW6z3xmc6mbyMrGaAKeE')
const fakhook = new webhook.Webhook('https://discord.com/api/webhooks/909994220134207539/ct3oPo-qWYycCOSOfsaSivYQCNszP9Cu9aZ5K3Cd3VF0dRCf9G66iaZJGSYZoUU9sq_n')
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912567321720135730/myqqINFtHH83fH5nFVkPbwio5dYx1W9mBtHS0IjDAKje_oTlaryIBCSwKihhOCydr6Ju')
const CHANNEL = discordBot.channels.TOYSRUSCA;
const helper = require('../helper');
const DATABASE_TABLE = 'toysrusca';
const SITENAME = 'TOYSRUSCA'
let stats;
const { v4 } = require('uuid');
let totalData = 0;

let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    stats = await helper.manageStats(SITENAME)
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
    console.log('[TOYSRUS-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let url = `https://www.toysrus.ca/en/tachyon/${sku}.html`;
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    stats.total++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.toysrus.ca/en/product-variation?pid=${sku}&quantity=1&mobile=true&abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        stats.success++;
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let status = productCache.status
        if (body.product) {
            if (body.product.availability.ats > 0) {
                let title = body.product.productName
                let price = body.product.price.sales.formatted
                let image = body.product.images.large[0].url
                let stock = body.product.availability.ats + '+'

                if (status !== "In-Stock") {
                    postRestockWebhook(url, title, sku, price, image, stock);
                    console.log(`[TOYSRUS-CA] In Stock! ${sku}`)
                    PRODUCTS[sku].status = 'In-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                }
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[TOYSRUS-CA] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********TOYSRUS-CA-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, stock) {
    let checkout = `https://www.toysrus.ca/en/checkout-login`
    let cart = 'https://www.toysrus.ca/en/cart'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.toysrus.ca', '', 'https://www.toysrus.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Links**", '[Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Toysrus CA | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    prestonhook.send(webhookMessage);
    bandithook.send(webhookMessage);
    archook.send(webhookMessage);
    fakhook.send(webhookMessage);
    spacehook.send(webhookMessage);
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
                console.log("*********SAMSCLUB-SKU-ERROR*********");
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
            embed.setTitle(`SAMSCLUB Monitor`);
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