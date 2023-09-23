// https://www.homedepot.com/p/svcs/frontEndModel/308038103
// (https://www.homedepot.com/p/Home-Decorators-Collection-Ashby-Park-44-in-White-Color-Changing-Integrated-LED-Brushed-Nickel-Ceiling-Fan-with-Light-Kit-and-3-Reversible-Blades-59244/308038103)

const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const AbortController = require('abort-controller');

const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const { v4 } = require('uuid');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.HOMEDEPOT);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'homedepot';

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
    console.log("[HOMEDEPOT] Started monitoring all SKUs!")
}
async function monitor(sku) {
    let url = `https://www.homedepot.com/p/tachyon/${sku}`;
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;

    let proxy = helper.getRandomProxy();
    // console.log("[HOMEDEPOT] Monitoring " + sku)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.homedepot.com/p/svcs/frontEndModel/${sku}?cache=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status === 400) {
            //console.log('400')
            monitor(sku)
            return
        }
        if (response.status === 403) {
            //console.log('403')
            monitor(sku)
            return
        }
        if (response.status === 503) {
            //console.log('503')
            monitor(sku)
            return
        }
        if (response.status === 204) {
            //console.log('204')
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
            console.log('[HOMEDEPOT] Unauthenticated Proxy: ' + proxy);
            monitor(sku);
            return;
        }
        body = JSON.parse(body);
        let status = query.rows[0].status
        let stock = body.inventory.online.quantity
        if ((stock && stock > 0)) {
            let title = body.primaryItemData.info.productLabel;
            let pricez = '$' + body.primaryItemData.itemExtension.pricing.originalPrice;
            let price = pricez.replace("00", '')
            let image = body.primaryItemData.media.mediaList[0].location;

            if ((stock && stock > 0) && query.rows[0].status !== 'In-Stock') { //if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, stock, price, image);
                console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if ((!stock || (stock && stock <= 0)) && query.rows[0].status !== 'Out-of-Stock') {  //if (status !== "Out-of-Stock") {
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
        //console.log("**************HOMEDEPOT-ERROR**************");
        //console.log("Proxy - " + proxy);
        //console.log(err);
        monitor(sku)
    });
}


async function postRestockWebhook(url, title, sku, stock, price, image) {
    let ATC = `https://www.homedepot.com/p/tachyon/${sku}`
    let cart = 'https://www.homedepot.com/mycart/home'
    let checkout = 'https://www.homedepot.com/auth/view/checkout'
    let login = 'https://www.homedepot.com/auth/view/signin'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor('#6cb3e3')
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.homedepot.com', '', 'https://www.homedepot.com')
        .addField("**In Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Homedepot | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
        if (msg.channel.id === discordBot.channels.HOMEDEPOT) {
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

module.exports = {
    totalData: function () {
        return totalData;
    }
}