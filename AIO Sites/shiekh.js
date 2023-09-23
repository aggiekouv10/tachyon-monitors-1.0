const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
var request = require('request-promise');
const database = require('../database/database')
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const genCookie = require('./hibbett/px-payload');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SHIEKH);
const elephent = new webhook.Webhook('https://discord.com/api/webhooks/1023248014975979530/tWmcqN2opdx1WiB3sP8MjpobelYPvt0bw41VESK5mBDSkPndrQQwfh_Fu6MmBa-GllXc');

const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'shiekh';
SITENAME = 'SHIEKH'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let totalData = 0;
let PRODUCTS = {}

startMonitoring();
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[NORDSTROM] Monitoring all SKUs!')
}

async function monitor(sku) {
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    let cache = ''
    let random = Math.floor(Math.random() * 2000) + 1
    for (let i = 0; i < random; i++) {
        cache += '%20'
    }
    if (query.rows.length === 0)
        return;
    let proxy = 'http://usa.rotating.proxyrack.net:9000'
    let proxy2 = helper.getRandomDDProxy()
    let cookie = await genCookie(await proxy2)
    let pid = ''
    try {pid = await sku.split('-').join('%20');}
    catch (e) {pid = sku}

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    fetch(`https://api.shiekh.com/api/V1/extend/products/${pid}/.js`, {
        "headers": {
            'User-Agent': 'Shiekh Shoes/10.6 (com.shiekh.shoes.ios; build:1233; iOS 16.0.0) Alamofire/5.6.1',
            'X-PX-AUTHORIZATION': `2:${cookie}`,
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal,
        method: 'GET',
    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        if (response.status == 404) {
            console.log(sku)
            return
        }
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        body = await JSON.parse(body);
        try{
            let event = Date.parse(new Date(Date.now()).toISOString())
            let event1 = Date.parse(new Date(body.release_date).toISOString())
            if (event1 > event) {
                //console.log('Not released yet')
                await helper.sleep(2000);
                monitor(sku)
                return
            }
            }
            catch(e){}
        if (body.size.length > 0) {
            let url = 'https://shiekh.com/' + body.url_path + '.html';
            let title = body.name
            let price = '$' + body.price
            let image = body.images[0].original
            let sizes = '';
            let stock = 0
            let sizeList = [];
            let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
            let oldSizeList = query.rows[0].sizes
            let inStock = false;
            let sizesparse = body.size
            let option_id = body.extension_attributes.configurable_product_options[0].attribute_id
            let option_value = ''
            for (let size of sizesparse) {
                if (size.in_stock == true) {
                    sizes += `[${size.value}](${url}?size) (${size.qty}) - ${size.size_id}` + '\n';
                    option_value += `${size.size_id},`
                    stock += Number(size.qty)
                    sizeList.push(size.value);
                    if (!oldSizeList.includes(size.value)) {
                        inStock = true;
                    }
                }
            }

            await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);

            if (inStock) {
                sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                postRestockWebhook(url, title, sku, sizeleft, sizeright, price, image, stock);
                postcopbox(url, title, sku, sizeleft, sizeright, price, image, stock)
                postElphent(option_value, sku, title, option_id)
            }
        }
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

async function postRestockWebhook(url, title, sku, sizeleft, sizeright, price, image, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://shiekh.com', '', 'https://shiekh.com')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Shiekh | v1 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
}
async function postcopbox(url, title, sku, sizeleft, sizeright, price, image, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cop Box")
        .setColor("#cd8fff")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://shiekh.com', '', 'https://shiekh.com')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg")
        .setFooter("Shiekh | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg')
    await elephent.send(webhookMessage)
}
async function postElphent(option_value, sku, title, option_id) {
    const options = {
        method: 'POST',
        url: 'https://cloudapii.herokuapp.com/shkfeergfrewg',
        headers: { 'Content-Type': 'application/json' },
        body: {
            option_value: option_value,
            option_id: option_id,
            sku: sku,
            title: title,
            mode: "1"
        },
        json: true
    };

    request(options, function (error) {
        if (error) throw new Error(error);
    });
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
            sizes: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
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
                    sizes: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********SNIPES-USA-SKU-ERROR*********");
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
            embed.setTitle(`SNIPES-USA Monitor`);
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
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorTimes')) {
        if (msg.channel.id === CHANNEL) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`SNIPES-USA Monitor Times`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`SNIPES-USA Monitor Times`);
            embed2.setColor('#6cb3e3')
            if (Object.keys(PRODUCTS).length > 0) {
                let SKUList1 = [];
                let SKUList2 = [];
                let i = 0;
                for (let sku of Object.keys(PRODUCTS)) {
                    if (i < Object.keys(PRODUCTS).length / 2)
                        SKUList1.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    else
                        SKUList2.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    i++;
                }
                embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
                embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
            msg.reply(embed2);
        }
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorStatuses')) {
        if (msg.channel.id === CHANNEL) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`SNIPES-USA Monitor Statuses`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`SNIPES-USA Monitor Statuses`);
            embed2.setColor('#6cb3e3')
            if (Object.keys(PRODUCTS).length > 0) {
                let SKUList1 = [];
                let SKUList2 = [];
                let i = 0;
                for (let sku of Object.keys(PRODUCTS)) {
                    if (i < Object.keys(PRODUCTS).length / 2)
                        SKUList1.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
                    else
                        SKUList2.push(`${sku} - ${PRODUCTS[sku].lastMonitorStatus}`);
                    i++;
                }
                embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
                embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
            msg.reply(embed2);
        }
    }

});

module.exports = {
    totalData: function () {
        return totalData;
    }
}
