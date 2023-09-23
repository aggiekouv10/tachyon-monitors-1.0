const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SOLEBOX);
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
  console.log('[Solebox-Releases] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.solebox.com/en_US/search?srule=release%20date&prefn1=soleboxExclusive&prefv1=true&prefn2=isComingSoon&prefv2=true&openCategory=true&abcz=${v4()}`, {
    "headers": {
      'Host': 'www.solebox.com',
      'Connection': 'keep-alive',
      'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
      'sec-ch-ua-mobile': '?0',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.101 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.b-product-grid-tile.js-tile-container');
    for (let product of products) {
      let name = product.querySelector('.b-product-tile-link.js-product-tile-link').textContent
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        if(product.querySelector('.b-product-tile-badge-text.b-product-tile-badge-text--date.js-release-date') == null) {
            continue;
          }else{
        let url = 'https://www.solebox.com' + product.querySelector('.b-product-tile-body-link').attributes.href
        let price = '€' + product.querySelector('.b-product-tile-price-item').textContent.trim().replace('&euro;','')
        let sku = product.querySelector('.b-product-tile-inner.b-product-tile-inner--overlay').attributes['data-pid']
        let image = `https://www.solebox.com/dw/image/v2/BDCB_PRD/on/demandware.static/-/Sites-solebox-master-de/default/dw19639b3a/${sku.substring(1)}_PS.jpg?sw=780&sh=780&sm=fit&sfrm=png`
        let date = product.querySelector('.b-product-tile-badge.b-product-tile-badge--release').attributes['data-release-date']
        postRestockWebhook(url, name, price, image, sku, date)
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

async function postRestockWebhook(url, name, price, image, sku, date) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.solebox.com/en_us', '', 'https://www.solebox.com/en_us/')
    .addField("**New Release**", date, true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Solebox Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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