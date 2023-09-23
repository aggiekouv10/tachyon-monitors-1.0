const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYUS);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const got = require('got')

const DATABASE_TABLE = 'bestbuyus';
let totalData = 0;
const WAITTIME = 500;

let LISTS = [];
const SKU_LIST_LENGTH = 5;

startMonitoring();

async function startMonitoring() {
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    pushToList(row.sku);
  }
  for (let i = 0; i < LISTS.length; i++) {
    await helper.sleep(helper.getRandomNumber(700, 1500));
    monitor(i);
  }
  console.log("[BESTBUY-US] Started monitoring all SKUs!")
}

function pushToList(sku) {
  for (let i = 0; i < LISTS.length; i++) {
    if (LISTS[i] && LISTS[i].length < SKU_LIST_LENGTH) {
      LISTS[i].push(sku);
      // console.log("old push: " + sku)
      return true;
    }
  }
  // console.log("NEW LIST PUSHED " + sku)
  LISTS.push([sku]);
  return false;
}

function removeFromList(sku) {
  for (let i = 0; i < LISTS.length; i++) {
    if (!LISTS[i])
      continue;
    LISTS[i] = LISTS[i].filter(function (value, index, arr) {
      return value !== sku;
    });
    if (LISTS[i].length === 0) {
      // console.log(LISTS)
      LISTS[i] = null;//ISTS.splice(i+1, 1);
      // console.log(LISTS)
    }
  }
}


async function monitor(listIndex) {
  let skus = LISTS[listIndex];
  let queryListParam = ''
  // console.log(skus)
  if (!skus)
    return;
  let list = '';
  for (let sku of skus) {
    list += sku + ',';
    queryListParam += `'${sku}',`
  }
  queryListParam = queryListParam.substring(0, queryListParam.length - 1);
  list = list.substring(0, list.length - 1);
  let pdpURL = `https://www.bestbuy.com/api/3.0/priceBlocks?skus=${list},` + v4();
  // console.log(`SELECT * from ${DATABASE_TABLE} where sku in (${queryListParam})`)
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku in (${queryListParam})`);
  // console.log(query.rows[0])
  if (query.rows.length === 0)
    return;

  let proxy = helper.getRandomProxy();
  let time = Date.now();
  // console.log(pdpURL);

  // for (let i = 0; i < helper.getRandomNumber(2, 50); i++)
  //   pdpURL += "," + ['a', 'b', 'c', 'd', 'e'][helper.getRandomNumber(0, 5)];
  got(pdpURL, {
    'headers': {
      'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      // 'accept-encoding': "gzip, deflate, br",
      'accept-language': "en-US,en;q=0.9",
      'cache-control': 'no-cache',
      // 'cookie': '_abck=261D673871A363E40BB379EB43822469~-1~YAAQrIwsMY0iONB4AQAAeTHj0AXi64ljFBHNfjo6Lnpu1ITIFymRK1lUHyPiBK88enr2IH2AXeb9lY6QPr85VJXxg3JzQsKdP59IQoLwPUuX5KPzoO4GBETT1uvGmbVrb53zocF+ZNVb1z5tMk0F0KqZqzUJ1OFi5tTSrYzEeVB77cuiaj3dnSiGyDNP41MVPAk1hGOK8ycrFAdUnhZiSYgSYnNUhqE+GMkanu+0ct9h/MxvqlUYsTY8p3oFYnFySaSMBZbhYYKUO5z6KoUxDDfDcPs+LayZ/7zqlh2Am1eQxrCv0e2bJZ461pwlduHeXy5EpSpmJvBIKfCz5RP5Mkbz8EDcsKh7fineiVy4M66fi7I8Pk+PjtEGpOCyUU/gW1YhFduQcbdXa2MU6IeW3952yhg=~-1~-1~-1; bm_sz=72BFA4E3446A884C71AF1A61967DF504~YAAQrIwsMYwiONB4AQAAeDHj0AsB908UE+MZa1AJbdjunzaDmsB8xeomXs4i/tsRTJTg6sNWPZ8VtjiKwMG7Fb9MiGDtmUbxVO13dUpS69acV5H/LDlTIID6eKAG0i0ETRb7eSHvd4lZdAhLOkyvIT470LxgyilGgMgBC4GMMIH8KkI+7uSxLhJ6mytoU2VyT3Hi56tkcjiHTYMBLatj+eQ2+vyur1VCQSoLai6TIiz/Mb3kr0hd0jtDbIoG03HM3qzimZ4EfYb0gnjcp4YgZsbIKDXLFirzfW1Wmw==; bby_rdp=l; bby_cbc_lb=p-browse-e;',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': "document",
      'sec-fetch-mode': "navigate",
      'sec-fetch-site': "none",
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
  },
    httpsAgent: new HTTPSProxyAgent(proxy),
    
  }).then(async response => {
        clearTimeout(timeoutId)
    // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
    // console.log("YAY")
    let body = await response.body;
    totalData += ((body.length * 1) / 1000000);
    try {
      body = JSON.parse(body);
    } catch (err) {
      if (body.includes('561 Proxy Unreachable')) {
        console.log('[BESTBUY-US] Proxy Fucking Unreachable - ' + sku + ' - ' + proxy);
        monitor(listIndex);
        return;
      }
      if (body.toLowerCase().includes('many requests')) {
        console.log('[BESTBUY-US] 429, SKU: ' + sku);
        monitor(listIndex);
        return;
      }
      console.log("********************BESTBUY-US-ERROR********************")
      console.log("SKU: " + sku);
      console.log("Proxy: " + proxy);
      console.log(err);
      console.log(body)
      monitor(listIndex);
      return;
    }
    for (let obj of body) {
      // let obj = body[i];
      let item = obj.sku
      if (!item.names) {
        // if(['a', 'b', 'c', 'd', 'e'].includes(obj.sku.skuId))
        //   continue;
        console.log("[BESTBUY-US] Couldn't find names - " + obj.sku.skuId + " - " + proxy);
        discordBot.sendChannelMessage(discordBot.channels.BESTBUYUS, `Could not find name for sku ${obj.sku.skuId} ! Please remove this SKU or check again! Disabling it for now`);
        await database.query(`delete from ${DATABASE_TABLE} where sku='${obj.sku.skuId}'`);
        removeFromList(obj.sku.skuId);
        continue;
      }

      let sku = item.skuId;
      let title = item.names['short'];
      let price = item.price.priceDomain.currentPrice + '';
      let image = `https://pisces.bbystatic.com/image2/BestBuy_US/images/products/${sku.substring(0, 4)}/${sku}_sd.jpg?width=659&height=630`;
      let type = 'Out-of-Stock';

      query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
      if (query.rows.length === 0)
        continue;

      // if (item.buttonState && item.buttonState.buttonState !== 'SOLD_OUT' && item.buttonState.buttonState !== 'IN_STORE') {
        if (item.buttonState && item.buttonState.buttonState === 'ADD_TO_CART') {
        if (item.buttonState.buttonState === 'ADD_TO_CART') {
          type = 'Online';
        }
        if (item.buttonState.buttonState === 'CHECK_STORES') {
          type = 'Online';
        }


        // let last;
        // for(let rows of query) {
        //   if(row.sku === sku) {
        //     last = row.last;
        //     break;
        //   }
        // }
        if (type !== query.rows[0].last && type !== 'Out-of-Stock') {
          postRestockWebhook('https://www.bestbuy.com/site/tachyon/' + sku + '.p?skuId=' + sku, title, sku, type, price, image);
          console.log(`[BESTBUY-US] Instock! SKU: ${sku}, Proxy: ${proxy}`)
        }
      }
      // console.log(`update ${DATABASE_TABLE} set last='${type}' where sku='${sku}'`);
      // if(type === 'Out-of-Stock') {
      //   console.log(item)
      // }
      if (type !== query.rows[0].last && item.buttonState.buttonState !== 'IN_STORE')
        console.log(`update ${DATABASE_TABLE} set last='${type}' where sku='${sku}'`)
      await database.query(`update ${DATABASE_TABLE} set last='${type}' where sku='${sku}'`);
    }
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(listIndex);
      }, WAITTIME);
    }
  }).catch(err => {
    console.log("********************BESTBUY-US-ERROR********************")
    console.log("SKUs: " + list);
    console.log("Proxy: " + proxy);
    console.log(err);
    setTimeout(function () {
      monitor(listIndex);
    }, 150);
  });
}

async function postRestockWebhook(url, title, sku, type, price, image) {
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.bestbuy.com', '', 'https://www.bestbuy.com')
    .addField("**Stock**", "In Stock", true)
    .addField("**Price**", price, true)
    .addField("**Type**", type)
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
      removeFromList(sku);
      discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
      return;
    }
    await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
    if (!pushToList(sku)) {
      console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
      monitor(LISTS.length - 1);
    }
    discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
    let splits = msg.content.split(" ")
    if (splits.length < 2) {
      discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
      return;
    }
    let args = splits[1].split('\n');
    if (!args || args.length < 2) {
      discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
      return;
    }
    // console.log(args)
    let waitTime = parseInt(args[0].trim());
    let skus = args.splice(1);
    let monitoringSKUs = [];
    let notMonitoringSKUs = [];
    let errorSKUs = [];
    let tempSKUs = [];
    for (let sku of skus) {
      if (!tempSKUs.includes(sku))
        tempSKUs.push(sku);
    }
    skus = tempSKUs;
    // console.log(skus);
    for (let sku of skus) {
      sku = sku.trim();
      // console.log(sku);
      try {
        if (sku === '')
          continue;
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length > 0) {
          await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
          removeFromList(sku);
          notMonitoringSKUs.push(sku);
          continue;
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
        if (!pushToList(sku)) {
          console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
          monitor(LISTS.length - 1);
        }
        monitoringSKUs.push(sku);
      }
      catch (err) {
        errorSKUs.push(sku);
        console.log("*********BESTBUY-SKU-ERROR*********");
        console.log("SKU: " + sku);
        console.log(err);
      }
    }
    // console.log(notMonitoringSKUs.length)
    const monitoringMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('Now monitoring')
      .setDescription(monitoringSKUs.join('\n'))
    if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
    const notMonitoringMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('NOW NOT monitoring')
      .setDescription(notMonitoringSKUs.join('\n'))
    if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
    const monitoringErrorMessage = new Discord.MessageEmbed()
      .setColor('#6cb3e3')
      .setTitle('ERROR monitoring')
      .setDescription(errorSKUs.join('\n'))
    if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
  }
  if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
    if (msg.channel.id === discordBot.channels.BESTBUYUS) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("BestBuy-US Monitor");
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