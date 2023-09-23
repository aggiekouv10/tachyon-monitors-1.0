const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SOLEBOX);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'solebox';
const SITENAME = 'SOLEBOX'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let totalData = 0;
let request = 0;
let PRODUCTS = {}

startMonitoring();
async function startMonitoring() {


    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.sku);
    }
    console.log("[SOLEBOX] Started monitoring all SKUs!")
}

async function monitor(sku) {
    let url = `https://www.solebox.com/de_DE/p/tachyon-${sku}.html`
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;
    let proxy = helper.getRandomDDProxy()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www.solebox.com/de_DE/p/${sku}.html;.js?dwvar_1_size=1&format=ajax&abcz=${v4()}`, {
        "headers": {
            'User-Agent': '',

        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)

        if (response.status == 404) {
            await helper.sleep(query.rows[0].waittime);
            monitor(sku)
            return
        }
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        if (body.includes('denied')) {
            console.log('oof')
            monitor(sku)
            return
        }
        console.log('success')
        body = JSON.parse(body);
        let title = body.product.brand + ' ' + body.product.productName
        let price = body.product.price.sales.formatted
        let image = body.product.images[0].pdp.srcM
        let sizes = '';
        let variants = '';
        let sizeList = [];
        let oldSizeList = JSON.parse(query.rows[0].sizes);
        let inStock = false;
        let sizesparse = body.product.variationAttributes[1].values
        for (let size of sizesparse) {
            if (size.isOrderable === true) {
                sizes += `[${size.value}](https://www.solebox.com/de_DE/p/tachyon-${sku}.html?chosen=size&dwvar_${sku})\n`;
                variants += `${size.variantId.trim()}\n`
                sizeList.push(size.value);
                if (!oldSizeList.includes(size.value)) {
                    inStock = true;
                }
            }
        }
        await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        if (inStock) {
            postRestockWebhook(url, title, sku, sizes, variants, price, image);
        }
        if (query.rows.length > 0) {
            setTimeout(function () {
                monitor(sku);
            }, query.rows[0].waittime);
        }
    }).catch(err => {
        if (err.toString().includes('network') || err.toString().includes('Response') || err.toString().includes('aborted')) {
            monitor(sku)
        } else {
            console.log("Erorr occured!");
            console.log(err);
            monitor(sku)
        }
    });
}

async function postRestockWebhook(url, title, sku, sizes, variants, price, image) {
    let gb = `[GB](https://www.solebox.com/en_GB/p/tachyon-${sku}.html) . `
    let it = `[IT](https://www.solebox.com/en_GB/p/tachyon-${sku}.html) . `
    let de = `[DE](https://www.solebox.com/en_DE/p/tachyon-${sku}.html) . `
    let fr = `[FR](https://www.solebox.com/en_FR/p/tachyon-${sku}.html)\n`
    let ch = `[CH](https://www.solebox.com/en_CH/p/tachyon-${sku}.html) . `
    let es = `[ES](https://www.solebox.com/en_ES/p/tachyon-${sku}.html) . `
    let at = `[AT](https://www.solebox.com/en_AT/p/tachyon-${sku}.html) . `
    let nl = `[NL](https://www.solebox.com/en_NL/p/tachyon-${sku}.html)`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.solebox.com/${sku}.html) . `
    let polar = `[PolarCop](https://qt.polarcop.com/solebox?key=${sku}) . `
    let phasma = `[Phasma](https://qt.polarcop.com/solebox?key=${sku})\n`
    let orbit = `[Orbit](https://qt.polarcop.com/solebox?key=${sku}) . `
    let mbot = `[Mbot](https://qt.polarcop.com/solebox?key=${sku}) . `
    let ganesh = `[Ganesh](https://qt.polarcop.com/solebox?key=${sku})`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.solebox.com', '', 'https://www.solebox.com')
        .addField("**Restock**", "1+", true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizes, true)
        .addField("**Variants**", variants, true)
        .addField(" ", " ", true)
        .addField("QT", flare + polar + phasma + orbit + mbot + ganesh, true)
        .addField("Links", gb + it + de + fr + ch + es + at + nl, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Solebox | v2.3 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await snkrgroup.send(webhookMessage);
}


discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;

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
