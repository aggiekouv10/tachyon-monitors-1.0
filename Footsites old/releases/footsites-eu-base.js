const fetch = require('node-fetch');
const database = require('../../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTLOCKER);
const helper = require('../../helper');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 10000;
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
  console.log('[Footlocker-Releases]] Monitoring!')
}

async function monitor() {
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://www.footlocker.com/release-dates", {
    'headers': {
      'accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    }
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.ReleaseProduct-Container');
    for (let product of products) {
      let name = product.querySelector('.ProductName-primary').textContent.replace('Women&#x27;s','')
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        let color = product.querySelector('.ProductColor').textContent.trim()
        //let price = product.querySelector('.product-card__price').textContent
        let date = product.querySelector('.ProductReleaseDate').textContent.replace('- Launch date:','')
        if(product.querySelector('.ReleaseProduct-Link') == null) {
          continue;
        }else{
        let url = 'https://www.footlocker.com' + product.querySelector('.ReleaseProduct-Link').attributes.href.replace(' ','')
        let sku = url.split('/')[6].replace('.html','').replace('~','tachyon')
        let image = `https://images.footlocker.com/is/image/EBFL2/${sku}`
        let price = product.querySelector('.ProductPrice').textContent
        console.log(url, name, image, sku, color, date)
        postRestockWebhook(url, name, image, sku, color, date, price)
      }
    }
  }
    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  })
 
}

async function postRestockWebhook(url, name, image, sku, color, date, price) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(`${name} - ${color}`)
    .setURL(url)
    .setAuthor('https://www.footlocker.com', '', 'https://www.footlocker.com')
    .addField("**Launch Date**", date, true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Footsites Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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