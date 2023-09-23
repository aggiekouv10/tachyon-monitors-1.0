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
const discordWebhook = new webhook.Webhook(discordBot.webhooks.AMAZONCA);
const forbiddenhook = new webhook.Webhook('https://discord.com/api/webhooks/903270710254927983/JVhvaOG39g1VvyGIG4ee0D4HhTUhgJ_27G50FdTaY5NUI8clHD1V_8qAo1nrlRXHUvUg');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912558860923969576/9DgirkM2dtJDUz8-PP_yVGQyilpLkwq1w04Pnt14SFS5SZcwGUO2BggrdaIS_V1n8xNa');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901741373894565888/L4_aOZH4qWMY0VRZuONAlCGWjMVcINaC1XUX_4ky2swNcpdBKLLWigYDlBGzC5-TIq6L');
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904868883289243718/UcoLh4zvpeGFtb6ZgGgF81ZSBitVUtfpJDCWEq4tB4l6uzn59NPCdECr4I9eC-hrcFba');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/905292177888931841/Z4ylHelU6yYuqmcjoRvKANaTckcxuBnTKw1uXv2FqREGYSyLGieoYoxQIA0_aqNCNihF');
const CHANNEL = discordBot.channels.AMAZONCA;
const helper = require('../helper');
const DATABASE_TABLE = 'amazonca';
const SITENAME = 'AMAZONCA'
const { v4 } = require('uuid');
let stats;
let PRODUCTS = {}

startMonitoring();

async function startMonitoring() {
    stats = await helper.manageStats(SITENAME)
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
    console.log('[AMAZON-CA] Monitoring all SKUs!')
}
async function monitor(sku) {
    let url = `https://www.amazon.ca/dp/${sku}`;
    let proxy = helper.getUSARotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    stats.total++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.amazon.com/gp/product/ajax/ref=dp_aod_ALL_mbc?experienceId=aodAjaxMain&asin=${sku}&abcz=${v4()}`, {
        "headers": {
            'User-Agent': randomUseragent.getRandom(),
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)

        let body = await helper.getBodyAsText(response, 3000)
        let root = HTMLParser.parse(body);
        if (response.status !== 200) {
            //console.log('400')
            monitor(sku)
            return
        }
        stats.success++;
        let status = productCache.status
        if (root.querySelector('.a-fixed-right-grid-col.aod-atc-column.a-col-right .a-declarative')) {
            if (root.querySelector('.a-button-inner input[class="a-button-input"]').attributes['aria-label'].includes('Amazon.ca')) {
                let title = root.querySelector('#aod-asin-title-text').textContent
                if(title.includes('Xbox Series S')) {
                    await helper.sleep(productCache.waittime);
                    return
                }
                let price = root.querySelector('.a-price .a-offscreen').textContent
                let image = root.querySelector('#aod-asin-image-id').attributes.src
                let parse = root.querySelector('.a-fixed-right-grid-col.aod-atc-column.a-col-right .a-declarative').attributes['data-aod-atc-action']
                let parsed = JSON.parse(parse)
                let offerid = parsed.oid

                if (status !== "In-Stock") {
                    postRestockWebhook(url, title, sku, price, image, offerid);
                    console.log(`[AMAZON-CA] In Stock! ${sku}`)
                    PRODUCTS[sku].status = 'In-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                }
            } else {
                if (status !== "Out-of-Stock") {
                    console.log(`[AMAZON-CA] OOS! ${sku}`)
                    PRODUCTS[sku].status = 'Out-of-Stock'
                    database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                }
            }
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********AMAZON-CA-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, offerid) {
    let ATC = `https://www.amazon.ca/gp/aws/cart/add-res.html?OfferListingId.1=${offerid}&Quantity.1=1`
    let DirectCheckout = `https://www.amazon.ca/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offerListingID=${offerid}&ASIN=${sku}&isMerchantExclusive=0&merchantID=A3DWYIK6Y9EEQB&isAddon=0&nodeID=&sellingCustomerID=&qid=&sr=&storeID=&tagActionCode=&viewID=glance&rebateId=&ctaDeviceType=desktop&ctaPageType=detail&usePrimeHandler=0&sourceCustomerOrgListID=&sourceCustomerOrgListItemID=&wlPopCommand=&itemCount=20&quantity.1=1&asin.1=${sku}&submit.buy-now=Submit&dropdown-selection=jijjmulnqjp&dropdown-selection-ubb=jijjmulnqjp`
    let checkout = `https://www.amazon.com/checkout`
    let cart = 'https://www.amazon.com/cart'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.amazon.ca', '', 'https://www.amazon.ca')
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Direct Checkout**", `[Buy Now](${DirectCheckout})`, true)
        .addField("**Offer ID**", '```' + offerid + '```')
        .addField("**Links**", '[ATC](' + ATC + ') | [Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Amazon CA | v2.2.3 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    forbiddenhook.send(webhookMessage);
    spacehook.send(webhookMessage);
    prestonhook.send(webhookMessage);
    bandithook.send(webhookMessage);
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
                console.log("*********AMAZON-CA-SKU-ERROR*********");
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
            embed.setTitle(`AMAZON-CA Monitor`);
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