const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const AbortController = require('abort-controller');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { HttpsProxyAgent } = require('hpagent')
var HTMLParser = require('node-html-parser');
const HTTPSProxyAgent = require('https-proxy-agent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.USMINT);
//('https://discord.com/api/webhooks/973716278810394638/GO6NzuwqzPtXImms3my7OMZ3EvXbRK__sliADskICjbMYjbStLrkSaUbOj4-LFHRlDfe');
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/973764612610744340/4g0x0u7g0smyA5i5uB9wVJ6yGOlqPOew1ZVcpOP3EE9My7YEapdqNZSFOIor31cqwOfs');
const space = new webhook.Webhook('https://discord.com/api/webhooks/975544941063335966/sDu5GMfStJ_EYK8ch2I5QYinvSa0W1_f7w0Pk8u8zdSqeexGB1HF5QoZ31mFisn8guTQ');

const CHANNEL = discordBot.channels.USMINT;
const DATABASE_TABLE = 'usmint';
const SITENAME = 'USMINT'
const helper = require('../helper');
const { v4 } = require('uuid');
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
    console.log('[US Mint] Monitoring all SKUs!')
}
async function monitor(sku) {
    let url = `https://catalog.usmint.gov/tachyon-${sku}.html`;
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;
    let proxy = helper.getMixedRotatingProxy()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://catalog-usmint-gov.translate.goog/on/demandware.store/Sites-USM-Site/default/Product-Variation?pid=${sku}&abcz=${v4()}&format=ajax&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
        'headers': {
            'user-agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)'
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
        var root = HTMLParser.parse(body);
        let status = query.rows[0].status
        if (root.querySelector('#hidden-product-name')) {
            if (root.querySelector('.in-stock-msg') && !root.querySelector('img#sold-out-image')) {
                let title = root.querySelector('#hidden-product-name').textContent;
                let price = root.querySelector('.price-regular').textContent.trim()
                let image = root.querySelector('.primary-image').attributes.src;
                let stock = root.querySelector('.input-text').attributes["data-available"].split('.')[0]
                if (status !== "In-Stock") {
                    postRestockWebhook(url, title, sku, price, image, stock);
                    console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                    await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                }
            }
            if (query.rows.length > 0) {
                setTimeout(function () {
                    monitor(sku);
                }, query.rows[0].waittime);
            }
        }
    }).catch(err => {
        if (err.type === 'aborted') {
            //console.log("[NEWBALANCE] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[NEWBALANCE] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.response && err.response.statusCode === 410) {
            console.log("[US-MINT] GONE MFERS: " + sku + " - " + proxy)
            monitor(sku)
            return
        }
        console.log("***********US-MINT-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy)
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, stock) {
    let atc = `https://catalog.usmint.gov/on/demandware.store/Sites-USM-Site/default/Cart-MiniAddProduct?pid=${sku}`
    let cart = 'https://catalog.usmint.gov/on/demandware.store/Sites-USM-Site/default/Cart-Show'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://catalog.usmint.gov', '', 'https://catalog.usmint.gov')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**Links**", '[ATC](' + atc + ') | [CART](' + cart + ')')
        .setThumbnail('https://cdn.discordapp.com/attachments/810952829392257046/973721563776053329/unknown.png')
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("US Mint | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    
    synthiysis.send(webhookMessage);
    space.send(webhookMessage);
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
        if (msg.channel.id === discordBot.channels.USMINT) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Homedepot Monitor");
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