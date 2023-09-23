const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const randomUseragent = require('random-useragent');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const HTMLParser = require('node-html-parser');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.EBGAMESCASTORE);
const archook = new webhook.Webhook('https://discord.com/api/webhooks/914795873622450186/w1sKiBBlmWB3rK2P5WoI_q-q_eWXlF7QGRBLl__4vl9POciCs4XwJtmgStwWfioZlzcn');
const CHANNEL = discordBot.channels.EBGAMESCASTORE;
const helper = require('../helper');
const DATABASE_TABLE = 'gamestopcastore';
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
    console.log('[GAMESTOP-instore-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    let realsku = sku.split(',')[0]
    let url = `https://www.gamestop.ca/Toys-Collectibles/Games/${realsku}.html`;
    if (!productCache)
        return;
    await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.gamestop.ca/StoreLocator/GetStoresForStoreLocatorByProduct?value=${realsku}&skuType=1&language=en-CA&abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        
    }).then(async response => {
        clearTimeout(timeoutId)
        if(response.status !== 200) {
            monitor(sku)
            return
        }
        
        let body = await helper.getBodyAsText(response)
        body = await JSON.parse(body);
        let status = productCache.status
        for(store of body) {
            if(store.Details === 'Please note this location is a Distribution Centre, and is not open to the public.') {
                continue
            }
            if(store.ProductStatus === 'available') {
            let street = store.Address
            let city = store.City
            let province = store.Province
            let location = store.Name
            let deail = store.Details.split('<b>Now Available at this location:</b><br /> - Get Cash For your Trades. <a href=\"/Cash4Trade\">More Info.</a>\r\n<br><br>').join('').split('<b>Now Available at this location:</b><br /> - Get Cash For your Trades. <a href=\"/Cash4Trade\">More Info.</a>\n<br><br>').join()
            let zip = store.Zip
            let phone = store.Phones
            let title = sku.split(',')[1].split('-').join(' ')
            let imageparse = sku.split(',')[2]
            let image = `https://static-ca.gamestop.ca/images/products/${imageparse}/3max.jpg`
            if (status !== "In-Stock") {
                await postRestockWebhook(url, street, city, province, location, deail, zip, phone, title, image, realsku);
                console.log(`[GAMESTOP-instore-CA] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            if (status !== "Out-of-Stock") {
                console.log(`[GAMESTOP-instore-CA] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
    }
}
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********GAMESTOP-instore-CA-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, street, city, province, location, deail, zip, phone, title, image, realsku) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.gamestop.ca', '', 'https://www.gamestop.ca')
        .addField("**Stock**", 'Available', true)
        .addField("**Sku**", realsku, true)
        .addField("**Location**", location, true)
        .addField("**Street**", street, true)
        .addField("**City**", city, true)
        .addField("**Province**", province, true)
        .addField("**Zipcode**", zip, true)
        .addField("**Detail**", deail, true)
        .addField("**Phone**", phone, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Gamestop CA Store | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await archook.send(webhookMessage);
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
            PRODUCTS[sku] = null
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCTS[sku] = {
            sku: sku,
            waittime: waitTime,
            status: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
        monitor(sku);
        // console.log("added " + sku)
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
                    PRODUCTS[sku] = null
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCTS[sku] = {
                    sku: sku,
                    waittime: waitTime,
                    status: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********GAMESTOP-instore-CA-SKU-ERROR*********");
                console.log("SKU: " + sku);
                console.log(err);
                monitor(sku);
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
        if (msg.channel.id === CHANNEL) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`GAMESTOP-instore-CA Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku} - ${row.waittime}ms`);
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