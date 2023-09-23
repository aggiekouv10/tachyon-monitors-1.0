const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.DAILYDEALS);
const space = new webhook.Webhook('https://discord.com/api/webhooks/976327445374447677/FflSyhWqfzdVU_ESFrB4HrF9oU30OcWEawp304RHyVJQG14-Gk48ew4Edw3mTT5DRhTG');
const CHANNEL = discordBot.channels.DAILYDEALS;
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 2000;

async function startMonitoring() {
    monitor()
    console.log('[DAILYDEALS] Monitoring!')
}

async function monitor() {
    let proxy = helper.getRandomDDProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000)
    fetch(`https://yofreesamples.com/deals-promos-online/best-deals-today-online?abcz=${v4()}`, {
        'headers': {
            'user-agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)'
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            monitor()
            return
        }
        let body = await helper.getBodyAsText(response)
        let root = HTMLParser.parse(body);
        let products = root.querySelectorAll('.wp-block-kadence-rowlayout.alignnone');
        for (let product of products) {
            let name = product.querySelector('.external_link_title').textContent
            if (!PRODUCTS.includes(name)) {
                PRODUCTS.push(name)
                if (justStarted) {
                    continue;
                }
                let url = product.querySelector('.external_link_title').attributes.href.replace('yfsbest','').replace('yofreeoffer','')
                let percent = product.querySelector('.has-text-align-center.m0.p0.has-text-color').textContent
                let image = product.querySelector('.wp-block-image img').attributes.src
                let online = product.querySelector('.has-text-align-center.m0.p0.has-black-color.has-text-color').textContent
                let msrp = '~~'+ product.querySelector('.has-text-align-center.m0.p0.has-text-color.has-small-font-size').textContent + '~~'
                let promocode = "None"
                if (product.querySelector('.promo_code'))
                    promocode = product.querySelector('.promo_code').textContent
                postRestockWebhook(url, name, image, online, msrp, percent, promocode)

            }
        }

        if (justStarted)
            justStarted = false;
        await helper.sleep(WAIT_TIME);
        monitor();
    }).catch(error => {
        if (error.type === 'aborted') {
            //console.log("[NEWBALANCE] Timeout - " + sku, proxy)
            monitor();
            return;
        }
        console.log(error)
        monitor();
        return
    });
}

async function postRestockWebhook(url, name, image, online, msrp, percent, promocode) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(name)
        .setURL(url)
        .addField("Online", online, true)
        .addField("MSRP", msrp, true)
        .addField("Discount", percent, true)
        .addField("Promocode", promocode, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter(" Daily Deals | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    space.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
        PRODUCTS = [];
        msg.reply("Resetted!")
        return;
    }
});