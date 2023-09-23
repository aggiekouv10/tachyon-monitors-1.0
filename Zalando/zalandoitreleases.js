const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.ZALANDOIT);
const helper = require('../helper');
let site = 'https://www.zalando.it'
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
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
  monitor()
  console.log('[Zalando-IT-Releases] Monitoring!')
}

async function monitor() {
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${site}/scarpe-uomo/?order=activation_date`, {
    'headers': {
        'Connection': 'keep-alive',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        'sec-ch-ua-mobile': '?0',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'pragma': 'no-cache',
    }
    }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    // console.log(PRODUCTS)
    let products = root.querySelectorAll('.qMZa55.SQGpu8.iOzucJ.JT3_zV.DvypSJ');
    for (let product of products) {
      if(product.querySelector('h3')) {
      let name = product.querySelector('h3').textContent
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        if(product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL')) {
          if(product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.includes(site) === true) {
            let url = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
            let discount = product.querySelector('.VnVJx_.ka2E9k.uMhVZi.dgII7d.z-oVg8.pVrzNP.DJxzzA.FCIprz.thcXNJ.WCjo-q').textContent
            let price =  product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL').textContent + `/${discount}`
            let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
            let image = product.querySelector('img').attributes.src
            postRestockWebhook(url, name, price, image, sku)
          }else{
            let url = site + product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
            let discount = product.querySelector('.VnVJx_.ka2E9k.uMhVZi.dgII7d.z-oVg8.pVrzNP.DJxzzA.FCIprz.thcXNJ.WCjo-q').textContent
            let price =  product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL').textContent + `/${discount}`
            let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
            let image = product.querySelector('img').attributes.src
            postRestockWebhook(url, name, price, image, sku) 
          }
    }else {
      if(product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.includes(site) === true) {
        let url = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
        let price = product.querySelector('.u-6V88.ka2E9k.uMhVZi.FxZV-M.z-oVg8.pVrzNP.cMfkVL').textContent
        let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
        let image = product.querySelector('img').attributes.src
        postRestockWebhook(url, name, price, image, sku)
      }else {
        let url = site + product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
        let price = product.querySelector('.u-6V88.ka2E9k.uMhVZi.FxZV-M.z-oVg8.pVrzNP.cMfkVL').textContent
        let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
        let image = product.querySelector('img').attributes.src
        postRestockWebhook(url, name, price, image, sku)
      }
    }
      }
    }else{
      continue;
    }
  }
    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(error => {
    monitor();
    return
});

}

async function postRestockWebhook(url, name, price, image, sku) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor(site, '', site)
    .addField("**New Release**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Zalando | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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