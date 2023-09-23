const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller')
const helper = require('../helper');
const { v4 } = require('uuid');

const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912564069490376805/Y0VrfneJoIhYkpVFgA8AgIhPhOHMESepD3BVQCItgpoy_qoracJ-TiqJeBOG6oRniGue');
const SITENAME = 'ASOS'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
const DATABASE_TABLE = 'asos';
let PRODUCTS = {}
let stats;

const DistributeManager = require('../Webhook-Manager/manager')
const distributor = new DistributeManager(SITENAME);

startMonitoring();

async function startMonitoring() {
    await distributor.connect()
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
    console.log('[ASOS] Monitoring all SKUs!')
}

async function monitor(sku) {

    let proxy = helper.getRandomDDProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;

    const controller = new AbortController(); //this
    const timeoutId = setTimeout(() => controller.abort(), 2000) //this
    fetch(`https://api-asos-com.translate.goog/product/catalogue/v3/products/${sku}?store=COM&abcz=${v4()}&_x_tr_sl=el&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp`, {
        'headers': {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
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
        body = JSON.parse(body);
        if (body.isInStock === true) {
            let title = body.name
            let price = body.price.current.text
            let image = 'https://imageresize.24i.com/?w=300&url=https://' + body.media.images[0].url
            let url = `https://www.asos.com/tachyon/prd/${sku}`
            let sizes = []
            let variant = ''
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false
            let sizeList = []
            for (variant of body.variants) {
                if (variant.isInStock === true) {
                    sizes += variant.displaySizeText.replace('UK ', '') + ' UK\n'
                    sizeList.push(variant.displaySizeText);
                    if (!oldSizeList.includes(variant.displaySizeText))
                        inStock = true;
                }
            }
            let sizeright = sizes.split('\n')
            let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
            if (inStock) {
                postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft)
                inStock = false;
                await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }

        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.toString().includes('request') || err.toString().includes('network')) {
            monitor(sku)
        } else {
            console.log("***********ASOS-ERROR***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            monitor(sku)
        }
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft) {
    let fr = `[FR](https://www.asos.com/fr/tachyon/prd/${sku}) . `
    let it = `[IT](https://www.asos.com/it/tachyon/prd/${sku}) . `
    let de = `[DE](https://www.asos.com/de/tachyon/prd/${sku})\n`
    let gb = `[GB](https://www.asos.com/gb/tachyon/prd/${sku}) . `
    let pl = `[PL](https://www.asos.com/pl/tachyon/prd/${sku}) . `
    let es = `[ES](https://www.asos.com/es/tachyon/prd/${sku})`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.asos.com/gb/tachyon/prd/23600038)\n`
    let polar = `[PolarCop](https://qt.polarcop.com/asos?pid=https://www.asos.com/gb/tachyon/prd/23600038)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.asos.com', '', 'https://www.asos.com')
        .addField("**Stock**", '1+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        .addField("QT", flare + polar, true)
        .addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Asos | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    spacehook.send(webhookMessage)
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
                console.log("*********ASOS-SKU-ERROR*********");
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
            embed.setTitle(`ASOS Monitor`);
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