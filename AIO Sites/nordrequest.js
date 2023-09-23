const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NORDSTROM);
const helper = require('../helper');
const got = require('got');
const { HttpsProxyAgent } = require('hpagent')
const HTTPSProxyAgent = require('https-proxy-agent');
const { default: axios } = require('axios');
const DATABASE_TABLE = 'nordstrom';
const HTMLParser = require('node-html-parser');
const { v4 } = require('uuid');


const WEBHOOKS = [
  // 'https://discord.com/api/webhooks/831517697144520737/8jig4lBgOepNO8dlzSATEQ747J1KARpBEF_QxE26BoIbv_2CbR0VUKpJ-DjblgvTCoEP', Felix
  'https://discord.com/api/webhooks/831561147030175765/4WiYd5qhC-nS9oAmhzozquyJpLE_65dyYKwC2nQRzQf4XxzFRc5FfjsFUXxx8uhqubcu',
  'https://discord.com/api/webhooks/834169799990837258/DIi9BSDhjerP_hR7zx1d-MbWFONYTwAVro7lOfuMmBxtKyK-nNluyOsdoq3urxCcc2EY',
  'https://discord.com/api/webhooks/851282889122250772/4hTkvXU5jS5znJmfC7bB_bdz37Ous3IUEQpFm5dOYz5WRHVfJuWF0leop5huGVjenpTj',
  'https://discord.com/api/webhooks/856536651751882753/0Rq0Z-udiZMBHofNCI8uJd8wyWkLo0rSXPjaGjaMQu5J0fvHqx3c5hre1SHeaTpbzTMf'
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

let PRODUCTS = {}
let totalData = 0;

startMonitoring();
let PRODUCTS2 = [];
let justStarted = true;
const WAIT_TIME = 500;
function removeProduct(name) {
  let newProducts = [];
  console.log("Removing " + name)
  for (let product of PRODUCTS2) {
    if (product !== name)
      newProducts.push(product);
  }
  PRODUCTS2 = newProducts;
}

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    // await helper.sleep(helper.getRandomNumber(150, 300));
    PRODUCTS[row.sku] = {
      sizes: row.sizes,
      waittime: row.waittime
    }
    //monitor(row.sku);
    monitorrleases()
  }
  console.log("[NORDSTROM] Started monitoring all SKUs!")
}

async function monitor(SKU) {
  let pData = PRODUCTS[SKU];
  if (!pData) {
    console.log("Removed " + SKU);
    return;
  }

  let URL = "https://www.nordstrom.com/api/style/" + SKU;
  let PROXY = helper.getRandomProxy();//PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];
  const proxyAgent = new HTTPSProxyAgent(PROXY);

  let METHOD = "GET";
  let HEADERS = {};

  HEADERS.Host = 'www.nordstrom.com';
  HEADERS.accept = 'application/vnd.nord.pdp.v1+json';
  HEADERS['user-agent'] = HEADLIST[Math.floor(Math.random() * (0 - HEADLIST.length)) + HEADLIST.length];
  // console.log(HEADERS['user-agent']);
  HEADERS['accept-language'] = 'en-US';

  let req = {
    // 'url': URL,//'https://www.google.com',
    httpsAgent: new HTTPSProxyAgent(PROXY),
    //'jar': JAR,
    'method': METHOD,
    'headers': HEADERS,
    // followRedirect: false,
    // methodRewriting: false,
    maxRedirects: 0,
    'timeout': 3000,
    retry: 0
  }
  let time = Date.now();
  try {
    axios(URL, req).then(async response => {
      // console.error('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response.status); // Print the response status code if a response was received
      //console.log('body:', body); // Print the HTML for the Google homepage.
      if (response.status === 302) {
        console.log("[NORDSTROM-US] Redirect: " + response.headers['location'] + "  - " + SKU + " - " + PROXY)
        setTimeout(function () {
          monitor(SKU);
        }, 300);
        return;
      }
      let body = await response.data;
      // totalData += ((body.length * 1) / 1000000);
      try {
        body = JSON.parse(JSON.stringify(body));
      } catch (err) {
        if (body.includes('561 Proxy Unreachable')) {
          console.log('[NORDSTROM] Proxy Fucking Unreachable - ' + SKU + ' - ' + proxy);
          monitor(SKU);
          return;
        }
        if (body.toLowerCase().includes('many requests')) {
          console.log('[NORDSTROM] 429, SKU: ' + SKU);
          monitor(SKU);
          return;
        }
        if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
          console.log('[NORDSTROM] Unauthenticated Proxy: ' + PROXY);
          monitor(SKU);
          return;
        }
        console.log("********************NORDSTROM-ERROR********************")
        console.log("SKU: " + SKU);
        console.log("Proxy: " + PROXY);
        console.log(err);
        console.log(body)
        console.log(response.headers)
        console.log(response.statusCode)
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
        await helper.sleep(pData.waittime);
        monitor(SKU);
        return;
      }

      let url = `https://www.nordstrom.com/s/Tachyon-Monitors/${SKU}`;
      let price = '$' + body.price.style.priceString;
      let title = body.productTitle;
      let image = body.styleMedia.byId[body.styleMedia.allIds[0] + ''].imageMediaUri.largeDesktop;
      let productSkus = body.skus.allIds;
      let sizes = '';
      let sizeList = [];
      let oldSizeList = JSON.parse(pData.sizes);
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
      PRODUCTS[SKU].sizes = JSON.stringify(sizeList)
      database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${SKU}'`);
      if (inStock) {
        // console.log('Restock NORDSTROM');
        postRestockWebhook(url, title, SKU, sizes, price, image);
      }

      await helper.sleep(pData.waittime);
      monitor(SKU);

    }).catch(async err => {
      if (err.response && err.response.status === 407) {
        console.log(`[NORDSTROM-US] BAD REQUEST - ${SKU} - ${PROXY}`)
        await helper.sleep(150);
        monitor(SKU);
        return;
      }
      if (err.code === 'ETIMEDOUT') {
        console.log(`[NORDSTROM-US] ETIMEDOUT - ${SKU} - ${PROXY}`)
        await helper.sleep(150);
        monitor(SKU);
        return;
      }
      if (err.code === 'ECONNRESET') {
        console.log(`[NORDSTROM-US] ECONNRESET - ${SKU} - ${PROXY}`)
        await helper.sleep(150);
        monitor(SKU);
        return;
      }
      console.log("****************NORDSTROM-ERROR****************");
      console.log(PROXY);
      console.log(SKU);
      console.log(err);
      await helper.sleep(150);
      monitor(SKU);
    })
  } catch (err) {
    console.log("** NORDSTROM ERROR **");
    console.log(PROXY);
    console.log(SKU);
    console.log(err);
    await helper.sleep(150);
    monitor(SKU);
  }
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**SKU**", sku, true)
    .addField("**Sizes**", sizes)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Nordstrom | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
  for (let w of WEBHOOKS) {
    let ww = new webhook.Webhook(w);
    ww.send(webhookMessage);
  }
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
      PRODUCTS[SKU] = null;
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring Item '${SKU}'!`);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${SKU}', '[]', ${waitTime})`);
    PRODUCTS[SKU] = {
      sizes: '[]',
      waittime: waitTime
    }
    monitor(SKU);
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring Item '${SKU}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.NORDSTROM) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Nordstrom Monitor");
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

async function monitorrleases() {
  axios(`https://www.nordstrom.com/browse/activewear?breadcrumb=Home%2FActivewear%2FActivewear%20New%20Arrivals&origin=topnav&sort=Newest&filterByProductType=shoes_boots&filterByProductType=shoes_sandals&filterByProductType=shoes_sneakers`, {
    'headers': {
      'Method': 'get',
      'user-agent': HEADLIST[Math.floor(Math.random() * (0 - HEADLIST.length)) + HEADLIST.length]
    },
  }).then(async response => {
    clearTimeout(timeoutId)
    let body = await response.data;
    let root = HTMLParser.parse(body);
    console.log(response.data)
    let products = root.querySelectorAll('._1AOd3.QIjwE');
    for (let product of products) {
      let name = product.querySelector('.xTitle.xByline b').textContent.replace('&#39;s', '').replace(' &amp;', '') + product.querySelector('.xTitle.xByline br').textContent.replace('&#39;s', '').replace(' &amp;', '')
      console.log(name)
      if (!PRODUCTS2.includes(name)) {
        PRODUCTS2.push(name)
        if (justStarted) {
          continue;
        }
        // console.log(PRODUCTS)
        if (product.querySelector('.xTitle.xByline a')) {

        } else {
          let url = 'https://www.nordstrom.com/browse/sneaker-releases'
          let date = product.querySelector('.xTitle.xHeading').textContent
          let image = product.querySelector('.xItemInner').attributes.style
          postReleasekWebhook(url, name, image, date)
        }
      }
    }

    if (justStarted)
      justStarted = false;
    await helper.sleep(WAIT_TIME);
    monitor();
  }).catch(error => {
    console.log(error)
    monitor();
    return
  });

}

async function postReleasekWebhook(url, name, image, date) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(name)
    .setURL(url)
    .setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
    .addField("**Sku**", date, true)
    .addField("**Links**", '[Checkout](' + url + ')')
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("Nordstrom Releases| v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  discordWebhook.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
  if (msg.channel.id !== CHANNEL)
    return;
  if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
    discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
    PRODUCTS2 = [];
    msg.reply("Resetted!")
    return;
  }
});