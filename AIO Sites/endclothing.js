const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const HTTPSProxyAgent = require('https-proxy-agent')
var request = require('request-promise');
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const HTMLParser = require('node-html-parser');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.END);
const elephent = new webhook.Webhook('https://discord.com/api/webhooks/1017575269449613434/SB4ZJ2kIMsrFHWBXV9I3atlGxq3DduipAUR0pN1VAUxdagwZwGkJV2kvF7pxk5FO1sOY');
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'endclothing';
const SITENAME = 'END'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
//et stats;
let totalData = 0;
startMonitoring();

async function startMonitoring() {
  //stats = await helper.manageStats(SITENAME)
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    PRODUCTS[row.sku] = {
      sku: row.sku,
      waittime: row.waittime,
      sizes: row.sizes,
    }
    monitor(row.sku);
    // break;
  }
  console.log('[END] Monitoring all SKUs!')
}


async function monitor(sku) {
  let proxy = helper.getRandomDDProxy()
  let productCache = PRODUCTS[sku]
  if (!productCache)
    return;
  //console.log("Requesting", Date.now())
  //stats.total++;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000)
  let agent = randomUseragent.getRandom()
  fetch(`https://www.endclothing.com/us/${sku}?abcz=${v4()}`, {
    'headers': {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status !== 200) {
      //stats.success++;
      monitor(sku);
      return
    }
    let body = await helper.getBodyAsText(response)
    body = await JSON.parse(body.split('<script id="__NEXT_DATA__" type="application/json">')[1].split('</script>')[0])
    if (body.props.initialProps.pageProps.product.in_stock === true) {
      let title = body.props.initialProps.pageProps.product.name
      let price = '$' + body.props.initialProps.pageProps.product.price
      let image = body.props.initialProps.pageProps.product.media_gallery_entries[0].file
      let url = `https://www.endclothing.com/us/${sku}`
      let sizes = []
      let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
      let oldSizeList = query.rows[0].sizes
      let inStock = false
      let sizeList = []
      let variants = body.props.initialProps.pageProps.product.options[0].values
      let count = 0
      for (let variant of variants) {
        if(variant.in_stock !== true)
        continue
        sizes += `[${variant.label}](https://www.endclothing.com/us/${sku}?size=${variant.label.replace(' ','')})\n`
        count++
        sizeList.push(variant.label);
        if (!oldSizeList.includes(variant.label))
          inStock = true;
      }
      let sizeright = sizes.split('\n')
      let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
      let pid = body.props.initialProps.pageProps.product.sku
      if (inStock) {
        postRestockWebhook(url, title, pid, price, image, sizeright, sizeleft, count)
        postElephent(url, title, pid, price, image, sizeright, sizeleft, count)

        inStock = false;
        await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
      }
    }
    // console.log(Date.now() - time)
    await helper.sleep(productCache.waittime);
    monitor(sku);
  }).catch(async err => {
    if (err.type === 'aborted') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitor(sku);
      return;
    }
    if (err.type === 'request') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitor(sku);
      return;
    }
    console.log("***********HIBBETT-ERROR***********");
    console.log("SKU: " + sku);
    console.log("Proxy: " + proxy);
    console.log(err);
    monitor(sku)
  });
}

async function postElephent(url, title, pid, price, image, sizeright, sizeleft, count) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Elephent AIO")
    .setColor("#cd8fff")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.endclothing.com', '', 'https://www.endclothing.com')
    .addField("**Stock**", count + '+', true)
    .addField("**Price**", price, true)
    .addField("**Sku**", pid, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg")
    .setFooter("End by Tachyon | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg')
    await elephent.send(webhookMessage);
}

async function postRestockWebhook(url, title, pid, price, image, sizeright, sizeleft, count) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.endclothing.com', '', 'https://www.endclothing.com')
    .addField("**Stock**", count + '+', true)
    .addField("**Price**", price, true)
    .addField("**Sku**", pid, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setFooter("End by Tachyon | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
        console.log("*********HIBBETT-SKU-ERROR*********");
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
      embed.setTitle(`HIBBETT Monitor`);
      embed.setColor('#6cb3e3')
      if (query.rows.length > 0) {
        let SKUList = [];
        for (let row of query.rows) {
          SKUList.push(`${row.sku}`);
        }
        embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
      }
      else {
        embed.setDescription("Not Monitoring any SKU!")
      }
      msg.reply(embed);
    }
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorTimes')) {
    if (msg.channel.id === CHANNEL) {
      const embed = new Discord.MessageEmbed();
      embed.setTitle(`Hibbett Monitor Times`);
      embed.setColor('#6cb3e3')
      const embed2 = new Discord.MessageEmbed();
      embed2.setTitle(`Hibbett Monitor Times`);
      embed2.setColor('#6cb3e3')
      if (Object.keys(PRODUCTS).length > 0) {
        let SKUList1 = [];
        let SKUList2 = [];
        let i = 0;
        for (let sku of Object.keys(PRODUCTS)) {
          if (i < Object.keys(PRODUCTS).length / 2)
            SKUList1.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
          else
            SKUList2.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
          i++;
        }
        embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
        embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
      }
      else {
        embed.setDescription("Not Monitoring any SKU!")
      }
      msg.reply(embed);
      msg.reply(embed2);
    }
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorStatuses')) {
    if (msg.channel.id === CHANNEL) {
      const embed = new Discord.MessageEmbed();
      embed.setTitle(`Hibbett Monitor Statuses`);
      embed.setColor('#6cb3e3')
      const embed2 = new Discord.MessageEmbed();
      embed2.setTitle(`Hibbett Monitor Statuses`);
      embed2.setColor('#6cb3e3')
      if (Object.keys(PRODUCTS).length > 0) {
        let SKUList1 = [];
        let SKUList2 = [];
        let i = 0;
        for (let sku of Object.keys(PRODUCTS)) {
          if (i < Object.keys(PRODUCTS).length / 2)
            SKUList1.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
          else
            SKUList2.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
          i++;
        }
        embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
        embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
      }
      else {
        embed.setDescription("Not Monitoring any SKU!")
      }
      msg.reply(embed);
      msg.reply(embed2);
    }
  }

});

module.exports = {
  totalData: function () {
    return totalData;
  }
}