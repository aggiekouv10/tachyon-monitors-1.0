const fetch = require('node-fetch');
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.EVGAUS);
const helper = require('../helper');
const { v4 } = require('uuid');
const { webkit, devices } = require('playwright');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 3000;
function removeProduct(name) {
    let newProducts = [];
    console.log("Removing " + name)
    for (let product of PRODUCTS) {
        if (product !== name)
            newProducts.push(product);
    }
    PRODUCTS = newProducts;
}

async function startMonitoring() {
    monitor()
    console.log('[EVGA-US]] Monitoring!')
}

async function monitor() {
    let proxy = helper.getRandomProxy();
    const launchOptions = {
        proxy: {
            server: proxy
        }
    };
    let pluses = ''
    let random = Math.floor(Math.random() * 1000 ) + 1
    for (let i = 0; i < random; i++) {
        pluses += 's'
      }
    const browser = await webkit.launch({ headless: false, launchOptions, userAgent: randomUseragent.getRandom() });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
            ? route.abort()
            : route.continue()
    })
    await page.goto(`https://www.amd.com/en/direct-buy/products/${v4()}`);
    await page.waitForSelector('div[class="row-flex"]')
    page.on('request', async resp => {
        console.log(resp.url())
    })
        let root = HTMLParser.parse(body);
        let products = root.querySelectorAll('.list-item');
        for (let product of products) {
            let name = product.querySelector('.pl-list-pname').textContent.trim()
            if (product.querySelector('.btnBigAddCart')) {
                if (!PRODUCTS.includes(name)) {
                    PRODUCTS.push(name)
                    if (justStarted) {
                        continue;
                    }
                    let url = 'https://www.evga.com' + product.querySelector('.pl-list-pname a').attributes.href
                    console.log(url)
                    let price = '$' + product.querySelector('.pl-list-price strong').textContent.trim() + product.querySelector('.pl-list-price sup').textContent.trim()
                    let sku = product.querySelector('.pl-list-pn').textContent.replace('P/N: ', '')
                    let image = 'http://proxy.hawkaio.com/' + product.querySelector('.lazyload').attributes['data-src']
                    postRestockWebhook(url, name, price, image, sku)
                } else {
                    continue
                }
            }
        }

        if (justStarted)
            justStarted = false;
        await helper.sleep(WAIT_TIME);
        monitor();

}

async function postRestockWebhook(url, name, price, image, sku) {
    console.log(arguments)
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(name)
        .setURL(url)
        .setAuthor('https://www.evga.com', '', 'https://www.evga.com')
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Links**", '[Checkout](' + url + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("EVGA US | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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