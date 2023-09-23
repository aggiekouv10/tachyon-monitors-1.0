const fs = require('fs');
const got = require('got')
const { HttpsProxyAgent } = require('hpagent')
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTCA);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/847650846648434709/HQPhLOzBzWeRZdmCnhVg0BF2ndxQByt5yAcxRNV7r8rvFz2vplZr4N-SQ0LZ9TO76jOE');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/905265644453384222/zziZzLI6neiU7uuuB9ehwATzKMdrm_Nsf3FT1pXwtifrXs_Rjub4cTb1T2nc7ve89OqE');
const DATABASE_TABLE = 'walmartca';
let totalData = 0;
const WAITTIME = 200;

const SITENAME = "WALMARTCA"
const CHANNEL = discordBot.channels[SITENAME]
let LISTS = [];
let PRODUCT_DATA = {}
const SKU_LIST_LENGTH = 75;

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        let data = await preMonitor(row.sku);
        if (!data) {
            console.log("[WALMART-CA] Invalid Data for " + row.sku);
            discordBot.sendChannelMessage(CHANNEL, `Invalid Data/block for '${row.sku}'`);
            continue;
        }
        data.status = row.last;
        PRODUCT_DATA[data.sku] = data;
        pushToList(data.sku);
        // break;
    }
    for (let i = 0; i < LISTS.length; i++) {
        await helper.sleep(helper.getRandomNumber(700, 1500));
        monitor(i);
    }
    console.log("[WALMART-CA] Started monitoring all SKUs!")
    discordBot.sendChannelMessage(CHANNEL, `Started Monitoring all SKUs! ${Object.keys(PRODUCT_DATA).length}/${SKUList.rows.length}`);
}

function pushToList(sku) {
    for (let i = 0; i < LISTS.length; i++) {
        if (LISTS[i] && LISTS[i].length < SKU_LIST_LENGTH) {
            LISTS[i].push(sku);
            // console.log("old push: " + sku)
            return true;
        }
    }
    // console.log("NEW LIST PUSHED " + sku)
    LISTS.push([sku]);
    return false;
}

function removeFromList(sku) {
    for (let i = 0; i < LISTS.length; i++) {
        if (!LISTS[i])
            continue;
        LISTS[i] = LISTS[i].filter(function (value, index, arr) {
            return value !== sku;
        });
        if (LISTS[i].length === 0) {
            // console.log(LISTS)
            LISTS[i] = null;//ISTS.splice(i+1, 1);
            // console.log(LISTS)
        }
    }
}

async function preMonitor(sku, count = 0) {
    count++
    let proxy = 'http://aggiekouv:o471QN3RtzKeYGdh@proxy.packetstream.io:31112'
    let body
    try {
        let response = await fetch(`https://www.walmart.ca/en/ip/Tachyon-Monitors/${sku}`, {
            'headers': {
                'user-agent': "Walmart.ca/152 CFNetwork/1107.1 Darwin/19.0.0",
            },
            agent: new HTTPSProxyAgent(proxy),
            timeout: 2000
        });

        if (response.status !== 200) {
            console.log("[WALMART-CA PREMONITOR] ", response.status, sku, proxy)
            if (count > 10)
                return null;
            return preMonitor(sku, count);
        }
        body = await helper.getBodyAsText(response)
        let itemData
        try {
            itemData = body.split("window.__PRELOADED_STATE__=")[1].split(";</script>")[0] //JSON.parse(body)
            itemData = JSON.parse(itemData)
        } catch (err) {
            if (body.includes('Are you human?')) {
                console.log("[WALMART-CA] Captcha Block", sku, proxy)
                if (count > 10)
                    return null;
                return preMonitor(sku, count);
            }
        }

        let title = itemData.product.item.name.en; //itemData.productName 
        let ogSKU = sku;
        sku = itemData.product.item.skus[0]; //itemData.skuIds[0]
        let image = itemData.entities.skus[sku].images[0].thumbnail.url; //itemData.productImages.enlargedImages[0].fullUrl
        let result = { title, image, sku, ogSKU };
        // console.log(result);
        return result;
    }
    catch (err) {
        console.log("**************WALMART-CA-PREMONITOR**************");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(body)
        console.log("Error: " + err.toString())
        if (count > 10)
            return null;
        return preMonitor(sku, count);
    }
}

async function monitor(listIndex) {
    let skus = LISTS[listIndex];
    if (!skus) {
        console.log("SKUS fucking DIED");
        console.log(listIndex);
        console.log(JSON.stringify(LISTS))
        return;
    }
    let list = '';
    for (let sku of skus) {
        list += sku + ',';
    }
    list = list.substring(0, list.length - 1);

    let proxy = 'http://aggiekouv:o471QN3RtzKeYGdh@proxy.packetstream.io:31112'
    let randomSKU = Object.keys(PRODUCT_DATA);
    randomSKU = randomSKU[helper.getRandomNumber(0, randomSKU.length)];
    // let controller = new AbortController();
    // let timeout = setTimeout(() => {
    //     controller.abort();
    // }, 3500);
    let time = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500)
    let body

    // console.log("Sending..")
    fetch('https://www.walmart.ca/api/mobile/v2/price-offer', {
        method: "POST",
        headers: {
            'content-type':	'application/json',
            'x-px-bypass-reason':	'The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk.',
            'x-requested-with':	'XMLHttpRequest',
            'user-agent':	'Walmart.ca/152 CFNetwork/1107.1 Darwin/19.0.0',
            'x-px-original-token':	'3:e78f9e3eedf5a3772e9d5668f65facc7b04e769e0cac66cbe323f1d3f4f55f1c:rqC8wCm7nIaU10r4zhYRRLCDjJxhHpGmANDtVyDVaomZp8jn32PQrrqMN5lc/WDTXGANtkkdlMPU7DO6BzsvyA==:1000:F6OjB6i7Xu7cgQenYmlx0aYXz3MPyRb71YNSni6+vlzIqwtck+376rhUni/uDtRvRfCV1wabQeo51HFgURmunlY0jXR/AdkTGHhEuIoeZsOkbdeIoWh91LSXwcYqiEwRQeHWZRAkLpAor/quuH3M5V2jmk5RDw70rJliKJ+UMsRaz0QDZHBmoje8NYe57YxasW7VtOz5RurvoV6fMjgI5g==',
        },
        agent: new HTTPSProxyAgent(proxy),
        body: JSON.stringify({ "fsa": "L5V", "products": [{ "productId": `${randomSKU}`, "skuIds": skus }], "lang": "en", "pricingStoreId": '1061', "fulfillmentStoreId": "1061", "experience": "whiteGM" }),
        signal: controller.signal
    }).then(async response => {

        if (response.status !== 200) {
            if (response.status === 403) {
                console.log("[WALMART-CA] 403 BLOCKED", proxy)
                monitor(listIndex);
                return;
            }
        }
        clearTimeout(timeoutId)
        // console.log("YAY")
        // clearTimeout(timeout);
        // console.log("TIMEOUT CLEARED")
        body = await helper.getBodyAsText(response)
        // console.log("To text")
        // totalData += ((body.length * 1) / 1000000);
        try {
            // console.log("Trying")
            body = JSON.parse(body);
        } catch (err) {
            // console.log("Caught")
            if (response.status === 444) {
                console.log(`[WALMART-CA] Forbidden! - ${proxy}`);
                monitor(listIndex)
                return
            }
            console.log("********************WALMART-CA-ERROR********************")
            console.log("SKU-List: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(listIndex);
            return;
        }
        // console.log("Not Caught")
        if (body.blockScript) {
            console.log(`[WALMART-CA] Blocked! - ${proxy}`);
            monitor(listIndex)
            return
        }
        if (!body.offers) {
            console.log(`[WALMART-CA] No PRODUCT OFFERS!`);
            console.log(body)
            monitor(listIndex)
            return
        }
        let offers = body.offers;
        // console.log(Object.keys(offers).length + "/" + skus.length)
        for (let sku of skus) {

            // console.log(sku);
            // console.log(PRODUCT_DATA)
            let pData = PRODUCT_DATA[sku];
            let title = pData.title;
            if (!offers[sku]) {
                console.log("[WALMART-CA] ", sku, "was not present in the response")
                // process.exit(0)
                continue
            }
            let price = offers[sku].currentPrice;
            let image = pData.image;
            let stockCount = offers[sku].availableQuantity;

            if (stockCount > 0) {
                if (pData.status !== 'IN_STOCK') {
                    discordBot.sendChannelMessage(CHANNEL, `Instock: ${stockCount} for '${sku}'`);
                    postRestockWebhook('https://www.walmart.ca/ip/Tachyon-Monitors/' + sku, title, sku, stockCount.toString(), price.toString(), image);
                    console.log(`[WALMART-CA] Instock! SKU: ${sku}, Proxy: ${proxy}`);
                    // console.log(item.fulfillment.shipping_options.services);
                    PRODUCT_DATA[sku].status = 'IN_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='IN_STOCK' where sku='${pData.ogSKU}'`);
                }
            } else {
                if (pData.status !== 'OUT_OF_STOCK') {
                    console.log(`[WALMART-CA] OOS! SKU: ${sku}, Proxy: ${proxy}`)
                    PRODUCT_DATA[sku].status = 'OUT_OF_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='OUT_OF_STOCK' where sku='${pData.ogSKU}'`);
                }
            }

        }
        console.log(listIndex + " Response time: " + `(${Object.keys(offers).length + "/" + skus.length})` + (Date.now() - time) + " - Proxy: " + proxy);

        await helper.sleep(WAITTIME);
        // console.log("Next..")
        monitor(listIndex)
    }).catch(async function (err) {
        if (err.response && err.response.statusCode === 444) {
            console.log(`[WALMART-CA] Forbidden! - ${proxy}`);
            monitor(listIndex)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT') {
            console.log("[WALMART-CA] Timeout: " + " - " + proxy);
            await helper.sleep(150);
            monitor(listIndex)
            return;
        }
        if (err.code === 'ECONNRESET') {
            console.log("[WALMART-CA] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(listIndex)
            return;
        }
        console.log("********************WALMART-CA-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log(err);
        console.log(body)
        await helper.sleep(150);
        monitor(listIndex)
    })
}

async function postRestockWebhook(url, title, sku, stock, price, image) {
    let ominous = `http://localhost:2002/quicktask?options=%7B%22module%22%3A+%22Walmart+CA%22%2C+%22sku%22%3A+%22${sku}%22%2C+%22quantity%22%3A+1%7D`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Type**", "Restock", true)
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[OminousAIO](' + ominous + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Walmart-CA | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    archook.send(webhookMessage);
    MIKEpostRestockWebhook(url, title, sku, stock, price, image)
}

async function MIKEpostRestockWebhook(url, title, sku, stock, price, image) {
    let ominous = `http://localhost:2002/quicktask?options=%7B%22module%22%3A+%22Walmart+CA%22%2C+%22sku%22%3A+%22${sku}%22%2C+%22quantity%22%3A+1%7D`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Forbidden Monitors")
        .setColor("#DA4453")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Type**", "Restock", true)
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[OminousAIO](' + ominous + ') | [More Monitors](https://discord.gg/y4ja7n5VSU)')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
        // .setTime()
        .setFooter("Walmart-CA | v1.0 by Tachyon • " + helper.getTime(true), 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
    mikeWebhook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== discordBot.channels.WALMARTCA)
        return;
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
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            removeFromList(sku);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        let data = await preMonitor(sku);
        if (!data) {
            console.log("[WALMART-CA] Invalid Data for " + sku);
            discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
            return;
        }
        PRODUCT_DATA[data.sku] = data;
        await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '')`);
        if (!pushToList(data.sku)) {
            console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
            monitor(LISTS.length - 1);
        }
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
                    await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    removeFromList(sku);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                let data = await preMonitor(sku);
                if (!data) {
                    console.log("[WALMART-CA] Invalid Data for " + sku);
                    discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
                    continue;
                }
                PRODUCT_DATA[data.sku] = data;
                await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '')`);
                if (!pushToList(data.sku)) {
                    console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
                    monitor(LISTS.length - 1);
                }
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********WALMART-CA-SKU-ERROR*********");
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
        let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
        const embed = new Discord.MessageEmbed();
        embed.setTitle("WALMART-CA Monitor");
        embed.setColor('#6cb3e3')
        if (query.rows.length > 0) {
            let SKUList = [];
            for (let row of query.rows) {
                SKUList.push(row.sku);
            }
            embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
        }
        else {
            embed.setDescription("Not Monitoring any SKU!")
        }
        msg.reply(embed);
    }
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}