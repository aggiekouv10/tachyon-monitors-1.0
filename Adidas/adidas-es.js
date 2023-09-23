const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.ADIDASAR);
const helper = require('../helper');
const { v4 } = require('uuid');
const urlbase = 'https://www.adidas.com.ar'
const currency = ' (AUD)'

startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 200;
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
  console.log('[ADIDAS-ES] Monitoring!')
}

async function monitor(justStarted) {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.adidas.com.ar/on/demandware.static/-/Sites-CustomerFileStore/default/adidas-AR/es_AR/sitemaps/product/adidas-AR-es-ar-product.xml?abcz=${v4()}`, {
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
      if (!PRODUCTS.includes(sku)) {
        PRODUCTS.push(sku)
        if (justStarted) {
          continue;
        }
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${urlbase}/api/products/${sku}/availability?abcz=${v4()}`, {
          'headers': {
            'user-agent': 'PostmanRuntime/7.28.2',
          },
          agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        }).then(async response => {
        clearTimeout(timeoutId)
          let body = await helper.getBodyAsText(response)
          body = JSON.parse(body);
          let sizes = body.variation_list
          let sizename = ''
          for (let size of sizes) {
            if (size.availability_status === 'IN_STOCK') {
              sizename += `${size.size} (${size.availability}+) \n`
            }
          }
          const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${urlbase}/api/products/${sku}?abcz=${v4()}`, {
            'headers': {
              'user-agent': 'PostmanRuntime/7.28.2',
            },
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
          }).then(async response => {
        clearTimeout(timeoutId)
            let body = await helper.getBodyAsText(response)
            body = JSON.parse(body)
            let title = body.name
            let sku = body.id
            let image = body.view_list[0].image_url
            let price = body.pricing_information.currentPrice + currency
            let url = 'https:' + body.meta_data.canonical
            console.log(sizename)
            postRestockWebhook(url, title, price, image, sku, sizename)
          })

        })

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

async function postRestockWebhook(url, title, price, image, sku, sizename) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle('NEW Product\n' + title)
    .setURL(url)
    .setAuthor(urlbase, '', urlbase)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Sizes**", sizename)
    .setThumbnail(image)
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