const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.DSG);
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
  console.log('[Dsg-Releases] Monitoring!')
}

async function monitor() {
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.dickssportinggoods.com/s/footwear-release-calendar?abcz=${v4()}`, {
    'headers': {
      'authority': 'www.dickssportinggoods.com',
      'method': 'GET',
      'path': '/en-us/sets/woman/new-in?pageIndex=1&pageSize=180&sort=newitems&sortDirection=desc',
      'scheme': 'https',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      'cookie': 'crl8.fpcuid=a582c847-5865-4373-ab10-47ab118deaed; ftr_ncd=6; csi=ccffb581-671d-437f-9f88-4c5581018c28; dfUserSub=%2Fen-us; ctx=%7b%22u%22%3a5000006114643817%2c%22g%22%3a1%7d; ss=5KGXV_aUxRb52nJLzzMXYqHsNXPnDjYAqNRMMCV_b_cG-bMMHrCV3ibn57p2OGM4GWvcnnYhrG9F5a5tDVCYK2iwlTL7wCXyoWxXF7zDNAFIXlAVCf4JQKpXedjXB7bGED9q9adn0MscbQRMvcqMQHRbkGfgg3oKjC0ohG5KLlRORN3LVFx2mB9tyPSY7ZNoWgkg6a8t500dfv98ANJvBO_NhISd4xdjQaY3_GYs3xk; forterToken=99e1c2cf5c8d46848950fc039a4805c9_1623290297830__UDF43_9ck; __cfwaitingroom=Chh5T1hGdTI4Z3JybjRzLzRzWjZjUUZ3PT0S1AFnTmk5Z0JHanB1LzVIejZ1ZkhXdWRBSjFwMXcvKzI1MkZHTUl4NUxYVmQ3NmNlYWxGSk92Q3Q3aThHb2gvRm1mUzJHMnBMQkszampPaUsyelY2MWlQWkx4ZTJ3UUdud254d0h1OFM1VktYS3lPODJsaTNXaDNtWXdSRE1oZXZUTFk5L0xXVlNpSFFra0lEVW8rUjJ1cDhzUUN2cGV0T1duMHhZRG1EbGhwcnZEZGxENC9rQ0NZbnN4QlZzRlZxVzdZUUNrdnFoWHI5K3NRUUZSUlNacA%3D%3D; __cid=iIizOs2ntHq6x34VfVbMcNWeITM-XkA0O1yuJCtdu3Qf0qWsSHC9ETBjr2MoWeogy5I0S29evdnE7foiBznXaVcnzEhUPIoRFm2FDG80y0BXKtYEdgmFFQhzlR8YCsxKDmmeBEBrkQ0YHNVUVDjyQVoWzFAXaJYTFm6TBBAW7XB1EYkEVDTOQRgawEdTMowEezXXS1U4ih0Jc5UKDGmSFhZqkgRrPMNFSjSKEQtqixcOMa1CD2mWFAhlklM7Xi-kEPqljpNd-yQ4XaUkOI1a',
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
    let products = root.querySelectorAll('.card.ng-star-inserted');
    for (let product of products) {
      let name = product.querySelector('.name').textContent.replace('&#x27;', "'")
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        // console.log(PRODUCTS)
        let url = 'https://www.dickssportinggoods.com/s/footwear-release-calendar'
        let price = product.querySelector('.price').textContent
        let image = 'https://media.discordapp.net/attachments/809958634019618866/861453274845675560/www.forbes.png'
        let date = product.querySelector('.month').textContent + product.querySelector('.date-number').textContent + ', ' + product.querySelector('.time').textContent
        postRestockWebhook(url, name, price, image, date)

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

async function postRestockWebhook(url, name, price, image, date) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.dickssportinggoods.com', '', 'https://www.dickssportinggoods.com')
    .addField("**Price**", price, true)
    .addField("**Launch Date**", date, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("DSG Releases| v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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