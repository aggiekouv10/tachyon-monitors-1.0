const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTCAPRE);
const mikeWebhook = new webhook.Webhook('https://discord.com/api/webhooks/847650846648434709/HQPhLOzBzWeRZdmCnhVg0BF2ndxQByt5yAcxRNV7r8rvFz2vplZr4N-SQ0LZ9TO76jOE');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912558404617244743/ACZY-c5Nspv3OK78YCCB1dO7uxyVMxqsFv4n2YSNc3oC06gWb3ETtV17tzTJh8o-IMnl');
const prestonhook = new webhook.Webhook('https://discordapp.com/api/webhooks/901740628684177419/ECe7qHq4GeqKU_LFlFKhSJX3fu8vsjbUxOal6mTegLPE_UHUkljPu98Ay8Bm5JAxZ2di');
const bandithook = new webhook.Webhook('https://discord.com/api/webhooks/904868570532556902/hwCCOwUS3rTrkGN-lDPwr9l0Ke79v_WATEqKHnakC4hPUtDb9lHWZQx-UQLRcwq2iRKn');
const archook = new webhook.Webhook('https://discord.com/api/webhooks/905265644453384222/zziZzLI6neiU7uuuB9ehwATzKMdrm_Nsf3FT1pXwtifrXs_Rjub4cTb1T2nc7ve89OqE');
const luminous = new webhook.Webhook('https://discord.com/api/webhooks/909327577938812979/dALtsbDTgkewaT9Xv-6S3r0BlBh9Zg_z_JA7mdcOww8T8xN_s029n2FnEb2fNbC_oQW7');
const fakehook = new webhook.Webhook('https://discord.com/api/webhooks/909993848103649320/Idiglyzb3j2SOfDSKDDK8UzZbkx6HZOpFH3xge-NsQR7c80nAMhUDjA3w3sqi3m6NADQ');
const CHANNEL = discordBot.channels.WALMARTCAPRE;
const helper = require('../helper');
const DATABASE_TABLE = 'walmartcapre';
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
        monitor(row.sku, true);
    }
    console.log('[Walmart-CA Premonitor] Monitoring all SKUs!')
}
async function monitor(sku, launch) {
    if (launch) {
        await helper.sleep(helper.getRandomNumber(30, 90) * 1000)
    }
    let url = `https://www.walmart.ca/en/ip/${sku}`;
    let proxy = helper.getMixedRotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    fetch(`https://www.walmart.ca/en/ip/${sku}`, {
        'headers': {
            'user-agent': 'Android v18.15.1',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
        },
        agent: new HTTPSProxyAgent(proxy),
        timeout: 2000
    }).then(async response => {
        console.log("[WALMART-CA preload] ", response.status, sku, proxy)
        if (response.status !== 200) {
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response)
        let itemData = body.split("window.__PRELOADED_STATE__=")[1].split(";</script>")[0]
        itemData = JSON.parse(itemData)
        let status = productCache.status
        if (itemData.pipLite === true) {
            let title = itemData.product.item.name.en;
            sku = itemData.product.item.skus[0];
            console.log(itemData.entities.skus[sku].images[0].thumbnail.url)
            let image = itemData.entities.skus[sku].images[0].thumbnail.url;
            let price = 'NA'
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image);
                console.log(`[Walmart-CA Premonitor] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[Walmart-CA Premonitor] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        await helper.sleep(helper.getRandomNumber(10, 15) * 60 * 1000);
        monitor(sku);
    }).catch(async err => {
        console.log("***********Walmart-CA Premonitor-ERROR***********");
        console.log("SKU: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
    });
}

async function postRestockWebhook(url, title, sku, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Walmart product loaded to drop!**", '')
        .addField("**Preload**", 'True', true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Time**", '11 PM EST - 1 AM EST', true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Walmart CA Preload | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    //discordWebhook.send(webhookMessage);
    //spacehook.send(webhookMessage);
    //prestonhook.send(webhookMessage);
    //bandithook.send(webhookMessage);
    //archook.send(webhookMessage);
    //luminous.send(webhookMessage);
    //fakehook.send(webhookMessage);
    //MIKEpostRestockWebhook(url, title, sku, price, image)
}
async function MIKEpostRestockWebhook(url, title, sku, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Forbidden Monitors")
        .setColor("#DA4453")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.ca', '', 'https://www.walmart.ca')
        .addField("**Walmart product loaded to drop!**", '')
        .addField("**Preload**", 'True', true)
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630")
        .setFooter("Walmart CA Preload | v1.0 by Tachyon • " + helper.getTime(true), 'https://media.discordapp.net/attachments/643508445047423013/830971179727585280/forbiddenLogo.png?width=630&height=630')
    mikeWebhook.send(webhookMessage);
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
                console.log("*********Walmart-CA Premonitor-SKU-ERROR*********");
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
            embed.setTitle(`Walmart-CA Premonitor Monitor`);
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