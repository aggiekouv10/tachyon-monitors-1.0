const fs = require('fs');
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.AMAZONCAID);
const forbiddenhook = new webhook.Webhook('https://discord.com/api/webhooks/903270710254927983/JVhvaOG39g1VvyGIG4ee0D4HhTUhgJ_27G50FdTaY5NUI8clHD1V_8qAo1nrlRXHUvUg');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/891720465234677771/PZqtoWbR9zgW9Rdz_4ZA8HrFCD9ulpaRlYfw05dINBF5JjsZ-BPgeIEexOD1G7m-Lyvf');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901741373894565888/L4_aOZH4qWMY0VRZuONAlCGWjMVcINaC1XUX_4ky2swNcpdBKLLWigYDlBGzC5-TIq6L');
const CHANNEL = discordBot.channels.AMAZONCAID;
const helper = require('../helper');
const DATABASE_TABLE = 'amazoncaid';
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
    console.log('[AMAZON-CA-ID] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomProxy();
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.amazon.ca/gp/overlay/display.html', {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
    
            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        }).then(async response => {
        clearTimeout(timeoutId)
            let sessionIDCookie = "session-id=" + response.headers.get('set-cookie').split("session-id=")[1].substr(0, 19);
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.amazon.ca/gp/aws/cart/add.html?OfferListingId.1=${sku}&Quantity.1=1&tag=mms321-20&abcz=${v4()}`, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "max-age=0",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                'User-Agent': randomUseragent.getRandom(),
                "cookie": sessionIDCookie + ";"
            },
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
            
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        let root = HTMLParser.parse(body);
        if(response.status === 400) {
        //console.log('400')
        monitor(sku)
        return   
        }
        if(response.status === 403) {
        //console.log('403')
        monitor(sku)
        return   
        }
        if(response.status === 503) {
        //console.log('503')
        monitor(sku)
        return    
        }
        if(response.status === 204) {
        //console.log('204')
        monitor(sku)
        return
        }
        let status = productCache.status
        if(root.querySelector('.item-row')) {
        if (root.querySelector('.item-row')) {
            let title1 = root.querySelectorAll('.item-row a')[1]
            let title = title1.textContent
            let price = root.querySelector('.price.item-row').textContent
            let image = root.querySelector('.item-row img').attributes.src
            let realsku = root.querySelector('.item-row a').attributes.href.replace('/gp/product/','')
            let url = `https://www.amazon.ca/dp/${realsku}/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=${realsku}&linkCode=as2&tag=tachyon03-20`;
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, realsku);
                console.log(`[AMAZON-CA-ID] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[AMAZON-CA-ID] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
    }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        console.log("***********AMAZON-CA-ID-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}).catch(async err => {
    console.log("***********AMAZON-CA-ID-ERROR***********");
    console.log("SKU: " + sku);
    console.log("Proxy: " + proxy);
    console.log(err);
    monitor(sku)
});
}

async function postRestockWebhook(url, title, sku, price, image, realsku) {
    let ATC = `https://www.amazon.ca/gp/aws/cart/add.html?OfferListingId.1=${sku}&Quantity.1=1&tag=mms321-20`
    let checkout = `https://www.amazon.ca/checkout`
    let cart = 'https://www.amazon.ca/cart'
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.amazon.ca', '', 'https://www.amazon.ca')
        .addField("**Sku**", realsku, true)
        .addField("**Price**", price, true)
        .addField("**Offer ID**", '```' + sku + '```')
        .addField("**Links**", '[ATC](' + ATC + ') | [Checkout](' + checkout + ') | [Cart](' + cart + ')')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Amazon CA id | v2.1.3 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await forbiddenhook.send(webhookMessage);
    await spacehook.send(webhookMessage);
    await prestonhook.send(webhookMessage);
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
                console.log("*********AMAZON-CA-ID-SKU-ERROR*********");
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
            embed.setTitle(`AMAZON-CA-ID Monitor`);
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