const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.TAFMX);
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 2000;
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
    fetch(`https://www.taf.com.mx/calzado/sneakers?O=OrderByReleaseDateDESC&PS=1000&filter_indicator=2000013,2000004,2000000?abcz=${v4()}`, {
    'headers': {

    },
    //agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.product-item__cta')
    for (let product of products) {
      let title = root.querySelector('.product-item__name').innerText.trim()
  console.log(title)
      if (!PRODUCTS.includes(title)) {
        PRODUCTS.push(title)
        if (justStarted) {
          continue;
        }
        let url = product.querySelector('.js-buy-pdp').attributes.href
        let image = product.querySelector('.img').attributes.src
        let sku = product.querySelector('.product-item__main-image.contenedor-img').attributes['data-skuid']
        let price = product.querySelector('.price-new').innerText
        postRestockWebhook(title, url, image, sku, price)
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

async function postRestockWebhook(url) {
  var webhookMessage = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.taf.com.mx', '', 'https://www.taf.com.mx')
  .addField("**Price**", price, true)
  .addField("**Sku**", sku, true)
  .addField("**Links**", '[Checkout](' + url + ')')
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
  .setTime()
  .setFooter("TAFMX | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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