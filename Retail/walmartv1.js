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

const { v4 } = require('uuid');
const { default: axios } = require('axios');
const helper = require('../helper');

const DistributeManager = require('../Webhook-Manager/manager')

const SITENAME = 'WALMARTUS'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'walmartus';
let PRODUCTS = {}
// ^^ THESE

const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/935982755114807326/ULsA3DIvd42y0MaMOo675EfCHkMdIOTPYdjp5ybbgdu9T1qYj_sP7GFvrjQb88Xj65Id');


const distributor = new DistributeManager(SITENAME); //this


startMonitoring();

async function startMonitoring() {
    await distributor.connect() //this

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
    console.log('[WALMART-US-1] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getUSARotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    // console.log('Good 0', sku, Date.now())
    const controller = new AbortController(); //this
    const timeoutId = setTimeout(() => controller.abort(), 2000) //this
    fetch(`https://www-walmart-com.translate.goog/terra-firma/item/${sku}?abcz=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
        'headers': {
            'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
        // 
    }).then(async response => {
        clearTimeout(timeoutId)
         //THIS

        if(response.status === 200) {
            // console.log("200")
        }
        if(response.status === 400) {
            monitor(sku)
            return
        }

        if (response.status !== 200) {
            console.log(`[WALMART-US-1] ${response.status}! - ${proxy}`);
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 3000)
        // console.log('Good 2', sku, Date.now())
        try {
            body = JSON.parse(body)
            // console.log('Good 3', sku, Date.now())
        } catch (err) {
            if (body.includes('Forbidden')) {
                //console.log(`[WALMART-US-1] Forbidden!! - ${proxy}`);
                monitor(sku)
                return
            }
            console.log("***********WALMART-US-1-ERROR JSON PARSING***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log("Status: " + response.status)
            console.log(err);
            //console.log(body);
            await helper.sleep(200);
            monitor(sku)
            return;
        }
        let status = productCache.status
        if (body.blockScript) {
            console.log(`[WALMART-US-1] Blocked! - ${proxy}`);
            monitor(sku)
            return
        }
        for (let offerID in body.payload.offers) {
            let offer = body.payload.offers[offerID];
            if (offer.sellerId !== 'F55CDC31AB754BB68FE0B39041159D63')
              continue;
        if (offer.productAvailability.availabilityStatus === "IN_STOCK" ) {
            let url = `https://www.walmart.com/ip/tachyon/${sku}`
            let product = body.payload.selected.product
            let title = body.payload.products[product].productAttributes.productName
            let price = "$" + offer.pricesInfo.priceMap.CURRENT.price
            let offerid = offer.id
            let image = body.payload.images[body.payload.selected.defaultImage].assetSizeUrls.DEFAULT;
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, offerid);
                console.log(`[WALMART-US-1] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[WALMART-US-1] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
    }
        // console.log('Good', sku, Date.now())
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.response && err.response.statusCode === 444) {
            //console.log(`[WALMART-US-1] Forbidden! - ${proxy}`);
            monitor(sku)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            //console.log("[WALMART-US-1] 
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ECONNRESET') {
            //console.log("[WALMART-US-1] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ERR_SOCKET_CLOSED') {
            //console.log("[WALMART-US-1] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        console.log("********************WALMART-US-1-ERROR********************")
        console.log("SKUs: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        // console.log(body)
        await helper.sleep(150);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, offerid) {
    let ATC = `http://goto.walmart.com/c/2242082/565706/9383?veh=aff&sourceid=imp_000011112222333344&prodsku=${sku}&u=http%3A%2F%2Faffil.walmart.com%2Fcart%2Fbuynow%3F%3Dveh%3Daff%26affs%3Dsdk%26affsdkversion%3D%26affsdktype%3Djs%26affsdkcomp%3Dbuynowbutton%26colorscheme%3Dorange%26sizescheme%3Dprimary%26affsdkreferer%3Dhttp%253A%252F%252Faffil.walmart.com%26items%3D${sku}%7C1%26upcs%3D`
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
      .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
      .setThumbnail(image)
      .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Walmart US | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    synthiysis.send(webhookMessage);


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