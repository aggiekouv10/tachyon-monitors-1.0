const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.GAMENERDZ);
const helper = require('../helper');
const DATABASE_TABLE = 'gamenerdz';

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log('[US Mint] Monitoring all SKUs!')
}
async function monitor(sku) {
  let url = `https://www.gamenerdz.com/marvel-heroclix-fantastic-four-future-foundation-booster-brick-10`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.gamenerdz.com/remote/v1/product-attributes/${sku}`).then(async response => {
        if(response.status === 400) {
            //console.log('400')
            monitor(sku)
            return   
            }
            if(response.status === 403) {
            //console.log('403')
            monitor(sku)
            return   
            }
            if(response.status === 503) {
            //console.log('503')
            monitor(sku)
            return    
            }
            if(response.status === 204) {
            //console.log('204')
            monitor(sku)
            return
            }
    let body = await helper.getBodyAsText(response)
    body = JSON.parse(body);
    status = query.rows[0].status
    if (body.data.stock > 0) {
      let title = body.data.sku;
      let price = body.data.price.without_tax.formatted;
      let image = `https://cdn11.bigcommerce.com/s-ua4dd/images/stencil/1280x1280/products/43687/99871/WZK84780D__95856.1615599583.jpg?c=2`
      let stock = body.data.stock
      if (status !== "In-Stock") {
        postRestockWebhook(url, title, sku, price, image, stock);
        console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
        await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
    }
} else {
    if (status !== "Out-of-Stock") {
        console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
        await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
    }
}
if (query.rows.length > 0) {
    setTimeout(function () {
        monitor(sku);
    }, query.rows[0].waittime);
}
}).catch(err => {
console.log("Erorr occured!");
console.log(err);
monitor(sku)
});
}

async function postRestockWebhook(url, title, sku, price, image, stock) {
  let checkout = `https://www.gamenerdz.com/checkout`
  let cart = 'https://www.gamenerdz.com/cart.php'
  var webhookMessage = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.gamenerdz.com', '', 'https://www.gamenerdz.com')
  .addField("**Stock**", stock, true)
  .addField("**Price**", price, true)
  .addField("**Links**", '[Checkout](' + checkout + ') | [Cart](' + cart + ')')
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
  .setTime()
  .setFooter("US Mint | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
      await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
      monitor(sku);
      discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
      if (msg.channel.id === discordBot.channels.GAMENERDZ) {
          let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
          const embed = new Discord.MessageEmbed();
          embed.setTitle("Homedepot Monitor");
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