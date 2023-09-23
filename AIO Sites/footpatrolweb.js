const fs = require('fs');
const got = require('got');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTPATROL);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const DATABASE_TABLE = 'footpatrol';
let totalData = 0;
let request = 1;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[FOOTPATROL] Started monitoring all SKUs!")
}

async function monitor(sku) {
  let url = `https://www.footpatrol.com/product/tachyon-monitors/${sku}_footpatrolcom/`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  let proxy = helper.getRandomProxy();
  request++;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(url, {
    'headers': {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal
  }).then(async response => {
    clearTimeout(timeoutId)
    let input = await response.text();
    totalData += ((input.length * 1) / 1000000);
    let pattern = /var dataObject = {(.|\n)*variants: \[(.|\n)*]\n};/;

    let text = pattern.exec(input);
    if (!text || text.length === 0) {
      console.log("[FOOTPATROL] Failed to match, SKU: " + sku + "; request = " + request);
      // console.log(text);
      monitor(sku);
      return;
    }

    eval(text[0]);
    // console.log(dataObject)

    var title = dataObject.description;
    var image = `https://i8.amplience.net/i/jpl/fp_${sku}_a?w=750&h=580`;
    var price = '£' + dataObject.unitPrice

    let sizes = '';
    let sizeList = [];
    let oldSizeList = []//JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let variant of dataObject.variants) {
      let size = variant.name.trim();
      sizes += size + '\n';
      sizeList.push(size)
      if (!oldSizeList.includes(size))
        inStock = true;
    }
    // Checks if its in timer
    // if (body.variantAttributes[0].displayCountDownTimer)
    //   inStock = false;
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock && query.rows[0].last !== JSON.stringify(sizeList)) {
      postRestockWebhook(url, title, sku, sizes, price, image);
      await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    console.log("Erorr occured!");
    console.log(err);
    setTimeout(function () {
      monitor(sku);
    }, 150);
  });
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.footpatrol.com', '', 'https://www.footpatrol.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**Sku**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Footpatrol | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
    monitor(sku);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.FOOTPATROL) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Footpatrol Monitor");
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