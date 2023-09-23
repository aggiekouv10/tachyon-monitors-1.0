const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.DISNEY);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'disney';
const { v4 } = require('uuid');
let totalData = 0;
let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status
        }
        monitor(row.sku);
    }
    console.log("[DISNEY] Started monitoring all SKUs!")
}
async function monitor(sku) {
    let url = `https://www.shopdisney.com/tachyon-${sku}.html`;
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;

    let proxy = await helper.getUSARotatingProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.shopdisney.com/on/demandware.store/Sites-shopDisney-Site/default/Product-Variation?pid=${sku}&abcz=${v4()}`, {
        'headers': {
            'User-Agent': randomUseragent.getRandom(),
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        if(response.status !== 200) {
            //console.log('400')
            monitor(sku)
            return   
            }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body)
        status = query.rows[0].status
        if(body) {
        let stock = body.addToCartButtonState.isSoldOut
        if (stock === false) {
            let title = body.product.productName;
            let price = body.product.price.sales.formatted;
            let image = body.product.images.large[0].url;
            let stocks = body.product.ATS

            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, stocks, price, image);
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
    }
    }).catch(err => {
        console.log("Erorr occured!");
        console.log(err);
        monitor(sku)
    });
}



async function postRestockWebhook(url, title, sku, stocks, price, image) {
    let ATC = `https://www.shopdisney.com/on/demandware.store/Sites-shopDisney-Site/default/Cart-MiniAddProduct?pid=${sku}`
    let cart = 'https://www.shopdisney.com/my-bag'
    let checkout = 'https://www.shopdisney.com/checkout?stage=shipping#shipping'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor('#6cb3e3')
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.shopdisney.com', '', 'https://www.shopdisney.com')
        .addField("**In Stock**", stocks, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') |')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Disney-US | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
        if (msg.channel.id === discordBot.channels.DISNEY) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("ShopDisney-US Monitor");
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