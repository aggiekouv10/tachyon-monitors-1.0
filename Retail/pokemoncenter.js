const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const got = require('got')
const { webkit } = require('playwright');
const HTTPSProxyAgent = require('https-proxy-agent')
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');

const { v4 } = require('uuid');
const { default: axios } = require('axios');
const helper = require('../helper');

const DistributeManager = require('../Webhook-Manager/manager')

let reese84 = '3:Oh+Y2RTAERI/vVTxNPidWw==:oYvEbS3qqcfPk424TRPbeUSYa95VcZk3sBzIo9ufyQ9hIqOh8YpLm2YG8XpktFcokHjbZUNnHKA1D5ysSb71WTYsEqwo2qMNNv5FIkeIp3wPdIvAXCZbVY580sn1z4WGH1Lx01S+MgOJGYh09OXb2KWUlEnHJIXzFz+YVaz/YelO0LfSEoepIB+TEtTM3HRuGtglbWtxJGB7UaEbsnbZxMtyGLpXPaKd+7TcZXo17sxHKmw/RqT1bA0YyePktgWhHEnN0PGI6CUozIva8DNyHqDJAwcuJN3Sl1dVhwEElBZitPEwFiMbKg2Whi/g/XtqyOsO3tmeifIE4clCPQ6ULaQW5O0BiiZyVbuZl5cmo6wAEUX6D8u7tFcEG3pX8vw35CqMRWjQuAyD+DJZkOft/Lm+XkZFyV6HVjfl4QUVeqxFgNx3M8X7IOu3DbJ5im4eBlDVhsVXG2Dp92wv2LoHHw==:w22sTTIMcy9pxKEQHdYRG3DeoDRR+tcAMhtl2WkulEU='
const SITENAME = 'POKEMONCENTER'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'pokemoncenter';
let PRODUCTS = {}
let stats;
// ^^ THESE

const fbhhook = new webhook.Webhook('https://discord.com/api/webhooks/889548324628201583/Jic0MGfVe6nPOVtXKZnnTwJsX8Sqn0t7-MNggBKN_v9XPKoCISox1zEcaeZ1tmWZn9tp');
const slaphook = new webhook.Webhook('https://discord.com/api/webhooks/888964706012901396/yIKYthF1n3E6MO4Nk2ikoEq85vPguRzieSYVwTjcphQoI61mYAgLHXEkKJYPra4FbEgr');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912554293410799616/efPN3_oXJnlGcvS9oYZFgKp3VxFMYsk8C-HngYeNnAUUJsIYTR73ZxQFuWM9F5mKNuR3');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/908981596718235649/89N-wRSA7Qzg4DNwlVD27Ywcr3oKxt0UoDQQ2mQA4vIOXLE7v5AxHcqsKa15hjHMGM6R')
const luminous = new webhook.Webhook('https://discord.com/api/webhooks/908994056879763466/CANJcKz9BftMk46TDEcJ8cKjFXjLi31SX6s8f5yvlL0BO4Gp5IAyvx_Q87fberEti9Sp')


const distributor = new DistributeManager(SITENAME); //this

pokeGen()
startMonitoring();
async function startMonitoring() {
    await distributor.connect() //this
    stats = await helper.manageStats(SITENAME) //this

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
    console.log('[POKEMONCENTER] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy()
    console.log(reese84)
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    // console.log('Good 0', sku, Date.now())
    const controller = new AbortController(); //this
    const timeoutId = setTimeout(() => controller.abort(), 4000) //this
    stats.total++; //THIS
    fetch(`https://www.pokemoncenter.com/tpci-ecommweb-api/product/${sku}?format=nodatalinks&abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom(),
            'Cookie': 'reese84=' + reese84,
            'X-Store-Scope': 'pokemon',
            'Accept-Language': 'en-US,en;q=0.9'
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
        // 
    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        if (response.status !== 200) {
            console.log(`[POKEMONCENTER] ${response.status}! - ${proxy}`);
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 3000)
        try {
            body = JSON.parse(body)
        } catch (err) {
            console.log("***********POKEMONCENTER-ERROR JSON PARSING***********");
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
        stats.success++
        if (body._availability[0].state === "AVAILABLE" ) {
            let url = `https://www.pokemoncenter.com/product/${sku}`
            let title = body._definition[0]["display-name"]
            let price = body._pricerange[0]['list-price-range']['to-price'][0].display
            let image = 'https://www.pokemoncenter.com' + body.images[0].original
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, offerid);
                console.log(`[POKEMONCENTER] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[POKEMONCENTER] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }

        // console.log('Good', sku, Date.now())
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.response && err.response.statusCode === 444) {
            //console.log(`[POKEMONCENTER] Forbidden! - ${proxy}`);
            monitor(sku)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            //console.log("[POKEMONCENTER] 
            monitor(sku)
            return;
        }
        if (err.code === 'ECONNRESET') {
            //console.log("[POKEMONCENTER] ECONNRESET: " + " - " + proxy);
            monitor(sku)
            return;
        }
        if (err.code === 'ERR_SOCKET_CLOSED') {
            //console.log("[POKEMONCENTER] ECONNRESET: " + " - " + proxy);
            monitor(sku)
            return;
        }
        console.log("********************POKEMONCENTER-ERROR********************")
        console.log("SKUs: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        // console.log(body)
        await helper.sleep(150);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, offerid) {
    let cart = `https://www.walmart.com/cart`
    let checkout = `https://www.walmart.com/account/checkout`
    let login = `https://www.walmart.com/account/login`
    let phantom = `https://api.ghostaio.com/quicktask/send?site=WALMART&input=${url}`
    let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
    let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
    let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
    var webhookMessage = new webhook.MessageBuilder()
      .setName("Tachyon Monitors")
      .setColor("#6cb3e3")
      .setTitle(title)
      .setURL(url)
      .setAuthor('https://www.walmart.com', '', 'https://www.walmart.com')
      .addField("**Stock**", '1+', true)
      .addField("**Price**", price, true)
      .addField("**SKU**", sku, true)
      .addField("**Offerid**", '```' + offerid + '```')
      .addField("**Links**", '[Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
      .setThumbnail(image)
      .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Walmart US | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    spacehook.send(webhookMessage);
    fbhhook.send(webhookMessage);
    slaphook.send(webhookMessage);
    archook.send(webhookMessage);
    luminous.send(webhookMessage);

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
                console.log("*********POKEMONCENTER-SKU-ERROR*********");
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
    
});
async function pokeGen() {
    let proxy = helper.getRandomCAResiProxy();
    let credentials = proxy.split("@")[0].replace("http://", "").split(":")
    let server = proxy.split("@")[1]
    console.log(credentials, server)
    const browser = await webkit.launch({ 
        headless: false, 
        proxy: {
        server: `http://18.214.28.69:31112`,
        username: 'aggiekouv',
        password: 'o471QN3RtzKeYGdh_country-UnitedStates'
    }, 
    userAgent: randomUseragent.getRandom()});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
            ? route.abort()
            : route.continue()
    })
    await page.goto('https://www.pokemoncenter.com/product/701-06560/gigantamax-pikachu-poke-plush-31-in');
    await page.waitForSelector('div[class="_3H3CLWDwxSP9uT4hOUNJfS"]')

    page.on('request', async resp => {
        if (resp.url()) {
            reese84 = await resp.headerValue('reese84')
            console.log(await resp.headerValue('reese84'))
            //await page.close()
            await helper.sleep(1000);
            //pokeGen()
        }
    })
}
module.exports = {
    totalData: function () {
        return totalData;
    }
}