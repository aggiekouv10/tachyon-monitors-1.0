//SKU: 1916263 (https://www.snipes.com/p/lacoste-carnaby_evo_0921_1_sui_-white-0001380**1916263**.html)
//Availability/Stock: https://www.snipes.com/s/snse-DE-AT/dw/shop/v19_5/products/(0001380<sku>)?client_id=cf212f59-94d1-4314-996f-7a11871156f4&locale=de-DE&expand=+prices
//AJAX: https://www.snipes.com/p/lacoste-carnaby_evo_0921_1_sui_-white-0001380<sku>.html?dwvar_0001380<sku>_color=&format=ajax
//Image: https://dev.snipes.com/dw/image/v2/BDCB_PRD/on/demandware.static/-/Sites-snse-master-eu/default/dwd48480da/<sku>_P.jpg?sw=780&sh=780&sm=fit&sfrm=png

const fs = require('fs');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { v4 } = require('uuid');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SNIPESEU);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const DATABASE_TABLE = 'snipeseu';
let totalData = 0;
const WAITTIME = 500;

let LISTS = [];
let PRODUCT_DATA = {}
const SKU_LIST_LENGTH = 50;
const SITENAME = 'SNIPESEU'
const CHANNEL = discordBot.channels[SITENAME]
startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCT_DATA[row.sku] = {
            sizes: JSON.parse(row.last)
        }
        pushToList(row.sku);
    }
    for (let i = 0; i < LISTS.length; i++) {
        await helper.sleep(helper.getRandomNumber(700, 1500));
        monitor(i);
    }
    console.log("[SNIPESEU] Started monitoring all SKUs!")
}

function pushToList(sku) {
    for (let i = 0; i < LISTS.length; i++) {
        if (LISTS[i] && LISTS[i].length < SKU_LIST_LENGTH) {
            LISTS[i].push(sku);
            // console.log("old push: " + sku)
            return true;
        }
    }
    // console.log("NEW LIST PUSHED " + sku)
    LISTS.push([sku]);
    return false;
}

function removeFromList(sku) {
    for (let i = 0; i < LISTS.length; i++) {
        if (!LISTS[i])
            continue;
        LISTS[i] = LISTS[i].filter(function (value, index, arr) {
            return value !== sku;
        });
        if (LISTS[i].length === 0) {
            // console.log(LISTS)
            LISTS[i] = null;//ISTS.splice(i+1, 1);
            // console.log(LISTS)
        }
    }
}


async function monitor(listIndex) {
    let skus = LISTS[listIndex];
    if (!skus)
        return;
    // console.log(skus)
    if (!skus)
        return;
    let list = '';
    for (let sku of skus) {
        list += sku + ',';
    }
    list = list.substring(0, list.length - 1);
    let pdpURL = `https://www.snipes.com/s/snse-DE-AT/dw/shop/v19_5/products/(${list})?client_id=cf212f59-94d1-4314-996f-7a11871156f4&cache=${v4()}&locale=de-DE&expand=availability,+prices,+promotions,+variations`;
    // console.log(pdpURL)

    let proxy = helper.getRandomDDProxy;
    let time = Date.now();
    // console.log(pdpURL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
        'headers': {
            'cache-control': 'max-age=0',
            'pragma': 'max-age=0',
            'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            'accept-encoding': "gzip, deflate, br",
            'accept-language': "en-US,en;q=0.9",
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': "document",
            'sec-fetch-mode': "navigate",
            'sec-fetch-site': "none",
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        // console.log("Response time: " + (Date.now() - time) + " - Proxy: " + proxy);
        // console.log("YAY")
        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        try {
            body = JSON.parse(body);
        } catch (err) {
            console.log("********************SNIPESEU-ERROR********************")
            console.log("SKU-List: " + list);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(listIndex);
            return;
        }
        if (!body.data) {
            console.log(`[SNIPESEU] No PRODUCT DATA!`);
            console.log(body)
        }
        for (let item of body.data) {

            let sku = item.id;
            // console.log(sku);
            // console.log(PRODUCT_DATA)
            let pData = PRODUCT_DATA[sku];
            let title = item.name + " - " + item.variation_values.color;
            let price = item.c_akeneo_wwsprice[0] || "NA";
            let image = `https://www.snipes.com/dw/image/v2/BDCB_PRD/on/demandware.static/-/Sites-snse-master-eu/default/dwb94c64eb/${JSON.parse(item.c_akeneo_images)[0]}.jpg?sw=780&sh=780&sm=fit&sfrm=png`
            let stockCount = item.inventory.ats


            let oldSizeList = pData.sizes;
            let sizeList = [];
            let inStock = false;

            for (let variant of item.variants) {
                if (variant.orderable) {
                    let size = variant.variation_values.size.trim();
                    sizeList.push(size)
                    if (!oldSizeList.includes(size))
                        inStock = true;
                }
            }


            if (stockCount > 0 && item.inventory.orderable) {
                if (inStock) {
                    postRestockWebhook(`https://www.snipes.com/p/Tachyon_Monitors-${sku}.html`, title, sizeList.join("\n"), stockCount.toString(), price, image);
                    console.log(`[SNIPESEU] Sizes Increased! SKU: ${sku}, Proxy: ${proxy}`);
                    // console.log(item.fulfillment.shipping_options.services);
                }
                PRODUCT_DATA[sku].sizes = sizeList;
                database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            } else {
                // if (oldSizeList.length !== ) {
                //     console.log(`[SNIPESEU] Sizes Lowered! SKU: ${sku}, Proxy: ${proxy}`)
                //     PRODUCT_DATA[sku].status = 'OUT_OF_STOCK';
                //     await database.query(`update ${DATABASE_TABLE} set last='${JSON.stringify(sizeList)}' where sku='${sku}'`);
                // }
            }

        }
        // console.log("Response: " + (Date.now() - time) + "ms")

        await helper.sleep(WAITTIME);
        monitor(listIndex)
    }).catch(async err => {
        console.log("********************SNIPESEU-ERROR********************")
        console.log("SKUs: " + list);
        console.log("Proxy: " + proxy);
        console.log(err);
        await helper.sleep(150);
        monitor(listIndex)
    });
}

async function postRestockWebhook(url, title, sizes, stock, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.snipes.com', '', 'https://www.snipes.com')
        .addField("**Type**", "Restock", true)
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Snipes-EU | v1.0 • " + helper.getTime(true) + ' | by Tachyon Monitors', 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
            removeFromList(sku);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCT_DATA[sku] = {
            sizes: []
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '[]')`);
        if (!pushToList(sku)) {
            console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
            monitor(LISTS.length - 1);
        }
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
                    await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    removeFromList(sku);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCT_DATA[sku] = {
                    sizes: []
                }
                await database.query(`insert into ${DATABASE_TABLE}(sku, last) values('${sku}', '[]')`);
                if (!pushToList(sku)) {
                    console.log("LENGTH:::::::::::::::::::: " + LISTS.length)
                    monitor(LISTS.length - 1);
                }
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********SNIPESEU-SKU-ERROR*********");
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
        let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
        const embed = new Discord.MessageEmbed();
        embed.setTitle("SNIPESEU Monitor");
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
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}