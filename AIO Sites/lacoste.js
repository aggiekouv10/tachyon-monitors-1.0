const fs = require('fs');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent');
const AbortController = require('abort-controller')
const discordBot = require('../discord-bot');
const got = require('got');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.LACOSTE);
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'lacoste';
const SITENAME = 'LACOSTE'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
let stats;
let totalData = 0;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    PRODUCTS[row.sku] = {
      sku: row.sku,
      waittime: row.waittime,
      status: row.status
    }
    monitor(row.sku);
  }
  console.log("[LACOSTE] Started monitoring all SKUs!")
}

async function monitor(sku) {
  let proxy = helper.getRandomProxy();
  let request = `https://www.lacoste.com/us/lacoste/tachyon/${sku}.html?ajax=true&abcz=${v4()}`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(request, {
    'headers': {
      'User-Agent': randomUseragent.getRandom(),
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    totalData += ((response.body.length * 1) / 1000000);
    let body = await helper.getBodyAsText(response)
    let document = HTMLParser.parse(body);
    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let size of document.querySelectorAll('.js-pdp-size-btn.critical-skeleton.btn-cta.l-vmargin--small.l-hmargin--small.btn-size')) {
      sizes += `[${size.textContent.trim()}](${size.attributes['data-src']})\n`;
      sizeList.push(size.textContent);
      if (!oldSizeList.includes(size.textContent))
        inStock = true;
    }
    let sizeright = sizes.split('\n')
    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
    if (inStock) {
      let url = `https://www.lacoste.com/us/lacoste/tachyon/${sku}.html`
      let title = document.querySelector('h1').textContent;
      let price = document.querySelector('.nowrap.fs--medium.ff-semibold').textContent.trim();
      let image = "https:" + document.querySelector('.js-zoomable-img.l-relative.l-fill-width.cursor-zoom-in').attributes.src
      postRestockWebhook(url, title, sku, sizeright, sizeleft, price, image);
      await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    //console.log("**********OFFSPRING-ERROR**********");
    //console.log("SKU: " + sku)
    //console.log(err);
  });
}

async function postRestockWebhook(url, title, sku, sizeright, sizeleft, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.lacoste.com', '', 'https://www.lacoste.com')
    .addField("**Stock**", "1+", true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Lacoste | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    if (msg.channel.id === discordBot.channels.LACOSTE) {
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