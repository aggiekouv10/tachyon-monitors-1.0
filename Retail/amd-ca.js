const fetch = require('node-fetch');
const got = require('got');
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.AMDCA);
const helper = require('../helper');
const { v4 } = require('uuid');
const CHANNEL = discordBot.channels.AMDCA;
const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/855934839131865089/J7DndWnTz7ApulXT7fJXbkogbnDAUaz-dnw6nyMC5IOs6ciTU2Il08-gH_v17P8hTqaW')
let WEBHOOKS = [
  new webhook.Webhook('https://discord.com/api/webhooks/850910152899035176/os5ZpESQNcjJ7w0H_fxbUW34ANyj-g5C01xfT6z1QosnS51FUyi1RCUswbJqzUoV7raS')
]

let totalData = 0;

const WAIT_TIME = 1000;
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
  console.log('[AMD-CA] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomDDProxy();
  // console.log('aaamd')
  let time = Date.now()
  const random = (length = 8) => {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Pick characers randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;

};  console.log(random());
  got("https://www.amd.com/en/direct-buy/products/" + random(), {
    "headers": {
      'User-Agent': 'PostmanRuntime/7.28.4',
    },
    http2: true,
    followRedirect: true,
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
    'timeout': 3000,
    retry: 0
  }).then(async response => {
    let body = await response.body;
    totalData += ((body.length * 1) / 1000000);
    let redirect = response.headers["location"];
    if(redirect) {
      console.log("[AMD-CA] REDIRECT - " + proxy + " - " + redirect);
      await helper.sleep(250);
      monitor();
      return      
    }
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('div[class="shop-content"]');
    for (let product of products) {
      let text = product.querySelector('div[class="shop-links"]').textContent;
      let name = product.querySelector('div[class="shop-title"]').textContent.replace('"', "").trim();
      // console.log(name)
      if (text.includes("Add")) {
        if (!PRODUCTS.includes(name)) {
          PRODUCTS.push(name)
          console.log(PRODUCTS)
          if (justStarted) {
            continue;
          }
          let url = "https://amd.com" + product.querySelector('a').attributes.href.replace('"', "").trim();
          let price = product.querySelector('div[class="shop-price"]').textContent.replace('"', "").trim();
          let image = product.querySelector('img').attributes.src.replace('"', "").trim();
          console.log("[AMD-CA] Instock - " + name)
          postRestockWebhook(url, name, price, image)
        }
      } else {
        if (PRODUCTS.includes(name)) {
          removeProduct(name);
          console.log("[AMD-CA] Went OOS - " + name)
        }
      }
    }

    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(async err => {
    if (err.code === 'ECONNRESET') {
      console.log("[AMD-CA] ECONNRESET - " + proxy);
      await helper.sleep(WAIT_TIME);
      monitor();
      return
    }
    if (err.type === 'request-timeout' || err.type === 'body-timeout' || err.code === 'ETIMEDOUT') {
      console.log("[AMD-CA] Timeout - " + proxy);
      await helper.sleep(WAIT_TIME);
      monitor();
      return
    }
    console.log("********************AMD-CA-ERROR********************")
    console.log("Proxy: " + proxy);
    console.log(err);
    await helper.sleep(WAIT_TIME);
    monitor();
  });
}

async function postRestockWebhook(url, title, price, image) {
  // console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.amd.com', '', 'https://www.amd.com')
    .addField("**In Stock**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("AMD-CA | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  //postMIKERestockWebhook(url, title, price, image)
  for (let webhook of WEBHOOKS) {
    webhook.send(webhookMessage);
  }
}
async function postMIKERestockWebhook(url, title, price, image) {
  // console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
  .setName("Forbidden Monitors")
  .setColor("#DA4453")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.amd.com/', '', 'https://www.amd.com/')
    .addField("**In Stock**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
    .setTime()
    .setFooter("AMD-CA | v1.0 by Tachyon", 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
  mikeWebhook.send(webhookMessage);
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

module.exports = {
    totalData: function () {
        return totalData;
    }
}