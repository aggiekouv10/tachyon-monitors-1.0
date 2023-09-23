const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYUS);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'bestbuyus_single';

let totalData = 0;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log('[BESTBUY-US] Monitoring all SKUs!')
}

async function monitor(sku) {
  let url = `https://www.bestbuy.com/site/tachyon/${sku}.p?skuId=${sku}`;
  let pdpURL = `https://api.bestbuy.com/v1/products/${sku}.xml?apiKey=08JJS1ffSirGzNn7hMjRcjBN`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;

  let PROXY = helper.getRandomProxy();

  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
    headers: {
      'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      'accept-encoding': "gzip, deflate, br",
      'accept-language': "en-US,en;q=0.9",
      'user-agent': "Mozilla/5.0 (Linux; Android 8.0.0; SM-G930V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36"
    },
    agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    totalData += ((body.length * 1) / 1000000);
    if (body.includes('561 Proxy Unreachable')) {
      console.log('[BESTBUY-US] Proxy Fucking Unreachable - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    if (body.includes('Are you a human?')) {
      console.log('[BESTBUY-US] DETECTED CAPTCHA - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    if (body.includes('It appears our systems have detected the possible use of an automated program')) {
      console.log('[BESTBUY-US] DETECTED AUTOMATION - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    if (body.toLowerCase().includes('many requests')) {
      console.log('[BESTBUY-US] 429, SKU: ' + sku);
      monitor(sku);
      return;
    }
    if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
      console.log('[BESTBUY-US] Unauthenticated Proxy: ' + PROXY);
      monitor(sku);
      return;
    }
    if (!body || body === undefined) {
      console.log('[BESTBUY-US] Null body - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    let status = query.rows[0].status
    try {
      body["split"];
    } catch (err) {
      console.log('[BESTBUY-US] Null body - ' + sku + ' - ' + PROXY);
      monitor(sku);
      return;
    }
    console.log(body["split"]("<onlineAvailability>"))
    if (body["split"]("<onlineAvailability>")[0x1]["split"]('<')[0x0] === "true") {
      let title = body["split"]("<name>")[0x1]["split"]('<')[0x0];
      let price = body["split"]("<salePrice>")[0x1]["split"]('<')[0x0];
      let image = body["split"]("<href>")[0x1]["split"]('<')[0x0];
      if (status !== "In-Stock") {
        console.log(url)
        console.log(title)
        console.log(price)
        console.log(image)
        console.log(sku)
        await postRestockWebhook(url, title, sku, price, image);
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
    console.log("********************BESTBUY-US-ERROR********************")
    console.log("SKU: " + sku);
    console.log("Proxy: " + PROXY);
    console.log(err);
    setTimeout(function () {
      monitor(sku);
    }, 150);
  });
}

async function postRestockWebhook(url, title, sku, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.bestbuy.com', '', 'https://www.bestbuy.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Sku**", sku, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("BestBuy-US | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
    if (msg.channel.id === discordBot.channels.BESTBUYUS) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Bestbuy-US Monitor");
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