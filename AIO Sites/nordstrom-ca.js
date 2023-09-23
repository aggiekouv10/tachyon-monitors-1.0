const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const { webkit, devices } = require('playwright');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NORDSTROMCA);
const mikehook = new webhook.Webhook("https://discord.com/api/webhooks/807363503836233728/wo_POOGfCHNIJtoRvKx-sFP2qwIzju_U9wGD8OXUaY6CErEGB8nfYrh9jI13jlNDtkvB")
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'nordstromca';
const SITENAME = 'NORDSTROMCA'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
let stats;
let totalData = 0;
let fheader = ''
let bheader = ''
let cheader = ''
let dheader = ''
let zheader = ''
let aheader = ''
//shapegen()
startMonitoring()
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[NORDSTROM-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www.nordstrom.ca/api/style/${sku}?abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom(),
            'Accept': 'application/vnd.nord.pdp.v1+json',
            'x-y8s6k3db-f': fheader,
            'x-y8s6k3db-b': bheader,
            'x-y8s6k3db-c': cheader,
            'x-y8s6k3db-d': dheader,
            'x-y8s6k3db-z': zheader,
            'x-y8s6k3db-a': aheader,
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status === 403) {
            monitor(sku)
            return
        }
        if (response.status === 407) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        if (body.isAvailable === true) {
            let title = body.productTitle
            let parse = body.defaultGalleryMedia.styleMediaId
            let image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop
            let stock = 0
            let price = ''
            let url = `https://www.nordstrom.ca/s/tachyon/${sku}`
            let sizes = []
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false
            let sizeList = []
            let ids = body.skus.allIds
            for (let id of ids) {
                if (body.skus.byId[id].isAvailable === true) {
                    sizes += `${body.skus.byId[id].sizeId} (${body.skus.byId[id].totalQuantityAvailable})\n`
                    stock += Number(body.skus.byId[id].totalQuantityAvailable)
                    sizeList.push(body.skus.byId[id].sizeId);
                    price = body.price.bySkuId[id].priceString
                    if (!oldSizeList.includes(body.skus.byId[id].sizeId))
                        inStock = true;
                }
            }
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            if (inStock) {
                postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock)
                inStock = false;
                await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }

        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        //console.log("***********NORDSTROM-ERROR***********");
        //console.log("SKU: " + sku);
        //console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.nordstrom.ca', '', 'https://www.nordstrom.ca')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Nordstrom | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await mikehook.send(webhookMessage)
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
                console.log("*********NORDSTROM-SKU-ERROR*********");
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
            embed.setTitle(`NORDSTROM Monitor`);
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

async function shapegen() {
    let proxy = helper.getRandomProxy();
    const launchOptions = {
        proxy: {
            server: proxy
        }
    };
    const browser = await webkit.launch({ headless: true, launchOptions, userAgent: randomUseragent.getRandom() });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
            ? route.abort()
            : route.continue()
    })
    await page.goto('https://www.nordstrom.ca/s/tachyon/5768422');
    await page.waitForSelector('div[class="_2h2RA"]')

    page.on('request', async resp => {
        if (resp.url().includes('/cake')) {
            fheader = await resp.headerValue('x-y8s6k3db-f')
            bheader = await resp.headerValue('x-y8s6k3db-b')
            cheader = await resp.headerValue('x-y8s6k3db-c')
            dheader = await resp.headerValue('x-y8s6k3db-d')
            zheader = await resp.headerValue('x-y8s6k3db-z')
            aheader = await resp.headerValue('x-y8s6k3db-a')
            await page.close()
            await helper.sleep(10000);
            shapegen()
        }
    })
}