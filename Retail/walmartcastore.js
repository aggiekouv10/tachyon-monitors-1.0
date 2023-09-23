const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const HTMLParser = require('node-html-parser');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTCASTORE);
const archook = new webhook.Webhook('https://discord.com/api/webhooks/902001019054075954/5PWu58Ulc1OZw6VIpGCQXju5RUCvxaa_n097YIjWAwNth3-wrwGzAq81QHOwq1B7SIjO');
const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/890927874935238666/KmGVyKa1KKfgtPs3zc0_WLwbkYshcMUmY4HNyRGblqz4Vc8vJP-CgaxqqoNTjpVN9EPu');
const CHANNEL = discordBot.channels.WALMARTCASTORE;
const helper = require('../helper');
const DATABASE_TABLE = 'walmartcastore';
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
        monitor(row.sku);
    }
    console.log('[WALMART-CA-STORE] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomCAResiProxy()
    let productCache = PRODUCTS[sku]
    let parse = sku.split(',')
    let rawsku = parse[0]
    let latitude = parse[1]
    let longitude = parse[2]
    let realsku = parse[3]
    let url = `https://www.walmart.ca/en/ip/tachyon/${realsku}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    if (!productCache)
        return;
    await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.walmart.ca/api/product-page/find-in-store?latitude=${latitude}&longitude=${longitude}&lang=en&upc=${rawsku}`, {
        'headers': {
            'authority': 'www.walmart.ca',
            'accept': 'application/json' ,
            'sec-ch-ua-mobile': '?0',
            'user-agent': randomUseragent.getRandom(),
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        
        console.log(response.status)
        if(response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 3000)
        body = await JSON.parse(body);
        let status = productCache.status
        console.log(body.info[0].availabilityStatus)
        if (body.info[0].availabilityStatus === 'AVAILABLE' || body.info[0].availabilityStatus === 'LIMITED') {
            let street = body.info[0].intersection
            let price = body.info[0].sellPrice + " CAD"
            let location = body.info[0].displayName
            let stock = body.info[0].availableToSellQty
            let title = 'PlayStation®5 console'
            let image = 'https://i5.walmartimages.ca/images/Large/283/923/6000202283923.jpg'
            if (status !== "In-Stock") {
                await postRestockWebhook(url, street, title, rawsku, price, location, stock, image, realsku);
                await MIKEpostRestockWebhook(url, street, title, rawsku, price, location, stock, image, realsku)
                console.log(`[WALMART-CA-STORE] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[WALMART-CA-STORE] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
    }).catch(async err => {
        console.log("***********WALMART-CA-STORE-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)

    }).catch(async err => {
        console.log("***********WALMART-CA-STORE-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
    await helper.sleep(productCache.waittime);
    monitor(sku);
}

async function postRestockWebhook(url, street, title, rawsku, price, location, stock, image, realsku) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Price**", price, true)
        .addField("**Location**", location, true)
        .addField("**Street**", street, true)
        .addField("**Stock**", stock, true)
        .addField("**Sku**", realsku, true)
        .addField("**Upc**", rawsku, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Walmart CA Store | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await archook.send(webhookMessage);
}
async function MIKEpostRestockWebhook(url, street, title, rawsku, price, location, stock, image, realsku) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Forbidden Monitors")
        .setColor("#DA4453")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Price**", price, true)
        .addField("**Location**", location, true)
        .addField("**Street**", street, true)
        .addField("**Stock**", stock, true)
        .addField("**Sku**", realsku, true)
        .addField("**Upc**", rawsku, true)
        .setThumbnail(image)
        .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
        .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
        .setFooter("Walmart CA Store | v1.0 by Tachyon • " + helper.getTime(true), 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
    await mikeWebhook.send(webhookMessage);
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
                console.log("*********WALMART-CA-STORE-SKU-ERROR*********");
                console.log("SKU: " + sku);
                console.log(err);
                monitor(sku);
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
            embed.setTitle(`WALMART-CA-STORE Monitor`);
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