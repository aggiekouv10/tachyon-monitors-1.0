const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const HTMLParser = require('node-html-parser');

const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.JDSPORTSUS);
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/969379856456495104/VGfAcxn0Ds3zf-N5zYx9eb2Sey_sHermGbASktah9snDC82gFa5f_oU-B0bdDJfp8d9f');
//('https://discord.com/api/webhooks/973715972844318771/DKIOPmOKEvyrwAEwNyFTeO1lRp7UodBc1FhuESKmgNcBbYi7tQLEua9qPiUwWWdAkthc')
const space = new webhook.Webhook('https://discord.com/api/webhooks/975542489215823942/snqcO6MDgHE61NLxVggOrEm_Ua55nne2PqS9i1CgC9kptUitVTTrtbwvdwI36-JD0Zse');
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'jdsports';
const SITENAME = 'JDSPORTSUS'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let stats;
let totalData = 0;
let PRODUCTS = {}
startMonitoring();

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
    console.log('[JD-SPORTS] Monitoring all SKUs!')
}
async function monitor(sku) {
    let productID = sku.split(',')[0]
    let styleID = sku.split(',')[1]
    let colorID = sku.split(',')[2]
    let proxy = helper.getRandomDDProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www.jdsports.com/store/browse/json/productSizesJson.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}&productId=${v4()}`, {
        'headers': {
            'User-Agent': 'SSL Labs (https://www.ssllabs.com/about/assessment.html); on behalf of 69.179.157.70'
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        if(body.includes('WAITING')) {
            monitor(sku)
            return
        }
        body = JSON.parse(body);
        if(body.productSizes.length < 0) {
            await helper.sleep(productCache.waittime);
            monitor(sku)
            return
        }
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
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 4000)
            fetch(`https://www.jdsports.com/store/browse/gadgets/productLookupXML.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}`, {
                'headers': {
                    'User-Agent': 'SSL Labs (https://www.ssllabs.com/about/assessment.html); on behalf of 69.179.157.70'
                },
                agent: new HTTPSProxyAgent(proxy),
                signal: controller2.signal
            }).then(async response => {
                clearTimeout(timeoutId2)
                if (response.status !== 200) {
                    monitor(sku)
                    return
                }
                let body2 = await helper.getBodyAsText(response)
                if(body2.includes('WAITING')) {
                    monitor(sku)
                    return
                }
                let root = HTMLParser.parse(body2);
                let title = root.querySelector('name').textContent
                let price = ''
                if (root.querySelector('sale').textContent.length > 0) {
                    price = root.querySelector('sale').textContent
                }
                if (root.querySelector('fullPrice')) {
                    price = root.querySelector('fullPrice').textContent
                }
                let image = root.querySelector('image').textContent
                let url = `https://www.jdsports.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}`
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                if (inStock) {
                    postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock, productID, styleID, colorID)
                    inStock = false;
                    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
                }
            }).catch(async err => {
                console.log(err);
                monitor(sku)
                return;
            });
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.type === 'aborted') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        console.log("***********JDSPORTS-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock, productID, styleID, colorID) {
    let cyber = `[Cyber](https://cybersole.io/dashboard/tasks?quicktask=jdsports:${productID}) . `
    let phantom = `[Phantom](https://api.ghostaio.com/quicktask/send?site=jdsports&input=${productID}:${styleID}:${colorID}) . `
    let wrath = `[Wrath](http://localhost:32441/qt?input=https://www.jdsports.com/store/product/~/${productID}?styleId=${styleID}%26colorId=${colorID})\n`
    let ganesh = `[Ganesh](http://www.ganeshbot.com/api/quicktask?STORE=JD-SPORTS&PRODUCT=https://www.jdsports.com/store/product/ganesh/${productID}?styleId=${styleID}&colorId=${colorID}&SIZE=8&MODE=MOBILE)  . `
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
        .setFooter("JD Sports | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await synthiysis.send(webhookMessage)
    await space.send(webhookMessage)
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
                console.log("*********JD-SPORTS-SKU-ERROR*********");
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
            embed.setTitle(`JD-SPORTS Monitor`);
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