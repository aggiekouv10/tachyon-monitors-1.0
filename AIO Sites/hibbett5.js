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
const genCookie = require('./hibbett/px-payload');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.HIBBETT5);
const tachyonhook = new webhook.Webhook('https://discord.com/api/webhooks/902728303637577738/yE9eRI2rn-WUXRUXhy3CUrvu8DOXf-vGYOaRI3M1wSXIa70VkHHttyz4a8JVfNPNxuOP');
//const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/969379470081417256/TDL4We-9VubDyXbGOMXpcBZ8Jqq0C525e14dvT0jA1S54BJdC54CuKTbfIgT6cje9GGq');
//const space = new webhook.Webhook('https://discord.com/api/webhooks/975536702254907483/eshc0_AmE9jO6apqwocw32GE0yH6gdePKceSvkTXLuMgUlLD8BxB-g9Yst1Nizwxhhq1');
//const drop = new webhook.Webhook('https://discord.com/api/webhooks/915337547952042014/ZBJX_qOJLZggH2HtQrmTu8NXFmLak33vkPadKIbPnELWj4hNNnVPusBmVgPZtbpreMAL');
const elephent = new webhook.Webhook('https://discord.com/api/webhooks/993227634353909790/QpfnMhYZywotKvAzaaiP7GrT_gpEjPHrSHpNYh-TrZ2qiqhvDAHiZZH1UnbsTMEzmwE7');
//const carbon = new webhook.Webhook('https://discord.com/api/webhooks/834236640792543263/w0zKq3zHgAfPEBMCg59uWJz6R7wnTyRaLWzqmViYm3eNq9b86PilLzdye-0rcePkdUic')
const cookology = new webhook.Webhook('https://discord.com/api/webhooks/709983906560213023/nz4Rm_skf5ngz73M-pvw-SeZe3PhesWlxXT4kFiUGUNiHopOfmhrR6y6wwVUNvHIWWxe')
//const Flipd = new webhook.Webhook('https://discord.com/api/webhooks/1012937038888181862/nB3NBrh6QuniCri0u7ZGaUt1lTzNL3eHydEUEF33iE6EPIxsBfzRIgxTYhemuFdUY4Bj')
const helper = require('../helper');
const { v4 } = require('uuid');
const { cookie } = require('request');
const DATABASE_TABLE = 'hibbett5';
const SITENAME = 'HIBBETT5'
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
    console.log('[HIBBETT] Monitoring all SKUs!')
}


async function monitor(sku) {
    let proxy = 'http://190.2.140.41:30914'
    //let cookie = await genCookie(await helper.getRandomDDProxy())
    //console.log(cookie)
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    //console.log("Requesting", Date.now())
    //stats.total++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000)
    let agent = await randomUseragent.getRandom()
    await fetch(`https://hibbett-mobileapi.prolific.io/ecommerce/products/${sku}`, {
        'headers': {
            'X-PX-AUTHORIZATION': `1`,
            'x-px-bypass-reason': 'The%20certificate%20for%20this%20server%20is%20invalid.%20You%20might%20be%20connecting%20to%20a%20server%20that%20is%20pretending%20to%20be%20%E2%80%9Cpx-conf.perimeterx.net%E2%80%9D%20which%20could%20put%20your%20confidential%20information%20at%20risk.',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        },
        agent: await new HTTPSProxyAgent(proxy),
        signal: controller.signal,
    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        let body = await helper.getBodyAsText(response)
        console.log(body)
        if (response.status !== 200) {
            //console.log('nooo')
            //stats.success++;
            monitor(sku);
            return
        }
        body = await JSON.parse(body)
        let title = body.name
        let price = body.price
        let parse = body.imageIds[0]
        let image = body.imageResources[parse][0].url
        let url = `https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}#Tachyon`
        let sizes = []
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        let oldSizeList = query.rows[0].sizes
        let inStock = false
        let sizeList = []
        let variants = body.skus
        let count = 0
        let sizevar = ''
        for (let variant of variants) {
            if (variant.size.includes('.')) {
                sizevar = `00${variant.size.replace('.', '')}`
            } else {
                if (variant.size.length > 2) {
                    sizevar = `0${variant.size}0`
                } else {
                    sizevar = `00${variant.size}0`
                }
            }
            if (variant.isAvailable === true) {
                sizes += `[${variant.size}](https://www.hibbett.com/product?pid=${sku}&dwvar_${sku}_size=${sizevar}&dwvar_${sku}_color=${variant.color.id}) - ${variant.id}\n`
                count++
                sizeList.push(variant.id);
                if (!oldSizeList.includes(variant.id))
                    inStock = true;
            }
        }
        let sizeright = sizes.split('\n')
        let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
        if (inStock) {
            postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, count)
            //dropPosthook(url, title, sku, price, image, sizeright, sizeleft, count)
            postcopbox(url, title, sku, price, image, sizeright, sizeleft, count)
            //postCarbonhook(url, title, sku, price, image, sizeright, sizeleft, count)
            cookologyhook(url, title, sku, price, image, sizeright, sizeleft, count)
            //Flipdhook(url, title, sku, price, image, sizeright, sizeleft, count)
            //postElphent(sku, title, image)
            inStock = false;
            await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
        }

        // console.log(Date.now() - time)
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.type === 'aborted') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        if (err.type === 'request') {
            //console.log("[HIBBETT] Timeout - " + sku, proxy)
            monitor(sku);
            return;
        }
        //console.log("***********HIBBETT-ERROR***********");
        //console.log("SKU: " + sku);
        //console.log("Proxy: " + proxy);
        //console.log(err);
        monitor(sku)
    });
}

async function postElphent(sku, title, image) {
    const options = {
        method: 'POST',
        url: 'https://cloudapii.herokuapp.com/hibbett',
        headers: { 'Content-Type': 'application/json' },
        body: {
            mode: '1',
            sku: sku,
            title: title,
            picture: image,
        },
        json: true
    };

    request(options, function (error) {
        if (error) throw new Error(error);
    });
}

async function postRestockWebhook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
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
        .setFooter("Hibbett | v5.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    tachyonhook.send(webhookMessage)
   // synthiysis.send(webhookMessage)
    //space.send(webhookMessage)
}

async function cookologyhook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cookology")
        .setColor("#7557c8")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/894983430952063047/894983493984088084/Group_41.png")
        .setFooter("Hibbett by Tachyon | v5.0 " + helper.getTime(true), 'https://media.discordapp.net/attachments/894983430952063047/894983493984088084/Group_41.png')
    cookology.send(webhookMessage);
}

async function postcopbox(url, title, sku, price, image, sizeright, sizeleft, count) {

    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cop Box")
        .setColor("#cd8fff")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg")
        // .setTime()
        .setFooter("Hibbett by Tachyon | v5.0 " + helper.getTime(true), 'https://media.discordapp.net/attachments/804617985498546177/989026781023580190/Frame_1.jpg')
    elephent.send(webhookMessage);
}

async function dropPosthook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#eb6339")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
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
        .setFooter("Hibbett by Tachyon | v5.0 • " + helper.getTime(true), 'https://cdn.discordapp.com/attachments/973659244723310643/983215242668539934/win.png')
    drop.send(webhookMessage)
}

async function postCarbonhook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Carbon")
        .setColor("#04f5ff")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/998307425536983182/1000495532625645728/unknown.png")
        // .setTime()
        .setFooter("Hibbett by Tachyon | v5.0 • " + helper.getTime(true), 'https://cdn.discordapp.com/attachments/998307425536983182/1000495532625645728/unknown.png')
    carbon.send(webhookMessage)
}

async function Flipdhook(url, title, sku, price, image, sizeright, sizeleft, count) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Flipd")
        .setColor("#42e2c0")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .addField("**Stock**", count + '+', true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizeleft.join('\n'), true)
        .addField("**Sizes**", sizeright.join('\n'), true)
        .addField(" ", " ", true)
        //.addField("QT", flare + polar, true)
        //.addField("Links", fr + it + de + gb + pl + es, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/927970321062055997/1011285624986271754/profilepic.jpg?width=601&height=601")
        // .setTime()
        .setFooter("Hibbett by Tachyon | v5.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/927970321062055997/1011285624986271754/profilepic.jpg?width=601&height=601')
    Flipd.send(webhookMessage)
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
                console.log("*********HIBBETT-SKU-ERROR*********");
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
            embed.setTitle(`HIBBETT Monitor`);
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