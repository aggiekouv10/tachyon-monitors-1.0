const Hawk = require('hawk');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.SIZEUK);
const CHANNEL = discordBot.channels.SIZEUK;
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');

const DATABASE_TABLE = 'sizeuk';
let totalData = 0;
let errors = 0;

const SITE = 'size';
const URL = 'https://www.size.co.uk/';
const credentials = {
    id: 'fbc28a16ec',
    key: 'd7c7872a58138c995430dd957b18c85b',
    algorithm: 'sha256'
};
const API_KEY = '9039BF1C29724461881ACD80232F5313';



startMonitoring();

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.sku);
    }
    console.log(`[MESH] (${SITE}) Started monitoring all SKUs!`)
}

async function monitor(sku) {
    let proxy = helper.getRandomMeshProxy();
    const requestOptions = {
        uri: `https://prod.jdgroupmesh.cloud/stores/${SITE}/products/${sku}?channel=iphone-app&expand=variations`,
        method: 'GET',
        headers: {},
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    };

    const { header } = Hawk.client.header(requestOptions.uri, 'GET', { credentials: credentials });
    // console.log(header)
    requestOptions.headers["X-Request-Auth"] = header;
    requestOptions.headers["x-api-key"] = API_KEY

    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;

    let start = Date.now()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(requestOptions.uri, requestOptions).then(async response => {
        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        if (response.status !== 200) {
            errors++;
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + SITE)
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log("Code: " + response.status);
            console.log("Response: " + body)
            if (errors > 5) {
                console.log("--------------------------MESH-OVER------------------------")
                console.log("Site: " + SITE)
                return;
            }
            monitor(sku);
            return;
        }
        errors = 0;
        try {
            body = JSON.parse(body);
        } catch (err) {
            if (body.includes('561 Proxy Unreachable')) {
                console.log(`[MESH] (${SITE}) Proxy Fucking Unreachable - ` + sku + ' - ' + proxy);
                monitor(sku);
                return;
            }
            if (body.toLowerCase().includes('many requests') || response.status === 429) {
                console.log(`[MESH] (${SITE}) 429, SKU: ` + sku);
                setTimeout(function () {
                    monitor(sku);
                }, helper.getRandomNumber(300, 700));
                return;
            }
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + SITE)
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            console.log(body)
            monitor(sku);
            return;
        }

        let sizes = '';
        let sizeList = [];
        let oldSizeList = JSON.parse(query.rows[0].sizes);
        let inStock = false;
        let title = body.name;
        let price = body.price.currency + " " + body.price.amount
        let image = body.mainImage;
        for (let size in body.options) {
            if (body.options[size].stockStatus === 'IN STOCK') {
                sizeList.push(size);
                sizes += size + "\n";
                if (!oldSizeList.includes(size))
                    inStock = true;
            }
        }
        // Checks if its in timer
        // if (body.variantAttributes[0].displayCountDownTimer)
        //   inStock = false;
        if (inStock) {
            postRestockWebhook(URL + '/product/Tachyon-Monitors/' + sku, title, sku, sizes, price, image);
            await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        }
        if (query.rows.length > 0) {
            setTimeout(function () {
                monitor(sku);
            }, query.rows[0].waittime);
        }
    }).catch(err => {
        console.log("********************MESH-ERROR********************")
        console.log("Site: " + SITE)
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        setTimeout(function () {
            monitor(sku);
        }, 150);
    });
}

async function postRestockWebhook(url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor(URL, '', URL)
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Mesh | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
                    await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }

                await database.query(`insert into ${DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
                monitor(sku);
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********MESH-SKU-ERROR*********");
                console.log("Site: " + SITE)
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
            embed.setTitle(`Mesh (${SITE}) Monitor`);
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