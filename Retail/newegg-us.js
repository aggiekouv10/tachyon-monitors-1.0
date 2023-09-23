const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NEWEGGUS);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'neweggus';

const banned = [];

let totalData = 0;
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
  console.log('[NEWEGG-US] Monitoring all SKUs!')
}

async function monitor(sku) {
  let url = `https://www.newegg.com/tachyon/p/${sku}`;
  let pdpURL = `https://www-newegg-com.translate.goog/product/api/ProductRealtime?ItemNumber=${sku}&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  let PROXY = helper.getRandomProxy();
  if(banned.includes(PROXY)) {
    monitor(sku);
    return;
  }

  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    headers: {
      'accept': "application/json, text/plain, */*",
      'accept-encoding': "gzip, deflate, br",
      'cache-control': "no-cache",
      'content-type': "application/json",
      'origin': "https://www.newegg.com",
      'referer': "https://www.newegg.com/",
      'user-agent': "Android v18.15.1"
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
  }).then(async response => {
        clearTimeout(timeoutId)
    if(response.status === 400) {
      //console.log('400')
      monitor(sku)
      return   
      }
      if(response.status === 403) {
      //console.log('403')
      monitor(sku)
      return   
      }
      if(response.status === 503) {
      //console.log('503')
      monitor(sku)
      return    
      }
      if(response.status === 204) {
      //console.log('204')
      monitor(sku)
      return
      }
    let body = await helper.getBodyAsText(response)
    try {
      body = JSON.parse(body);
    } catch (err) {
      if (body.includes('561 Proxy Unreachable')) {
        console.log('[NEWEGG-US] Proxy Fucking Unreachable - ' + sku + ' - ' + PROXY);
        monitor(sku);
        return;
      }
      if (body.includes('Are you a human?')) {
        console.log('[NEWEGG-US] DETECTED CAPTCHA - ' + sku + ' - ' + PROXY);
        monitor(sku);
        return;
      }
      if (body.includes('It appears our systems have detected the possible use of an automated program')) {
        console.log('[NEWEGG-US] DETECTED AUTOMATION - ' + sku + ' - ' + PROXY);
        monitor(sku);
        return;
      }
      if (body.includes('detected abnormal behaviors')) {
        console.log('[NEWEGG-US] DETECTED ABNORMAL - ' + sku + ' - ' + PROXY);
        monitor(sku);
        return;
      }
      if (body.toLowerCase().includes('many requests')) {
        console.log('[NEWEGG-US] 429, SKU: ' + sku);
        monitor(sku);
        return;
      }
      if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
        console.log('[NEWEGG-US] Unauthenticated Proxy: ' + PROXY);
        monitor(sku);
        return;
      }
      console.log("********************NEWEGG-US-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + PROXY);
      console.log(err);
      console.log(body)
      monitor(sku);
      return;
    }
    if (!body) {
      console.log('[NEWEGG-US] Null body - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    let status = query.rows[0].status
    if(!body["MainItem"]) {
      // console.log('[NEWEGG-US] Invalid Body - ' + sku + ' - ' + PROXY);
      // console.log(body);
      console.log(PROXY);
      console.log(banned.length)
      banned.push(PROXY)
      monitor(sku);
      return;
    }
    if (body["MainItem"]["Instock"]) {
      let title = body["MainItem"]["Description"]["Title"];
      let price = body["MainItem"]["UnitCost"] + '';
      let image = "https://c1.neweggimages.com/ProductImageCompressAll1280/" + body["MainItem"]["Image"]["ItemCellImageName"];
      if (status !== "In-Stock") {
        // console.log(url)
        // console.log(title)
        // console.log(price)
        // console.log(image)
        // console.log(sku)
        await postRestockWebhook(url, title, sku, price, image);
        console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
        await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
      }
    } else {
      if (status !== "Out-of-Stock") {
        console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
        await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
      }
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    console.log("********************NEWEGG-US-ERROR********************")
    console.log("SKU: " + sku);
    console.log("Proxy: " + PROXY);
    console.log(err);
    setTimeout(function () {
      monitor(sku);
    }, 150);
  });
}

async function postRestockWebhook(url, title, sku, price, image) {
  let ATC = `https://www.newegg.com/Shopping/AddtoCart.aspx?Submit=ADD&ItemList=${sku}&hmt=add`
  let cart = 'https://secure.newegg.com/shop/cart'
  let checkout = 'https://secure.newegg.com/shop/checkout'
  let login = 'https://secure.newegg.com/NewMyAccount/AccountLogin.aspx?nextpage=https%3A%2F%2Fwww.newegg.com%2F'
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.newegg.com', '', 'https://www.newegg.com')
    .addField("**In Stock**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Newegg | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
    monitor(sku);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.NEWEGGUS) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Newegg-US Monitor");
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