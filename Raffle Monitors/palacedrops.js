const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.PALACEDROP);
const CHANNEL = discordBot.channels.PALACEDROP
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 500;
function removeProduct(nimageame) {
  let newProducts = [];
  console.log("Removing " + image)
  for (let product of PRODUCTS) {
    if (product !== image)
      newProducts.push(product);
  }
  PRODUCTS = newProducts;
}

async function startMonitoring() {
  monitor(true)
  console.log('[Palace-Releases] Monitoring!')
}
async function monitor(justStarted) {
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.palacedrop.com/droplist`).then(async response => {
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let url = 'https://www.palacedrop.com' + root.querySelector('#latest a').attributes.href

    fetch(`${url}?abcz=${v4()}`, {
      'headers': {
        'User-Agent': randomUseragent.getRandom(),
      },
      agent: new HTTPSProxyAgent(proxy),
      signal: controller.signal
    }).then(async response => {
      clearTimeout(timeoutId)
      
      let body = await response.text()
      let root = HTMLParser.parse(body);
      let products = root.querySelectorAll('.col-md-3.col-sm-6.col-6');
      for (let product of products) {
        let image = product.querySelector('img').attributes.src
        if (!PRODUCTS.includes(image)) {
          PRODUCTS.push(image)
          if (justStarted) {
            continue;
          }
          let name = product.textContent.trim()
          let likes = product.querySelector('div[style="display:flex;flex-direction:row"]').firstChild.innerText + '🟢'
          let dislikes = product.querySelector('div[style="display:flex;flex-direction:row"]').lastChild.innerText + '🔴'
          postRestockWebhook(url, name, image, likes, dislikes)

        }
      }

      await helper.sleep(WAIT_TIME);
      monitor();
    }).catch(error => {
      console.log(error)
      monitor();
      return
    });
  }).catch(error => {
    console.log(error)
    monitor();
    return
  });
}

async function postRestockWebhook(url, name, image, likes, dislikes) {
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.palacedrop.com', '', 'https://www.palacedrop.com')
    .addField("**Likes**", likes, true)
    .addField("**Dislikes**", dislikes, true)
    .setImage(image)
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/0/0b/Palace_Logo.jpg')
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Palace Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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