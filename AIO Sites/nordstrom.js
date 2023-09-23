const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const request = require('request-promise');
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const { webkit, devices } = require('playwright');
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller')
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NORDSTROM);
const tachyonhook = new webhook.Webhook("https://discord.com/api/webhooks/834169799990837258/DIi9BSDhjerP_hR7zx1d-MbWFONYTwAVro7lOfuMmBxtKyK-nNluyOsdoq3urxCcc2EY")
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/969379711400693840/F89-OgPFQB3NWePzmLkKrHaBw9c_cXa9WhREp_pw0tkJOw5YIpjeRuemU2zqYhRcMWhR');
const space = new webhook.Webhook('https://discord.com/api/webhooks/975536798107332668/SourLZ6oygvltPhLv01JJcaKXeOGshhxfLQKEpw4XKFj390IoIw1lJRB7NC-UmOEazuS');
const drop = new webhook.Webhook('https://discord.com/api/webhooks/982665840543551510/FI7FKKWtGuiotKdrXQAD1IHLX6VDwHGWN8-Gh_17MEGOYLasNiX1kepLHK7JXiU6z_sU');
const copbox = new webhook.Webhook('https://discord.com/api/webhooks/989020377072160808/UR6TLqmGtC2Q3lRS0dxKNqM9skqOrQ3qfEsrZQjo4ouvMXGFpwI-mGKLdqaEh3wIl0m7');
const elephent = new webhook.Webhook('https://discord.com/api/webhooks/989020422974619658/GUIF147sE5LI2ZRuOuKQ2HCPW-MBJuFVBG9qNqnPSgB9I3uBdt3tsvimMNyagbfI1-3o');
const cookology = new webhook.Webhook('https://discord.com/api/webhooks/849478344902705163/AXduq03EnyTJW8omYAUeFF3QacSU5aGyyFu0VJFMaWOG5nPWmlQGFdbZ5gR6EmYGm_nd');

const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'nordstrom';
const SITENAME = 'NORDSTROM'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let fheader = ''
let bheader = ''
let cheader = ''
let dheader = ''
let zheader = ''
let aheader = ''
let totalData = 0;
let PRODUCTS = {}
let totalRequests = 0;
let totalSuccess = 0;
let useragent = ''

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
    console.log('[NORDSTROM] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomDDProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www.nordstrom.com/api/style/${sku}?abcz=${v4()}`, {
        'headers': {
            'user-agent': 'Mozilla/5.0 (compatible; MJ12bot/v1.4.1; http://www.majestic12.co.uk/bot.php?+)',
            'Accept': 'application/vnd.nord.pdp.v1+json',
            'consumer-id': 'recs-PDP_1',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            console.log('DEAD!!!!!!')
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        body = await JSON.parse(body);
        if (body.errorcode == 'ERROR_STYLE_NOT_FOUND') {
            console.log('[NORDSTROM] ' + sku + ' not found!')
            return
        }
        let ids = body.skus.allIds
        if (ids.length > 0) {
            console.log(body.productTitle)
            let title = body.productTitle
            let parse = body.defaultGalleryMedia.styleMediaId
            let image = 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829'
            try { image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop }
            catch (e) { }
            let stock = 0
            let price = ''
            let url = `https://www.nordstrom.com/s/tachyon/${sku}`
            let sizes = []
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false
            let sizeList = []
            let oosid = body.soldOutSkus.byId
            let oossku = body.soldOutSkus.allIds
            let inid = body.skus.byId
            let insku = body.skus.allIds
            let vars = Object.assign(oosid, inid)
            let skus = Object.assign(oossku, insku)
            for (let id of skus) {
                if (vars[id].isAvailable === true || vars[id].totalQuantityAvailable > 0) {
                    sizes += `${vars[id].sizeId} (${vars[id].totalQuantityAvailable}) - ${vars[id].rmsSkuId}\n`
                    stock += Number(vars[id].totalQuantityAvailable)
                    sizeList.push(vars[id].rmsSkuId);
                    price = vars[id].displayPrice
                    if (!oldSizeList.includes(vars[id].rmsSkuId))
                        inStock = true;
                }
            }
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            if (inStock) {
                postElphent(sizes, sku, title, price, image)
                postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock)
                postdrop(url, title, sku, price, image, sizeright, sizeleft, stock)
                postcopbox(url, title, sku, price, image, sizeright, sizeleft, stock)
                cookologyhook(url, title, sku, price, image, sizeright, sizeleft, stock)
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
async function postElphent(sizes, sku, title, price, image) {
    const options = {
        method: 'POST',
        url: 'https://cloudapii.herokuapp.com/bdgfhbdfghbtb',
        headers: { 'Content-Type': 'application/json' },
        body: {
            offerid: sizes,
            sitesku: sku,
            title: title,
            price: price,
            image: image
        },
        json: true
    };

    request(options, function (error) {
        if (error) throw new Error(error);
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Nordstrom | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await tachyonhook.send(webhookMessage)
    await synthiysis.send(webhookMessage)
    await space.send(webhookMessage)
}
async function postdrop(url, title, sku, price, image, sizeright, sizeleft, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Drop Alert")
        .setColor("#eb6339")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/973659244723310643/983215242668539934/win.png")
        .setFooter("Nordstrom | v1.0 • " + helper.getTime(true), 'https://cdn.discordapp.com/attachments/973659244723310643/983215242668539934/win.png')
    await drop.send(webhookMessage)
}

async function cookologyhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cookology")
        .setColor("#7557c8")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/894983430952063047/894983493984088084/Group_41.png")
        .setFooter("Nordstrom by Tachyon | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/894983430952063047/894983493984088084/Group_41.png')
    await cookology.send(webhookMessage)
}

async function postcopbox(url, title, sku, price, image, sizeright, sizeleft, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cop Box")
        .setColor("#cd8fff")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg")
        .setFooter("Nordstrom | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg')
    await copbox.send(webhookMessage)
    await elephent.send(webhookMessage)
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

    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${totalSuccess}/${totalRequests}  [${Math.round(totalSuccess / totalRequests * 10000) / 100}%]`);
    }
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}

async function shapegen() {
    let proxy = helper.getMixedRotatingProxy();
    let credentials = proxy.split("@")[0].replace("http://", "").split(":")
    let server = proxy.split("@")[1]
    const browser = await webkit.launch({
        headless: true,
        proxy: {
            server: proxy,
        },
        userAgent: randomUseragent.getRandom()
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
            ? route.abort()
            : route.continue()
    })
    await page.goto('https://www.nordstrom.com/s/converse-chuck-taylor-all-star-run-star-hike-high-top-platform-sneaker-unisex/5419083?origin=category-personalizedsort&breadcrumb=Home%2FMen%2FShoes&color=102');
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
            await helper.sleep(5000);
            shapegen()
        }
    })
}
