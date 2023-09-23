const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const HTMLParser = require('node-html-parser');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.CHAMPSSPORTS);
//('https://discord.com/api/webhooks/972569353725812826/QMPRLQC-i50RjUCKcZk32Q1JgEJv_A0DWMwhs2NPqzus1y7x8b48jAejLwUpZ1ZZQuID');
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/973440397755969577/vB5Gs8ya3Fiq_Rpbv4it9BcTaxU0MYFYkLZxi_ea7NNhmfY_uHoI2P5zhr2vdxa5qQDI');
const space = new webhook.Webhook('https://discord.com/api/webhooks/975542035513761802/GMnJV7WQUleXShNqG4z0xFWXExynHMAaODRLOW27whLbJX_PCS0uJML6TMUcAOVJ6NFV');
const drop = new webhook.Webhook('https://discord.com/api/webhooks/915338309625065472/tMp7xazIcPekY1xHyG65w9Gtubr_VjXSzKm41ls0mF59zr9DSABskWYkmNqE8STD0Bkf');

const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'champssports';
const SITENAME = 'CHAMPSSPORTS'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
//et stats;
let totalData = 0;
startMonitoring();

async function startMonitoring() {
    //stats = await helper.manageStats(SITENAME)
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes,
        }
        monitor(row.sku);
        // break;
    }
    console.log('[CHAMPSSPORTS] Monitoring all SKUs!')
}


async function monitor(sku) {
    let proxy = helper.getUSARotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www-champssports-com.translate.goog/zgw/product-core/v1/pdp/sku/${sku}?_x_tr_sl=en&_x_tr_tl=el&_x_tr_hl=en&_x_tr_pto=wapp`, {
        'headers': {
            'User-Agent': randomUseragent.getRandom(),
            'x-forwarded-for': ' ',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        if (response.status == 404) {
            await helper.sleep(productCache.waittime);
            monitor(sku);
            return
        }
        if (response.status != 200) {
            monitor(sku);
            return
        }
        body = JSON.parse(body);
        if (body.inventory.inventoryAvailable == true) {
            let title = body.model.name
            let price = body.style.price.formattedSalePrice
            let image = `https://images.footlocker.com/is/image/EBFL2/${sku}_a1?wid=520&hei=520&fmt=png-alpha`
            let url = `https://www.champssports.com/product/~/${sku}.html#Tachyon`
            let sizes = []
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false
            let sizeList = []
            let variants = body.sizes
            let count = 0
            for (let variant of variants) {
                if (variant.inventory.inventoryAvailable != true)
                    continue
                sizes += `[${variant.size}](https://www.champssports.com/product/~/${sku}.html?size=${variant.size}) - ${variant.productWebKey}\n`
                count++
                sizeList.push(variant.size);
                if (!oldSizeList.includes(variant.size.substring(1))) {
                    inStock = true;
                }
            }
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            if (inStock) {
                if (body.style.launchAttributes.launchDisplayCounterEnabled && body.style.launchAttributes.launchProduct) {
                    count = "LOADED " + count
                    title = "LOADED TO DROP " + body.style.launchAttributes.launchDate + "\n" + title
                }
                postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, count)
                inStock = false;
                await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
        }
        // console.log(Date.now() - time)
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.type === 'aborted') {
            //console.log("[CHAMPSSPORTS] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[CHAMPSSPORTS] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        console.log("***********CHAMPSSPORTS-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var zephyraio = `https://api.zephyraio.com/api/quicktask?url=https://www.champssports.com/product/~/${sku}.html`
    var prism = 'https://prismaio.com/dashboard?url=https://www.champssports.com/product/~/' + sku + '.html'
    var Polaris = 'http://localhost:9099/footsites?store=champssports&sku=' + sku + '&platform=desktop'
    var kylin = `https://dashboard.kylinbot.io/quick-task/kylin-bot/create?input=https://www.champssports.com/product/~/${sku}.html&sku=${sku}`
    var cyber = 'https://cybersole.io/dashboard/tasks?quicktask=champssports:' + sku
    var EVE = 'http://remote.eve-backend.net/api/v2/quick_task?link=https://www.champssports.com/&sku=' + sku
    var Ganesh = 'https://ganeshbot.com/api/quicktask?STORE=CHAMPSSPORTS%20US&PRODUCT=' + sku + '&SIZE=ANY'
    var Whatbot = 'https://whatbot.club/redirect-qt?qt=whatbot://https://www.champssports.com/product/~/A4159800' + sku + '.html'
    var PD = 'https://api.destroyerbots.io/quicktask?url=https://www.champssports.com/product/~/A4159800' + sku + '.html'
    var MekAIO = `https://dashboard.mekrobotics.com/quicktask?link=https://www.champssports.com/product/~/${sku}.html&sku=${sku}`
    var wrath = 'https://whatbot.club/redirect-qt?qt=whatbot://https://www.champssports.com/product/~/' + sku + '.html'
    var hayha = `http://localhost:7447/qt?url=https://www.champssports.com/product/~/${sku}.html`
    var venetia = `http://localhost:4444/quicktask?storetype=Footsites&input=https://www.champssports.com/product/~/${sku}.html`
    var kage = `http://localhost:1007/quickTasks?site=champssports&sku=${sku}`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.champssports.com', '', 'https://www.champssports.com')
        .addField("**Stock**", count + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField("**QT**", '[Kage](' + kage + ') | ' + '[Prism](' + prism + ') | ' + '[Polaris](' + Polaris + ') | ' + '[Kylin](' + kylin + ') | ' + '[Cyber](' + cyber + ') | [EVE](' + EVE + ') | ' + '[Ganesh](' + Ganesh + ') | ' + '[Whatbot](' + Whatbot + ') | ')
        .addField(" ", '[PD](' + PD + ') | ' + '[MekAIO](' + MekAIO + ') | ' + '[Hayha](' + hayha + ') | ' + '[Venetia](' + venetia + ') | ' + '[Wrath](' + wrath + ') | ' + '[ZephyrAIO](' + zephyraio + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("ChampsSports US | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    synthiysis.send(webhookMessage);
    space.send(webhookMessage);
    drop.send(webhookMessage);
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
                console.log("*********CHAMPSSPORTS-SKU-ERROR*********");
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
            embed.setTitle(`CHAMPSSPORTS Monitor`);
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
            embed.setTitle(`CHAMPSSPORTS Monitor Times`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`CHAMPSSPORTS Monitor Times`);
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
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorStatuses')) {
        if (msg.channel.id === CHANNEL) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`CHAMPSSPORTS Monitor Statuses`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`CHAMPSSPORTS Monitor Statuses`);
            embed2.setColor('#6cb3e3')
            if (Object.keys(PRODUCTS).length > 0) {
                let SKUList1 = [];
                let SKUList2 = [];
                let i = 0;
                for (let sku of Object.keys(PRODUCTS)) {
                    if (i < Object.keys(PRODUCTS).length / 2)
                        SKUList1.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
                    else
                        SKUList2.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
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