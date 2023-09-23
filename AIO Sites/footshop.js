const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTSHOP);
const helper = require('../helper');
const { v4 } = require('uuid');
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
  console.log('[Footshop-Releases] Monitoring!')
}

async function monitor() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.footshop.com/en/2209-men-s-shoes-and-sneakers?ajax=true&abcz=${v4()}`, {
    'headers': {
      'authority': 'www.footshop.com',
      'method': 'GET',
      'path': '/en-us/sets/woman/new-in?pageIndex=1&pageSize=180&sort=newitems&sortDirection=desc',
      'scheme': 'https',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      'cookie': '_vsid=f2466cdd-a681-49a7-9904-b2f873a69d69; Max-Age=7462158; Domain=.footshop.com; Path=/; Secure; SameSite=Lax',
      'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    }
  }).then(async response => {
    clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    body = JSON.parse(body);
    let products = body.products.items
    for (let product of products) {
      let name = product.name
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        let varients = product.attributes.variants
        for (let varient of varients) {
          let sizes = varient.name
          console.log(sizes)
          let image = product.image
          let sku = product.id
          let url = `https://www.footshop.com/en/${sku}-tachyon.html`
          let price = product.price.value_formatted
          postRestockWebhook(url, name, price, image, sku, sizes)
        }
      }
    }
    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(error => {
    console.log(error)
    monitor();
    return
  });

}

async function postRestockWebhook(url, name, price, image, sku, sizes) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.footshop.com', '', 'https://www.footshop.com')
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**sizes**", sizes, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Footshop | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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