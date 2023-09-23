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
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYCAMULTI);
const HTTPSProxyAgent = require('https-proxy-agent');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912571939187470368/k-9PPebE1DL-86KU6F1WMyJfMTTV0Jxx3OBmetaKP4e6K6gYUQw_FJFwjimbrp4-dZYk');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901740805734158366/PxJoZ5VvXp9UTY9ibQ5EpYo9si3E8MCLSJhvb9741wC6iaG5Jv3cj31hX1G_P7wibDpF');
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904868657102983178/MNUJ-WgzIeIdqm7ct1KQjjI09Hf5rvObsh9YwsgENi8yXAR5kx_O55D85BvhHI-WKrKD');
const mikehook = new webhook.Webhook('https://discord.com/api/webhooks/908521016249172040/e1E-oY-rHGtEZyWIQlmDGzGYhEF9mYbJSSljZHhV62rWZdeBdacqiGsAE4fpbV6SEPBc');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/904817438938521690/hxJuY4VRzxEOH2s1WGDFvabhvEvWfKOROUSdSf5cpyMxjZSiSI8hqIOs2a-v45aTwWWQ');
const luminous = new webhook.Webhook('https://discord.com/api/webhooks/909327696511766549/xDp2MAy7LNC5fiGXQbxWMwCZbIX-IFXo7GLNXdxU_C38AnqlMk8xJ6Wvp62A4IOsmPrv');
const fakehook = new webhook.Webhook('https://discord.com/api/webhooks/909993950973153291/gbrhe1C-V003k0-JvFBV0UuZ5AOMEz1Ib_eeCtYXwG2HkNhImfojCS_A_bSjD1-3OMDb');
const CHANNEL = discordBot.channels.BESTBUYCAMUTLI;
let totalData = 0;
const WAITTIME = 200;
const helper = require('../helper');
const DATABASE_TABLE = 'bestbuyca_multi';
const SITENAME = 'BESTBUYCA-MULTI'
let stats;

let LISTS = [];
let PRODUCT_DATA = {}
const SKU_LIST_LENGTH = 50;

startMonitoring();

async function startMonitoring() {
    stats = await helper.manageStats(SITENAME)
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    let PROMISES = []
    for (let row of SKUList.rows) {
        // await preMonitor(row.sku)
        PROMISES.push(preMonitorWrapper(row.sku, row.status))
        pushToList(row.sku);
        // break;
    }
    const results = await Promise.all(PROMISES.map(p => p.catch(e => e)));
    const invalidResults = results.filter(result => (result instanceof Error));
    console.log(invalidResults)
    console.log("DONE!")

    for (let i = 0; i < LISTS.length; i++) {
        await helper.sleep(helper.getRandomNumber(700, 1500));
        monitor(i);
    }
    // console.log(PRODUCT_DATA)
    // console.log(Object.keys(PRODUCT_DATA).length)
    // console.log(SKUList.rows.length)
    for (let x of SKUList.rows) {
        if (!Object.keys(PRODUCT_DATA).includes(x.sku)) {
            console.log(x.sku)
        }
    }
    console.log("[BESTBUY-CA] Started monitoring all SKUs!")
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

async function preMonitorWrapper(sku, status) {
    let data = await preMonitor(sku)
    if (!data)
        console.log("[BESTBUY-CA] Invalid Data for " + sku);
    data.status = status
    PRODUCT_DATA[sku] = data
}

async function preMonitor(sku, count = 0) {
    // console.log(sku)
    count++
    let proxy = helper.getRandomProxy()
    stats.total++;
    try {
        let response = await fetch(`https://api.bazaarvoice.com/data/products.json?passkey=ca56StNjkMTqvaQE5CE0wn1rAjkeCQZWzJEMeNfcAN1c8&apiversion=5.5&filter=id:eq:${sku}`, {
            'headers': {
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'sec-ch-ua-mobile': '?0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            agent: new HTTPSProxyAgent(proxy),
            timeout: 30000
        });

        if (response.status !== 200) {
            console.log("[BESTBUY-CA PREMONITOR] ", response.status, sku, proxy)
            if (count > 10) {
                return null;
            }
            return preMonitor(sku, count);
        }
        let body = JSON.parse(await helper.getBodyAsText(response))
        let title = body.Results[0].Name
        let price = 'NA'
        let image = body.Results[0].ImageUrl
        let result = { title, image, price };
        // console.log(result);
        return result
    }
    catch (err) {
        if (err.toString().includes("timeout") || err.toString().includes('socket hang up')) {

        } else {
            console.log("**************BESTBUY-CA-PREMONITOR**************");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log("Error: " + err.toString())
        }
        if (count > 10) {
            return null;
        }
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
        list += sku + '|';
    }
    list = list.substring(0, list.length - 1);

    let proxy = helper.getRandomProxy()
    let randomSKU = Object.keys(PRODUCT_DATA);
    randomSKU = randomSKU[helper.getRandomNumber(0, randomSKU.length)];
    // let controller = new AbortController();
    // let timeout = setTimeout(() => {
    //     controller.abort();
    // }, 3500);
    let time = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    let body

    // console.log("Sending..")
    stats.total++
    fetch(`https://bestbuyforbusiness.ca/api/product/availability?skus=${list}&abc=${v4()}`, {
        'headers': {
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'sec-ch-ua-mobile': '?0',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {

        if (response.status !== 200) {
            if (response.status === 403) {
                console.log("[BESTBUY-CA] 403 BLOCKED", proxy)
                monitor(listIndex);
                return;
            }
        }
        stats.success++
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
                console.log(`[BESTBUY-CA] Forbidden! - ${proxy}`);
                monitor(listIndex)
                return
            }
            console.log("********************BESTBUY-CA-ERROR********************")
            console.log("SKU-List: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            // console.log(body)
            monitor(listIndex);
            return;
        }
        for (let prod of body) {
            let sku = prod.sku
            let url = `https://www.bestbuy.ca/en-ca/product/tachyon/${sku}`
            // console.log(sku);
            // console.log(PRODUCT_DATA)
            let pData = PRODUCT_DATA[sku];
            let title = pData.title;
            let price = pData.price;
            let image = pData.image;
            let stockCount = prod.availability.onlineAvailabilityCount;

            if (stockCount && stockCount !== 10) {
                if (PRODUCT_DATA[sku].status !== "In-Stock") {
                    postRestockWebhook(url, title, sku, price, image, stockCount);
                    mikePostHook(url, title, sku, price, image, stockCount)
                    console.log(`[BESTBUY-CA-v2] In Stock! ${sku}`)
                    PRODUCT_DATA[sku].status = 'In-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                }
            } else {
                if (PRODUCT_DATA[sku].status !== "Out-of-Stock") {
                    // console.log(PRODUCT_DATA[sku])
                    console.log(`[BESTBUY-CA-v2] OOS! ${sku}`)
                    PRODUCT_DATA[sku].status = 'Out-of-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                }
            }
        }
        console.log("[BESTBUY-CA]", listIndex + " Response time: " + body.length + " " + (Date.now() - time) + " - Proxy: " + proxy);

        await helper.sleep(WAITTIME);
        // console.log("Next..")
        monitor(listIndex)
    }).catch(async function (err) {
        if (err.response && err.response.statusCode === 444) {
            console.log(`[BESTBUY-CA] Forbidden! - ${proxy}`);
            monitor(listIndex)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT') {
            console.log("[BESTBUY-CA] Timeout: " + " - " + proxy);
            await helper.sleep(150);
            monitor(listIndex)
            return;
        }
        if (err.code === 'ECONNRESET') {
            console.log("[BESTBUY-CA] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(listIndex)
            return;
        }
        console.log("********************BESTBUY-CA-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log(err);
        // console.log(body)
        await helper.sleep(150);
        monitor(listIndex)
    })
}

async function postRestockWebhook(url, title, sku, price, image, stock) {
    let ATC = `https://api.bestbuy.ca/click/tachyon/${sku}/cart`
    let cart = `https://www.bestbuy.com/cart`
    let checkout = `https://www.bestbuy.com/checkout/r/fast-track`
    let login = `https://www.bestbuy.com/identity/global/signin`
    let ominous = `[Ominous](http://localhost:2002/quicktask?options=%7B%22module%22:%20%22BestBuy+CA%22,%20%22sku%22:%20%${sku}%22,%20%22quantity%22:%201%7D)`
    let paypalcheckout = `https://www.bestbuy.ca/checkout/?qit=1#/en-ca/shipping?expressPaypalCheckout=true`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.bestbuy.ca', '', 'https://www.bestbuy.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**QT**", ominous, true)
        .addField("**Links**", '[Paypal Checkout](' + paypalcheckout + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ')', true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Bestbuy CA | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    spacehook.send(webhookMessage);
    prestonhook.send(webhookMessage);
    bandithook.send(webhookMessage);
    archook.send(webhookMessage);
    luminous.send(webhookMessage);
    fakehook.send(webhookMessage);
}
async function mikePostHook(url, title, sku, price, image, stock) {
    let ATC = `https://api.bestbuy.ca/click/tachyon/${sku}/cart`
    let cart = `https://www.bestbuy.com/cart`
    let checkout = `https://www.bestbuy.com/checkout/r/fast-track`
    let login = `https://www.bestbuy.com/identity/global/signin`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Forbidden Monitors")
        .setColor("#DA4453")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.bestbuy.ca', '', 'https://www.bestbuy.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
        // .setTime()
        .setFooter("Bestbuy CA | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
    await mikehook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
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
            console.log("[BESTBUY-CA] Invalid Data for " + sku);
            discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
            return;
        }
        PRODUCT_DATA[sku] = data;
        await database.query(`insert into ${DATABASE_TABLE}(sku, status) values('${sku}', '')`);
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
                    console.log("[BESTBUY-CA] Invalid Data for " + sku);
                    discordBot.sendChannelMessage(msg.channel.id, `Invalid Data for '${sku}'`);
                    continue;
                }
                PRODUCT_DATA[sku] = data;
                await database.query(`insert into ${DATABASE_TABLE}(sku, status) values('${sku}', '')`);
                if (!pushToList(sku)) {
                    console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
                    monitor(LISTS.length - 1);
                }
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********BESTBUY-CA-SKU-ERROR*********");
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
        embed.setTitle("BESTBUY-CA Monitor");
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
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}