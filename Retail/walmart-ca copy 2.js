const fs = require('fs');
const got = require('got')
const { HttpsProxyAgent } = require('hpagent')
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTCA);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/847650846648434709/HQPhLOzBzWeRZdmCnhVg0BF2ndxQByt5yAcxRNV7r8rvFz2vplZr4N-SQ0LZ9TO76jOE');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/891720244048052234/J6kI4qzoSpn8XyAadlpiZe2oQps7aOjXBvlZxc3BvaTwjyehgafUJ0v2Zbk21a_nJGDu');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901740628684177419/ECe7qHq4GeqKU_LFlFKhSJX3fu8vsjbUxOal6mTegLPE_UHUkljPu98Ay8Bm5JAxZ2di');
const DATABASE_TABLE = 'walmartca';
let totalData = 0;
const WAITTIME = 500;

let LISTS = [];
let PRODUCT_DATA = {}
const SKU_LIST_LENGTH = 50;

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        let data = await preMonitor(row.sku);
        if (!data) {
            console.log("[WALMART-CA] Invalid Data for " + row.sku);
            continue;
        }
        data.status = row.last;
        PRODUCT_DATA[data.sku] = data;
        pushToList(data.sku);
    }
    for (let i = 0; i < LISTS.length; i++) {
        await helper.sleep(helper.getRandomNumber(700, 1500));
        monitor(i);
    }
    console.log("[WALMART-CA] Started monitoring all SKUs!")
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

async function preMonitor(sku, second) {
    let proxy = helper.getRandomProxy();
    try {
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.walmart.ca/en/ip/${sku}`, {
            'headers': {
                'user-agent': 'Android v18.15.1',
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
            },
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
            
        });

        if (response.status !== 200) {
            if (second)
                return null;
            return preMonitor(sku, true);
        }
        let body = await helper.getBodyAsText(response)
        let itemData = body.split("window.__PRELOADED_STATE__=")[1].split(";</script>")[0]
        itemData = JSON.parse(itemData)

        let title = itemData.product.item.name.en;
        let ogSKU = sku;
        sku = itemData.product.item.skus[0];
        let image = itemData.entities.skus[sku].images[0].thumbnail.url;
        let result = { title, image, sku, ogSKU };
        // console.log(result);
        return result;
    }
    catch (err) {
        console.log("**************WALMART-CA-PREMONITOR**************");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log("Error: " + err.toString())
        if (second)
            return null;
        return preMonitor(sku, true);
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

    let proxy = helper.getRandomCAResiProxy();
    let randomSKU = Object.keys(PRODUCT_DATA);
    randomSKU = randomSKU[helper.getRandomNumber(0, randomSKU.length)];
    // let controller = new AbortController();
    // let timeout = setTimeout(() => {
    //     controller.abort();
    // }, 3500);
    let time = Date.now();
    let body
    try {
        console.log("Sending..")
        let response = await got('https://www.walmart.ca/api/product-page/v2/price-offer', {
            method: "POST",
            headers: {
                'user-agent': 'Android v18.15.1',
                'content-type': 'application/json; charset=utf-8',
                'accept-encoding': 'gzip',
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9',
                'content-type': 'application/json'
            },
            agent: {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo', 
                    proxy: proxy
                })
            },
            body: JSON.stringify({ "fsa": "L5V", "products": [{ "productId": `${randomSKU}`, "skuIds": skus }], "lang": "en", "pricingStoreId": '1061', "fulfillmentStoreId": "1061", "experience": "whiteGM" }),
            
            retry: 0
        })

        // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
        // console.log("YAY")
        // clearTimeout(timeout);
        // console.log("TIMEOUT CLEARED")
        body = await response.body;
        // console.log("To text")
        // totalData += ((body.length * 1) / 1000000);
        try {
            console.log("Trying")
            body = JSON.parse(body);
        } catch (err) {
            console.log("Caught")
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
        console.log("Not Caught")
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
        console.log(Object.keys(offers).length + "/" + skus.length)
        for (let sku of skus) {

            // console.log(sku);
            // console.log(PRODUCT_DATA)
            let pData = PRODUCT_DATA[sku];
            let title = pData.title;
            let price = offers[sku].currentPrice;
            let image = pData.image;
            let stockCount = offers[sku].availableQuantity;

            if (stockCount > 0) {
                if (pData.status !== 'IN_STOCK') {
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
        console.log("Response: " + (Date.now() - time) + "ms")

        await helper.sleep(WAITTIME);
        console.log("Next..")
        monitor(listIndex)
    } catch (err) {
        if (err.response && err.response.statusCode === 444) {
            console.log(`[WALMART-CA] Forbidden! - ${proxy}`);
            monitor(listIndex)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT') {
            console.log("[WALMART-CA] 
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
    }
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
    spacehook.send(webhookMessage);
    prestonhook.send(webhookMessage);
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