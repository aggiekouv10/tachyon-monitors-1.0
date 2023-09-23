const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.GAMENERDZ);
const helper = require('../helper');
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
  console.log('[Gamenerdz-Releases]] Monitoring!')
}

async function monitor() {
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://www.gamenerdz.com/search-results-page?q=new+releases&tab=products&sort_by=created&page=4").then(async response => {
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    console.log(body)
    let products = root.querySelectorAll('.snize-product.snize-product-in-stock');
    for (let product of products) {
      let name = product.querySelector('.snize-title').textContent
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        // console.log(PRODUCTS)
        let url = product.querySelector('.snize-view-link').attributes.href
        let price = product.querySelector('.snize-price.snize-price-with-discount.money').textContent
        let image = product.querySelector('.snize-item-image:not(snize-flip-image)').attributes.src
        postRestockWebhook(url, name, price, image)

      }
    }

    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  })

}

async function postRestockWebhook(url, name, price, image) {
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.gamenerdz.com', '', 'https://www.gamenerdz.com')
    .addField("**New Release**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Gamenerdz Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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