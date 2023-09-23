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
const discordWebhook = new webhook.Webhook(discordBot.webhooks.HIBBETT);
const tachyonhook = new webhook.Webhook('https://discord.com/api/webhooks/902728303637577738/yE9eRI2rn-WUXRUXhy3CUrvu8DOXf-vGYOaRI3M1wSXIa70VkHHttyz4a8JVfNPNxuOP');
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/969379470081417256/TDL4We-9VubDyXbGOMXpcBZ8Jqq0C525e14dvT0jA1S54BJdC54CuKTbfIgT6cje9GGq');
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'hibbett';
const SITENAME = 'HIBBETT'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
//et stats;
let totalData = 0;
monitor();
monitor();
monitor();


let agent = ''
function getuseragent() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://api.whatismybrowser.com/api/v2/user_agent_database_search?software_type_specific=bot&limit=500`, {
        'headers': {
            'X-API-KEY': 'fec576b1d033eb1c791d57bad11f23ca',
        },
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        console.log(body)
        let random = Math.floor(Math.random() * 400) + 1
        agent = body.search_results.user_agents[random].user_agent;
    })
}

async function monitor(sku) {
    await getuseragent()
    //console.log(agent)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    var ip = (Math.floor(Math.random() * 255) + 1) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255)) + "." + (Math.floor(Math.random() * 255));
    fetch(`https://www-hibbett-com.translate.goog/on/demandware.store/Sites-Hibbett-US-Site/default/Product-GetSetItem?pid=8P568&_x_tr_sl=en&_x_tr_tl=el&_x_tr_hl=en&_x_tr_pto=wapp`, {
        'headers': {
            'user-agent': agent,
            'Accept': 'application/vnd.nord.pdp.v1+json',
        },
        //yacybot (-global; amd64 Linux 3.10.0-693.21.1.el7.x86_64; java 1.8.0_161; America/en) http://yacy.net/bot.html
        //agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        let body = await helper.getBodyAsText(response)
        if (response.status !== 200) {
            monitor(sku);
            return
        }
        console.log(agent)
        monitor(sku);
    }).catch(async err => {
        if (err.type === 'abort') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        console.log("***********HIBBETT-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

module.exports = {
    totalData: function () {
        return totalData;
    }
}