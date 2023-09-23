const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYUS);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');

const DATABASE_TABLE = 'bestbuyus';
let totalData = 0;
const WAITTIME = 1000;

let KEYS = [
  'qhqws47nyvgze2mq3qx4jadt',
  'Q7rwdCDZnWPly3KzbG1KNR5F',
  'bsxgt8s4ytx7ywvg33c8tdzy',
  '08JJS1ffSirGzNn7hMjRcjBN',
  'bvn7tg3ftneqbun2h67ae7nu',
  'zbjjfx6y76g5mmp3znsetnqn',
  '0j7iapqW9cMtP87GqDaxc2Um',
  'xlTM7AGGKuDAXQEGNYD9xlY7',
  'xZzirguQPULirOqbS2fmmGuG'
]
let EXCLUDED_KEYS = [

]
let a = 0;
function getKey() {
  let key = KEYS[a];
  if (!key) {
    a = 0;
    key = KEYS[a];
  }
  a++;
  if (EXCLUDED_KEYS.includes(key)) {
    return getKey();
  }
  return key;
}

let LIST = [];
let PRODUCTS = [];
let HASH = null;
const SKU_LIST_LENGTH = 100;

startMonitoring();
async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    PRODUCTS.push({
      sku: row.sku,
      waittime: row.waittime,
      status: row.status
    })
    pushToList(row.sku)
  }
  monitor();
  console.log("[BESTBUY-US] Started monitoring all SKUs!")
}

function pushToList(sku) {
  if (LIST.length === SKU_LIST_LENGTH) {
    return false;
  }
  LIST.push(sku);
  // console.log("[BESTBUY-US] Pushed " + sku)
  return LIST;
}

function removeFromList(sku) {
  let newList = []
  for (let x of LIST) {
    if (x !== sku)
      newList.push(x);
  }
  // console.log(newList)
  LIST = newList;
}

function findProduct(sku) {
  for (let product of PRODUCTS) {
    if (product.sku === sku)
      return product;
  }
  return {};
}

// function updateProduct(sku, availability) {
//   for (let i = 0; i < PRODUCTS.length; i++) {
//     if (PRODUCTS[i].sku === sku)
//       PRODUCTS[i].onlineAvailability = availability;
//   }
// }

async function monitor() {
  if (EXCLUDED_KEYS.length === KEYS.length) {
    postWebhook('Game Over', JSON.stringify(EXCLUDED_KEYS));
    return;
  }
  if (LIST.length === 0) {
    await helper.sleep(WAITTIME);
    monitor();
    return;
  }
  let list = '';
  for (let x of LIST) {
    list += x + ","
  }
  list = list.substring(0, list.length - 1);
  let apiKey = getKey();
  let pdpURL = `https://api.bestbuy.com/v1/products(sku%20in(${list}))?apiKey=${apiKey}&show=onlineAvailability,sku,name,salePrice,image&cache=${v4()}&format=json&pageSize=100`;
  // console.log(pdpURL);
  // return;

  let proxy = helper.getRandomProxy();
  let time = Date.now();
  // console.log(pdpURL);

  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    // 'headers': {
    //   'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    //   'accept-encoding': "gzip, deflate, br",
    //   'accept-language': "en-US,en;q=0.9",
    //   'cache-control': 'no-cache',
    //   'pragma': 'no-cache',
    //   'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    //   'sec-ch-ua-mobile': '?0',
    //   'sec-fetch-dest': "document",
    //   'sec-fetch-mode': "navigate",
    //   'sec-fetch-site': "none",
    //   'sec-fetch-user': '?1',
    //   'upgrade-insecure-requests': '1',
    //   'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    // },
    // agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    
  }).then(async response => {
        clearTimeout(timeoutId)
    // console.log("YAY")
    let body = await helper.getBodyAsText(response)
    let currentHash = body;
    totalData += ((body.length * 1) / 1000000);
    try {
      body = JSON.parse(body);
    } catch (err) {
      if (body.toLowerCase().includes('many requests')) {
        console.log('[BESTBUY-US] 429, SKU: ' + list);
        monitor();
        return;
      }
      console.log("********************BESTBUY-US-ERROR********************")
      console.log("SKUs: " + list);
      console.log("Proxy: " + proxy);
      console.log(err);
      console.log(body)
      monitor();
      return;
    }
    if (!body.products) {
      if (body.errorMessage === 'The provided API Key has reached the per second limit allotted to it.') {
        console.log("[BESTBUY-US] Ratelimit!");
      } else if (body.errorMessage.toLowerCase().includes("daily")) {
        console.log("[BESTBUY-US] Key dead - " + apiKey);
        EXCLUDED_KEYS.push(apiKey);
        postWebhook('KEY DEAD', apiKey);
        await helper.sleep(WAITTIME);
        monitor();
        return;
      }
      else if (err.type === 'request-timeout' || err.type === 'body-timeout') {
        console.log("[BESTBUY-US] Timeout - " + proxy);
        monitor();
        return
      }
      else {
        console.log("********************BESTBUY-US-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log("ERROR: Rate Limited");
        console.log(body)
      }
      await helper.sleep(WAITTIME);
      monitor();
      return;
    }
    // if (!HASH) {
    //   PRODUCTS = body.products;
    //   HASH = currentHash;
    //   await helper.sleep(WAITTIME);
    //   monitor();
    //   return;
    // }
    if (currentHash === HASH) {
      await helper.sleep(WAITTIME);
      monitor();
      return;
    };
    // console.log(JSON.stringify(body))
    for (let product of body.products) {
      let oldProduct = findProduct(product.sku);
      // console.log(PRODUCTS);
      // console.log(oldProduct)
      // return;

      let sku = product.sku;
      let title = product.name;
      let price = product.salePrice;
      let image = product.image;

      // console.log("SKU: " + sku)
      if (product.onlineAvailability) {
        // console.log(true);
        if (product === {} || !oldProduct.onlineAvailability) {
          postRestockWebhook('https://www.bestbuy.com/site/tachyon/' + sku + '.p?skuId=' + sku, title, sku.toString(), 'Online', price.toString(), image, helper.getTime(true));
          console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
          console.log(`[BESTBUY-US] Instock! SKU: ${sku}, Proxy: ${proxy}`);
        }
      }
    }
    HASH = currentHash;
    PRODUCTS = body.products;

    await helper.sleep(WAITTIME);
    monitor();
    return;
  }).catch(async err => {
    if (err.type === 'request-timeout' || err.type === 'body-timeout') {
      console.log("[BESTBUY-US] Timeout - " + proxy);
      await helper.sleep(WAITTIME);
      monitor();
      return
    }
    console.log("********************BESTBUY-US-ERROR********************")
    console.log("SKUs: " + list);
    console.log("Proxy: " + proxy);
    console.log(err);
    setTimeout(function () {
      monitor();
    }, 150);
  });
}

async function postRestockWebhook(url, title, sku, type, price, image, time) {
  let ATC = `https://api.bestbuy.com/click/tachyon/${sku}/cart`
  let cart = `https://www.bestbuy.com/cart`
  let checkout = `https://www.bestbuy.com/checkout/r/fast-track`
  let login = `https://www.bestbuy.com/identity/global/signin`
  let phantom = `https://api.ghostaio.com/quicktask/send?site=BESTBUY&input=${url}`
  let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
  let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
  let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.bestbuy.com', '', 'https://www.bestbuy.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Type**", type, true)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    // .setTime()
    .setFooter("BestBuy-US | v1.0 | " + time, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
}

async function postWebhook(title, data) {
  // console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .addField("**Date**", data)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("BestBuy-US | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
      removeFromList(sku);
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
    pushToList(sku);
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
          removeFromList(sku);
          notMonitoringSKUs.push(sku);
          continue;
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
        pushToList(sku)
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********BESTBUY-SKU-ERROR*********");
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
    if (msg.channel.id === discordBot.channels.BESTBUYUS) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("BestBuy-US Monitor");
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