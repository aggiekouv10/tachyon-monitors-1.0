const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.OFFSPRING);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'offspring';
let totalData = 0;
let request = 0;

startMonitoring();
async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[OFFSPRING] Started monitoring all SKUs!")
}

async function monitor(sku) {
  let url = `https://www.offspring.co.uk/view/product/offspring_catalog/5,22/${sku}`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;
  request++;
  let proxy = helper.getRandomProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.offspring.co.uk/view/product/offspring_catalog/5,22/${sku}?abcz=${v4()}`, {
    "headers": {
      'User-Agent': randomUseragent.getRandom(),
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
    if (body.includes('Something went wrong')) {
      monitor(sku)
      return
    }
    let title = root.querySelector('.product__brand-link').textContent.trim() + ' ' + root.querySelector('.product__name').textContent.trim() + ' ' + root.querySelector('.product__variant').textContent.trim()
    let price = root.querySelector('.price__price.js-price').textContent.trim().replace('&euro; ', '€')
    let id = root.querySelector('#productCodeId').attributes.value
    let image = `https://i1.adis.ws/i/office/${id}_sd1.jpg`
    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    let sizesparse = root.querySelectorAll('.tabs__panel.tabs__panel--active .product__sizes-option')
    for (let size of sizesparse) {
      sizes += `[${size.querySelector('.product__sizes-size-1').textContent}](https://www.offspring.co.uk/view/product/offspring_catalog/5,22/${sku}?size=${size.querySelector('.product__sizes-size-1').textContent})\n`;
      sizeList.push(size.querySelector('.product__sizes-size-1').textContent);
      if (!oldSizeList.includes(size.querySelector('.product__sizes-size-1').textContent))
        inStock = true;
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
  }).catch(err => {
    //console.log("Erorr occured!");
    //console.log(err);
    monitor(sku)
  });
}

async function postRestockWebhook(url, title, sku, sizeright, sizeleft, price, image) {
  let burst = `[Burst](http://localhost:4000/qt?st=os&p=https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku}) . `
  let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku}) . `
  let tks = `[TKS](https://thekickstationapi.com/quick-task.php?link=https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku})\n`
  let prism = `[Prism](https://prismaio.com/dashboard?url=https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku}) . `
  let ganesh = `[Ganesh](https://ganeshbot.com/api/quicktask?STORE=OFFSPRING&PRODUCT=https://www.offspring.co.uk/view/product/offspring_catalog/2,20/${sku}&SIZE=ANY)`
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.offspring.co.uk', '', 'https://www.offspring.co.uk')
    .addField("**Restock**", "1+", true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    .addField("QT", burst + flare + tks + prism + ganesh, true)
    //.addField("Links", rt + ru + gb + us + de + es + fr + cz + nl, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Offspring | v3.1 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    if (msg.channel.id === discordBot.channels.OFFSPRING) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Offspring Monitor");
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