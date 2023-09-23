const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const helper = require('../helper')
const { v4 } = require('uuid')
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SPORTCHEK);
const CHANNEL = discordBot.channels.SPORTCHEK;

let WEBHOOKS = [
    new webhook.Webhook('https://discord.com/api/webhooks/851879817217441813/J9UnSpc4frpsLS83R6EzVg7tUnLdD0gzTiGpYh5KR_tWi_nmXZwYXnCJ5Nei6SV9Nfkr')
]


const DATABASE_TABLE = 'sportchek';

let PRODUCT_DATA = {}
let totalData = 0

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCT_DATA[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: JSON.parse(row.last)
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[SPORTCHEK] Monitoring all SKUs!')
}

async function monitor(sku) {
    let url = `https://www.sportchek.ca/product/Tachyon-Monitors-${sku}.html`;
    let proxy = helper.getRandomProxy();
    let pData = PRODUCT_DATA[sku];
    if (!pData)
        return;
    let time = Date.now()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://api.canadiantire.ca/search/api/chek/v0/products?q=${sku}&_=${Date.now()}`, {
        "headers": {
            'Connection': 'keep-alive',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'sec-ch-ua-mobile': '?0',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept': 'application/json',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        method: "GET",
        redirect: 'manual',
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("Response time: " + (Date.now() - time) + " SKU - " + sku + " - Proxy: " + proxy);
        // console.log("YAY")

        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        try {
            body = JSON.parse(body);
        } catch (err) {
            console.log("********************SPORTCHEK-ERROR********************")
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(sku);
            return;
        }
        if (response.status === 403) {
            console.log(`[SPORTCHEK] 403 - ${sku} - ${proxy}`);
            // console.log(body)
        }
        if(!body.products) {
            await helper.sleep(pData.waittime);
            monitor(sku)
            return
        }
        else if (body.products.length === 0) {
            await helper.sleep(pData.waittime);
            monitor(sku)
            return
        } else if (body.products.length > 1) {
            return
        }

        let item = body.products[0]

        if (sku !== item.code) {
            console.log(`[SPORTCHEK] SKU DIDNT MATCH CODE WTF? - ${sku} - ${proxy}`)
            await helper.sleep(pData.waittime);
            monitor(sku)
        }

        // console.log(PRODUCT_DATA)
        let title = item.title;
        let price = item.priceData;
        let image = 'https:' + item.imageAndColor[0].imageUrl;


        let oldSizeList = pData.sizes;
        let sizeList = [];
        let inStock = false;

        for (let variants of body.facets) {
            if (variants.title !== 'Size')
                continue;
            for (let variant of variants.values) {
                let size = variant.value.trim();
                sizeList.push(size)
                if (!oldSizeList.includes(size))
                    inStock = true;
            }
        }

        if (inStock) {
            if (inStock) {
                postRestockWebhook(url, title, sizeList.join("\n"), sku, price, image);
                console.log(`[SPORTCHEK] Sizes Increased! SKU: ${sku}, Proxy: ${proxy}`);
                PRODUCT_DATA[sku].status = sizeList;
                await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
            PRODUCT_DATA[sku].sizes = sizeList;
            database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        } else {
            if (oldSizeList.length !== sizeList.length) {
                console.log(`[SPORTCHEK] Sizes Lowered! SKU: ${sku}, Proxy: ${proxy}`)
                PRODUCT_DATA[sku].status = sizeList;
                await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
        }
        // console.log("Response: " + (Date.now() - time) + "ms")

        await helper.sleep(pData.waittime);
        monitor(sku)
    }).catch(async err => {
        if (err.type === 'request-timeout' || err.type === 'body-timeout' || err.code === 'ETIMEDOUT') {
          console.log("[SPORTCHEK-CA] Timeout - " + sku + " - " + proxy);
          monitor(sku)
          return
        }
        console.log("***********SPORTCHEK-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sizes, sku, price, image) {
    let checkout = `https://www.samsclub.com/checkout`
    let cart = 'https://www.samsclub.com/cart'
    console.log(arguments)
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.sportchek.ca', '', 'https://www.sportchek.ca')
        .addField("**SKU**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes)
        // .addField("**Links**", '[Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("SportChek | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    for(let webhook of WEBHOOKS) {
      webhook.send(webhookMessage);
    }
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
            PRODUCT_DATA[sku] = null
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCT_DATA[sku] = {
            sku: sku,
            waittime: waitTime,
            sizes: []
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
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
                    PRODUCT_DATA[sku] = null
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCT_DATA[sku] = {
                    sku: sku,
                    waittime: waitTime,
                    sizes: []
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********SPORTCHEK-SKU-ERROR*********");
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
            embed.setTitle(`SPORTCHEK Monitor`);
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