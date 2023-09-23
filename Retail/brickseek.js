const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller');

const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BRICKSEEK);
//('https://discord.com/api/webhooks/974185849388404747/x4quogQ7qXijM7nnPOJF0FBHd4mrvUo0VvVxfK9v9SPNXqtA87bUTj9Oc3OtzMqy8bZv');
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/974174465921515560/RC-0C0XGfnHBxVc6kYIDovOdPWI8HCL7azpF3ZAYBnei6aJlxlV4Cxv6ACuoCBo77mhq') 
const space = new webhook.Webhook('https://discord.com/api/webhooks/975544798868041798/fazjti6Zjr83zxHXYdo1gpVYYKZI1vbabt0zmvmc1NHPMCwGCi1ZW-m6Mebqs2PugFAq');

const CHANNEL = discordBot.channels.BRICKSEEK;
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 2000;

async function startMonitoring() {
  monitor()
  console.log('[Brickseek] Monitoring!')
}

async function monitor() {
  let proxy = helper.getMixedRotatingProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://brickseek-com.translate.goog/deals/?sort=newest&abcz=${v4()}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
    'headers': {
      'user-agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)'
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status !== 200) {
      //console.log('400')
      monitor()
      return
    }
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.item-list__item.item-list__item--deal.item-list__item--deal-online');
    for (let product of products) {
      let name = product.querySelector('.item-list__title span').textContent.replace('&quot;', '"').replace('&#039;', "'").replace('&amp;', '&')
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        let url = product.querySelector('.item-list__link').attributes.href.replace("?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui", "").replace("https://brickseek-com.translate.goog", "https://brickseek.com")
        let percent = product.querySelector('.item-list__discount-meter-bar-fill-text').textContent
        let image = product.querySelector('.item-list__image-container img').attributes.src
        let online = '$' + product.querySelector('.item-list__price-column.item-list__price-column--highlighted .price-formatted__dollars').textContent + '.' + product.querySelector('.item-list__price-column.item-list__price-column--highlighted .price-formatted__cents').textContent
        let msrp = '~~$' + product.querySelector('.item-list__price-column:not(.item-list__price-column.item-list__price-column--highlighted) .price-formatted__dollars').textContent + '.' + product.querySelector('.item-list__price-column:not(.item-list__price-column.item-list__price-column--highlighted) .price-formatted__cents').textContent + '~~'
        postRestockWebhook(url, name, image, online, msrp, percent)

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
  if (error.type === 'request') {
      //console.log("[NEWBALANCE] Timeout - " + sku, proxy)
      monitor();
      return;
  }
    console.log(error)
    monitor();
    return
  });
}

async function postRestockWebhook(url, name, image, online, msrp, percent) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://brickseek.com', 'https://media.discordapp.net/attachments/809958634019618866/861441448645623869/download.jpg', 'https://brickseek.com')
    .addField("Online", online, true)
    .addField("MSRP", msrp, true)
    .addField("Discount", percent, true)
    .addField("**Posted In**", '[Deals](https://brickseek.com/deals/?sort=newest)', true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Brickseek | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
  if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
    PRODUCTS = [];
    msg.reply("Resetted!")
    return;
  }
});