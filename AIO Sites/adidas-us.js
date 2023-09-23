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
      }
    }
})
}