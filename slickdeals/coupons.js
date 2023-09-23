const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.COUPONS);
const CHANNEL = discordBot.channels.COUPONS

const helper = require('../helper');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 2000;

async function startMonitoring() {
  monitor()
  console.log('[Coupons] Monitoring!')
}

async function monitor() {
    fetch("https://slickdeals.net/forums/forumdisplay.php?f=10").then(async response => {
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let products = root.querySelectorAll('.threadtitleline');
    for (let product of products) {
      let name = product.querySelector('.bp-p-dealLink.bp-c-link').textContent.replace('amp;','').replace('&quot;','"')
      if (!PRODUCTS.includes(name)) {
        PRODUCTS.push(name)
        if (justStarted) {
          continue;
        }
        let url = "https://slickdeals.net" + product.querySelector('.bp-p-dealLink.bp-c-link').attributes.href
        postRestockWebhook(url, name)

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

async function postRestockWebhook(url, name) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://slickdeals.net', 'https://media.discordapp.net/attachments/809958634019618866/861323148510494750/icon.png', 'https://slickdeals.net')
    .addField("**Posted In**", '[Coupons](https://slickdeals.net/forums/forumdisplay.php?f=10)', true)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Slickdeals | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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