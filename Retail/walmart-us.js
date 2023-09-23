const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTUS);
const CHANNEL = discordBot.channels.WALMARTUS;
const helper = require('../helper');
helper.init();
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'walmartus';
let totalData = 0;
let errors = 0;

let EXCLUDED_PROXIES = require('../walmartExcludedProxies.json');//[]
const { default: axios } = require('axios');
let CAPTCHA = [];
let PRODUCTS = [];
let initial = true;

function addProduct(sku, waittime, last) {
  let alreadyPresent = isProductPresent(sku);
  if (!alreadyPresent)
    PRODUCTS.push({ sku: sku, waittime: waittime, last: last });
}

function isProductPresent(sku) {
  for (let product of PRODUCTS) {
    if (product.sku === sku)
      return true;
  }
  return false;
}


function getProduct(sku) {
  for (let product of PRODUCTS) {
    if (product.sku === sku)
      return product;
  }
}

function editLast(sku, last) {
  for (let i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].sku === sku) {
      PRODUCTS[i].last = last;
      break;
    }
  }
}

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    // await helper.sleep(helper.getRandomNumber(200, 500));
    addProduct(row.sku, row.waittime);
    monitor(row.sku, true);
  }
  console.log(`[WALMART-US] Started monitoring all SKUs!`)
}

async function monitor(sku, initial) {
  let proxy = helper.getRandomProxy();

  let cachedProduct = getProduct(sku);
  if (!cachedProduct) {
    return;
  }

  let start = Date.now()
  axios.get(`https://www-walmart-com.translate.goog/terra-firma/item/${sku}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui&abcz=${v4()}`, {
    "headers": {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
    },
    httpsAgent: new HTTPSProxyAgent(proxy),
    
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await response.data;
    // console.log(body.status)
    // totalData += ((body.length * 1) / 1000000);
    errors = 0;
    // try {
    //   body = JSON.parse(body);
    // } catch (err) {
    //   if (body.includes('561 Proxy Unreachable')) {
    //     console.log(`[WALMART-US] Proxy Fucking Unreachable - ` + sku + ' - ' + proxy);
    //     monitor(sku);
    //     return;
    //   }
    //   if (body.toLowerCase().includes('many requests') || response.status === 429) {
    //     console.log(`[WALMART-US] 429, SKU: ` + sku);
    //     setTimeout(function () {
    //       monitor(sku);
    //     }, helper.getRandomNumber(300, 700));
    //     return;
    //   }
    if (body.includes && body.includes('Verify')) {
      console.log(`[WALMART-US] Captcha Block - ` + sku + ' - ' + proxy);
      if (!CAPTCHA.includes(proxy))
        CAPTCHA.push(proxy);
      monitor(sku);
      return;
    }
    //   if (err.type === 'request-timeout' || err.type === 'body-timeout') {
    //     console.log("[AMD-US] Timeout - " + proxy);
    //     monitor();
    //     return
    //   }
    //   console.log("********************WALMART-US-ERROR********************")
    //   console.log("SKU: " + sku);
    //   console.log("Proxy: " + proxy);
    //   console.log(err);
    //   console.log(body)
    //   monitor(sku);
    //   return;
    // }

    let stocked = false;
    
    for (let offerID in body.payload.offers) {
      let offer = body.payload.offers[offerID];
      if (!offer.sellerId === 'F55CDC31AB754BB68FE0B39041159D63')
        continue;

      let inStock = offer.productAvailability.availabilityStatus === "IN_STOCK";
      let title = "TBD";
      for (let product in body.payload.products) {
        product = body.payload.products[product]
        if (product.productAttributes && product.productAttributes.productName) {
          title = product.productAttributes.productName;
          break;
        }
      }
      let price = offer.pricesInfo.priceMap.CURRENT.currencyUnitSymbol + offer.pricesInfo.priceMap.CURRENT.price;
      let image = body.payload.images[Object.keys(body.payload.images)[0]].assetSizeUrls.DEFAULT;

      if (inStock) {
        if (cachedProduct.last !== 'IN_STOCK') {
          stocked = true;
          if (!initial) {
            console.log("[WALMART-US] RESTOCK: " + sku + " - " + title)
            postRestockWebhook('https://www.walmart.com/ip/Tachyon-Monitors/' + sku, title, sku, price.toString(), image, helper.getTime(true));
          }
          await database.query(`update ${DATABASE_TABLE} set status='IN_STOCK' where sku='${sku}'`);
          editLast(sku, "IN_STOCK");
        }
        return;
      }
      if (cachedProduct.last !== 'OUT_OF_STOCK' && !stocked) {
        await database.query(`update ${DATABASE_TABLE} set status='OUT_OF_STOCK' where sku='${sku}'`);
        editLast(sku, "OUT_OF_STOCK");
      }
    }
    await helper.sleep(cachedProduct.waittime);
    monitor(sku);
  }).catch(async err => {
    if (err.type === 'request-timeout' || err.type === 'body-timeout' || err.code === 'ETIMEDOUT') {
      console.log("[WALMART-US] Timeout - " + proxy);
      monitor(sku, initial);
      return
    }
    if (err.response && err.response.status !== 200) {
      if (err.response.status === 444) {
        console.log("[WALMART-US] ERR 444 - " + proxy);
        EXCLUDED_PROXIES.push(proxy);
        await helper.sleep(500);
        monitor(sku, initial);
        return;
      }
      errors++;
      console.log("********************WALMART-US-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log("Code: " + err.response.status);
      console.log("Response: " + err.response, data)
      // if (errors > 5) {
      //   console.log("--------------------------WALMART-US-OVER------------------------")
      //   return;
      // }
      monitor(sku, initial);
      return;
    }
    console.log("********************WALMART-US-ERROR********************")
    console.log("SKU: " + sku);
    console.log("Proxy: " + proxy);
    console.log(err);
    await helper.sleep(150);
    monitor(sku, initial);
  });
}

function getProxy() {
  let proxy = helper.getRandomProxy()//PROXIES[a++];
  if (EXCLUDED_PROXIES.includes(proxy))
    return getProxy();
  return proxy;
}

async function postRestockWebhook(url, title, sku, price, image, time) {
  // console.log(arguments)
  let cart = `https://www.walmart.com/cart`
  let checkout = `https://www.walmart.com/account/checkout`
  let login = `https://www.walmart.com/account/login`
  let phantom = `https://api.ghostaio.com/quicktask/send?site=WALMART&input=${url}`
  let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
  let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
  let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
  //let item  = prices.split('$')
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.walmart.com', '', 'https://www.walmart.com')
    .addField("**In Stock**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Links**", '[Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    // .setTime()
    .setFooter("Walmart | v1.0 | " + time, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }

  if (msg.content.startsWith(discordBot.commandPrefix + 'proxies')) {
    discordBot.sendChannelMessage(msg.channel.id, `Invalid: ` + EXCLUDED_PROXIES.length);
    return;
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'captcha')) {
    discordBot.sendChannelMessage(msg.channel.id, `Captcha: ` + CAPTCHA.length);
    return;
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

        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
        monitor(sku);
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********WALMART-US-SKU-ERROR*********");
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
      embed.setTitle(`Walmart-US Monitor`);
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