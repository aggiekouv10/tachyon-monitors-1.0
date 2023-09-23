const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.MICROCENTER);
const CHANNEL = discordBot.channels.MICROCENTER;
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');

const DATABASE_TABLE = 'microcenter';
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
  console.log("[MICROCENTER] Started monitoring all SKUs!")
}

async function monitor(sku, doubleCheck) {
  let url = `https://www.microcenter.com/product/${sku}/Tachyon-Monitors`;
  let pdpURL = `https://www.microcenter.com/product/${sku}/${v4()}?cache=${v4()}`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  let proxy = helper.getRandomProxy();
  // console.log("Fetching")
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    "headers": {
      'user-agent': randomUseragent.getRandom()
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
    let body2;
    let price = "Unavailable";
    totalData += ((body.length * 1) / 1000000);
    try {
      body2 = JSON.parse(body.split(`var inventory = `)[1].split("]")[0] + "]");
      price = body.split("'productPrice'")[1].split(',')[0];
      price = price.substr(2, price.length - 3) + " (USD)";
      body = "{" + body.split(`"@type": "Product",`)[1].split(`"itemCondition"`)[0];
      body = body.substr(0, body.length - 4) + '}}'
      body = JSON.parse(body)
      // fs.writeFileSync('testst.html', body.toString())
      // console.log("Done")
      // return
    } catch (err) {
      if (doubleCheck)
        return null;
      if (body.includes('561 Proxy Unreachable')) {
        console.log('[MICROCENTER] Proxy Fucking Unreachable - ' + sku + ' - ' + proxy);
        monitor(sku);
        return;
      }
      if (body.toLowerCase().includes('many requests') || response.status === 429) {
        console.log('[MICROCENTER] 429, SKU: ' + sku);
        setTimeout(function () {
          monitor(sku);
        }, helper.getRandomNumber(300, 700));
        return;
      }
      if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
        console.log('[MICROCENTER] Unauthenticated Proxy: ' + proxy);
        monitor(sku);
        return;
      }
      if (!body || body === undefined) {
        console.log('[MICROCENTER] Null body - ' + sku + ' - ' + proxy);
        monitor(sku);
        return;
      }
      console.log("********************MICROCENTER-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log(err);
      // console.log(body)
      monitor(sku);
      return;
    }
    if (doubleCheck) {
      return body;
    }

    let title = body.name;
    let image = body.image[0];
    // let price = + body.offers.price + ` (${body.offers.priceCurrency})`

    let last = JSON.parse(query.rows[0].last)
    // console.log(last)
    let newList = [];
    let update = false;

    for (let store of body2) {
      if (store.qoh > 0) {
        newList.push(store.storeNumber);
        if (!last.includes(store.storeNumber)) {
          console.log("Instock - " + store.storeName)
          postRestockWebhook(url, title, store.storeName, price, image);
          update = true;
        }
      } else {
        if (last.includes(store.storeNumber)) {
          let double = await monitor(sku, true);
          if (double === body) {
            console.log("Missed - " + store.storeName)
            update = true;
          }
        }
      }
    }

    if (update) {
      await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(newList)}' where sku='${sku}'`);
    }

    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    if(err.code === 'ECONNRESET') {
      console.log("[MICROCENTER-US] ECONNRESET - " + sku + " - " + proxy);
      setTimeout(function () {
        monitor(sku);
      }, 150);
      return
    }
    if(err.type === 'request-timeout') {
      console.log("[MICROCENTER-US] Timeout - " + sku + " - " + proxy);
      setTimeout(function () {
        monitor(sku);
      }, 150);
      return
    }
    console.log("********************MICROCENTER-ERROR********************")
    console.log("SKU: " + sku);
    console.log("Proxy: " + proxy);
    console.log(err);
    setTimeout(function () {
      monitor(sku);
    }, 150);
  });
}

async function postRestockWebhook(url, title, location, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.microcenter.com', '', 'https://www.microcenter.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Location**", location, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Microcenter | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
    monitor(sku);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
    let splits = msg.content.split(" ")
    if (splits.length < 2) {
      discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
      return;
    }
    let args = splits[1].split('\n');
    if (!args || args.length < 2) {
      discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
      return;
    }
    // console.log(args)
    let waitTime = parseInt(args[0].trim());
    let skus = args.splice(1);
    let monitoringSKUs = [];
    let notMonitoringSKUs = [];
    let errorSKUs = [];
    let tempSKUs = [];
    for (let sku of skus) {
      if (!tempSKUs.includes(sku))
        tempSKUs.push(sku);
    }
    skus = tempSKUs;
    // console.log(skus);
    for (let sku of skus) {
      sku = sku.trim();
      // console.log(sku);
      try {
        if (sku === '')
          continue;
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length > 0) {
          await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
          notMonitoringSKUs.push(sku);
          continue;
        }

        await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
        monitor(sku);
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********MICROCENTER-SKU-ERROR*********");
        console.log("SKU: " + sku);
        console.log(err);
      }
    }
    // console.log(notMonitoringSKUs.length)
    const monitoringMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('Now monitoring')
      .setDescription(monitoringSKUs.join('\n'))
    if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
    const notMonitoringMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('NOW NOT monitoring')
      .setDescription(notMonitoringSKUs.join('\n'))
    if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
    const monitoringErrorMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('ERROR monitoring')
      .setDescription(errorSKUs.join('\n'))
    if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === CHANNEL) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle(`Microcenter Monitor`);
      embed.setColor('#6cb3e3')
      if (query.rows.length > 0) {
        let SKUList = [];
        for (let row of query.rows) {
          SKUList.push(`${row.sku} - ${row.waittime}ms`);
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