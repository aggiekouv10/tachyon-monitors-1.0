const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SUPREMEUS);
const CHANNEL = discordBot.channels.SUPREMEUS;
const helper = require('../helper');
helper.init();
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');

let totalData = 0;

let productsAll = [];
let HASH = null;
let WAITTIME = 1000;

startMonitoring();

async function startMonitoring() {
  // let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  // for (let row of SKUList.rows) {
  //   await helper.sleep(helper.getRandomNumber(1500, 3000));
  //   monitor(row.sku);
  // }
  monitorProductList();
  console.log("[SUPREME-US] Started monitoring all SKUs!")
}

async function monitorProductList() {
  let pdpURL = `${STOCK_URLS[helper.getRandomNumber(0, STOCK_URLS.length)]}?${v4()}`;

  let proxy = helper.getRandomDDProxy();
  let UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150"//helper.getMobileUA();
  let startTime = Date.now();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.supremenewyork.com/mobile_stock.json', {
    'headers': {
      'Accept': "application/json",
      'X-Requested-With': "XMLHttpRequest",
      'Accept-Encoding': "gzip, deflate",
      'Accept-Language': "en-us",
      'Origin': "https://www.supremenewyork.com",
      'User-Agent': UA,
      'Referer': "https://www.supremenewyork.com/mobile",
      'Proxy-Connection': "keep-alive"
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
  }).then(async response => {
        clearTimeout(timeoutId)
    let responseTime = Date.now() - startTime;
    let body = await helper.getBodyAsText(response)
    let currentHash = body;
    totalData += ((body.length * 1) / 1000000);
    try {
      body = JSON.parse(body);
    } catch (err) {
      console.log("********************SUPREME-PRODUCTS-ERROR********************")
      console.log("URL: " + pdpURL);
      console.log("Proxy: " + proxy);
      console.log(err);
      console.log(body)
      monitorProductList();
      return;
    }

    let totalProducts = [];
    // console.log("Fetched - " + responseTime + "ms" + " - " + pdpURL + " - " + (currentHash.includes('Cordura')) + " - " + proxy)
    // console.log(response.headers)
    // if (currentHash === HASH) {
    //   await helper.sleep(WAITTIME)
    //   monitorProductList();
    //   return;
    // }
    // console.log(currentHash)
    // await helper.sleep(WAITTIME)
    // monitorProductList();
    // return;
    let categories = Object.keys(body.products_and_categories);
    for (let category of categories) {
      let products = body.products_and_categories[category];
      // console.log(category + ": " + products.length)
      for (let product of products) {
        totalProducts.push(product.id);
        if (productsAll.length > 0 && !productsAll.includes(product.id)) {
          let title = product.name;
          let sku = product.id.toString();
          let price = (product.price / 100.00).toString();
          let category = product.category_name;
          let image = "https:" + product.image_url_hi;
          postNewProductWebhook(`https://www.supremenewyork.com/shop/Tachyon-Monitors/` + sku, title, sku, category, price, image);
          return;
        }
      }
    }
    HASH = currentHash;
    productsAll = totalProducts;
    // console.log("Total Products:" + productsAll.length + '\n\n');

    await helper.sleep(WAITTIME)
    monitorProductList();
    return;
  }).catch(async err => {
    console.log("********************SUPREME-PRODUCTS-ERROR********************")
    console.log("URL: " + pdpURL);
    console.log("Proxy: " + proxy);
    console.log(err);
    await helper.sleep(150)
    monitorProductList();
    return;
  });
}

async function monitorProduct(sku, name) {
  let pdpURL = `https://www.supremenewyork.com/shop/${sku}.json?${v4()}`;

  let proxy = helper.getRandomSupremeUSProxy();
  let UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150"//helper.getMobileUA();
  let startTime = Date.now();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    'headers': {
      'Accept': "application/json",
      'X-Requested-With': "XMLHttpRequest",
      'Accept-Encoding': "gzip, deflate",
      'Accept-Language': "en-us",
      'Origin': "https://www.supremenewyork.com",
      'User-Agent': UA,
      'Referer': "https://www.supremenewyork.com/mobile",
      'Proxy-Connection': "keep-alive"
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
  }).then(async response => {
        clearTimeout(timeoutId)
    let responseTime = Date.now() - startTime;
    let body = await helper.getBodyAsText(response)
    totalData += ((body.length * 1) / 1000000);
    try {
      body = JSON.parse(body);
    } catch (err) {
      console.log("********************SUPREME-US-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log(err);
      console.log(body)
      monitorProductList();
      return;
    }
    if(response.status === 404) {

    }
    let totalProducts = [];
    // console.log("Fetched - " + responseTime + "ms" + " - " + pdpURL + " - " + (currentHash.includes('Cordura')) + " - " + proxy)
    // console.log(response.headers)
    // if (currentHash === HASH) {
    //   await helper.sleep(WAITTIME)
    //   monitorProductList();
    //   return;
    // }
    // console.log(currentHash)
    // await helper.sleep(WAITTIME)
    // monitorProductList();
    // return;
    let categories = Object.keys(body.products_and_categories);
    for (let category of categories) {
      let products = body.products_and_categories[category];
      // console.log(category + ": " + products.length)
      for (let product of products) {
        totalProducts.push(product.id);
        if (productsAll.length > 0 && !productsAll.includes(product.id)) {
          let title = product.name;
          let sku = product.id.toString();
          let price = (product.price / 100.00).toString();
          let category = product.category_name;
          let image = "https:" + product.image_url_hi;
          postNewProductWebhook(`https://www.supremenewyork.com/shop/Tachyon-Monitors/` + sku, title, sku, category, price, image);
          return;
        }
      }
    }
    HASH = currentHash;
    productsAll = totalProducts;
    // console.log("Total Products:" + productsAll.length + '\n\n');

    await helper.sleep(WAITTIME)
    monitorProductList();
    return;
  }).catch(async err => {
    console.log("********************SUPREME-PRODUCTS-ERROR********************")
    console.log("URL: " + pdpURL);
    console.log("Proxy: " + proxy);
    console.log(err);
    await helper.sleep(150)
    monitorProductList();
    return;
  });
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.supremenewyork.com/', '', 'https://www.supremenewyork.com/')
    .addField("**Type**", "Restock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**SKU**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Supreme-US | v1.0 " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
}

async function postNewProductWebhook(url, title, sku, category, price, image) {
  console.log(arguments);
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.supremenewyork.com/', '', 'https://www.supremenewyork.com/')
    .addField("**Type**", "New Product Added", true)
    .addField("**Price**", price, true)
    .addField("**Category**", category)
    .addField("**SKU**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Supreme-US | v1.0 " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }
  // if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
  //   if (msg.channel.id === discordBot.channels.FOOTACTION) {
  //     let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  //     const embed = new Discord.MessageEmbed();
  //     embed.setTitle("Footaction Monitor");
  //     embed.setColor('#6cb3e3')
  //     if (query.rows.length > 0) {
  //       let SKUList = [];
  //       for (let row of query.rows) {
  //         SKUList.push(row.sku);
  //       }
  //       embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
  //     }
  //     else {
  //       embed.setDescription("Not Monitoring any SKU!")
  //     }
  //     msg.reply(embed);
  //   }
  // }
});

module.exports = {
  totalData: function () {
    return totalData;
  }
}