const fetch = require('node-fetch');
const database = require('../../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const helper = require('../../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const moment = require('moment');
const { v4 } = require('uuid');
const { default: axios } = require('axios');

class SnkrsMonitor {

    discordWebhook
    CHANNEL

    DATABASE_TABLE
    totalData = 0
    errors

    MARKETPLACE
    CHANNELID
    LANGUAGE

    RELEASES = []
    RELEASES_WAITTIME;

    constructor(MARKETPLACE, CHANNELID, LANGUAGE, discordWebhook, CHANNEL) {
        this.MARKETPLACE = MARKETPLACE;
        this.CHANNELID = CHANNELID;
        this.LANGUAGE = LANGUAGE;
        // this.DATABASE_TABLE = DATABASE_TABLE;
        this.discordWebhook = new webhook.Webhook(discordWebhook);
        this.CHANNEL = CHANNEL;
    }

    async initiate(discordBot, RELEASES_WAITTIME = 30000) {
        this.initiateCommands(discordBot);

        this.RELEASES_WAITTIME = RELEASES_WAITTIME;
        this.RELEASES = [];
        this.monitorReleases(true)

        console.log(`[SNKRS-${this.MARKETPLACE}] Started monitoring all SKUs!`)
    }

    initiateCommands(discordBot) {
        // console.log("INTIATE")
        let proxyThis = this;
        discordBot.getClient.on('message', async function (msg) {
            if (msg.channel.id !== proxyThis.CHANNEL)
                return;
            if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
                // proxyThis.RELEASES = [];
                msg.reply("Reset is disabled by Vega")
                return;
            }
        });
    }

    removeRelease(sku) {

    }

    async monitorReleases(initial) {
        let proxy = helper.getRandomNikeProxy()
        const requestOptions = {
            uri: `https://api.nike.com/product_feed/threads/v2/?anchor=0&count=60&filter=marketplace(${this.MARKETPLACE})&filter=language(${this.LANGUAGE})&filter=channelId(${this.CHANNELID})&filter=exclusiveAccess(true,false)&fields=active,id,lastFetchTime,productInfo,${v4()}`,
            method: 'GET',
            headers: {
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'sec-ch-ua-mobile': '?0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                Connection: 'keep-alive',
            },
            agent: new HTTPSProxyAgent(proxy),
        };

        let start = Date.now()
        // console.log(requestOptions.uri)
        axios(requestOptions.uri, requestOptions).then(async response => {
            let body = await response.data;
            // this.totalData += ((body.length * 1) / 1000000);
            if (response.status !== 200) {
                this.errors++;
                console.log("********************SNKRS-RELEASES-ERROR********************")
                console.log("Site: " + this.MARKETPLACE)
                console.log("Proxy: " + proxy);
                console.log("Code: " + response.status);
                console.log("Response: " + body)
                if (this.errors > 5) {
                    console.log("--------------------------SNKRS-RELEASES-OVER------------------------")
                    console.log("Site: " + this.MARKETPLACE)
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
                    console.log(`[SNKRS-${this.MARKETPLACE}] Proxy Fucking Unreachable - ` + sku + ' - ' + proxy);
                    this.monitorReleases(initial);
                    return;
                }
                if (body.toLowerCase().includes('many requests') || response.status === 429) {
                    console.log(`[SNKRS-${this.MARKETPLACE}] 429, SKU: ` + sku);
                    await helper.sleep(helper.getRandomNumber(3000, 7000));
                    this.monitorReleases(initial);
                    return;
                }
                console.log("********************SNKRS-ERROR********************")
                console.log("Site: " + this.MARKETPLACE)
                console.log("Proxy: " + proxy);
                console.log(err);
                console.log(body)
                this.monitorReleases(initial)
                return;
            }

            for (let product of body.objects) {
                if (!product.productInfo)
                    continue;
                let productInfo = product.productInfo[0];
                if (!productInfo.launchView)
                    continue;
                let sku = productInfo.productContent.globalPid;
                if (this.RELEASES.includes(sku))
                    continue;
                let name = productInfo.productContent.fullTitle + " - " + productInfo.productContent.colorDescription;
                let price = productInfo.merchPrice.currentPrice + " (" + productInfo.merchPrice.currency + ")";
                let image = productInfo.imageUrls.productImageUrl;
                let releaseType = productInfo.launchView.method;
                let releaseDateFormatted = moment(productInfo.launchView.startEntryDate);
                releaseDateFormatted = releaseDateFormatted.utc().format('YYYY-MM-DD') + " " + releaseDateFormatted.utc().format('HH:mm:ss') + " (UTC)"
                let url = `https://nike.com/${this.MARKETPLACE === 'us' ? '' : this.MARKETPLACE.toLowerCase()}/launch/t/${productInfo.productContent.slug}`
                // console.log(url)

                let sizeList = [];
                let stockList = [];
                if (productInfo.availableSkus) {
                    for (let size of productInfo.availableSkus) {
                        for (let size2 of productInfo.skus) {
                            if (size2.id === size.id) {
                                sizeList.push(size2.nikeSize);
                                stockList.push(size.level)
                            }
                        }
                    }
                }
                let sizes = "```" + sizeList.join("\n") + "```";
                let stocks = "```" + stockList.join("\n") + "```";

                // console.log(`${this.MARKETPLACE}: ${name}`)
                this.RELEASES.push(sku);
                if (!initial) {
                    postReleaseWebhook(this.discordWebhook, url, name, sku, sizes, stocks, price, image, releaseDateFormatted, releaseType, this.MARKETPLACE);
                    console.log(`[${this.MARKETPLACE}] Release - ${sku} - ${name}`)
                }
            }
            // console.log(this.RELEASES.length)


            await helper.sleep(this.RELEASES_WAITTIME);
            this.monitorReleases()
        }).catch(async err => {
            console.log("********************MESH-ERROR********************")
            console.log("Site: " + this.MARKETPLACE)
            console.log("Proxy: " + proxy);
            console.log(err);
            await helper.sleep(3000);
            this.monitorReleases(initial)
        });
    }

}

async function postRestockWebhook(discordWebhook, url, title, sku, sizes, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setAuthor(`https://www.nike.`, '', `https://www.boxlunch.com/`)
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
        .setFooter(`SNKRS-${region} | v1.0 `, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
}

async function postReleaseWebhook(discordWebhook, url, title, sku, sizes, stocks, price, image, date, type, region) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        // .setAuthor(URL, '', URL)
        .addField("**SKU**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Launch Type**", type, true)
        .addField("**Launch Date**", date)
        .addField("**Sizes**", sizes, true)
        .addField("**Level**", stocks, true)
        // .addField("**Sizes**", sizes)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter(`SNKRS-${region} | v1.0 `, 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
}

module.exports = SnkrsMonitor;