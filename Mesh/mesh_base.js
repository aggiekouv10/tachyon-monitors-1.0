const Hawk = require('hawk');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');
const { default: axios } = require('axios');
const slapphook = new webhook.Webhook('https://discord.com/api/webhooks/893713995972874292/sop0RH137XixG3TP3_0qCnZnq7dKEr8M9Xdxaem87twEo6qy1RDgsAzUAeZLgLsdVSIv')
const jwhooksg = new webhook.Webhook('https://discord.com/api/webhooks/901473219410800640/I64rKsLKghg2Cg9lozMQUBCVxhC19XPwYJ590V6EKxKjGV9BedCURspUZZT0vdAoQjzl')
const jwhookmy = new webhook.Webhook('https://discord.com/api/webhooks/901473462361661510/NazH8OeLu5rJd5F_goUgWGTz-kJb9NypfRGx9tnaaEIq2jX-nlrllR2zvzTQbn_vnW65')
class MeshMonitor {

    discordWebhook
    CHANNEL

    DATABASE_TABLE
    totalData = 0
    errors

    SITE
    URL
    credentials
    API_KEY

    RELEASES = []
    RELEASES_WAITTIME;

    constructor(SITE, URL, credentials, API_KEY, DATABASE_TABLE, discordWebhook, CHANNEL) {
        this.SITE = SITE;
        this.URL = URL;
        this.credentials = credentials;
        this.API_KEY = API_KEY;
        this.DATABASE_TABLE = DATABASE_TABLE;
        this.discordWebhook = new webhook.Webhook(discordWebhook);
        this.CHANNEL = CHANNEL;
    }

    async initiate(discordBot, RELEASES_WAITTIME = 15000) {
        this.initiateCommands(discordBot);

        this.RELEASES_WAITTIME = RELEASES_WAITTIME;
        this.RELEASES = [];
        this.monitorReleases(true)

        let SKUList = await database.query(`SELECT * from ${this.DATABASE_TABLE}`);
        for (let row of SKUList.rows) {
            // await helper.sleep(helper.getRandomNumber(1500, 3000));
            this.monitor(row.sku);
        }
        console.log(`[MESH] (${this.SITE}) Started monitoring all SKUs!`)
    }

    initiateCommands(discordBot) {
        // console.log("INTIATE")
        let proxyThis = this;
        discordBot.getClient.on('message', async function (msg) {
            if (msg.channel.id !== proxyThis.CHANNEL)
                return;

            if (!(msg.author.id === '768217432791318538' || msg.author.id === '811261153748975618')) {
                return
            }
            if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
                // proxyThis.RELEASES = [];
                msg.reply("Disabled!")
                return;
            }
            if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
                let args = msg.content.split(" ");
                if (args.length !== 3) {
                    discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
                    return;
                }
                let sku = args[1];
                let waitTime = args[2];
                let query = await database.query(`SELECT * from ${proxyThis.DATABASE_TABLE} where sku='${sku}'`);
                if (query.rows.length > 0) {
                    await database.query(`delete from ${proxyThis.DATABASE_TABLE} where sku='${sku}'`);
                    discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
                    return;
                }
                await database.query(`insert into ${proxyThis.DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
                proxyThis.monitor(sku);
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
                        let query = await database.query(`SELECT * from ${proxyThis.DATABASE_TABLE} where sku='${sku}'`);
                        if (query.rows.length > 0) {
                            await database.query(`delete from ${proxyThis.DATABASE_TABLE} where sku='${sku}'`);
                            notMonitoringSKUs.push(sku);
                            continue;
                        }

                        await database.query(`insert into ${proxyThis.DATABASE_TABLE}(sku, sizes, waittime) values('${sku}', '[]', ${waitTime})`);
                        proxyThis.monitor(sku);
                        monitoringSKUs.push(sku);
                    }
                    catch (err) {
                        errorSKUs.push(sku);
                        console.log("*********MESH-SKU-ERROR*********");
                        console.log("Site: " + proxyThis.SITE)
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
                if (msg.channel.id === proxyThis.CHANNEL) {
                    let query = await database.query(`SELECT * from ${proxyThis.DATABASE_TABLE}`);
                    const embed = new Discord.MessageEmbed();
                    embed.setTitle(`Mesh (${proxyThis.SITE}) Monitor`);
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
    }

    async monitor(sku) {
        //let pluses = ''
        //let random = Math.floor(Math.random() * 500 ) + 1
        //for (let i = 0; i < random; i++) {
        //    pluses += '&'
        //  }
        let proxy = helper.getRandomMeshProxy();
        let start_time = new Date().getTime();
        const requestOptions = {
            uri: `https://prod.jdgroupmesh.cloud/stores/${this.SITE}/products/${sku}?channel=iphone-app&expand=variations`,
            method: 'GET',
            headers: {},
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
        };        const { header } = Hawk.client.header(requestOptions.uri, 'GET', { credentials: this.credentials });
        requestOptions.headers["X-Request-Auth"] = header;
        requestOptions.headers["x-api-key"] = this.API_KEY

        let query = await database.query(`SELECT * from ${this.DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length === 0)
            return;

        let start = Date.now()
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(requestOptions.uri, requestOptions).then(async response => {
            let body = await helper.getBodyAsText(response)
            this.totalData += ((body.length * 1) / 1000000);
            if (response.status !== 200) {

                if (response.status === 404) {
                    if (query.rows.length > 0) {
                        await helper.sleep(query.rows[0].waittime);
                        this.monitor(sku);
                    }
                    return;
                }
                this.errors++;
                //console.log("********************MESH-ERROR********************")
                //console.log("Site: " + this.SITE)
                //console.log("SKU: " + sku);
                //console.log("Proxy: " + proxy);
                //console.log("Code: " + response.status);
                //console.log("Response: " + body)
                if (this.errors > 10) {
                    //console.log("--------------------------MESH-OVER------------------------")
                    //console.log("Site: " + this.SITE)
                    return;
                }
                this.monitor(sku);
                return;
            }
            this.errors = 0;
            
            try {
                body = JSON.parse(body);
            } catch (err) {
                if (body.includes('561 Proxy Unreachable')) {
                    console.log(`[MESH] (${this.SITE}) Proxy Fucking Unreachable - ` + sku + ' - ' + proxy);
                    this.monitor(sku);
                    return;
                }
                if (body.toLowerCase().includes('many requests') || response.status === 429) {
                    console.log(`[MESH] (${this.SITE}) 429, SKU: ` + sku);
                    await helper.sleep(450);
                    this.monitor(sku);
                    return;
                }
                //console.log("********************MESH-ERROR********************")
                //console.log("Site: " + this.SITE)
                //console.log("SKU: " + sku);
                //console.log("Proxy: " + proxy);
                //console.log(err);
                //console.log(body)
                this.monitor(sku);
                return;
            }
            console.log('Response time:', new Date().getTime() - start_time);
            let sizes = '';
            let ids = '';
            let sizeList = [];
            let oldSizeList = JSON.parse(query.rows[0].sizes);
            let inStock = false;
            let title = body.name;
            let price = body.price.currency + " " + body.price.amount
            let image = body.mainImage;
            let stock = 0
            for (let size in body.options) {
                if (body.options[size].stockStatus === 'IN STOCK') {
                    sizeList.push(size);
                    sizes += `${size}\n`;
                    ids += `${body.options[size].SKU}\n`
                    stock++
                    if (!oldSizeList.includes(size))
                        inStock = true;
                }
            }
            // Checks if its in timer
            // if (body.variantAttributes[0].displayCountDownTimer)
            //   inStock = false;
            if (inStock) {
                postRestockWebhook(this.URL, this.discordWebhook, this.URL + '/product/Tachyon-Monitors/' + sku, title, sku, sizes, ids, price, image, stock);
                await database.query(`update ${this.DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where sku='${sku}'`);
            }
            if (query.rows.length > 0) {
                await helper.sleep(query.rows[0].waittime);
                this.monitor(sku);
            }
        }).catch(async err => {
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + this.SITE)
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log(err);
            await helper.sleep(150);
            this.monitor(sku);
        });
    }

    async monitorReleases(initial) {
        let proxy = helper.getRandomMeshProxy();
        const requestOptions = {
            uri: `https://prod.jdgroupmesh.cloud/stores/${this.SITE}/products/search?bust=${v4()}&channel=iphone-app&facet:new=latest&fp_sort_order=latest&from=0&max=150&sort`,
            method: 'GET',
            headers: {},
            agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
            
        };

        const { header } = Hawk.client.header(requestOptions.uri, 'GET', { credentials: this.credentials });
        // console.log(header)
        requestOptions.headers["X-Request-Auth"] = header;
        requestOptions.headers["x-api-key"] = this.API_KEY

        let start = Date.now()
        // console.log("FETCHING..")
        axios(requestOptions.uri, requestOptions).then(async response => {
            let body = await response.data;
            // this.totalData += ((body.length * 1) / 1000000);
            if (response.status !== 200) {
                this.errors++;
                console.log("********************MESH-RELEASES-ERROR********************")
                console.log("Site: " + this.SITE)
                console.log("Proxy: " + proxy);
                console.log("Code: " + response.status);
                console.log("Response: " + body)
                if (this.errors > 10) {
                    console.log("--------------------------MESH-RELEASES-OVER------------------------")
                    console.log("Site: " + this.SITE)
                    return;
                }
                this.monitorReleases(initial);
                return;
            }
            this.errors = 0;
            try {
                body = JSON.parse(JSON.stringify(body));
            } catch (err) {
                if (body.includes('561 Proxy Unreachable')) {
                    console.log(`[MESH] (${this.SITE}) Proxy Fucking Unreachable - ` + sku + ' - ' + proxy);
                    this.monitorReleases(initial);
                    return;
                }
                if (body.toLowerCase().includes('many requests') || response.status === 429) {
                    console.log(`[MESH] (${this.SITE}) 429, SKU: ` + sku);
                    await helper.sleep(helper.getRandomNumber(300, 700));
                    this.monitorReleases(initial);
                    return;
                }
                console.log("********************MESH-ERROR********************")
                console.log("Site: " + this.SITE)
                console.log("Proxy: " + proxy);
                console.log(err);
                console.log(body)
                this.monitorReleases(initial)
                return;
            }

            for (let product of body.products) {
                let sku = product.SKU;
                let name = product.name;
                let price = product.price.amount + " (" + product.price.currency + ")";
                let image = product.mainImage;
                if (this.RELEASES.includes(sku))
                    continue;
                // console.log(name)
                this.RELEASES.push(sku);
                if (!initial) {
                    postReleaseWebhook(this.URL, this.discordWebhook, this.URL + '/product/Tachyon-Monitors/' + sku, name, sku, '', price, image);
                    console.log(`[${this.SITE}] Release - ${sku} - ${name}`)
                }
            }


            await helper.sleep(this.RELEASES_WAITTIME);
            this.monitorReleases()
        }).catch(async err => {
            if (err.response && err.response.status !== 200) {
                this.errors++;
                console.log("********************MESH-RELEASES-ERROR********************")
                console.log("Site: " + this.SITE)
                console.log("Proxy: " + proxy);
                console.log("Code: " + err.response.status);
                console.log(err.response.data)
                if (this.errors > 10) {
                    console.log("--------------------------MESH-RELEASES-OVER------------------------")
                    console.log("Site: " + this.SITE)
                    return;
                }
                this.monitorReleases(initial);
                return;
            }
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + this.SITE)
            console.log("Proxy: " + proxy);
            console.log(err);
            await helper.sleep(150);
            this.monitorReleases(initial)
        });
    }
}

async function postRestockWebhook(SiteURL, discordWebhook, url, title, sku, sizes, ids, price, image, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", stock.toString() + '+', true)
        .addField("**SKU**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes, true)
        .addField("**Pids**", '```\n' + ids + '```', true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Mesh | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    slapphook.send(webhookMessage);
    if (SiteURL === 'https://www.jdsports.sg') {
        // postMDTSRestockWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/855152437673197608/H53ueOfOUZFLJcfj72Tg_dtSpElbBjzcI3v9P14BkkVewg_jZGi-af7qB91Pxd69bdoM'), url, title, sku, sizes, price, image)
        postZAERestockWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/864814743754899476/3GzjTBQzXYy1HRv0SuM4d5gHmn49tTi6Ml8eJbiUHt-PGhbfrXwU1XmFkRtBJqziYGW-'), url, title, sku, sizes, price, image)
        jwhooksg.send(webhookMessage);
    }
    if (SiteURL === 'https://www.jdsports.my') {
        // postMDTSRestockWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/855152500697333780/qdG8p0cPmH3dZjU4TVJx_hGeTMCuWO7h5YP1d4Ln-8J-j6LLjNO5Wb3IjNhrmt7nb3O6'), url, title, sku, sizes, price, image)
        postZAERestockWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/864814627267018804/8vBliMaGMvenjJyHFvSgnujgX18yaYwEuAdDo03FbgZrsoiUhH70pMkSfWJCpU-e6XbD'), url, title, sku, sizes, price, image)
        jwhookmy.send(webhookMessage);
    }
}

async function postZAERestockWebhook(SiteURL, discordWebhook, url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("JDSports")
        .setColor("#ffd700")
        .setTitle(title)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes)
        .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/802094265844236318/859434021935513630/image0.jpg")
        .setTime()
        .setFooter("Mesh | v1.0 Powered by SNKRfied MY", 'https://cdn.discordapp.com/attachments/802094265844236318/859434021935513630/image0.jpg')
    discordWebhook.send(webhookMessage);
}


async function postReleaseWebhook(SiteURL, discordWebhook, url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "New Product!", true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku)
        // .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Mesh | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    if (SiteURL === 'https://www.jdsports.sg') {
        // postMDTSReleaseWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/855152437673197608/H53ueOfOUZFLJcfj72Tg_dtSpElbBjzcI3v9P14BkkVewg_jZGi-af7qB91Pxd69bdoM'), url, title, sku, sizes, price, image)
        postZaeReleaseWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/864814743754899476/3GzjTBQzXYy1HRv0SuM4d5gHmn49tTi6Ml8eJbiUHt-PGhbfrXwU1XmFkRtBJqziYGW-'), url, title, sku, sizes, price, image)
        jwhooksg.send(webhookMessage);
    }
    if (SiteURL === 'https://www.jdsports.my') {
        // postMDTSReleaseWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/855152500697333780/qdG8p0cPmH3dZjU4TVJx_hGeTMCuWO7h5YP1d4Ln-8J-j6LLjNO5Wb3IjNhrmt7nb3O6'), url, title, sku, sizes, price, image)
        postZaeReleaseWebhook(SiteURL, new webhook.Webhook('https://discord.com/api/webhooks/864814627267018804/8vBliMaGMvenjJyHFvSgnujgX18yaYwEuAdDo03FbgZrsoiUhH70pMkSfWJCpU-e6XbD'), url, title, sku, sizes, price, image)
        jwhookmy.send(webhookMessage);
    }
}

async function postMDTSReleaseWebhook(SiteURL, discordWebhook, url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Cook Vault")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "New Product!", true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku)
        // .addField("**Sizes**", sizes)
        .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/843548439626252288/860179704825118730/cookvault_logo_final.jpg?width=630&height=630")
        .setTime()
        .setFooter("Mesh | v1.0 by Tachyon", 'https://media.discordapp.net/attachments/843548439626252288/860179704825118730/cookvault_logo_final.jpg?width=630&height=630')
    discordWebhook.send(webhookMessage);
}

async function postZaeReleaseWebhook(SiteURL, discordWebhook, url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("JDSports")
        .setColor("#ffd700")
        .setTitle(title)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "New Product!", true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku)
        // .addField("**Sizes**", sizes)
        .addField("**Links**", '[More Monitors](https://discord.gg/y4ja7n5VSU)')
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/802094265844236318/859434021935513630/image0.jpg")
        .setTime()
        .setFooter("Mesh | v1.0 Powered by SNKRfied MY", 'https://cdn.discordapp.com/attachments/802094265844236318/859434021935513630/image0.jpg')
    discordWebhook.send(webhookMessage);
}

module.exports = MeshMonitor;