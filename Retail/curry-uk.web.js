const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.CURRYUK);
const helper = require('../helper');
const { Console } = require('console');
const DATABASE_TABLE = 'curryuk';
startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
}
async function monitor(sku) {
  let url = `https://www.currys.co.uk/gbuk/tachyon-10216298-pdt.html`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;


  got(url).then(async response => {
    const dom = new JSDOM(response.body);
    status = query.rows[0].status
    if (dom.window.document.querySelector('.space-b.center')) {
      let titles = dom.window.document.querySelector('.page-title.nosp').textContent.slice(1);
      let prices = dom.window.document.querySelector('.amounts').textContent;
      let image = dom.window.document.querySelector('.product-image').src;
      let titlez = titles.replace(/\s+/g, ' ').trim()
      let pricez = prices.replace(/\s+/g, ' ').trim()
      let title = titlez.split(" ").join(" ")
      let price = pricez.split(" ").join(",")
      if (status !== "In-Stock") {
        postRestockWebhook(url, title, sku, price, image);
        console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
        await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
      }
    }else{
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
  });
}


async function postRestockWebhook(url, title, sku, price, image) {
  let ATC = `https://www.currys.co.uk/gbuk/computing/tachyon-${sku}-pdt.html`
  let cart = 'https://www.currys.co.uk/app/basket'
  let checkout = 'https://www.currys.co.uk/app/checkout'
  let login = 'https://www.currys.co.uk/gbuk/s/authentication.html'
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#121a2d")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.currys.co.uk', '', 'https://www.currys.co.uk')
    .addField("**In Stock**", 'True', true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
    .setTime()
    .setFooter("CA Computers | v1.0", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
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
    if (msg.channel.id === discordBot.channels.CURRYUK) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Lady Footlocker Monitor");
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