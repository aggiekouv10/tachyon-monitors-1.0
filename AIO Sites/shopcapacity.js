const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SHOPCAPACITY);
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
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
  monitor()
  console.log('[shopcapcity-Releases] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.shopcapcity.com/shop/?orderby=date&abcz=${v4()}`, {
    'headers': {
      'method': 'GET',
      'path': '/en-us/sets/woman/new-in?pageIndex=1&pageSize=180&sort=newitems&sortDirection=desc',
      'scheme': 'https',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.ast-grid-common-col.ast-full-width');
    for (let product of products) {
      let name = product.querySelector('.woocommerce-loop-product__title').textContent.replace('&#39;s', '').replace(' &amp;', '').trim()
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        let url = product.querySelector('.ast-loop-product__link').attributes.href
        let price = product.querySelector('.woocommerce-Price-amount.amount bdi').textContent.replace('&#36;', '$')
        let image = product.querySelector('.attachment-woocommerce_thumbnail.size-woocommerce_thumbnail').attributes.src
        postRestockWebhook(url, name, price, image)

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
async function postRestockWebhook(url, name, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.shopcapcity.com', '', 'https://www.shopcapcity.com')
    .addField("**Price**", price, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Shopcapcity | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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