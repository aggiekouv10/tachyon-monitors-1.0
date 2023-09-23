const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const randomUseragent = require('random-useragent');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const HTMLParser = require('node-html-parser');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.DSG);
const space = new webhook.Webhook('https://discord.com/api/webhooks/975537409905295370/Od-_UXCJvQMchrgbjPqIiz20GjP4c1SaSMmAGKeRiyLYC6-Q6s-R7xO0QkPYyeWtiJLA');
const helper = require('../helper');
const { v4 } = require('uuid');
const DATABASE_TABLE = 'dsg2';
const SITENAME = 'DSG'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.AIO
let PRODUCTS = {}
//et stats;
let totalData = 0;
startMonitoring();

async function startMonitoring() {
    //stats = await helper.manageStats(SITENAME)
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            sizes: row.sizes,
        }
        monitor(row.sku);
        // break;
    }
    console.log('[DSG2] Monitoring all SKUs!')
}


async function monitor(sku) {
    let proxy = helper.getRandomDDProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    //console.log("Requesting", Date.now())
    //stats.total++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://www.dickssportinggoods.com/p/spring/msvc/product/v5/store/15108/products/${sku}?abcz=${v4()}`, {
        'headers': {
            'User-Agent': randomUseragent.getRandom(),
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            //stats.success++;
            monitor(sku);
            return
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let title = body.data.title
        let image = `https://dks.scene7.com/is/image/GolfGalaxy/${body.data.id}_${body.data.skus[0].defAttributes[0].swatchImage.replace('_swatch', '')}`
        let url = 'https://www.dickssportinggoods.com' + body.data.pdpSeoUrl
        let price = "$" + body.data.price.maxOffer
        let vars = body.data.skus
        let stock = 0
        let sizes = []
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        for (let size of vars) {
            if (size.atsInventory > 0 && size.defAttributes[1].value.trim().length > 0) {
                sizes += `${size.defAttributes[1].value.trim()} (${size.atsInventory}) - ${size.id} \n`;
                stock += size.atsInventory
                sizeList.push(size.id);
                if (!oldSizeList.includes(size.id))
                    inStock = true;
            }
        }
        sizes = sizes.split('[object Object],').join('').replace('[object Object]', '')
        let sizeright = sizes.trim().split('\n')
        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
        if (sizeleft.length < 1)
            sizeright = ['-']
        if (inStock) {
                postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock)
                //dropPosthook(url, title, sku, price, image, sizeright, sizeleft, stock)
                inStock = false;
                await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
        // console.log(Date.now() - time)
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.type === 'aborted') {
            //console.log("[DSG2] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[DSG2] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        console.log("***********DSG2-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    let fr = `[FR](https://www.asos.com/fr/tachyon/prd/${sku}) . `
    let it = `[IT](https://www.asos.com/it/tachyon/prd/${sku}) . `
    let de = `[DE](https://www.asos.com/de/tachyon/prd/${sku})\n`
    let gb = `[GB](https://www.asos.com/gb/tachyon/prd/${sku}) . `
    let pl = `[PL](https://www.asos.com/pl/tachyon/prd/${sku}) . `
    let es = `[ES](https://www.asos.com/es/tachyon/prd/${sku})`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.asos.com/gb/tachyon/prd/23600038)\n`
    let polar = `[PolarCop](https://qt.polarcop.com/asos?pid=https://www.asos.com/gb/tachyon/prd/23600038)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.dickssportinggoods.com', '', 'https://www.dickssportinggoods.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("DSG | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    space.send(webhookMessage)
}

async function dropPosthook(url, title, sku, price, image, sizeright, sizeleft, stock) {
    let fr = `[FR](https://www.asos.com/fr/tachyon/prd/${sku}) . `
    let it = `[IT](https://www.asos.com/it/tachyon/prd/${sku}) . `
    let de = `[DE](https://www.asos.com/de/tachyon/prd/${sku})\n`
    let gb = `[GB](https://www.asos.com/gb/tachyon/prd/${sku}) . `
    let pl = `[PL](https://www.asos.com/pl/tachyon/prd/${sku}) . `
    let es = `[ES](https://www.asos.com/es/tachyon/prd/${sku})`
    let flare = `[Flare](http://127.0.0.1:5559/quicktask?product=https://www.asos.com/gb/tachyon/prd/23600038)\n`
    let polar = `[PolarCop](https://qt.polarcop.com/asos?pid=https://www.asos.com/gb/tachyon/prd/23600038)`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Drop Alert")
        .setColor("#eb6339")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.dickssportinggoods.com', '', 'https://www.dickssportinggoods.com')
        .addField("**Stock**", stock + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/973659244723310643/983215242668539934/win.png")
        // .setTime()
        .setFooter("DSG | v3.0 • " + helper.getTime(true), 'https://cdn.discordapp.com/attachments/973659244723310643/983215242668539934/win.png')
    drop.send(webhookMessage)
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
                console.log("*********DSG2-SKU-ERROR*********");
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
            embed.setTitle(`DSG2 Monitor`);
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
            embed.setTitle(`Hibbett Monitor Times`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`Hibbett Monitor Times`);
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
            embed.setTitle(`Hibbett Monitor Statuses`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`Hibbett Monitor Statuses`);
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