const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NORDSTROMCA);
const helper = require('../helper');
const got = require('got');
const { HttpsProxyAgent } = require('hpagent')
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'nordstromca';

const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/855935040646414357/SOPn3j4wrg_kNsRFugGZkNXynjFYEYUNhuP1BMK8BftbtvsPZafDKqPWkCPX00ZdcV29')
const WEBHOOKS = [
  'https://discord.com/api/webhooks/857085640273559614/Vg8T0UYOpnh3hgSmV5rxu4QO0Xe-1l6-VMMRPKIt9jeBRima8F8dp18eWtSRYpH6DOhD'
]

const HEADLIST = [
  "AdsBot-Google (+http://www.google.com/adsbot.html)",
  "Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
  "AdsBot-Google-Mobile-Apps",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 (compatible; Google-Read-Aloud;  +https://support.google.com/webmasters/answer/1061943)",
  "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)  Chrome/49.0.2623.75 Safari/537.36 Google Favicon",
  "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19"
];

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
];
let totalData = 0;

startMonitoring();
// monitor('5445302');

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    // await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[NORDSTROM-CA] Started monitoring all SKUs!")
}

async function monitor(SKU) {
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${SKU}'`);
  if (query.rows.length === 0)
    return;

  let URL = "https://www.nordstrom.ca/api/style/" + SKU;
  let PROXY = helper.getRandomProxy();//PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];
  const proxyAgent = new HTTPSProxyAgent(PROXY);

  let METHOD = "GET";
  let HEADERS = {};

  HEADERS.Host = 'www.nordstrom.ca';
  HEADERS.accept = 'application/vnd.nord.pdp.v1+json';
  HEADERS['user-agent'] = HEADLIST[Math.floor(Math.random() * (0 - HEADLIST.length)) + HEADLIST.length];
  // console.log(HEADERS['user-agent']);
  HEADERS['accept-language'] = 'en-US';

  let req = {
    // 'url': URL,//'https://www.google.com',
    agent: {
      https: new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: PROXY
      })
    },
    //'jar': JAR,
    'method': METHOD,
    'headers': HEADERS,
    followRedirect: false,
    methodRewriting: false,
    'timeout': 3000,
    retry: 0
  }
  let time = Date.now();
  try {
    console.log(SKU)
    got(URL, req).then(async response => {
      // console.error('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response.status); // Print the response status code if a response was received
      //console.log('body:', body); // Print the HTML for the Google homepage.
      if (response.statusCode === 302) {
        console.log("[NORDSTROM-CA] Redirect: " + response.headers['location'] + "  - " + SKU + " - " + PROXY)
        setTimeout(function () {
          monitor(SKU);
        }, 300);
        return;
      }
      let body = await response.body;
      totalData += ((body.length * 1) / 1000000);
      try {
        body = JSON.parse(body);
      } catch (err) {
        if (body.includes('561 Proxy Unreachable')) {
          console.log('[NORDSTROM-CA] Proxy Fucking Unreachable - ' + SKU + ' - ' + proxy);
          monitor(SKU);
          return;
        }
        if (body.toLowerCase().includes('many requests')) {
          console.log('[NORDSTROM-CA] 429, SKU: ' + SKU);
          monitor(SKU);
          return;
        }
        if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
          console.log('[NORDSTROM-CA] Unauthenticated Proxy: ' + PROXY);
          monitor(SKU);
          return;
        }
        console.log("********************NORDSTROM-ERROR********************")
        console.log("SKU: " + SKU);
        console.log("Proxy: " + PROXY);
        console.log(err);
        console.log(body)
        monitor(SKU);
        return;
      }
      if (JSON.stringify(body).includes('noticed\x20some\x20unusual\x20activity')) {
        console.log("NORDSTROM: Detected!")
        console.log("UA: " + HEADERS['user-agent']);
        console.log("Proxy: " + PROXY);
        setTimeout(function () {
          monitor(SKU);
        }, helper.getRandomNumber(3000, 5000));
        return;
      }
      if (JSON.stringify(body).includes('data:font/woff;base64,d09GRgABAAAAALJCABIAAAABjHAAAQACAACw')) {
        console.log("NORDSTROM: Page Incomplete, Retrying!")
        console.log("UA: " + HEADERS['user-agent']);
        console.log("Proxy: " + PROXY);
        setTimeout(function () {
          monitor(SKU);
        }, helper.getRandomNumber(500, 1500));
        return;
      }
      time = Date.now() - time;
      // fs.appendFileSync(__dirname + '/nordstats.txt', time + " - " + PROXY +  '\n');

      if (!body.price) {
        //Out of stock or invalid sku
        if (query.rows.length > 0) {
          setTimeout(function () {
            monitor(SKU);
          }, query.rows[0].waittime);
        }
        return;
      }

      let url = `https://www.nordstrom.ca/s/Tachyon-Monitors/${SKU}`;
      let price = body.price.style.priceString + ' CAD';
      let title = body.productTitle;
      let image = body.styleMedia.byId[body.styleMedia.allIds[0] + ''].imageMediaUri.largeDesktop;
      let productSkus = body.skus.allIds;
      let sizes = '';
      let sizeList = [];
      let oldSizeList = JSON.parse(query.rows[0].sizes);
      // let inStock = body.skus.allIds.length > 0;
      let inStock = false;
      for (let sku of productSkus) {
        let size = body.skus.byId[sku].sizeId + ` (${body.skus.byId[sku].totalQuantityAvailable}+)`;
        if (sizeList.includes(size.trim()))
          continue;
        sizes += size.trim() + '\n';
        sizeList.push(size.trim());
        if (!oldSizeList.includes(size.trim()))
          inStock = true;
      }
      await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${SKU}'`);
      if (inStock) {
        // console.log('Restock NORDSTROM');
        postRestockWebhook(url, title, SKU, sizes, price, image);
      }
      if (query.rows.length > 0) {
        setTimeout(function () {
          monitor(SKU);
        }, query.rows[0].waittime);
      }

    }).catch(err => {
      if (err.response && err.response.statusCode === 407) {
        console.log(`[NORDSTROM-US] BAD REQUEST - ${SKU} - ${PROXY}`)
        setTimeout(function () {
          monitor(SKU);
        }, 150);
        return;
      }
      if (err.code === 'ECONNRESET') {
        console.log(`[NORDSTROM-CA] ECONNRESET - ${SKU} - ${PROXY}`)
        setTimeout(function () {
          monitor(SKU);
        }, 150);
        return;
      }
      console.log("****************NORDSTROM-ERROR****************");
      console.log(PROXY);
      console.log(SKU);
      console.log(err);
      setTimeout(function () {
        monitor(SKU);
      }, 150);
    })
  } catch (err) {
    console.log("** NORDSTROM ERROR **");
    console.log(PROXY);
    console.log(SKU);
    console.log(err);
    setTimeout(function () {
      monitor(SKU);
    }, 150);
  }
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.nordstrom.ca', '', 'https://www.nordstrom.ca')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Sizes**", sizes)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Nordstrom | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  postMIKERestockWebhook(url, title, sku, sizes, price, image)
  for (let w of WEBHOOKS) {
    let ww = new webhook.Webhook(w);
    ww.send(webhookMessage);
  }
}

async function postMIKERestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Forbidden Monitors")
    .setColor("#DA4453")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.nordstrom.ca/', '', 'https://www.nordstrom.ca/')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Sizes**", sizes)
    .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
    .setTime()
    .setFooter("Nordstrom-CA | v1.0 by Tachyon", 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
  mikeWebhook.send(webhookMessage);
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
      discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <sku> <waitTime>");
      return;
    }
    let SKU = args[1];
    let waitTime = args[2];
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${SKU}'`);
    if (query.rows.length > 0) {
      await database.query(`delete from ${DATABASE_TABLE}  where sku='${SKU}'`);
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring Item '${SKU}'!`);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${SKU}', '[]', ${waitTime})`);
    monitor(SKU);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring Item '${SKU}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.NORDSTROMCA) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Nordstrom-CA Monitor");
      embed.setColor('#6cb3e3')
      if (query.rows.length > 0) {
        let SKUList = [];
        let count = 0;
        for (let row of query.rows) {
          SKUList.push(`${row.sku} - ${row.waittime}ms`);
          count++;
        }
        embed.addField(`**Monitored Items (${count})**`, SKUList)
      }
      else {
        embed.setDescription("Not Monitoring any Item!")
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