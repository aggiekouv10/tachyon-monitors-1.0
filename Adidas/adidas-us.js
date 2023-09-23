const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller')
const discordWebhook = new webhook.Webhook(discordBot.webhooks.ADIDASUS);
const CHANNEL = discordBot.channels.ADIDASUS
const helper = require('../helper');
const { v4 } = require('uuid');
const urlbase = 'https://www.adidas.com'
const currency = ' (USD)'

startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 1000;
async function startMonitoring() {
  monitor(true)
  console.log('[ADIDAS-US] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`${urlbase}/yeezy;`, {
    'headers': {
      'user-agent': 'PostmanRuntime/7.28.2',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal

  }).then(async response => {
    if (response.status !== 200) {
      monitor(sku)
      return
    }
    clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let json = root.querySelector('script').textContent.replace('window.ENV = ', '').trim()
    let script = JSON.parse(json);
    let products = script.productIds
    for (let product of products) {
      let sku = product
      if (!PRODUCTS.includes(sku)) {
        PRODUCTS.push(sku)
        const controller = new AbortController();
        fetch(`${urlbase}/api/products/${sku}/availability?slot=${v4()}`, {
          'headers': {
            'user-agent': 'PostmanRuntime/7.28.2',
          },
          agent: new HTTPSProxyAgent(proxy),
          signal: controller.signal,
          timeout: 4000
        }).then(async response => {
          if (response.status !== 200) {
            monitor(sku)
            return
          }
          let body = await helper.getBodyAsText(response)
          body = JSON.parse(body);
          if (body.availability_status === 'PREVIEW') {
            await helper.sleep(WAIT_TIME);
            monitor(sku)
            return
          }
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
            if (sizename.length > 0) {
              postRestockWebhook(url, title, price, image, sku, sizename)
            }
          })

        })
      }
    }

    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(error => {
    //console.log(error)
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