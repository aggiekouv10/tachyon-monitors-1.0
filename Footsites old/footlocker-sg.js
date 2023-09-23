const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FOOTLOCKERSG);
const jwhook = new webhook.Webhook('https://discord.com/api/webhooks/892201588045787177/xb1Dk3iySfQ_0eMF4RtyE5yiG9iesFJCelMtjHxyYAkGQjTkb7D7OH2avxm5UwGkaQsr');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'footlockersg';
let totalData = 0;
let request = 0;

startMonitoring();
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.sku);
    }
    console.log("[FOOTLOCKER-SG] Started monitoring all SKUs!")
}

async function monitor(sku) {
    let url = `https://www.slamjam.com/en_US/tachyon/${sku}.html`
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;
    request++;
    let proxy = helper.getRandomProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.slamjam.com/en_US/${sku}.html?abcz=${v4()}`, {
        "headers": {
            'User-Agent': randomUseragent.getRandom(),
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
    }).then(async response => {
        clearTimeout(timeoutId)
        if(response.status === 403) {
        monitor(sku)
        return
        }
        let body = await helper.getBodyAsText(response)
        let root = HTMLParser.parse(body);
        let title = root.querySelector('.d-sm-none.product-detail__mobile-head .t-up').textContent.trim() + ' ' + root.querySelector('.product-name').textContent.trim()
        let price = root.querySelector('.sales .value').textContent.trim().replace('&euro; ','€')
        let image = 'https://imageresize.24i.com/?w=300&url=' + root.querySelector('.slider-data-large div').attributes['data-image-url'] + '&w=100&bg=white'
        let sizes = '';
        let sizeList = [];
        let oldSizeList = JSON.parse(query.rows[0].sizes);
        let inStock = false;
        let sizesparse = root.querySelectorAll('#select-prenotation option')
        for (let size of sizesparse) {
            if(size.textContent.trim() !== 'Select Size') {
            if(!size.outerHTML.includes('disabled')) {
            sizes += `[${size.textContent.trim()}](${url}?size=${size.attributes['data-attr-value']}) - ${size.attributes['data-attr-value']}` + '\n';
            sizeList.push(size.textContent.trim());
            if (!oldSizeList.includes(size.textContent.trim()))
            inStock = true;
        }
          }
        }
        await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        if (inStock)
            postRestockWebhook(url, title, sku, sizes, price, image);
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

async function postRestockWebhook(url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.footlocker.sg', '', 'https://www.footlocker.sg')
        .addField("**Restock**", "1+", true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("FOOTLOCKER-SG | v1.1 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    //await jwhook.send(webhookMessage);
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
      if (msg.channel.id === discordBot.channels.FOOTLOCKERSG) {
        let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
        const embed = new Discord.MessageEmbed();
        embed.setTitle("FOOTLOCKER-SG Monitor");
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