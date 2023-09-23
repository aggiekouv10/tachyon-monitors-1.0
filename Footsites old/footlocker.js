const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTLOCKER);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const DATABASE_TABLE = 'footlocker';
let totalData = 0;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[FOOTLOCKER-US] Started monitoring all SKUs!")
}

async function monitor(sku) {
  let url = `https://www.footlocker.com/product/tachyon/${sku}.html`;
  let pdpURL = `https://www.footlocker.com/api/products/pdp/${sku}`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;
    let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    'headers': {
      'accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    totalData += ((body.length * 1) / 1000000);
    try {
      body = JSON.parse(body);
    } catch (err) {
      if(body.includes('561 Proxy Unreachable')) {
        console.log('[FOOTLOCKER] Proxy Fucking Unreachable - ' + sku + ' - ' + proxy);
        monitor(sku);
        return;
      }
      if(body.toLowerCase().includes('many requests') || response.status === 429) {
        console.log('[FOOTLOCKER] 429, SKU: ' + sku);
        setTimeout(function () {
          monitor(sku);
        }, helper.getRandomNumber(300, 700));
        return;
      }
      console.log("********************FOOTLOCKER-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log(err);
      console.log(body)
      console.log(response.status)
      monitor(sku);
      return;
    }
    if (!body.variantAttributes) {
      if (body.url && body.url.includes('geo.captcha')) {
        console.log("[FOOTLOCKER-US] DATADOME ANTI-BOT: " + proxy);
        monitor(sku);
        return;
      }
      if (query.rows.length > 0) {
        setTimeout(function () {
          monitor(sku);
        }, query.rows[0].waittime);
      }
      // console.log("[FOOTLOCKER-US] OOS/Invalid SKU: " + sku);
      // console.log(body);
      return;
    }
    let code = body.variantAttributes[0].code;

    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    let variant = "";
    for (let unit of body.sellableUnits) {
      if (unit.attributes[1].id !== code)
        continue;
      if (variant === "")
        variant = " - " + unit.attributes[1].value;
      if (unit.stockLevelStatus !== "inStock")
        continue;
      let size = unit.attributes[0].value;
      sizes += size + '\n';
      sizeList.push(size);
      if (!oldSizeList.includes(size))
        inStock = true;
    }
    // Checks if its in timer
    // if (body.variantAttributes[0].displayCountDownTimer)
    //   inStock = false;
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock && query.rows[0].last !== JSON.stringify(sizeList)) {
      let title = body.name + variant;
      let price = body.variantAttributes[0].price.formattedValue ? body.variantAttributes[0].price.formattedValue : body.variantAttributes[0].price.formattedOriginalPrice;
      let image = `https://images.footlocker.com/is/image/EBFL2/${sku}?wid=630&hei=630&fmt=png-alpha`;
      //let image = dom.window.document.querySelector('span[class="Image Image--product Image--square"] img[src]').src;
      // console.log('Restock');
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
  if (sizes.length > 1024)
    sizes = 'Too many';
  var phantom = 'https://api.ghostaio.com/quicktask/send?site=FootLockerUS&input=https://www.footlocker.com/product/~/' + sku + '.html'
  var tks = 'https://thekickstationapi.com/quick-task.php?link=https://www.footlocker.com/product/~/' + sku + '.html&autostart=true'
  var prism = 'https://prismaio.com/dashboard?url=https://www.footlocker.com/product/~/' + sku + '.html'
  var Polaris = 'http://localhost:9099/footsites?store=footlocker&sku=' + sku + '&platform=desktop'
  var cyber = 'https://cybersole.io/dashboard/tasks?quicktask=Footlocker:' + sku
  var EVE = 'http://remote.eve-backend.net/api/v2/quick_task?link=https://www.footlocker.com/&sku=' + sku
  var Ganesh = 'https://ganeshbot.com/api/quicktask?STORE=FOOTLOCKER%20US&PRODUCT=' + sku + '&SIZE=ANY'
  var Whatbot = 'https://whatbot.club/redirect-qt?qt=whatbot://https://www.footlocker.com/product/~/A4159800' + sku + '.html'
  var PD = 'https://api.destroyerbots.io/quicktask?url=https://www.footlocker.com/product/~/A4159800' + sku + '.html'
  var wrath = 'https://whatbot.club/redirect-qt?qt=whatbot://https://www.footlocker.com/product/~/' + sku + '.html'
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.footlocker.com', '', 'https://www.footlocker.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**Sku**", sku, true)
    .addField("**Links**", '[Phantom](' + phantom + ') | ' + '[Prism](' + prism + ') | ' + '[Polaris](' + Polaris + ') | ' + '[Cyber](' + cyber + ') | [EVE](' + EVE + ') | ' + '[Ganesh](' + Ganesh + ') | ' + '[Whatbot](' + Whatbot + ') | ' + '[PD](' + PD + ') | ' + '[Wrath](' + wrath + ') |')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Footlocker | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    if (msg.channel.id === discordBot.channels.FOOTLOCKER) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Footlocker Monitor");
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