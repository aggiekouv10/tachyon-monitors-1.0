const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SOULMX);
const helper = require('../helper');
const { default: got } = require('got/dist/source');

let WEBHOOKS = [
    new webhook.Webhook('https://discord.com/api/webhooks/844556333290094662/e1y12BtpUXCZPFmlufHDgggYm0kbxG6Awg0LOev_FxUKxIs-9HjNUrEYANjBBX-yhvQ-')
]

const WAIT_TIME = 3000;
let PRODUCTS = [];
let justStarted = true;

function removeProduct(name) {
    let newProducts = [];
    console.log("Removing " + name)
    for (let product of PRODUCTS) {
        if (product !== name)
            newProducts.push(product);
    }
    PRODUCTS = newProducts;
}

startMonitoring();

async function startMonitoring() {
    monitor();
    console.log('[SOUL-MX] Monitoring!')
}

async function monitor() {
    let proxy = helper.getRandomProxy();

    got('https://soul.com.mx/nuevo.html?' + helper.getRandomNumber(12, 12000000123123), {
        "headers": {
            'Host': 'www.soul.com',
            'Connection': 'keep-alive',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
            'sec-ch-ua-mobile': '?0',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
        },

        // 'agent': new HTTPSProxyAgent(proxy),
        followRedirect: false,
        methodRewriting: false,
        agent: {
            https: new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                scheduling: 'lifo',
                proxy: proxy
            })
        },
        'timeout': 5000,
        throwHttpErrors: false,
        http2: true,
        retry: 0
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await response.body;
        if (response.statusCode !== 200) {
            console.log("[SOUL-MX] Status: " + response.statusCode + " - " + proxy);
            await helper.sleep(WAIT_TIME);
            monitor();
            return
        }
        let root = HTMLParser.parse(body);
        let products = root.querySelector('div[class="mod_nuevos"]').querySelectorAll('li[class="product-container  width25 floatleft "]');

        // console.log(PRODUCTS)
        for (let product of products) {
            let a = product.querySelector('a');
            let name = a.attributes.title.trim();
            if (!PRODUCTS.includes(name)) {
                PRODUCTS.push(name)
                // console.log(PRODUCTS)
                if (justStarted) {
                    continue;
                }
                let url = 'https://soul.com.mx/' + a.attributes.href;
                let price = product.querySelector('div[class="product-price"]').textContent.trim();
                let image = 'https://soul.com.mx/' + product.querySelector('img').attributes.src.trim();
                console.log("[SOUL-MX] Instock - " + name)
                postRestockWebhook(url, name, price, image, helper.getTime(true))
            }
        }

        if (justStarted)
            justStarted = false;
        await helper.sleep(WAIT_TIME);
        monitor();
    }).catch(async err => {
        if (err.type === 'request-timeout' || err.type === 'body-timeout') {
            console.log("[SOUL-MX] Timeout - " + proxy);
            await helper.sleep(WAIT_TIME);
            monitor();
            return
        }
        console.log("********************SOUL-MX-ERROR********************")
        console.log("Proxy: " + proxy);
        console.log(err);
        await helper.sleep(WAIT_TIME);
        monitor();
    });
}

async function postRestockWebhook(url, title, price, image, time) {
    // console.log(arguments)
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.soul.com.mx', '', 'https://www.soul.com.mx')
        .addField("**Stock**", 'New Product', true)
        .addField("**Price**", price, true)
        .setThumbnail(image)
        // .setTime()
        .setFooter("Soul-MX | v1.0 " + time, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    for (let webhook of WEBHOOKS) {
        webhook.send(webhookMessage);
    }
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