// https://api.currys.co.uk/smartphone/api/productsStock/10208007,<sku2>
// (STOCK numbers)

// https://api.currys.co.uk/smartphone/api/products/10208007<sku>
// (details)

const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller');

const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.CURRYUK);
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912564570982338610/aaJzYI-VUBuMbIz7CynlSZBx4TgHy15NQh2TnNp_mVo0uatdIJBhPGapSMqpV36bGR2Z');

const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'curryuk';

let totalData = 0;
let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status
        }
        monitor(row.sku);
    }
    console.log("[CURRY-UK] Started monitoring all SKUs!")
}
async function monitor(sku) {
    let url = `https://www.currys.co.uk/gbuk/tachyon-${sku}-pdt.html`;
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;
    let proxy = helper.getMixedRotatingProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://api-currys-co-uk.translate.goog/smartphone/api/productsStock/${sku}?abcz=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
        'headers': {
            'accept': 'application/json',
            'user-agent': randomUseragent.getRandom()
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            //console.log('400')
            monitor(sku)
            return
        }
        let body2 = await response.text();
        totalData += ((body2.length * 1) / 1000000);
        try {
            body2 = JSON.parse(body2);
        } catch (err) {
            if (body2.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
                console.log('[CURRY-UK] Unauthenticated Proxy: ' + proxy);
                monitor(sku);
                return;
            }
            if (!body2 || body2 === undefined) {
                console.log('[CURRY-UK] Null body - ' + sku + ' - ' + proxy);
                monitor(sku);
                return;
            }
            console.log("********************CURRY-UK-ERROR********************")
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            monitor(sku);
            return;
        }
        // console.log(body2)
        let status = query.rows[0].status
        let stockin = body2.payload[0].quantityAvailable
        if (stockin > 0) {
            if (status !== "In-Stock") {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000)
                fetch(`https://api.currys.co.uk/store/api/products/${sku}`, {
                    'headers': {
                        'accept': 'application/json',
                        'user-agent': randomUseragent.getRandom()
                    },
                    agent: new HTTPSProxyAgent(proxy),
                    signal: controller.signal

                }).then(async response => {
                    clearTimeout(timeoutId)
                    let body = await helper.getBodyAsText(response)
                    try {
                        body = JSON.parse(body);
                    } catch (err) {
                        if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
                            console.log('[CURRY-UK] Unauthenticated Proxy: ' + proxy);
                            monitor(sku);
                            return;
                        }
                        if (!body || body === undefined) {
                            console.log('[CURRY-UK] Null body - ' + sku + ' - ' + proxy);
                            monitor(sku);
                            return;
                        }
                        console.log("********************CURRY-UK-ERROR********************")
                        console.log("SKU: " + sku);
                        console.log("Proxy: " + proxy);
                        console.log(err);
                        console.log(body)
                        monitor(sku);
                        return;
                    }

                    let title = body.payload[0].label;
                    let pricez = '$' + body.payload[0].price.amount;
                    let price = pricez.replace("00", '')
                    let image = body.payload[0].images[0].url;

                    if (status !== "In-Stock") {
                        postRestockWebhook(url, title, sku, stockin, price, image);
                        console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                        await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    }
                })
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(status)
                console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        if (query.rows.length > 0) {
            setTimeout(function () {
                monitor(sku);
            }, query.rows[0].waittime);
        }
    }).catch(err => {
        console.log("***********CURRY-UK-ERROR***********");
        console.log("SKU - " + sku);
        console.log("Proxy - " + proxy);
        console.log(err);
        setTimeout(function () {
            monitor(sku);
        }, 500);
    });
}


async function postRestockWebhook(url, title, sku, stockin, price, image) {
    let ATC = `https://www.currys.co.uk/gbuk/computing/tachyon-${sku}-pdt.html`
    let cart = 'https://www.currys.co.uk/app/basket'
    let checkout = 'https://www.currys.co.uk/app/checkout'
    let login = 'https://www.currys.co.uk/gbuk/s/authentication.html'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.currys.co.uk', '', 'https://www.currys.co.uk')
        .addField("**In Stock**", stockin, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Currys UK | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
        monitor(sku);
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === discordBot.channels.CURRYUK) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Curry-UK Monitor");
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(row.sku);
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