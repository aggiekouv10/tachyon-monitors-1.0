const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const AbortController = require('abort-controller');

const HTMLParser = require('node-html-parser');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.NEWEGGCA);
const archook = new webhook.Webhook('https://discord.com/api/webhooks/905291761931403265/B0s7gPLhVp7FMhFRvQnisSVTNHpG_019vab3iZBDVfkXJX6owlt3wJgRHk4_A4V5rcBm');
const CHANNEL = discordBot.channels.NEWEGGCA;
const helper = require('../helper');
const DATABASE_TABLE = 'neweggca';
const { v4 } = require('uuid');
let totalData = 0;

let PRODUCTS = {}
const HOOK_DELAY = 5 * 60 * 1000;

startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status,
            lastHook: 0
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[Newegg-CA] Monitoring all SKUs!')
}
async function monitor(sku, doubleCheck) {
    let url = `https://www.newegg.ca/tachyon/p/${sku}?item=${sku}`;
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    if (!productCache)
        return;
    try {
        let response = await
            fetch(`https://www.newegg.ca/tachyon/p/${sku}?item=${sku}&abcz=${v4()}`, {
                'headers': {
                    'user-agent': randomUseragent.getRandom()
                },
                agent: new HTTPSProxyAgent(proxy),
                signal: controller.signal
            });
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
        let root = HTMLParser.parse(body);
        totalData += ((body.length * 1) / 1000000);
        status = productCache.status
        if (root.querySelector('.product-title')) {
            if (root.querySelector('.qty-box-input')) {
                if (doubleCheck) {
                    return true;
                }
                let title = root.querySelector('.product-title').innerText
                let price = root.querySelector('.price-current').innerText
                let image = root.querySelector('.product-view-img-original').attributes.src

                if (status !== "In-Stock") {
                    // console.log("Double checking 1")
                    let double = await monitor(sku, true);
                    // console.log("Double checked " + double)
                    if (double === true) {
                        if (Date.now() - PRODUCTS[sku].lastHook > HOOK_DELAY) {
                            postRestockWebhook(url, title, price, image, sku);
                            PRODUCTS[sku].lastHook = Date.now()
                        }
                        console.log(`[NEWEGG-CA] In Stock! ${sku} - ${proxy}`)
                        PRODUCTS[sku].status = 'In-Stock'
                        database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    }
                }
            } else {
                if (doubleCheck) {
                    return false;
                }
                if (status !== "Out-of-Stock") {
                    // console.log("Double checking 2")
                    let double = await monitor(sku, true);
                    // console.log("Double checked " + double)
                    if (double === false) {
                        console.log(`[NEWEGG-CA] OOS! ${sku} - ${proxy}`)
                        PRODUCTS[sku].status = 'Out-of-Stock'
                        database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                    }
                }
            }
        }

        await helper.sleep(productCache.waittime);
        monitor(sku);
    } catch (err) {
        if (doubleCheck) {
            return false;
        }
        if (err.code === 'ECONNRESET') {
            console.log(`[NEWEGG-CA WEB] ECONNRESET ${sku} - ${proxy}`)
            monitor(sku)
            return;
        }
        console.log("***********NEWEGG-CA-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    }
}

async function postRestockWebhook(url, title, price, image, sku) {
    let ATC = `https://www.newegg.ca/Shopping/AddtoCart.aspx?Submit=ADD&ItemList=${sku}&hmt=add`
    let cart = 'https://secure.newegg.ca/shop/cart'
    let checkout = 'https://secure.newegg.ca/shop/checkout'
    let login = 'https://secure.newegg.ca/NewMyAccount/AccountLogin.aspx?nextpage=https%3A%2F%2Fwww.newegg.com%2F'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.newegg.ca', '', 'https://www.newegg.ca')
        .addField("**In Stock**", 'True', true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') |')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Newegg CA | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    archook.send(webhookMessage);
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
            status: '',
            lastHook: 0
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
                    status: '',
                    lastHook: 0
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********NEWEGG-CA-SKU-ERROR*********");
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
        if (msg.channel.id === CHANNEL) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`NEWEGG-CA Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku}`);
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