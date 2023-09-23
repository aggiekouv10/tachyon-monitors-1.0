const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.ZALANDOUK);
const CHANNEL = discordBot.channels.ZALANDOUK;
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'zalandouk';
const { v4 } = require('uuid');
const got = require('got')
const request = require('request');
let totalData = 0;
helper.init();

let PRODUCTS = []

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

function removeProduct(sku) {
  let newProducts = [];
  for (let product of PRODUCTS) {
    if (product.sku !== sku)
      newProducts.push(product);
  }
  PRODUCTS = newProducts;
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
    // await helper.sleep(helper.getRandomNumber(1500, 3000));
    addProduct(row.sku, row.waittime, row.last);
    monitor(row.sku, row.waittime);
  }
  console.log("Started monitoring all SKUs!")
}


async function monitor(sku, waittime) {
  let cachedProduct = getProduct(sku);
  // console.log(cachedProduct)
  if (!cachedProduct) {
    return;
  }

  let proxy = helper.getRandomZalandoProxy();
  let url = `/api/mobile/v3/article/${sku}.json`;
  let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
  let ts = Date.now();
  let sig = helper.sha1(url + b + ts);
  let uuid = v4();
  const headers = {
    'x-app-Domain': '16',
    'User-Agent': 'Zalando/5.1.1 (Linux; Android 7.1.2; ASUS_Z01QD/Asus-user 7.1.2 20171130.276299 release-keys)',
    'x-uuid': uuid,
    'x-app-Version': '5.1.1',
    'x-ts': ts.toString(),
    'x-device-os': 'android',
    'x-device-platform': 'android',
    'x-device-language': 'en',
    'x-sig': sig.toString(),
    'X-os-version': '7.1.2',
    'Accept-Language': '*',
    'Accept': 'application/json',
    'X-Zalando-Mobile-App': '1166c0792788b3f3a',
    'X-Logged-In': true,
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, defalte, br',
    Connection: 'keep-alive',
  };
  // let response = await axios.get(`https://www.zalando.co.uk/${url}?ts=${ts.toString()}&sig=${sig.toString()}`, {
  //     headers: headers
  // })
  let initTime = Date.now();
  request.get({
    uri: `https://www.zalando.co.uk/${url}?ts=${ts.toString()}&sig=${sig.toString()}&bust=${v4()}`,
    headers: headers,
    secureProtocol: 'TLSv1_2_method',
    rejectUnauthorized: false,
    resolveWithFullResponse: true,
    gzip: true,
    json: true,
    proxy: proxy,
    
  }, async function (error, response, body) {
    console.log("Response - " + sku + " - " + (Date.now() - initTime))
    // let body = await helper.getBodyAsText(response)
    // totalData += ((body.length * 1) / 1000000);
    // try {
    //   body = JSON.parse(body);
    //   // console.log(body)
    // } catch (err) {
    //   console.log(err)
    // }
    if (error) {
      console.log("*********ZALANDO-UK ERROR*********");
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy)
      console.log(error);
      await helper.sleep(waittime);
      monitor(sku, waittime);
      return;
    }

    // console.log(body);

    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(cachedProduct.last);
    let inStock = false;
    try {
      for (let simple of body.simples) {
        if (simple.availableQuantity <= 0)
          continue;
        let size = simple.size.trim();
        sizes += size + ` (${simple.availableQuantity}+) \n`;
        sizeList.push(simple.simpleSku);
        if (!oldSizeList.includes(simple.simpleSku))
          inStock = true;
      }
    } catch (err) {
      console.log("*********ZALANDO-UK ERROR*********");
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy)
      console.log(err);
      await helper.sleep(waittime);
      monitor(sku, waittime);
      return;
    }

    if (inStock && cachedProduct.last !== JSON.stringify(sizeList)) {
      let title = body.label;
      let price = body.price.toString();
      let image = body.media_items[0].normal_url;
      postRestockWebhook(body.shareUrl, title, sku, sizes, price, image);
      await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
      editLast(sku, JSON.stringify(sizeList));
    }
    await helper.sleep(waittime);
    monitor(sku, waittime);
  })
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  console.log(arguments)
  if (sizes.length > 1024)
    sizes = 'Too many';
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.zalando.co.uk/', '', 'https://www.zalando.co.uk/')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**SKU**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    // .setTime()
    .setFooter("Zalando UK | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
      removeProduct(sku);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
    addProduct(sku, waitTime, '[]');
    monitor(sku, waitTime);
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
          removeProduct(sku);
          notMonitoringSKUs.push(sku);
          continue;
        }

        await database.query(`insert into ${DATABASE_TABLE}(sku, last, waittime) values('${sku}', '[]', ${waitTime})`);
        addProduct(sku, waitTime, '[]');
        monitor(sku, waitTime);
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********ZALANDO-UK-SKU-ERROR*********");
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
      embed.setTitle(`Zalando-UK Monitor`);
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