const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller')

const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SLAMJAM);
const slaphook = new webhook.Webhook('https://discord.com/api/webhooks/890307262437023785/gN3pvyoGwx8dgqIBjF5rqh65BO8EKoS77W7qkO65qb_UR67VK_3qBjAGe4S75tFqHGWC');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912565346597232691/c4TDZw4Xsc1zSN15puUdtKQmCmJEhWCugBFmVgjVpM7CvwDW4tqSTcKcO3J5nOnwV7ei');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'slamjam';
const SITENAME = 'SLAMJAM'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let PRODUCTS = {}
let totalData = 0;

startMonitoring();
async function startMonitoring() {

  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[SLAMJAM] Started monitoring all SKUs!")
}

async function monitor(sku) {

  let url = `https://www.slamjam.com/en_US/tachyon/${sku}.html`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;
  let proxy = helper.getMixedRotatingProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www-slamjam-com.translate.goog/products/${sku}.html?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en-US&_x_tr_pto=nui`, {
    "headers": {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
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
    let root = HTMLParser.parse(body);
    if (root.querySelector('.product-name')) {
      let title = root.querySelector('.d-sm-none.product-detail__mobile-head .t-up').textContent.trim() + ' ' + root.querySelector('.product-name').textContent.trim()
      let price = root.querySelector('.sales .value').textContent.trim().replace('&euro; ', '€')
      let image = 'https://imageresize.24i.com/?w=300&url=' + root.querySelector('.slider-data-large div').attributes['data-image-url'] + '&w=100&bg=white'
      let sizes = '';
      let sizeList = [];
      let oldSizeList = JSON.parse(query.rows[0].sizes);
      let inStock = false;
      let sizesparse = root.querySelectorAll('#select-prenotation option')
      for (let size of sizesparse) {
        if (size.textContent.trim() !== 'Select Size') {
          if (!size.outerHTML.includes('disabled')) {
            sizes += `[${size.textContent.trim()}](${url}?size=${size.attributes['data-attr-value']}) - ${size.attributes['data-attr-value']}` + '\n';
            sizeList.push(size.textContent.trim());
            if (!oldSizeList.includes(size.textContent.trim()))
              inStock = true;
          }
        }
      }
      let sizeright = sizes.split('\n')
      let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
      await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
      if (inStock)
        postRestockWebhook(url, title, sku, sizeright, sizeleft, price, image);
      if (query.rows.length > 0) {
        setTimeout(function () {
          monitor(sku);
        }, query.rows[0].waittime);
      }
    }
  }).catch(err => {
    console.log("Erorr occured!");
    console.log(err);
    monitor(sku)
  });
}

async function postRestockWebhook(url, title, sku, sizeright, sizeleft, price, image) {
  let burst = `[Burst](http://localhost:4000/qt?st=sjs&p=${sku}) . `
  let cyber = `[Cyber](https://cybersole.io/dashboard/tasks?quicktask=Slamjam:${sku}) . `
  let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=${sku}&store=SlamJam)\n`
  let fleek = `[Fleek](http://127.0.0.1:5000/qt?sku=https://www.slamjam.com/en_IT/${sku}.html&size=RANDOM&site=SlamJam) . `
  let orbit = `[Orbit](http://localhost:5080/quicktask?site=SlamJam&method=pid&input=${sku}) . `
  let phasma = `[Phasma](http://127.0.0.1:2001/qt?url=https://www.slamjam.com/en_IT/${sku}.html)`
  let rt = `[RT](https://www.slamjam.com/en_IT/${sku}.html) . `
  let ru = `[RU](https://www.slamjam.com/en_RU/${sku}.html) . `
  let gb = `[GB](https://www.slamjam.com/en_GB/${sku}.html) . `
  let us = `[US](https://www.slamjam.com/en_US/${sku}.html) . `
  let de = `[DE](https://www.slamjam.com/en_DE/${sku}.html)\n`
  let es = `[ES](https://www.slamjam.com/en_ES/${sku}.html) . `
  let fr = `[FR](https://www.slamjam.com/en_FR/${sku}.html) . `
  let cz = `[CZ](https://www.slamjam.com/en_CZ/${sku}.html) . `
  let nl = `[NL](https://www.slamjam.com/en_NL/${sku}.html)`
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.slamjam.com', '', 'https://www.slamjam.com')
    .addField("**Restock**", "1+", true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    .addField("QT", burst + cyber + flare + fleek + orbit + phasma, true)
    .addField("Links", rt + ru + gb + us + de + es + fr + cz + nl, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("SlamJam US | v2.1 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await discordWebhook.send(webhookMessage);
  await spacehook.send(webhookMessage);
  await slaphook.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
    return;
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
              console.log("*********AMAZON-CA-SKU-ERROR*********");
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
          embed.setTitle(`AMAZON-CA Monitor`);
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