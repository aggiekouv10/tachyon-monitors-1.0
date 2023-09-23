const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.YEEZYSUPPLY);
//('https://discord.com/api/webhooks/972569717036437524/JUiDsvbw1K1x30gduugBdOGLmkW_GTy0l_Q9r2eifHDp0ZtJaf1wr0Q4arAocW55MI_5');
const space = new webhook.Webhook('https://discord.com/api/webhooks/975542623588720698/Ev4pGAukmdszIkPOTEOwX4IjGMC1UwU4bQB-cuCMYR9xeMoGpjNVQEcXh8uZsdJoTs8Y');
const CHANNEL = discordBot.channels.YEEZYSUPPLY
const AbortController = require('abort-controller')
const randomUseragent = require('random-useragent');
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let status = false
let justStarted = true;
let justStarted1 = true;
const WAIT_TIME = 200;

async function startMonitoring() {
  productLoad()
  monitorSplash()
}

async function monitorSplash() {
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000)
  fetch(`https://www.yeezysupply.com/hpl/content/yeezy-supply/config/US/waitingRoomConfig.json?abcz=${v4()}`, {
    'headers': {
      'user-agent': randomUseragent.getRandom(),
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status != 200) {
      monitorSplash();
      return
    }
    let body = await helper.getBodyAsText(response)
    if (body.includes('Forbidden')) {
      monitorSplash();
      return
    }
    body = JSON.parse(body)
    if (body.ysStatusMessageKey == "sale_started" && status != true) {
      if (!justStarted) {
      postssalestarted()
      status = true
      }
    }
    if (body.ysStatusMessageKey == "sold_out" || body.ysStatusMessageKey == "welcome" && status != false) {
      if (!justStarted) {
      postssoldout()
      status = false
      }
    }
    await helper.sleep(WAIT_TIME);
    justStarted = false
    monitorSplash();
  }).catch(error => {
    if (error.type === 'aborted') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitorSplash();
      return;
    }
    if (error.type === 'request') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitorSplash();
      return;
    }
    console.log(error)
    monitorSplash();
  });
}

async function postssalestarted() {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle('Sale is now live!')
    .setURL('https://www.yeezysupply.com')
    .setAuthor('https://www.yeezysupply.com', '', 'https://www.yeezysupply.com')
    .setThumbnail('https://images-ext-2.discordapp.net/external/UyEOQQYhbHGzb_3CkZVWzpLnU9BihtLOiHsymtquka4/https/images-ext-2.discordapp.net/external/4dv3M6VwAl-HCTysHXOQU8W78d57KcBAo3Vs_1T6GFA/https/i.gifer.com/4EfZ.gif')
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Yeezysupply | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  
  space.send(webhookMessage);
}

async function postssoldout() {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle('Sale is now over!')
    .setURL('https://www.yeezysupply.com')
    .setAuthor('https://www.yeezysupply.com', '', 'https://www.yeezysupply.com')
    .setThumbnail('https://images-ext-2.discordapp.net/external/UyEOQQYhbHGzb_3CkZVWzpLnU9BihtLOiHsymtquka4/https/images-ext-2.discordapp.net/external/4dv3M6VwAl-HCTysHXOQU8W78d57KcBAo3Vs_1T6GFA/https/i.gifer.com/4EfZ.gif')
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Yeezysupply | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  
  space.send(webhookMessage);
}

async function productLoad() {
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000)
  fetch(`https://www.yeezysupply.com/api/yeezysupply/products/bloom/`, {
    'headers': {
      'user-agent': 'SSL Labs (https://www.ssllabs.com/about/assessment.html); on behalf of 69.179.157.70',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status != 200) {
      productLoad();
      return
    }
    let body = await helper.getBodyAsText(response)
    if (body.includes('Forbidden')) {
      productLoad();
      return
    }
    body = JSON.parse(body)
    for (let product of body) {
      let name = product.product_name + ' - ' + product.product_model_id
      let sku = product.product_id
      if (!PRODUCTS.includes(sku)) {
        PRODUCTS.push(sku)
        if (justStarted1) {
          continue;
        }
        let url = `https://www.yeezysupply.com/product/${sku}`
        let price = product.price
        let image = product.image.link
        let time = product.previewTo
        postLoadHook(url, name, price, image, sku, time)

      }
    }

    if (justStarted1)
      justStarted1 = false;
    await helper.sleep(WAIT_TIME);
    productLoad();
  }).catch(error => {
    if (error.type === 'aborted') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      productLoad()
      return;
    }
    if (error.type === 'request') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      productLoad()
      return;
    }
    console.log(error)
    productLoad();
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
  
  space.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
    return;
  if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
    PRODUCTS = [];
    status = true
    msg.reply("Resetted!")
    return;
  }
});