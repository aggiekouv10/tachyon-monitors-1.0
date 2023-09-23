const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.ADIDASUS);
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
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
  monitor(true)
  console.log('[ADIDAS-US] Monitoring!')
}
async function monitor(justStarted) {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.adidas.com/static/on/demandware.static/-/Sites-CustomerFileStore/default/adidas-US/en_US/sitemaps/product/adidas-US-en-us-product.xml?abcz=${v4()}`, {
    'headers': {
      'user-agent': 'PostmanRuntime/7.28.2',
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('loc');
    for (let product of products) {
        let sku = product.textContent.split('/').slice(-1).toString().replace('.html', '')
        let url = product.textContent.toString()
      if (!PRODUCTS.includes(url)) {
        PRODUCTS.push(url)
        if (justStarted) {
          continue;
        }
        postRestockWebhook(url, sku)
    }
}

    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(error => {
    console.log(error)
    monitor();
    return
  });

}

async function postRestockWebhook(url, sku) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle('Adidas US NEW Product')
    .setURL(url)
    .setAuthor('https://www.adidas.com', '', 'https://www.adidas.com')
    .addField("**URL**", url, true)
    .addField("**SKU**", sku)
    .setThumbnail('https://media.discordapp.net/attachments/809958634019618866/868273349774692382/Logo-Adidas.jpg?width=957&height=639')
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Adidas | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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