const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FACEBOOKDEALS);
const space = new webhook.Webhook('https://discord.com/api/webhooks/976327445374447677/FflSyhWqfzdVU_ESFrB4HrF9oU30OcWEawp304RHyVJQG14-Gk48ew4Edw3mTT5DRhTG');
const CHANNEL = discordBot.channels.FACEBOOKDEALS;
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 500;

async function startMonitoring() {
    monitor()
    console.log('[FACEBOOKDEALS] Monitoring!')
}

async function monitor() {
    let proxy = helper.getRandomDDProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://t.me/s/Salesaholic?abcz=${v4()}`, {
        'headers': {
            'user-agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
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
        let products = root.querySelectorAll('.tgme_widget_message_text.js-message_text');
        for (let product of products) {
            let name = product.textContent.replace('&#036;', '$').split('http')[0].replace('&#33;','%').split('⬇️').join(' ').split('🔥').join(' ').trim()
            if (!PRODUCTS.includes(name)) {
                PRODUCTS.push(name)
                if (justStarted) {
                    continue;
                }
                let text = product.textContent.replace('&#036;', '$').split('http')[0].replace('&#33;','%').split('⬇️').join(' ').split('🔥').join(' ').trim()
                let promocode = "↓"
                if (product.querySelector('code') || product.querySelector('pre')) {
                    if(product.querySelector('code'))
                    promocode = product.querySelector('code').textContent
                    if(product.querySelector('pre'))
                    promocode = product.querySelector('pre').textContent
                    postcode(promocode)
                }else{
                    let url = 'http' + product.querySelector('a').attributes.href.split('http')[1]
                    postRestockWebhook(url, name, text, promocode)
                }

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

async function postRestockWebhook(url, name, text, promocode) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(name)
        .setThumbnail('https://assets.site-static.com/userFiles/3190/image/deal_800.jpg')
        .setURL(url)
        .addField("Content", text, true)
        .addField("Promocode", promocode,)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Deals | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    space.send(webhookMessage);
}

async function postcode(promocode) {
    var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setText(promocode)
    discordWebhook.send(webhookMessage);
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