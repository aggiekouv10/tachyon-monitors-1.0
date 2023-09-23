const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NETAPORTER);
const pdxhook = new webhook.Webhook("https://discord.com/api/webhooks/893938585466728498/DFDNwZ7wnom9OKPolUCGZnLflsq0TUBoJp5kgFdSoxfSLu5ewda2PnNUlW3i1I1MBuTa")
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912565924446498866/cTKOP9mt517X7prmNwnzdUFAdzQ2D9b2Bh_hZ-f39iHf3WWfsgu3lJuW1vqqnVhgI3d_')
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'netaporter';
const SITENAME = 'NETAPORTER'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let totalData = 0;
let PRODUCTS = {}
startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    PRODUCTS[row.sku] = {
      sku: row.sku,
      waittime: row.waittime,
      sizes: row.sizes
    }
    // console.log(PRODUCTS[row.sku])
    monitor(row.sku);
  }
  console.log('[NETAPORTER] Monitoring all SKUs!')
}
async function monitor(sku) {
  let pluses = ''
  let random = Math.floor(Math.random() * 1000) + 1
  for (let i = 0; i < random; i++) {
    pluses += '+'
  }
  let proxy = helper.getUSARotatingProxy()
  let productCache = PRODUCTS[sku]
  if (!productCache)
    return;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.net-a-porter.com/api/mobile/nap/search/resources/store/nap_US/productview/${sku}` + pluses, {
    'headers': {
      'User-Agent': randomUseragent.getRandom(),
      'X-IBM-Client-Id': 'c598df52-882c-4bab-8dc9-53f2cc61e00e',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal

  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status !== 200) {
      monitor(sku)
      return
    }
    let body = await helper.getBodyAsText(response)
    body = JSON.parse(body);
    if (body.products[0].buyable === true) {
      let title = body.products[0].designerName + ' ' + body.products[0].name
      let price = '$' + body.products[0].price.sellingPrice.amount / 100
      let image = `http://proxy.hawkaio.com/https://www.net-a-porter.com/variants/images/${sku}/in/w2000_q60.jpg`
      let url = `https://www.net-a-porter.com/en-us/shop/product/tachyon/${sku}`
      let sizes = []
      let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
      let oldSizeList = query.rows[0].sizes
      let inStock = false
      let sizeList = []
      let stock = 0
      let variants = body.products[0].productColours[0].sKUs
      for (let variant of variants) {
        if (variant.buyable === true) {
          sizes += `${variant.size.labelSize} \n`
          stock++
          sizeList.push(variant.size.labelSize);
          if (!oldSizeList.includes(variant.size.labelSize))
            inStock = true;
        }
      }
      if (inStock) {
        let sizeright = sizes.split('\n')
        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
        postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock)
        inStock = false;
        await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
      }

    }
    await helper.sleep(productCache.waittime);
    monitor(sku);
  }).catch(async err => {
    if (err.toString().includes('request') || err.toString().includes('network')) {
      monitor(sku)
    } else {
      console.log("***********NETAPORTER-ERROR***********");
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log(err);
      monitor(sku)
    }
  });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
  let fr = `[FR](https://www.asos.com/fr/tachyon/prd/${sku}) . `
  let it = `[IT](https://www.asos.com/it/tachyon/prd/${sku}) . `
  let de = `[DE](https://www.asos.com/de/tachyon/prd/${sku})\n`
  let gb = `[GB](https://www.asos.com/gb/tachyon/prd/${sku}) . `
  let pl = `[PL](https://www.asos.com/pl/tachyon/prd/${sku}) . `
  let es = `[ES](https://www.asos.com/es/tachyon/prd/${sku})`
  let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.asos.com/gb/tachyon/prd/23600038)\n`
  let polar = `[PolarCop](https://qt.polarcop.com/asos?pid=https://www.asos.com/gb/tachyon/prd/23600038)`
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.net-a-porter.com', '', 'https://www.net-a-porter.com')
    .addField("**Stock**", stock + '+', true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    //.addField("QT", flare + polar, true)
    //.addField("Links", fr + it + de + gb + pl + es, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setFooter("Net A Porter | v2.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  pdxhook.send(webhookMessage);
  spacehook.send(webhookMessage);
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
      PRODUCTS[sku] = null
      await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
      return;
    }
    PRODUCTS[sku] = {
      sku: sku,
      waittime: waitTime,
      sizes: ''
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
    monitor(sku);
    // console.log("added " + sku)
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
          PRODUCTS[sku] = null
          database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
          notMonitoringSKUs.push(sku);
          continue;
        }
        PRODUCTS[sku] = {
          sku: sku,
          waittime: waitTime,
          sizes: ''
        }
        database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
        monitor(sku);
        // console.log("added " + sku)
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********NETAPORTER-SKU-ERROR*********");
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
      embed.setTitle(`NETAPORTER Monitor`);
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