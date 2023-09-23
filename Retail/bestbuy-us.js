const fs = require('fs');
const { fetch } = require('fetch-h2');
const fetch_default = require('node-fetch')
const got = require('got');
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { v4 } = require('uuid');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { default: axios } = require('axios');

const CHANNEL = discordBot.channels.BESTBUYUS
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYUS);
const logWebhook = new webhook.Webhook('https://discord.com/api/webhooks/854629805453869077/SrQOAKmh3BWBzycwakKFsZus9JwJJ1xAWqgp7Dw1AVq49b0XtIE277v_M-tJGUiOgXM9');

const DATABASE_TABLE = 'bestbuyus';
let totalData = 0;
const WAITTIME = 500;
let WEBHOOK_DELAY = 14 * 60 * 1000

let KEYS = [
    'qhqws47nyvgze2mq3qx4jadt',
    'Q7rwdCDZnWPly3KzbG1KNR5F',
    'bsxgt8s4ytx7ywvg33c8tdzy',
    '08JJS1ffSirGzNn7hMjRcjBN',
    'bvn7tg3ftneqbun2h67ae7nu',
    'zbjjfx6y76g5mmp3znsetnqn',
    '0j7iapqW9cMtP87GqDaxc2Um',
    'xlTM7AGGKuDAXQEGNYD9xlY7',
    'xZzirguQPULirOqbS2fmmGuG'
]
let EXCLUDED_KEYS = []
let a = 0;
function getKey() {
    let key = KEYS[a];
    if (!key) {
        a = 0;
        key = KEYS[a];
    }
    a++;
    if (EXCLUDED_KEYS.includes(key)) {
        return getKey();
    }
    return key;
}

let PRODUCTS = {}
const SKU_LIST_LENGTH = 25;

const SKU_LIST_LENGTH_2 = 100;

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        // let valid = await preMonitor(row.sku);
        // if (!valid) {
        //     console.log("[BESTBUY-US] Invalid Data for " + row.sku);
        //     continue;
        // }

        PRODUCTS[row.sku] = {
            status: row.last,
            waittime: row.waittime,
            enabled: true,
            lastHook: 0
        };
        // console.log(row.sku);
    }
    monitor(0, 25);
    monitor(24, 50);
    monitor(49, 75);
    monitor(74, 100);
    monitor2()
    // for (let i = 0; i < LISTS.length; i++) {
    //     // await helper.sleep(helper.getRandomNumber(700, 1500));
    //     monitor(i);
    // }
    console.log("[BESTBUY-US] Started monitoring all SKUs!")
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
    fetch(`https://www.bestbuy.com/api/3.0/priceBlocks?skus=${sku}`, {
            'headers': {
                'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                // 'accept-encoding': "gzip, deflate, br",
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
        // if (body[0].sku.error && !body[0].sku.error.includes('PRODUCT_SKU_INACTIVE')) {
        //     return false;
        // }
        return true;
    }
    catch (err) {
        console.log("**************BESTBUY-US-PREMONITOR**************");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err)
        if (second)
            return null;
        return preMonitor(sku, true);
    }
}

async function monitor(start, end) {
    let skus = [];
    let keys = Object.keys(PRODUCTS);
    for(let i = start; i < Math.min(end, keys.length); i++) {
        if(PRODUCTS[keys[i]].enabled) {
            skus.push(keys[i])
        }
    }
    if (skus.length === 0)
        return;
    // console.log(skus)
    let list = '';
    for (let sku of skus) {
        list += sku + ',';
    }
    list = list.substring(0, list.length - 1);
    let pdpURL = `https://www.bestbuy.com/api/3.0/priceBlocks?cache=${v4()}&skus=${list}`;
    // console.log(pdpURL)

    let proxy = helper.getRandomProxy()
    let time = Date.now();
    // console.log(pdpURL);

    got(pdpURL, {
        'headers': {
            'cache-control': 'max-age=0',
            'pragma': 'max-age=0',
            'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            // 'accept-encoding': "gzip, deflate, br",
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
        http2: true,
        
        retry: 0
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
        // console.log("YAY")
        let body = await response.body;
        totalData += ((body.length * 1) / 1000000);
        try {
            body = JSON.parse(body);
        } catch (err) {
            console.log("********************BESBTBUY-US-1-ERROR********************")
            console.log("SKU-List: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(start, end);
            return;
        }
        for (let item of body) {

            item = item.sku;
            if(item.error) {
                continue;
            }

            let sku = item.skuId;
            // console.log(sku);
            let pData = PRODUCTS[sku];
            let title = item.names['short'];
            let price = item.price.priceDomain.currentPrice + '';
            let image = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${sku.substring(0, 4)}/${sku}_sd.jpg?width=659&height=630`;

            if (item.buttonState && item.buttonState.buttonState === 'ADD_TO_CART') {
                if (pData.status !== 'IN_STOCK') {
                    if(Date.now() - PRODUCTS[sku].lastHook > WEBHOOK_DELAY) {
                        postRestockWebhook('https://www.bestbuy.com/site/tachyon/' + sku + '.p?skuId=' + sku, title, sku, 'Online.', price, image, helper.getTime(true));
                        PRODUCTS[sku].lastHook = Date.now();
                        console.log(`[BESTBUY-US-1] Instock! SKU: ${sku}, Proxy: ${proxy}`);
                    }
                    // console.log(item.fulfillment.shipping_options.services);
                    PRODUCTS[sku].status = 'IN_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='IN_STOCK' where sku='${sku}'`);
                }
            } else {
                if (pData.status !== 'OUT_OF_STOCK') {
                    // console.log(`[BESTBUY-US-1] OOS! SKU: ${sku}, Proxy: ${proxy}`)
                    PRODUCTS[sku].status = 'OUT_OF_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='OUT_OF_STOCK' where sku='${sku}'`);
                }
            }

        }
        // console.log("Response: " + (Date.now() - time) + "ms")

        await helper.sleep(WAITTIME);
        monitor(start, end)
    }).catch(async err => {
        console.log("********************BESTBUY-US-1-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log(err);
        await helper.sleep(150);
        monitor(start, end)
    });
}

async function monitor2() {
    if (EXCLUDED_KEYS.length === KEYS.length) {
        postWebhook('Game Over', JSON.stringify(EXCLUDED_KEYS));
        return;
    }
    let LIST = [];
    for (let key of Object.keys(PRODUCTS)) {
        if (PRODUCTS[key].enabled)
            LIST.push(key)
    }
    // console.log("Start: " + LIST.length);
    if (LIST.length === 0) {
        await helper.sleep(WAITTIME);
        monitor2();
        return;
    }
    let formattedList = LIST.join(',')
    let apiKey = getKey();
    let pdpURL = `https://api.bestbuy.com/v1/products(sku%20in(${formattedList}))?apiKey=${apiKey}&show=onlineAvailability,sku,name,salePrice,image&cache=${v4()}&format=json&pageSize=100`;

    // return;

    let proxy = helper.getRandomProxy();
    let time = Date.now();
    // console.log(pdpURL);

    axios(pdpURL, {
        // 'headers': {
        //   'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        //   'accept-encoding': "gzip, deflate, br",
        //   'accept-language': "en-US,en;q=0.9",
        //   'cache-control': 'no-cache',
        //   'pragma': 'no-cache',
        //   'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        //   'sec-ch-ua-mobile': '?0',
        //   'sec-fetch-dest': "document",
        //   'sec-fetch-mode': "navigate",
        //   'sec-fetch-site': "none",
        //   'sec-fetch-user': '?1',
        //   'upgrade-insecure-requests': '1',
        //   'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        // },
        // agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
        retry: 0,
        validateStatus: function (status) {
          return true; // default
        },
        transformResponse: []
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("YAY")
        let body = await response.data;
        totalData += ((body.length * 1) / 1000000);
        try {
            body = JSON.parse(body);
        } catch (err) {
            if (body.toLowerCase().includes('many requests')) {
                console.log('[BESTBUY-US-2] 429, SKU: ' + list);
                monitor2();
                return;
            }
            console.log("********************BESTBUY-US-2-ERROR********************")
            console.log("SKUs: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor2();
            return;
        }
        if (!body.products) {
            if (body.errorMessage === 'The provided API Key has reached the per second limit allotted to it.') {
                console.log("[BESTBUY-US-2] Ratelimit!");
            } else if (body.errorMessage.toLowerCase().includes("daily")) {
                console.log("[BESTBUY-US-2] Key dead - " + apiKey);
                EXCLUDED_KEYS.push(apiKey);
                postWebhook('KEY DEAD', apiKey);
                await helper.sleep(WAITTIME);
                monitor2();
                return;
            }
            else if (err.type === 'request-timeout' || err.type === 'body-timeout') {
                console.log("[BESTBUY-US-2] Timeout - " + proxy);
                monitor2();
                return
            }
            else {
                console.log("********************BESTBUY-US-2-ERROR********************")
                console.log("SKUs: " + list);
                console.log("Proxy: " + proxy);
                console.log("ERROR: Rate Limited");
                console.log(body)
            }
            await helper.sleep(WAITTIME);
            monitor2();
            return;
        }
        // console.log(JSON.stringify(body))
        for (let product of body.products) {
            // console.log(PRODUCTS);
            // console.log(oldProduct)
            // return;

            let sku = product.sku;
            let title = product.name;
            let price = product.salePrice;
            let image = product.image;

            // console.log("SKU: " + sku)
            if (product.onlineAvailability) {
                // console.log(true);
                if (PRODUCTS[sku].status !== 'IN_STOCK') {
                    if(Date.now() - PRODUCTS[sku].lastHook > WEBHOOK_DELAY) {
                        postRestockWebhook('https://www.bestbuy.com/site/tachyon/' + sku + '.p?skuId=' + sku, title, sku.toString(), 'Online', price.toString(), image, helper.getTime(true));
                        PRODUCTS[sku].lastHook = Date.now();
                        console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
                        console.log(`[BESTBUY-US-2] Instock! SKU: ${sku}, Proxy: ${proxy}`);
                    }
                    PRODUCTS[sku].status = 'IN_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='IN_STOCK' where sku='${sku}'`);
                }
            } else {
                if (PRODUCTS[sku].status !== 'OUT_OF_STOCK') {
                    // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
                    // console.log(`[BESTBUY-US-2] OOS! SKU: ${sku}, Proxy: ${proxy}`);
                    PRODUCTS[sku].status = 'OUT_OF_STOCK';
                    database.query(`update ${DATABASE_TABLE} set last='OUT_OF_STOCK' where sku='${sku}'`);
                }
            }
        }
        // console.log(body.products.length)

        await helper.sleep(WAITTIME);
        monitor2();
        return;
    }).catch(async err => {
        if (err.type === 'request-timeout' || err.type === 'body-timeout') {
            console.log("[BESTBUY-US-2] Timeout - " + proxy);
            await helper.sleep(WAITTIME);
            monitor2();
            return
        }
        console.log("********************BESTBUY-US-2-ERROR********************")
        console.log("SKUs: " + JSON.stringify(LIST));
        console.log("Proxy: " + proxy);
        console.log(err);
        setTimeout(function () {
            monitor2();
        }, 150);
    });
}

async function postRestockWebhook(url, title, sku, type, price, image, time) {
    let ATC = `https://api.bestbuy.com/click/tachyon/${sku}/cart`
    let cart = `https://www.bestbuy.com/cart`
    let checkout = `https://www.bestbuy.com/checkout/r/fast-track`
    let login = `https://www.bestbuy.com/identity/global/signin`
    let phantom = `https://api.ghostaio.com/quicktask/send?site=BESTBUY&input=${url}`
    let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
    let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
    let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
    // console.log(arguments)
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.bestbuy.com', '', 'https://www.bestbuy.com')
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Type**", type, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("BestBuy-US | v1.0 • " + time, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
}
async function postWebhook(title, data) {
    // console.log(arguments)
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .addField("**Date**", data)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("BestBuy-US | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await logWebhook.send(webhookMessage);
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
            PRODUCTS[sku].enabled = false;
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        let valid = await preMonitor(sku);
        if (!valid) {
            console.log("[BESTBUY-US] Invalid Data for " + sku);
            discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
            return;
        }
        PRODUCTS[sku] = {
            status: '',
            waittime: waitTime,
            enabled: true,
            lastHook: 0
        };
        await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '', ${waitTime})`);
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
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    PRODUCTS[sku].enabled = false
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                let valid = await preMonitor(sku);
                if (!valid) {
                    console.log("[BESTBUY-US] Invalid Data for " + sku);
                    discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
                    continue;
                }
                PRODUCTS[sku] = {
                    status: '',
                    waittime: waitTime,
                    enabled: true,
                    lastHook: 0
                };
                database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '', ${waitTime})`);
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********BESTBUY-US-SKU-ERROR*********");
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
        embed.setTitle("BESTBUY-US Monitor");
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