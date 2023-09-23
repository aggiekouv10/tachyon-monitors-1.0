const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const AbortController = require('abort-controller');

const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYCA);
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912571939187470368/k-9PPebE1DL-86KU6F1WMyJfMTTV0Jxx3OBmetaKP4e6K6gYUQw_FJFwjimbrp4-dZYk');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901740805734158366/PxJoZ5VvXp9UTY9ibQ5EpYo9si3E8MCLSJhvb9741wC6iaG5Jv3cj31hX1G_P7wibDpF');
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904868657102983178/MNUJ-WgzIeIdqm7ct1KQjjI09Hf5rvObsh9YwsgENi8yXAR5kx_O55D85BvhHI-WKrKD');
const mikehook = new webhook.Webhook('https://discord.com/api/webhooks/908521016249172040/e1E-oY-rHGtEZyWIQlmDGzGYhEF9mYbJSSljZHhV62rWZdeBdacqiGsAE4fpbV6SEPBc');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/904817438938521690/hxJuY4VRzxEOH2s1WGDFvabhvEvWfKOROUSdSf5cpyMxjZSiSI8hqIOs2a-v45aTwWWQ');
const luminous = new webhook.Webhook('https://discord.com/api/webhooks/909327696511766549/xDp2MAy7LNC5fiGXQbxWMwCZbIX-IFXo7GLNXdxU_C38AnqlMk8xJ6Wvp62A4IOsmPrv');
const fakehook = new webhook.Webhook('https://discord.com/api/webhooks/909993950973153291/gbrhe1C-V003k0-JvFBV0UuZ5AOMEz1Ib_eeCtYXwG2HkNhImfojCS_A_bSjD1-3OMDb');
const CHANNEL = discordBot.channels.BESTBUYCA;
const helper = require('../helper');
const DATABASE_TABLE = 'bestbuyca';
const SITENAME = 'BESTBUYCA'
//let stats;

const { v4 } = require('uuid');

let totalData = 0;

let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    //stats = await helper.manageStats(SITENAME)
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
    console.log('[BESTBUY-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let url = `https://www.bestbuy.ca/en-ca/product/tachyon/${sku}`;
    let proxy = helper.getUSARotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    //stats.total++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.bestbuy.ca/api/v2/json/product/${sku}?abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
        },
        //agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("[BESTBUY-CA] " + sku + ": " + response.status, proxy)
        let body = await helper.getBodyAsText(response);
        if (response.status !== 200) {
            // console.log("[BESTBUY-CA] " + sku + ": " + response.status)
            monitor(sku)
            return
        }
        //stats.success++;
        body = JSON.parse(body);
        let status = productCache.status
        if (body.availability.onlineAvailabilityCount > 0 && body.sellerId === null) {
            let status = productCache.status
            let title = body.name
            let price = '$' + body.salePrice
            let image = body.thumbnailImage
            let stock = body.availability.onlineAvailabilityCount
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, stock);
                mikePostHook(url, title, sku, price, image, stock)
                console.log(`[BESTBUYCA] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[BESTBUYCA] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.toString().includes('request')) {
            monitor(sku)
        } else {
            console.log("***********BESTBUYCA-ERROR***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            monitor(sku)
        }
    });
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
        .setFooter("Bestbuy CA | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
        .setFooter("Bestbuy CA | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
    mikehook.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    //if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
    //    discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    //}

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
                console.log("*********BESTBUYCA-SKU-ERROR*********");
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
            embed.setTitle(`BESTBUYCA Monitor`);
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
    
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}