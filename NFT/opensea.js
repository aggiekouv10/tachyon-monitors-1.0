const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.YEEZYSUPPLY);
const rise = new webhook.Webhook('https://discord.com/api/webhooks/972569717036437524/JUiDsvbw1K1x30gduugBdOGLmkW_GTy0l_Q9r2eifHDp0ZtJaf1wr0Q4arAocW55MI_5');
const CHANNEL = discordBot.channels.YEEZYSUPPLY
const AbortController = require('abort-controller')
const randomUseragent = require('random-useragent');
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 1000;

async function startMonitoring() {
  monitor()
}


async function monitor() {
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000)
  fetch(`https://api.opensea.io/wyvern/v1/orders?bundled=false&include_bundled=false&side=1&limit=20&offset=0&order_by=created_date&order_direction=desc`, {
    'headers': {
      'X-API-KEY': '2f90ccaf248549889b97386e5033798d',
      'Accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Sprint APA9292KT Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if(response.status != 200) {
        productLoad();
        return
    }
    let body = await helper.getBodyAsText(response)
    body = JSON.parse(body)
    for (let product of body.orders) {
      let name = product.asset.name
      let pid = product.asset.id
      if (!PRODUCTS.includes(pid)) {
        PRODUCTS.push(pid)
        if (justStarted) {
            continue;
          }
        let url = product.asset.permalink
        let price = product.payment_token_contract.eth_price
        let usdprice = product.payment_token_contract.usd_price
        let image = product.image.link
        let time = product.previewTo
        postLoadHook(url, name, price, image, sku, time)

      }
    }

    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    productLoad();
  }).catch(error => {
    console.log(error)
    productLoad();
    return
  });
  
}

async function postLoadHook(url, name, price, image, sku, time) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.yeezysupply.com/', '', 'https://www.yeezysupply.com/')
    .addField("**Type**", 'Product Loaded', true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Launch Time**", time, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Yeezysupply | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  rise.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
    return;
  if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
    PRODUCTS = [];
    msg.reply("Resetted!")
    return;
  }
});