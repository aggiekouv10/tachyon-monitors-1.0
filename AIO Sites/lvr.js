//https://api.luisaviaroma.com/lvrapprk/public/v1/catalog/widgetcatalogbyskus?format=json&Language=EN&Country=US&CurrencyView=USD&CurrencyFatt=USD&App=true&PlainSkus=${sku}&${v4()}
const fs = require('fs');
const crypto = require("crypto");
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const AbortController = require('abort-controller')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.LVR);
const peterfnf = new webhook.Webhook('https://discord.com/api/webhooks/974994448314413106/PXdAuiguitVbZyzYDT7bsi79eoRjjko0ftgpZxl7r230-0m3euarYHbp3n1kcw7wPs-L')
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'lvr';
const SITENAME = 'LVR'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let totalData = 0;
let PRODUCTS = {}
startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        monitor(row.sku);
    }
    console.log('[LVR] Monitoring all SKUs!')
}
async function monitor(sku) {
    var key = new Uint8Array([-114, -89, -101, -50, -61, -43, 69, -105, -17, -31, -122, 120, 10, -125, 92, 7, 84, 0, 98, 58, 17, 72, 29, 61, 23, -35, -110, -23, 5, -37, -74, 21]);
    var startTime = Math.floor((Date.now() - 300000) / 1000);
    var endTime = Math.floor((Date.now() + 1800000) / 1000);
    var data = `st=${startTime}~exp=${endTime}~acl=*`;
    var hmac = hmacsha256(key, data);
    function hmacsha256(key, data) {
        return crypto.createHmac("SHA256", key).update(data).digest("hex");
    }
    let proxy = helper.getRandomDDProxy();
    let productCache = PRODUCTS[sku]
    let seasonid = sku.split('-')[0]
    let collectionid = sku.split('-')[1].substring(0, 3)
    let itemid1 = sku.split('-')[1].slice(-3)
    let itemid = ''
    if (itemid1.substring(0, 1) > 0) {
        itemid = itemid1
    } else {
        itemid = sku.split('-')[1].slice(-3).replace('0', '')
    }
    if (!productCache)
        return;
    let pluses = ''
    let random = Math.floor(Math.random() * 2000) + 1
    for (let i = 0; i < random; i++) {
        pluses += '+'
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    console.log(`https://api.luisaviaroma.com/lvrapprk/public/v1/itemminimal?format=json&Language=EN&Country=US&CurrencyView=USD&CurrencyFatt=USD&App=true&ItemCode=${sku}&SeasonId=${seasonid}&CollectionId=${collectionid}&ItemId=${itemid}`)
    console.log(`${data}~hmac=${hmac}`)
    fetch(`https://api.luisaviaroma.com/lvrapprk/public/v1/itemminimal?format=json&Language=EN&Country=US&CurrencyView=USD&CurrencyFatt=USD&App=true&ItemCode=${sku}&SeasonId=${seasonid}&CollectionId=${collectionid}&ItemId=${itemid}`, {
        'headers': {
            'User-Agent': 'yacybot (/global; amd64 Linux 5.1.0-gentoo; java 1.8.0_201; Europe/de) http://yacy.net/bot.html',
            '__lvr_mobile_api_token__': `${data}~hmac=${hmac}`,
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status === 404) {
            await helper.sleep(productCache.waittime);
            monitor(sku)
            return
        }

        if (response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let title = body.DesignerText + ' ' + body.DescriptionText
        let color = Object.keys(body.PhotosByColor)
        let image = 'http://pxy.hawkaio.com/https://images.lvrcdn.com/Big' + body.PhotosByColor[color][0]
        let url = `https://www.luisaviaroma.com/${sku}`
        let price = ''
        let sizes = []
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        let stock = 0
        price = body.AvailabilityByColor[0].SizeAvailability[0].Pricing.Prices[0].ListPrice.toString()
        let variants = body.AvailabilityByColor[0].SizeAvailability
        for (let variant of variants) {
            stock += Number(variant.QuantitiesTotal.Available)
            sizes += `${variant.SizeValue} (${variant.QuantitiesTotal.Available})\n`
            sizeList.push(variant.SizeValue);
            if (!oldSizeList.includes(variant.SizeValue))
                inStock = true;
        }

        let sizeright = sizes.split('\n')
        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))

        if (inStock) {
            postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock)
            inStock = false;
            await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.toString().includes('timeout') || err.toString().includes('ETIMEDOUT') || err.toString().includes('aborted')) {
            monitor(sku)
            return
        }
            console.log("***********LVR-ERROR***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    let fr = `[FR](https://www.asos.com/fr/tachyon/prd/${sku}) . `
    let it = `[IT](https://www.asos.com/it/tachyon/prd/${sku}) . `
    let de = `[DE](https://www.asos.com/de/tachyon/prd/${sku})\n`
    let gb = `[GB](https://www.asos.com/gb/tachyon/prd/${sku}) . `
    let pl = `[PL](https://www.asos.com/pl/tachyon/prd/${sku}) . `
    let es = `[ES](https://www.asos.com/es/tachyon/prd/${sku})`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.asos.com/gb/tachyon/prd/23600038)\n`
    let polar = `[PolarCop](https://qt.polarcop.com/asos?pid=https://www.asos.com/gb/tachyon/prd/23600038)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#00e28d")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.luisaviaroma.com', '', 'https://www.luisaviaroma.com')
        .addField("**Stock**", stock.toString() + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/974770499160776725/975396010803224676/Logo_Transparent.png")
        // .setTime()
        .setFooter("LVR | v2.0 by Tachyon " + helper.getTime(true), 'https://cdn.discordapp.com/attachments/974770499160776725/975396010803224676/Logo_Transparent.png')
    discordWebhook.send(webhookMessage);
    //peterfnf.send(webhookMessage);
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
            sizes: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
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
                    sizes: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********LVR-SKU-ERROR*********");
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
            embed.setTitle(`LVR Monitor`);
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