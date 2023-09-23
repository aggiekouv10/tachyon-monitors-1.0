const Hawk = require('hawk');
const fetch = require('node-fetch');
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid');
const HTMLParser = require('node-html-parser');
class MeshMonitor {

    discordWebhook
    CHANNEL

    DATABASE_TABLE
    totalData = 0
    errors

    SITE
    URL

    RELEASES = []
    RELEASES_WAITTIME;

    constructor(SITE, URL, DATABASE_TABLE, discordWebhook, CHANNEL) {
        this.SITE = SITE;
        this.URL = URL;
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
            // console.log(msg.content)
            if (msg.channel.id !== proxyThis.CHANNEL)
                return;
            if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
                proxyThis.RELEASES = [];
                msg.reply("Resetted!")
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
        let proxy = helper.getRandomMeshProxy();
        let query = await database.query(`SELECT * from ${this.DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length === 0)
            return;
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(sku).then(async response => {
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
                console.log("********************MESH-ERROR********************")
                console.log("Site: " + this.SITE)
                console.log("SKU: " + sku);
                console.log("Proxy: " + proxy);
                console.log("Code: " + response.status);
                console.log("Response: " + body)
                if (this.errors > 10) {
                    console.log("--------------------------MESH-OVER------------------------")
                    console.log("Site: " + this.SITE)
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
                console.log("********************MESH-ERROR********************")
                console.log("Site: " + this.SITE)
                console.log("SKU: " + sku);
                console.log("Proxy: " + proxy);
                console.log(err);
                console.log(body)
                this.monitor(sku);
                return;
            }
            let root = HTMLParser.parse(body);
            let sizes = '';
            let sizeList = [];
            let oldSizeList = JSON.parse(query.rows[0].sizes);
            let inStock = false;
            let name = root.querySelector('.EKabf7.R_QwOV').textContent
            let price = root.querySelector('.uqkIZw.ka2E9k.uMhVZi.FxZV-M.z-oVg8.weHhRC.ZiDB59').textContent
            let image = root.querySelector('.KVKCn3.u-C3dd.jDGwVr.mo6ZnF.KLaowZ img').attributes.src

            if(document.querySelector('._7Cm1F9.ka2E9k.uMhVZi.FxZV-M.z-oVg8.weHhRC')){
                for (let size of document.querySelectorAll('.QaEXqt.JT3_zV._0xLoFW._78xIQ-.EJ4MLB:not(.nXkCf3 .u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8.nXX-zf)')) {
                  sizes += size.textContent.trim() + '\n';
                  sizeList.push(size.textContent);
                  if (!oldSizeList.includes(size.textContent))
                    inStock = true;
                }
            }else{
              if (document.querySelector('.in-stock-msg'))
              size = 'one size'
              sizeList.push(size)
              if (!oldSizeList.includes(size))
                    inStock = true;
                    sizes = 'One Size'
            }
            if (inStock) {
                postRestockWebhook(SiteURL, discordWebhook, url, name, price, image, sku);
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
        // console.log(header)

        let start = Date.now()
        // console.log("FETCHING..")
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${this.URL}/men/?activation_date`).then(async response => {
            let body = await helper.getBodyAsText(response)
            this.totalData += ((body.length * 1) / 1000000);
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
                body = await response.text();
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
            let root = HTMLParser.parse(body);
            let products = root.querySelectorAll('.qMZa55.SQGpu8.iOzucJ.JT3_zV.DvypSJ');
            for (let product of products) {
              if(product.querySelector('h3')) {
              let name = product.querySelector('h3').textContent
              if (!PRODUCTS.includes(name)) {
                PRODUCTS.push(name)
                if (justStarted) {
                  continue;
                }
                if(product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL')) {
                  if(product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.includes(site) === true) {
                    let url = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
                    let discount = product.querySelector('.VnVJx_.ka2E9k.uMhVZi.dgII7d.z-oVg8.pVrzNP.DJxzzA.FCIprz.thcXNJ.WCjo-q').textContent
                    let price =  product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL').textContent + `/${discount}`
                    let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
                    let image = product.querySelector('img').attributes.src
                    postRestockWebhook(url, name, price, image, sku)
                  }else{
                    let url = site + product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
                    let discount = product.querySelector('.VnVJx_.ka2E9k.uMhVZi.dgII7d.z-oVg8.pVrzNP.DJxzzA.FCIprz.thcXNJ.WCjo-q').textContent
                    let price =  product.querySelector('.u-6V88.ka2E9k.uMhVZi.dgII7d.z-oVg8._88STHx.cMfkVL').textContent + `/${discount}`
                    let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
                    let image = product.querySelector('img').attributes.src
                    postRestockWebhook(url, name, price, image, sku) 
                  }
            }else {
              if(product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.includes(site) === true) {
                let url = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
                let price = product.querySelector('.u-6V88.ka2E9k.uMhVZi.FxZV-M.z-oVg8.pVrzNP.cMfkVL').textContent
                let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
                let image = product.querySelector('img').attributes.src
                postRestockWebhook(url, name, price, image, sku)
              }else {
                let url = site + product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href
                let price = product.querySelector('.u-6V88.ka2E9k.uMhVZi.FxZV-M.z-oVg8.pVrzNP.cMfkVL').textContent
                let sku = product.querySelector('.VfpFfd.g88eG_.oHRBzn.LyRfpJ._LM.JT3_zV.g88eG_').attributes.href.split('-').slice(-2).join('-').replace('.html','')
                let image = product.querySelector('img').attributes.src
                postRestockWebhook(url, name, price, image, sku)
              }
            }
              }
            }else{
              continue;
            }
            }


            await helper.sleep(this.RELEASES_WAITTIME);
            this.monitorReleases()
        }).catch(async err => {
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + this.SITE)
            console.log("Proxy: " + proxy);
            console.log(err);
            await helper.sleep(150);
            this.monitorReleases(initial)
        });
    }
}

async function postRestockWebhook(SiteURL, discordWebhook, url, name, price, image, sku) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(name)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Mesh | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    if(SiteURL === 'https://www.jdsports.sg') {
        (new webhook.Webhook('https://discord.com/api/webhooks/855152437673197608/H53ueOfOUZFLJcfj72Tg_dtSpElbBjzcI3v9P14BkkVewg_jZGi-af7qB91Pxd69bdoM')).send(webhookMessage)
    }
    if(SiteURL === 'https://www.jdsports.my') {
        (new webhook.Webhook('https://discord.com/api/webhooks/855152500697333780/qdG8p0cPmH3dZjU4TVJx_hGeTMCuWO7h5YP1d4Ln-8J-j6LLjNO5Wb3IjNhrmt7nb3O6')).send(webhookMessage)
    }
}

async function postReleaseWebhook(SiteURL, discordWebhook, url, name, price, image, sku) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(name)
        .setURL(url)
        .setAuthor(SiteURL, '', SiteURL)
        .addField("**Stock**", "New Product!", true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Mesh | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
    if(SiteURL === 'https://www.jdsports.sg') {
        (new webhook.Webhook('https://discord.com/api/webhooks/855152437673197608/H53ueOfOUZFLJcfj72Tg_dtSpElbBjzcI3v9P14BkkVewg_jZGi-af7qB91Pxd69bdoM')).send(webhookMessage)
    }
    if(SiteURL === 'https://www.jdsports.my') {
        (new webhook.Webhook('https://discord.com/api/webhooks/855152500697333780/qdG8p0cPmH3dZjU4TVJx_hGeTMCuWO7h5YP1d4Ln-8J-j6LLjNO5Wb3IjNhrmt7nb3O6')).send(webhookMessage)
    }
}

module.exports = MeshMonitor;