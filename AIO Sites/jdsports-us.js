const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.JDSPORTSUS);
const CHANNEL = discordBot.channels.JDSPORTSUS;
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'jdsportsus';
const SITENAME = 'JDSPORTSUS'
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
let stats;
let totalData = 0;
startMonitoring();

async function startMonitoring() {
    stats = await helper.manageStats(SITENAME)
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
    console.log('[JDSPORTS-US] Monitoring all SKUs!')
}
async function monitor(sku) {
    let productID = sku.split(',')[0]
    let styleID = sku.split(',')[1]
    let colorID = sku.split(',')[2]
    let proxy = helper.getUSARotatingProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    stats.total++;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www-jdsports-com.translate.goog/store/browse/json/productSizesJson.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}&productId=${v4()}&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`, {
        'headers': {
            'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)'
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        stats.success++;

        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let sizes = ''
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        let sizesparse = body.productSizes
        let stock = 0
        for (let size of sizesparse) {
            if (size.sizeValue) {
                if (size.productId === styleID + '_' + colorID) {
                    if (size.sizeClass !== 'unavailable') {
                        stock += Number(Buffer.from(size.stockLevel, 'base64'))
                        sizes += `${size.sizeValue} (${Buffer.from(size.stockLevel, 'base64').toString()})\n`
                        sizeList.push(size.sizeValue);
                        if (!oldSizeList.includes(size.sizeValue))
                            inStock = true;
                    }
                }
            }
        }
        if (inStock === true) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000)
            fetch(`https://www-jdsports-com.translate.goog/store/recommendations/json/productRecommendationsEndecaJson.jsp?renderType=pdp&products=${productID}:${styleID}:${colorID}%7C&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
                'headers': {
                    'User-Agent': 'AdsBot-Google (+http://www.google.com/adsbot.html)'
                },
                agent: new HTTPSProxyAgent(proxy),
                signal: controller.signal
            }).then(async response => {
                clearTimeout(timeoutId)
                if (response.status !== 200) {
                    monitor(sku)
                    return
                }

                let body2 = await response.text();
                body2 = JSON.parse(body2);
                let title = body2.productsArray[0].displayName;
                let price = body2.productsArray[0].price.nowPrice
                let image = body2.productsArray[0].image
                let url = `https://www.jdsports.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}`
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                if (inStock) {
                    postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock, productID, styleID, colorID)
                    inStock = false;
                    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
                }
            })
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock, productID, styleID, colorID) {
    console.log(arguments)
    let cyber = `[Cyber](https://cybersole.io/dashboard/tasks?quicktask=JDSPORTS:${productID}) . `
    let phantom = `[Phantom](https://api.ghostaio.com/quicktask/send?site=JDSPORTS&input=${productID}:${styleID}:${colorID}) . `
    let wrath = `[Wrath](http://localhost:32441/qt?input=https://www.jdsports.com/store/product/~/${productID}?styleId=${styleID}%26colorId=${colorID})\n`
    let ganesh = `[Ganesh](http://www.ganeshbot.com/api/quicktask?STORE=JDSPORTS&PRODUCT=https://www.jdsports.com/store/product/ganesh/${productID}?styleId=${styleID}&colorId=${colorID}&SIZE=8&MODE=MOBILE)  . `
    let kage = `[Kage](http://localhost:1007/quickTasks?site=jdsports&sku=${productID})`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.jdsports.com', '', 'https://www.jdsports.com')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        .addField("QT", cyber + phantom + wrath + ganesh + kage, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("JD Sports US | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
                console.log("*********JDSPORTS-US-SKU-ERROR*********");
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
            embed.setTitle(`JDSPORTS-US Monitor`);
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