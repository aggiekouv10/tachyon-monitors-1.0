const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const HTTPSProxyAgent = require('https-proxy-agent');
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { JSDOM } = jsdom;
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BRANDSHOPRU);
const helper = require('../helper');

const DATABASE_TABLE = 'brandshopru';
let totalData = 0;

let sku = 'gx7576'
let url = `https://brandshop.ru/goods/tachyon/${sku}?abcz=${v4()}`;
let proxy = helper.getRandomProxy();
got(url, {
  'headers': {
    'method': 'GET',
    'scheme': 'https',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
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

  totalData += ((response.body.length * 1) / 1000000);
  const dom = new JSDOM(response.body);
  console.log(response)
  let title = dom.window.document.querySelector('title').textContent;
  let price = dom.window.document.querySelector('.regprice').textContent;
  let image = dom.window.document.querySelector('#product-image-big .img-responsive').src;
  postRestockWebhook(url, title, sku, sizes, price, image);
  if (query.rows.length > 0) {
    setTimeout(function () {
      monitor(sku);
    }, query.rows[0].waittime);
  }
}).catch(err => {
  console.log("Erorr occured!");
  console.log(err);
});


async function postRestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://brandshop.ru', '', 'https://brandshop.ru')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**Sku**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Brandshop | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
    return;
  if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
    discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
    let args = msg.content.split(" ");
    if (args.length !== 3) {
      discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
      return;
    }
    let sku = args[1];
    let waitTime = args[2];
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length > 0) {
      await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
    monitor(sku);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.BRANDSHOPRU) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Offspring Monitor");
      embed.setColor('#6cb3e3')
      if (query.rows.length > 0) {
        let SKUList = [];
        for (let row of query.rows) {
          SKUList.push(row.sku);
        }
        embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
      }
      else {
        embed.setDescription("Not Monitoring any SKU!")
      }
      msg.reply(embed);
    }
  }
});

module.exports = {
  totalData: function () {
    return totalData;
  }
}
