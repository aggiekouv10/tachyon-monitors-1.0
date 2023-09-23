const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTLOCKERAT)
const helper = require('../helper');

const DATABASE_TABLE = 'footlockerat';//Add to database

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
}

async function monitor(sku) {
  let url = `https://www.footlocker.at/de/product/tachyon/${sku}.html`;
  let pdpURL = `https://www.footlocker.at/api/products/pdp/${sku}`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, { 'headers': { 'accept': 'application/json' } }).then(async response => {
        clearTimeout(timeoutId)
    const body = await response.json();
    let code = body.variantAttributes[0].code;

    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let unit of body.sellableUnits) {
      if (unit.attributes[1].id !== code)
        continue;
      if (unit.stockLevelStatus !== "inStock")
        continue;
      let size = unit.attributes[0].value;
      sizes += size + '\n';
      sizeList.push(size);
      if (!oldSizeList.includes(size))
        inStock = true;
    }
    // Checks if its in timer
    if (body.variantAttributes[0].displayCountDownTimer)
      inStock = false;
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock) {
      let title = body.name;
      let price = body.variantAttributes[0].price.formattedValue ? body.variantAttributes[0].price.formattedValue : body.variantAttributes[0].price.formattedOriginalPrice;
      let image = `https://images.footlocker.com/is/image/FLEU/${sku}_01?wid=630&hei=630&fmt=png-alpha`;
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
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Space Notify")
    .setColor("#121a2d")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.footlocker.at/', '', 'https://www.footlocker.at/')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**Sku**", sku, true)
    .addField("**Links**", 'NA')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
    .setTime()
    .setFooter("Footlocker AT | v1.0 |", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
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
    if (msg.channel.id === discordBot.channels.FOOTLOCKERAT) {
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
