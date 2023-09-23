const fs = require('fs');
const got = require('got');
const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('hpagent');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SOLEBOX);
const helper = require('../helper');

const DATABASE_TABLE = 'solebox';

const PROXIES = [
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.182.4:8175',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.187.58:8236',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.177.218:7773',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.189.123:7705',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.182.245:8427',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.186.73:6511',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.184.219:8113',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.179.101:6514',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.178.54:6601',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.189.141:5435',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.179.15:8823',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.182.67:8304',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.184.235:5258',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.182.87:8912',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.180.67:8552',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.180.231:8416',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.188.100:5933',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.184.131:6274',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.187.4:6509',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.179.108:7373',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.177.41:8680',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.188.72:5792',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.188.18:7368',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.177.181:8260',
  'http://h8upoTGfZF:LFeLC8VbSE@45.43.191.72:5220',
]
let request = 1;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[SOLEBOX] Started Monitoring all SKUs!")
}

async function monitor(sku) {
  let prefix = helper.getRandomSKUPrefix().trim();
  let url = `https://www.solebox.com/de_DE/p/${prefix}-${sku}.html`;
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);

  const proxy = helper.getRandomProxy()//PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];
  request++;
  got(url, {
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: proxy
      })
    }
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await response.body;
    // console.log("[SOLEBOX] Monitoring - " + proxy)
    // fs.writeFileSync('res.html', body)
    const dom = new JSDOM(body);

    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let size of dom.window.document.querySelectorAll('div.b-swatch-value-wrapper .b-swatch-value--orderable')) {
      // console.log(size.textContent.trim())
      sizes += size.textContent.trim() + '\n';
      sizeList.push(size.textContent.trim());
      if (!oldSizeList.includes(size.textContent.trim()))
        inStock = true;
    }
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock) {
      let title = (dom.window.document.querySelector('title').textContent);
      title = title.substring(0, title.indexOf(" |"));
      let price = (dom.window.document.querySelector('.b-product-tile-price-item').textContent).trim();
      // let image = query.rows[0].image;
      //let image = dom.window.document.querySelector('span[class="Image Image--product Image--square"] img[src]').src;
      let image = await dom.window.document.querySelector('meta[name="og:image"]').content
      // console.log('Solebox Restock ' + sku);
      postRestockWebhook(url, sku, title, sizes, price, image);
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    if (err.toString().includes('410') || err.toString().includes('404'))
      return;
    if(err.toString().includes('403')) {
      console.log("403 (Solebox-" + request + ") - " + sku + " - " + proxy);
      monitor(sku);
      return;
    }
    if(err.toString().includes('503')) {
      console.log("503 (Solebox-" + request + ") - " + url + " - " + proxy);
      monitor(sku);
      return;
    }
    console.log("Erorr occured! (SoleBox-" + request + ") - " + sku);
    console.log(err);
  });
}

async function postRestockWebhook(url, sku, title, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.solebox.com', '', 'https://www.solebox.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sizes**", sizes)
    .addField("**SKU**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("SoleBox | 1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    if (msg.channel.id === discordBot.channels.SOLEBOX) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("SoleBox Monitor");
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
