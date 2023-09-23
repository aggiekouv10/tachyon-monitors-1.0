const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.OFFSPRING);
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 500;
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
    console.log('[Offspring-Releases]] Monitoring!')
  }
  let proxy = helper.getRandomProxy();
const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://ms-api.sivasdescalzo.com/api/releases/items?filter=all&limit=100&offset=0&abcz=${v4()}`, {
    "headers": {
        'Host': 'ms-api.sivasdescalzo.com',
        'Accept': 'application/json',
        'device-os': 'I-iOS 13.3',
        'app-version': '2.1.0',
        'device-id': 'A85742B9-5F3B-45C7-955D-D925D1565BF2',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-us',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache=',
        'store-code': 'en',
        'User-Agent': 'SVDApp/2002252216 CFNetwork/1121.2.2 Darwin/19.2.0',
        'Connection': 'keep-alive',
        'bundle-version': '22',
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
}).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    // console.log(PRODUCTS)
    let products = root.querySelectorAll('.col-s-12.col-m-8.col-l-6');
    for (let product of products) {
        let name = product.querySelector('.product-card__name-wrap').textContent
        if (!PRODUCTS.includes(name)) {
            PRODUCTS.push(name)
            // console.log(PRODUCTS)
          let url = "https://www.offspring.co.uk/view/product/offspring_catalog/5,21/" + product.querySelector('.product-card.product-card--plp.js-productCard').id
          let price = product.querySelector('.product-card__price').textContent
          let image = 'https://imageresize.24i.com/?w=300&url=' + product.querySelector('img').attributes.src
          console.log(name, url, price, image)
          postRestockWebhook(url, name, price, image)
        }
  }
})

async function postRestockWebhook(url, title, price, image) {
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.offspring.co.uk', '', 'https://www.offspring.co.uk')
    .addField("**New Release**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Offspring Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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