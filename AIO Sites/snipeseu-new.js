const fs = require('fs');
const HTMLParser = require('node-html-parser');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const database = require('../database/database')
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SNIPESEU);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { url } = require('inspector');
const randomUseragent = require('random-useragent');
const DATABASE_TABLE = 'snipeseu';
const SITENAME = 'SNIPESEU'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
let totalData = 0;
let request = 0;

startMonitoring();
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.sku);
    }
    console.log("[SNIPES EU] Started monitoring all SKUs!")
}

async function monitor(sku) {
    let url = `https://www.snipes.com/p/tachyon-${sku}.html`
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;
    request++;
    let proxy = helper.getRandomDDProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    fetch(`https://www.snipes.com/s/snse-DE-AT/dw/shop/v19_5/products/(${sku})?client_id=cf212f59-94d1-4314-996f-7a11871156f4&cache=${v4()}&locale=de-DE&expand=availability,+prices,+promotions,+variations`, {
        'headers': {
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
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
        body = JSON.parse(body);
        if(body.count === 0) {
            await helper.sleep(query.rows[0].waittime);
            monitor(sku)
            return
            }
        body = body.data[0]
        if(body.inventory.ats > 0 && body.inventory.orderable == true) {
        let title = body.name;
        let price = body.c_akeneo_wwsprice[0]
        let image = `https://www.snipes.com/dw/image/v2/BDCB_PRD/on/demandware.static/-/Sites-snse-master-eu/default/dwb94c64eb/${JSON.parse(body.c_akeneo_images)[0]}.jpg?sw=780&sh=780&sm=fit&sfrm=png`
        let stock = body.inventory.ats
        let sizes = '';
        let variants = '';
        let sizeList = [];
        let oldSizeList = query.rows[0].sizes;
        let inStock = false;
        let sizesparse = body.variants
        for (let size of sizesparse) {
            if (size.orderable === true) {
                variants += `${size.product_id.trim()}\n`
                sizes += `[${size.variation_values.size}](https://www.snipes.com/p/tachyon-${size.product_id}.html)` + '\n';
                sizeList.push(size.variation_values.size);
                if (!oldSizeList.includes(size.variation_values.size)) {
                    inStock = true;
                }
            }
        }
        await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        if (inStock) {
            postRestockWebhook(url, title, sku, price, image, stock, variants, sizes);
        }
    }
        if (query.rows.length > 0) {
            setTimeout(function () {
                monitor(sku);
            }, query.rows[0].waittime);
        }
    }).catch(err => {
        console.log(err)
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, stock, variants, sizes) {
    let burst = `[Burst](http://localhost:4000/qt?st=snipes&p=https://www.snipes.com/p/${sku}.html)\n`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.snipes.com/p/${sku}.html)\n`
    let ganesh = `[Ganesh](https://ganeshbot.com/api/quicktask?STORE=SNIPES&PRODUCT=${sku}&SIZE=ANY)`
    let fr = `[FR](https://www.snipes.fr/p/${sku}.html) . `
    let be = `[BE](https://www.snipes.be/p/${sku}.html) . `
    let ch = `[CH](https://www.snipes.ch/p/${sku}.html) . `
    let nl = `[NL](https://www.snipes.nl/p/${sku}.html)\n`
    let it = `[IT](https://www.snipes.it/p/${sku}.html) . `
    let es = `[ES](https://www.snipes.es/p/${sku}.html) . `
    let at = `[AT](https://www.snipes.at/p/${sku}.html)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.snipes.com', '', 'https://www.snipes.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizes, true)
        .addField("**Varients**", variants, true)
        .addField(" ", ' ')
        .addField("**QT**", burst + flare + ganesh, true)
        .addField("**Links**", fr + be + ch + nl + it + es + at, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("SNIPES EU | v2.1 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
        monitor(sku);
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === discordBot.channels.SNIPESEU) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Offspring Monitor");
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
                database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '', ${waitTime})`);
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
    }
})


