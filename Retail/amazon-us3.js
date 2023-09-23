const fs = require('fs');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const AbortController = require('abort-controller')
const discordWebhook = new webhook.Webhook(discordBot.webhooks.AMAZONUS);
const CHANNEL = discordBot.channels.AMAZONUS;
const helper = require('../helper');
const DATABASE_TABLE = 'amazonus';
const SITENAME = 'AMAZONUS'

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
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[AMAZON-US] Monitoring all SKUs!')
}

async function monitor(sku) {
    let url = `https://www.amazon.com/dp/${sku}/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=${sku}&linkCode=as2&tag=tachyon03-20`;
    let proxy = helper.getUSARotatingProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.amazon.com/gp/product/ajax/ref=dp_aod_ALL_mbc?experienceId=aodAjaxMain&asin=${sku}&abcz=${v4()}`, {
        "headers": {
            'User-Agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            //console.log('400')
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 2000);
        let root = HTMLParser.parse(body);
        let status = productCache.status
        console.log(root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'])
        if (root.querySelector('.a-price .a-offscreen')) {
            console.log(root.querySelector('.a-price .a-offscreen').textContent)
            if (root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'].includes('Amazon.com')) {
                let title = root.querySelector('#aod-asin-title-text').textContent
                let price = root.querySelector('.a-price .a-offscreen').textContent
                let image = root.querySelector('#aod-asin-image-id').attributes.src
                let parse = root.querySelector('.a-fixed-right-grid-col.aod-atc-column.a-col-right .a-declarative').attributes['data-aod-atc-action']
                let parsed = JSON.parse(parse)
                let offerid = parsed.oid

                if (status !== "In-Stock") {
                    postRestockWebhook(url, title, sku, price, image, offerid);
                    console.log(`[AMAZON-US] In Stock! ${sku}`)
                    PRODUCTS[sku].status = 'In-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    console.log(`[AMAZON-US] OOS! ${sku}`)
                    PRODUCTS[sku].status = 'Out-of-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                }
            }
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if(err.toString().includes('aborted')) {
            monitor(sku)
            return
        }
        console.log("***********AMAZON-US-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, offerid) {
    let ATC = `https://www.amazon.com/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offerListingID=${offerid}&ASIN=${sku}&isMerchantExclusive=0&merchantID=A3DWYIK6Y9EEQB&isAddon=0&nodeID=&sellingCustomerID=&qid=&sr=&storeID=&tagActionCode=&viewID=glance&rebateId=&ctaDeviceType=desktop&ctaPageType=detail&usePrimeHandler=0&sourceCustomerOrgListID=&sourceCustomerOrgListItemID=&wlPopCommand=&itemCount=20&quantity.1=1&asin.1=${sku}&submit.buy-now=Submit&dropdown-selection=&dropdown-selection-ubb=`
    let checkout = `https://www.amazon.com/checkout`
    let cart = 'https://www.amazon.com/cart'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.amazon.com', '', 'https://www.amazon.com')
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Offer ID**", '```' + offerid + '```')
        .addField("**Links**", '[ATC](' + ATC + ') | [Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Amazon US | v2.2.3 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);

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
                console.log("*********AMAZON-US-SKU-ERROR*********");
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
            embed.setTitle(`AMAZON-US Monitor`);
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