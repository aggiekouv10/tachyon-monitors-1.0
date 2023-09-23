const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.TARGET);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const DATABASE_TABLE = 'target';
let totalData = 0;
const WAITTIME = 500;

let LISTS = [];
let PRODUCT_DATA = {}
const SKU_LIST_LENGTH = 28;

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        let data = await preMonitor(row.sku);
        if (!data) {
            console.log("[TARGET] Invalid Data for " + row.sku);
            continue;
        }
        data.status = row.last;
        PRODUCT_DATA[row.sku] = data;
        pushToList(row.sku);
    }
    for (let i = 0; i < LISTS.length; i++) {
        await helper.sleep(helper.getRandomNumber(700, 1500));
        monitor(i);
    }
    console.log("[TARGET] Started monitoring all SKUs!")
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
    let proxy = helper.getRandomRegionalProxy("United States");
    try {
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin=${sku}&store_id=3254&has_store_id=false&pricing_store_id=3254&has_pricing_store_id=true&scheduled_delivery_store_id=none&has_scheduled_delivery_store_id=false&has_financing_options=false&&has_size_context=true`, {
            'headers': {
                'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                'accept-encoding': "gzip, deflate, br",
                'accept-language': "en-US,en;q=0.9",
                'cache-control': 'no-cache',
                'pragma': 'no-cache',
                'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-fetch-dest': "document",
                'sec-fetch-mode': "navigate",
                'sec-fetch-site': "none",
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
            },
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
            
        });

        if (response.status !== 200) {
            if (second)
                return null;
            return preMonitor(sku, true);
        }
        let body = await response.json();
        let title = body.data.product.item.product_description.title;
        let image = body.data.product.item.enrichment.images.primary_image_url || 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
        let price = body.data.product.price.formatted_current_price;
        let lastHook = 0;
        let result = { title, image, price, lastHook };
        // console.log(result);
        return result;
    }
    catch {
        console.log("**************TARGET-PREMONITOR**************");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        if (second)
            return null;
        return preMonitor(sku, true);
    }
}

async function monitor(listIndex) {
    let skus = LISTS[listIndex];
    if (!skus)
        return;
    // console.log(skus)
    if (!skus)
        return;
    let list = '';
    for (let sku of skus) {
        list += sku + ',';
    }
    list = list.substring(0, list.length - 1);
    let pdpURL = `https://redsky.target.com/redsky_aggregations/v1/web/plp_fulfillment_v1?device_type=${v4()}&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&tcins=${list}`;
    // console.log(pdpURL)

    let proxy = helper.getRandomRegionalProxy("United States");
    // console.log(pdpURL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
        'headers': {
            'cache-control': 'max-age=0',
            'pragma': 'max-age=0',
            'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            'accept-encoding': "gzip, deflate, br",
            'accept-language': "en-US,en;q=0.9",
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': "document",
            'sec-fetch-mode': "navigate",
            'sec-fetch-site': "none",
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
        // console.log("YAY")
        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        try {
            body = JSON.parse(body);
        } catch (err) {
            console.log("********************TARGET-ERROR********************")
            console.log("SKU-List: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(listIndex);
            return;
        }
        if (!body.data) {
            console.log(`[TARGET] No PRODUCT DATA!`);
            console.log(body)
        }
        for (let item of body.data.product_summaries) {

            let sku = item.tcin;
            // console.log(sku);
            // console.log(PRODUCT_DATA)
            let pData = PRODUCT_DATA[sku];
            let title = pData.title;
            let price = pData.price;
            let image = pData.image;
            let stockCount = item.fulfillment.shipping_options.available_to_promise_quantity;

            if (item.fulfillment.shipping_options.availability_status === 'IN_STOCK') {
                if (pData.status !== 'IN_STOCK') {
                    if (Date.now() - pData.lastHook > 10 * 60 * 1000) {
                        postRestockWebhook('https://www.target.com/p/Tachyon-Monitors/-/A-' + sku, title, sku, stockCount.toString(), price, image);
                        PRODUCT_DATA[sku].lastHook = Date.now()
                    }
                    console.log(`[TARGET] Instock! SKU: ${sku}, Proxy: ${proxy}`);
                    // console.log(item.fulfillment.shipping_options.services);
                    PRODUCT_DATA[sku].status = 'IN_STOCK';
                    await database.query(`update ${DATABASE_TABLE} set last='IN_STOCK' where sku='${sku}'`);
                }
            } else {
                if (pData.status !== 'OUT_OF_STOCK') {
                    console.log(`[TARGET] OOS! SKU: ${sku}, Proxy: ${proxy}`)
                    PRODUCT_DATA[sku].status = 'OUT_OF_STOCK';
                    await database.query(`update ${DATABASE_TABLE} set last='OUT_OF_STOCK' where sku='${sku}'`);
                }
            }

        }
        // console.log("Response: " + (Date.now() - time) + "ms")

        await helper.sleep(WAITTIME);
        monitor(listIndex)
    }).catch(async err => {
        console.log("********************TARGET-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log(err);
        await helper.sleep(150);
        monitor(listIndex)
    });
}

async function postRestockWebhook(url, title, sku, stock, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.target.com', '', 'https://www.target.com')
        .addField("**Type**", "Restock", true)
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Target by Tachyon | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            removeFromList(sku);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        let data = await preMonitor(sku);
        if (!data) {
            console.log("[TARGET] Invalid Data for " + sku);
            discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
            return;
        }
        PRODUCT_DATA[sku] = data;
        await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '')`);
        if (!pushToList(sku)) {
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
                    console.log("[TARGET] Invalid Data for " + sku);
                    discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
                    continue;
                }
                PRODUCT_DATA[sku] = data;
                await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '')`);
                if (!pushToList(sku)) {
                    console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
                    monitor(LISTS.length - 1);
                }
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********TARGET-SKU-ERROR*********");
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
        embed.setTitle("TARGET Monitor");
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