const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const HTMLParser = require('node-html-parser');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.BESTBUYCASTORE);
const archook = new webhook.Webhook('https://discord.com/api/webhooks/909336591108034570/Dax4PV6pEehM_hITuOR7Q3kzGkg_nF43jitgB_OVLeE7m5odoClJfzkCIS3BE6xeDcJ9');
const bandithook = new webhook.Webhook('https://discordapp.com/api/webhooks/905570885635813416/nuj6-2cvQX-NOZie9HfPC5i3SOc4nxNY3vIZ0hYrW_xe4rxoAVI6vDEjsXklo6PKdiQm');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912567106908852275/UjCnIGp3zS-LOOw9jNqsQlefu20B86KavoQ6x4OW1Rwfd-G0dvIx7_axYWcm8sFfnZxP');

const CHANNEL = discordBot.channels.BESTBUYCASTORE;
const helper = require('../helper');
const DATABASE_TABLE = 'bestbuycastore';
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
    console.log('[BESTBUY-CA-STORE-instore-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getUSARotatingProxy()
    let productCache = PRODUCTS[sku]
    let url = `https://www.bestbuy.ca/checkout/?qit=1#/en-ca/reserve-pickup/pickup-store?sku=${sku}`;
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.bestbuy.ca/ecomm-api/availability/products?accept-language=en-ca&accept=application%2Fvnd.bestbuy.standardpickup.v1%2Bjson&locations=977%7C203%7C931%7C62%7C617%7C927%7C965%7C57%7C938%7C237%7C943%7C932%7C956%7C202%7C200%7C937%7C926%7C795%7C916%7C544%7C910%7C954%7C207%7C233%7C930%7C622%7C223%7C245%7C925%7C985%7C990%7C959%7C949%7C942%7C613%7C950%7C208%7C984%7C213%7C615%7C982%7C823%7C631%7C953%7C995%7C247%7C620%7C225%7C235%7C935%7C219%7C608%7C626%7C621%7C218%7C246%7C980%7C936%7C989%7C210%7C964%7C236%7C610%7C624%7C632%7C944%7C975%7C211%7C901%7C639%7C928%7C858%7C859%7C940%7C972%7C627%7C224%7C637%7C674%7C541%7C970%7C658%7C857%7C855%7C856%7C978%7C543%7C968%7C967%7C962&skus=${sku}&abcz=${v4()}`, {
        'headers': {
            'user-agent': randomUseragent.getRandom()
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
        body = await JSON.parse(body.trim());
        let status = productCache.status
        let locations = body.availabilities[0].pickup.locations
        let title = ''
        let image = ''
        let stores = ''
        let stock = 0
        for (let store of locations) {
            if (store.hasInventory === true) {
                stores += `**${store.name}** (${store.quantityOnHand.toString()})\n`
                stock += store.quantityOnHand
            } else {
                continue
            }
        }
        if (stores.length > 0) {
            await fetch(`https://api.bazaarvoice.com/data/batch.json?passkey=ca56StNjkMTqvaQE5CE0wn1rAjkeCQZWzJEMeNfcAN1c8&apiversion=5.5&displaycode=18193-en_ca&resource.q0=products&filter.q0=id%3Aeq%3A${sku}`, {
                'headers': {
                    'user-agent': randomUseragent.getRandom()
                },
            }).then(async response2 => {
                if (response2.status !== 200) {
                    monitor(sku)
                    return
                }
                let body2 = await helper.getBodyAsText(response2)
                body2 = await JSON.parse(body2.trim());
                title = body2.BatchedResults.q0.Results[0].Name
                image = body2.BatchedResults.q0.Results[0].ImageUrl
                console.log(title, image)
                if(title.length < 0) {
                monitor(sku)
                return
            }
            }).catch(async err => {
                console.log("***********BESTBUY-CA-STORE-instore-CA-ERROR***********");
                console.log("SKU: " + sku);
                console.log("Proxy: " + proxy);
                console.log(err);
                monitor(sku)
                return
            });

            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, image, stores, stock);
                console.log(`[BESTBUYCA] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }

        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[BESTBUYCA] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }


        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********BESTBUY-CA-STORE-instore-CA-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, image, stores, stock) {
    let ominous = `[Ominous](http://localhost:2002/quicktask?options=%7B%22module%22:%20%22BestBuy+CA%22,%20%22sku%22:%20%${sku}%22,%20%22quantity%22:%201%7D)`
    let paypalcheckout = `[Paypal Checkout](https://www.bestbuy.ca/checkout/?qit=1#/en-ca/shipping?expressPaypalCheckout=true)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.bestbuy.ca', '', 'https://www.bestbuy.ca')
        .addField("**Stock**", stock, true)
        .addField("**Sku**", sku, true)
        .addField("**QT**", ominous, true)
        .addField("**Stores**", stores)
        .addField("**Links**", paypalcheckout, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Bestbuy CA Store | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    archook.send(webhookMessage);
    bandithook.send(webhookMessage);
    spacehook.send(webhookMessage);
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
                console.log("*********BESTBUY-CA-STORE-instore-CA-SKU-ERROR*********");
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
            embed.setTitle(`BESTBUY-CA-STORE-instore-CA Monitor`);
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