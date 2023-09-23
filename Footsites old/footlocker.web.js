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

const DATABASE_TABLE = 'footlocker';

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
}

async function monitor(sku) {
  let url = `https://www.footlocker.com/product/tachyon/${sku}.html`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if(query.rows.length === 0)
    return;
    
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(url).then(async response => {
    const dom = new JSDOM(await response.text());

    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let size of dom.window.document.querySelectorAll('.c-form-field.c-form-field--radio.ProductSize:not(.c-form-field--disabled)')) {
      sizes += size.textContent + '\n';
      sizeList.push(size.textContent);
      if (!oldSizeList.includes(size.textContent))
        inStock = true;
    }
    // Checks if its in timer
    if(dom.window.document.querySelectorAll('p[class="PreLaunch-header"]').length > 0)
      inStock = false;
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock) {
      let title = dom.window.document.querySelector('title').textContent;
      let price = dom.window.document.querySelector('.ProductPrice').textContent;
      let image = `https://images.footlocker.com/is/image/EBFL2/${sku}?wid=400&hei=400&fmt=png-alpha`;
      //let image = dom.window.document.querySelector('span[class="Image Image--product Image--square"] img[src]').src;
      // console.log('Restock');
      postRestockWebhook(url, title, sku, sizes, price, image);
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    console.log("Erorr occured!");
    console.log(err);
  });
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  if(sizes.length > 1024)
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
    .setAuthor('https://www.footlocker.com/', '', 'https://www.footlocker.com/')
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
