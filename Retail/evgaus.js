const fetch = require('node-fetch');
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller');

const discordWebhook = new webhook.Webhook(discordBot.webhooks.EVGAUS);
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912557721780383747/C0fCNwueVfre-0JxGSzuspVeU3ssebEoqhWDOa3YeVOlMwTlpuWqxL9Noo9riaIfD-ci');
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
  console.log('[EVGA-US]] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.evga.com/products/ProductList.aspx?type=0&abcz=${v4()}`, {
    'headers': {
      'Connection': 'keep-alive',
      'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
      'sec-ch-ua-mobile': '?0',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': randomUseragent.getRandom(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'pragma': 'no-cache',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.list-item');
    for (let product of products) {
      let name = product.querySelector('.pl-list-pname').textContent.trim()
      if (product.querySelector('.btnBigAddCart')) {
        if (!PRODUCTS.includes(name)) {
          PRODUCTS.push(name)
          if (justStarted) {
            continue;
          }
          let url = 'https://www.evga.com' + product.querySelector('.pl-list-pname a').attributes.href
          console.log(url)
          let price = '$' + product.querySelector('.pl-list-price strong').textContent.trim() + product.querySelector('.pl-list-price sup').textContent.trim()
          let sku = product.querySelector('.pl-list-pn').textContent.replace('P/N: ', '')
          let image = 'http://proxy.hawkaio.com/' + product.querySelector('.lazyload').attributes['data-src']
          postRestockWebhook(url, name, price, image, sku)
        } else {
          continue
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

async function postRestockWebhook(url, name, price, image, sku) {
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.evga.com', '', 'https://www.evga.com')
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("EVGA US | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  spacehook.send(webhookMessage);
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