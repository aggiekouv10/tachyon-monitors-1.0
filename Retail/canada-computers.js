const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const AbortController = require('abort-controller');

const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const HTMLParser = require('node-html-parser');
const { v4 } = require('uuid');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.CACUMPUTERS);
const CHANNEL = discordBot.channels.CACUMPUTERS;
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904869094967357510/DubGG0pfDdM7OIjyowBmPGRNvTSHnl2VXihmvGjS0Yvlf8NIKKNQ80y_aD_GmhzX7G5I');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/905291359123030016/fpD0OaEUIJN9fV7Kg2Pyn-6xVH5lzGhhfHA-RDqK4_kjhksPkXDwRTRLxeTSzXiWFhSg');
const helper = require('../helper');
const DATABASE_TABLE = 'cacomputers';
let PRODUCTS = {}

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
  console.log('[Canada Computers] Monitoring all SKUs!')
}

async function monitor(sku) {
  let proxy = helper.getRandomProxy();
  let pdp = `https://www-canadacomputers-com.translate.goog/product_info.php?cPath=21_273_274&item_id=${sku}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui&abcz=${v4()}`;
  let url = `https://www.canadacomputers.com/product_info.php?cPath=4_64_1969&item_id=${sku}`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(pdp, {
    'headers': {
      'user-agent': randomUseragent.getRandom()
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status === 400) {
      //console.log('400')
      monitor(sku)
      return
    }
    if (response.status === 403) {
      //console.log('403')
      monitor(sku)
      return
    }
    if (response.status === 503) {
      //console.log('503')
      monitor(sku)
      return
    }
    if (response.status === 204) {
      //console.log('204')
      monitor(sku)
      return
    }
    let body = await helper.getBodyAsText(response)
    let root = HTMLParser.parse(body);
    let status = query.rows[0].status
    if (root.querySelector('.h3.mb-0')) {
      if (root.querySelector('#btn-addCart')) {
        let title = root.querySelector('.h3.mb-0').textContent;
        let price = root.querySelector('.h2-big').textContent;
        let image = root.querySelector('.slick-image').attributes.src;
        if (status !== "In-Stock") {
          postRestockWebhook(url, title, sku, price, image);
          console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
          await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
        }
      } else {
        if (status !== "Out-of-Stock") {
          console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
          await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
        }
      }
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    console.log("Erorr occured!");
    console.log(err);
    monitor(sku);
    return
  });
}

async function postRestockWebhook(url, title, sku, price, image) {
  let ATC = `https://www.canadacomputers.com/shopping_cart.php?action=bundle_add_to_cart&item0=${sku}&qty0=1d`
  let cart = 'https://www.canadacomputers.com/shopping_cart.php'
  let checkout = 'https://www.canadacomputers.com/?checkout-method'
  let login = 'https://www.canadacomputers.com/login.php'
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.canadacomputers.com', '', 'https://www.canadacomputers.com')
    .addField("**In Stock**", '1+', true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("CA Computers | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
  await bandithook.send(webhookMessage);
  await archook.send(webhookMessage);
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
    await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
    monitor(sku);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.CACUMPUTERS) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("NeweggUS (Web) Monitor");
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