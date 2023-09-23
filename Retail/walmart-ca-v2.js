const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent')
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTCAV2);
const archook = new webhook.Webhook("https://discord.com/api/webhooks/905265644453384222/zziZzLI6neiU7uuuB9ehwATzKMdrm_Nsf3FT1pXwtifrXs_Rjub4cTb1T2nc7ve89OqE");
const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/906203888284225607/c3Fy48a8XPupjiBMmVhu5pXBEIc-SmhbuwSlw3KU7vXATUFKBzDj4ASika67COvbyJ4N');
const CHANNEL = discordBot.channels.WALMARTCAV2;
const helper = require('../helper');
const DATABASE_TABLE = 'walmartca2';
const { v4 } = require('uuid');
const { default: axios } = require('axios');
let totalData = 0;

let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
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
    console.log('[WALMART-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    //let proxy = helper.get()
    let proxy = 'http://aggiekouv:o471QN3RtzKeYGdh_country-UnitedStates@3.234.171.186:31112'
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    // console.log('Good 0', sku, Date.now())
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    fetch(`http://walmart.ca/api/ip/${sku}?isUPC=false&includePriceOfferAvailability=true&allOffers=true&abcz=${v4()}`, {
        'headers': {
            'user-agent': "Walmart.ca/152 CFNetwork/1107.1 Darwin/19.0.0",
            'x-px-autherization': '3:abd31f0a885c81035b389779074ee650e5659c30e23b76fed297b610893a3bf7:2jjXRMlfqKQEfA1tDYnwfA6KGjFgWtZvhst2iEzIkM+fYRCUv4OuQ7Y/qSq+oYeYD5tWG4uAzNgHnmBbWjP5rA==:1000:SKIXWE+AFiQ6qXsaDn3tHAu+Ql237c/Gtm0mt+UROxrPKbA+yKF2UKJhvF8jA84Q9n95Hebu6ZeyNMv6Qg/VXgvJTlFyjO5a0kCU72/hSBiUsiaA9oixI9NfderMXa2ULZ0lH9zH/lx5OznZaYUd7eSHUUG6npkkHGvPMy5xjpcjPA9px+rveC1hgGCQv3aCOtU/YyUCvpKEJg2Plsqv6Q==',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        console.log(response.status)
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response, 2500)
        // console.log('Good 1', sku, Date.now())
        if (response.status !== 200) {
            console.log(`[WALMART-CA v2]`, response.status)
            //console.log(`[WALMART-CA] Forbidden! - ${proxy}`);
            monitor(sku)
            return
        } else {
            console.log(`[WALMART-CA v2]`, response.status)

        }
        // console.log('Good 2', sku, Date.now())
        try {
            body = JSON.parse(await body.trim())
            // console.log('Good 3', sku, Date.now())
        } catch (err) {
            if (body.includes('Forbidden')) {
                //console.log(`[WALMART-CA] Forbidden!! - ${proxy}`);
                monitor(sku)
                return
            }
            if (body.includes('blockScript')) {
                //console.log(`[WALMART-CA] Forbidden!! - ${proxy}`);
                monitor(sku)
                return
            }
            console.log("***********WALMART-CA-ERROR JSON PARSING***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log("Status: " + response.status)
            console.log(err);
            console.log(body);
            await helper.sleep(200);
            monitor(sku)
            return;
        }
        let status = productCache.status
        if (body.blockScript) {
            console.log(`[WALMART-CA] Blocked! - ${proxy}`);
            monitor(sku)
            return
        }
        if (!body.priceOfferAvailability) {
        }
        if (body.priceOfferAvailability[0].skus[0].sellerName === 'Walmart' && body.priceOfferAvailability[0].skus[0].quantity > 0) {
            let url = `https://www.walmart.ca/en/ip/Tachyon/${sku}`
            let title = body.productName
            let price = body.priceOfferAvailability[0].minCurrentPrice + ' CAD'
            let image = 'https:' + body.productImages.carouselImages[0].fullUrl
            let stock = body.priceOfferAvailability[0].skus[0].quantity + '+'
            let offerid = body.priceOfferAvailability[0].skus[0].offerId
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, stock, offerid);
                MIKEpostRestockWebhook(url, title, sku, price, image, stock, offerid);
                console.log(`[WALMART-CA-v2] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[WALMART-CA-v2] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        // console.log('Good', sku, Date.now())
        await helper.sleep(productCache.waittime);
        // console.log('Good 4', sku, Date.now())
        monitor(sku);
    }).catch(async err => {
        if (err.response && err.response.statusCode === 444) {
            //console.log(`[WALMART-CA] Forbidden! - ${proxy}`);
            monitor(sku)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            //console.log("[WALMART-CA] 
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ECONNRESET') {
            //console.log("[WALMART-CA] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ERR_SOCKET_CLOSED') {
            //console.log("[WALMART-CA] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        console.log("********************WALMART-CA-ERROR********************")
        console.log("SKUs: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        // console.log(body)
        await helper.sleep(150);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, stock, offerid) {
    let ominous = `[Ominous](http://localhost:2002/quicktask?options=%7B%22module%22%3A+%22Walmart+CA%22%2C+%22sku%22%3A+%${sku}%22%2C+%22quantity%22%3A+1%7D) . `
    let discord = `[More](https://discord.gg/y4ja7n5VSU)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Offerid**", '```' + offerid + '```', true)
        .addField("**QT**", ominous + discord)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Walmart CA v2| v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    //spacehook.send(webhookMessage);
    archook.send(webhookMessage);
    //prestonhook.send(webhookMessage);
    //bandithook.send(webhookMessage);
    //luminous.send(webhookMessage);
    //fakehook.send(webhookMessage);
    //MIKEpostRestockWebhook(url, title, sku, price, image, stock, offerid)
}
async function MIKEpostRestockWebhook(url, title, sku, price, image, stock, offerid) {
    let ominous = `[Ominous](http://localhost:2002/quicktask?options=%7B%22module%22%3A+%22Walmart+CA%22%2C+%22sku%22%3A+%${sku}%22%2C+%22quantity%22%3A+1%7D) . `
    let discord = `[More](https://discord.gg/y4ja7n5VSU)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Forbidden Monitors")
        .setColor("#DA4453")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Offerid**", '```' + offerid + '```', true)
        .addField("**QT**", ominous + discord)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
        .setFooter("Walmart CA | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    mikeWebhook.send(webhookMessage)
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
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorTimes')) {
        if (msg.channel.id === CHANNEL) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`WALMART v2 Monitor Times`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`WALMART v2 Monitor Times`);
            embed2.setColor('#6cb3e3')
            if (Object.keys(PRODUCTS).length > 0) {
                let SKUList1 = [];
                let SKUList2 = [];
                let i = 0;
                for (let sku of Object.keys(PRODUCTS)) {
                    if (i < Object.keys(PRODUCTS).length / 2)
                        SKUList1.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    else
                        SKUList2.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    i++;
                }
                embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
                embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
            msg.reply(embed2);
        }
    }
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}