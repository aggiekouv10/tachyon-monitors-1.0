const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const AbortController = require('abort-controller')
const Discord = require('discord.js');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
//('https://discord.com/api/webhooks/973716053500776478/DQbpFX7_nukpYwqF0rApsIuD_Cz22xSU-ScX7yg0e6wvyDBdijeEQ2VzLBjBYNNwbraw');
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/936094621170290768/HbldOp6Ix-FnYouoLu7YBGk0EN2bJ_8ynKGGct5_kS-aExfD_Cll0219AFtMEF0Mqua7');
const space = new webhook.Webhook('https://discord.com/api/webhooks/975537409905295370/Od-_UXCJvQMchrgbjPqIiz20GjP4c1SaSMmAGKeRiyLYC6-Q6s-R7xO0QkPYyeWtiJLA');
const SITENAME = 'DSG'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'dsg';
let PRODUCTS = {}

const DistributeManager = require('../Webhook-Manager/manager')
const distributor = new DistributeManager(SITENAME); //this

startMonitoring();

async function startMonitoring() {
  await distributor.connect() //this
  let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
  for (let row of SKUList.rows) {
    await helper.sleep(helper.getRandomNumber(1500, 3000));
    monitor(row.sku);
  }
  console.log("[DSG] Started monitoring all SKUs!")
}
async function monitor(sku) {
  let realsku = sku.split(',')[0]
  let color = sku.split(',')[1]
  let url = `https://www.dickssportinggoods.com/p/tachyon/${realsku}`
  let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
  if (query.rows.length === 0)
    return;
  let proxy = helper.getRandomDDProxy();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000)
  fetch(`https://www.dickssportinggoods.com/p/${v4()}/${realsku}`, {
    "headers": {
      'User-Agent': randomUseragent.getRandom(),
    },
    agent: new HTTPSProxyAgent(proxy),
    signal: controller.signal

  }).then(async response => {
    clearTimeout(timeoutId)
    if (response.status !== 200) {
      monitor(sku)
      return
    }
    
    let body = await helper.getBodyAsText(response)
    if (body.includes('blocked')) {
      monitor(sku)
      return
    }
    clearTimeout(timeoutId)
    let root = HTMLParser.parse(body);
    if (root.querySelector('.out-of-stock-box-text')) {
      monitor(sku)
      return
    }
    if (!root.querySelector('pdp-in-stock-default')) {
      monitor(sku)
      return
    }
    let parse1 = root.querySelector('#dcsg-ngx-pdp-server-state').textContent.split('&q;').join('"').split('&s;').join("'")
    let parse = JSON.parse(parse1)
    let pname = `product-${realsku}--`
    let title = parse[pname].title + ' ' + color.toLowerCase()
    let price = parse[pname].price.maxOffer.toString()
    let image = ''
    let sizes = '';
    let sizeList = [];
    let oldSizeList = JSON.parse(query.rows[0].sizes);
    let inStock = false;
    let sizesparse = parse[pname].skus
    for (let size of sizesparse) {
      if (size.atsInventory > 0 && size.defAttributes[1].value.trim().length > 0) {
        if (size.defAttributes[0].value.toLowerCase() === color.toLowerCase().split('-').join(' ')) {
          let colorparse = size.defAttributes[0].value.split('/').join('_')
          image = `https://dks.scene7.com/is/image/GolfGalaxy/${realsku.toUpperCase()}_${colorparse.split(' ').join('_')}`
          sizes += `${size.defAttributes[1].value.trim()} (${size.atsInventory}) - ${size.id} \n`;
          sizeList.push(size.defAttributes[1].value.trim());
          if (!oldSizeList.includes(size.defAttributes[1].value.trim()))
            inStock = true;
        }
      }

    }
    let sizeright = sizes.split('\n')
    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
    await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
    if (inStock)
      postRestockWebhook(url, title, realsku, sizeright, sizeleft, price, image);
    if (query.rows.length > 0) {
      setTimeout(function () {
        monitor(sku);
      }, query.rows[0].waittime);
    }
  }).catch(err => {
    if (err.toString().includes('network')) {
      monitor(sku);
      return;
    }
    if (err.type === 'aborted') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitor(sku);
      return;
    }
    if (err.type === 'request') {
      //console.log("[HIBBETT] Timeout - " + sku, proxy)
      monitor(sku);
      return;
    }
    console.log("Erorr occured!");
    console.log(err);
    monitor(sku)
  });
}

async function postRestockWebhook(url, title, realsku, sizeright, sizeleft, price, image) {
  console.log(arguments)
  var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setTitle(title)
    .setURL(url)
    .setAuthor('https://www.dickssportinggoods.com', '', 'https://www.dickssportinggoods.com')
    .addField("**Price**", price, true)
    .addField("**Sku**", realsku, true)
    .addField(" ", ' ', true)
    .addField("**Sizes**", sizeleft.join('\n'), true)
    .addField("**Sizes**", sizeright.join('\n'), true)
    .addField(" ", " ", true)
    //.addField("QT", burst + cyber + flare + fleek + orbit + phasma, true)
    .setThumbnail(image)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
    .setTime()
    .setFooter("DSG | v2.1 ", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
  
  synthiysis.send(webhookMessage)
  space.send(webhookMessage)
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
    if (msg.channel.id === discordBot.channels.DSG) {
      let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
      const embed = new Discord.MessageEmbed();
      embed.setTitle("Offspring Monitor");
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