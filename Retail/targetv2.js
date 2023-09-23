const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const AbortController = require('abort-controller');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.TARGET);
const spacehook = new webhook.Webhook("https://discord.com/api/webhooks/912554373597503578/YnE9_Y-Dd8FVy4XPrspqWTrtpxBP3QShA0mDMGqEUcjZ6nzm6_3YVuJ499_zoD6xfwU0")
const CHANNEL = discordBot.channels.TARGET;
const helper = require('../helper');
const DATABASE_TABLE = 'target';
const { v4 } = require('uuid');
let totalData = 0;
let PRODUCTS = {}
const error = false
startMonitoring();

async function startMonitoring() {
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
    console.log('[TARGET-V2] Monitoring all SKUs!')
}
async function monitor(sku) {
    let url = `https://www.target.com/p/tachyon/-/A-${sku}`;
    let proxy = helper.getMixedRotatingProxy();
    let productCache = PRODUCTS[sku]
    let stock = ''
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://redsky.target.com/redsky_aggregations/v1/web_platform/product_fulfillment_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=${sku}&store_id=3259&scheduled_delivery_store_id=1154&required_store_id=3259&has_required_store_id=true`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status === 404) {
            await helper.sleep(productCache.waittime);
            monitor(sku)
            return
        }
        if (response.status === 407) {
            console.log(sku + " Bad SKU")
            monitor(sku)
            return
        }
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        if (body.data.product.fulfillment.shipping_options.available_to_promise_quantity > 0) {
            stock = body.data.product.fulfillment.shipping_options.available_to_promise_quantity
            fetch(`https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=ff457966e64d5e877fdbad070f276d18ecec4a01&tcin=${sku}&store_id=3254&has_store_id=false&pricing_store_id=3254&has_pricing_store_id=true&scheduled_delivery_store_id=none&has_scheduled_delivery_store_id=false&has_financing_options=false&&has_size_context=true`, {
                'headers': {
                    'user-agent': randomUseragent.getRandom()
                },
                agent: new HTTPSProxyAgent(proxy),
            }).then(async response => {
                if (response.status !== 200) {
                    monitor(sku)
                    return
                }
                let body2 = await response.text();
                body2 = JSON.parse(body2);
                let status = productCache.status
                if (stock > 0) {
                    let title = body2.data.product.item.product_description.title;
                    let image = body2.data.product.item.enrichment.images.primary_image_url || 'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
                    let price = body2.data.product.price.formatted_current_price;
                    if (status !== "In-Stock") {
                        await postRestockWebhook(url, title, sku, price, image, stock);
                        console.log(`[TARGET-V2] In Stock! ${sku}`)
                        PRODUCTS[sku].status = 'In-Stock'
                        await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    }
                } else {
                    if (status !== "Out-of-Stock") {
                        console.log(`[TARGET-V2] OOS! ${sku}`)
                        PRODUCTS[sku].status = 'Out-of-Stock'
                        await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                    }
                }
            }).catch(async err => {
                console.log("***********TARGET-V2-ERROR***********");
                console.log("SKU: " + sku);
                console.log("Proxy: " + proxy);
                console.log(err);
                monitor(sku)
                return
            });
        }
    }).catch(async err => {
        console.log("***********TARGET-V2-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
        return
    });
    await helper.sleep(productCache.waittime);
    monitor(sku);
}

async function postRestockWebhook(url, title, sku, price, image, stock) {
    let atc = `https://www.target.com/s?searchTerm=${sku}&bot=tachyon&stock=1`
    let checkout = `https://www.target.com/co-cart`
    let cart = 'https://www.target.com/co-cart'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.target.com', '', 'https://www.target.com')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Links**", '[ATC](' + atc + ') | [Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Target | v2.3 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    spacehook.send(webhookMessage);
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
                console.log("*********TARGET-V2-SKU-ERROR*********");
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
            embed.setTitle(`TARGET-V2 Monitor`);
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
