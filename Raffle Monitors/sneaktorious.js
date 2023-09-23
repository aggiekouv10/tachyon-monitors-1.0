const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const randomUseragent = require('random-useragent');
const HTMLParser = require('node-html-parser');
const AbortController = require('abort-controller')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.RAFFLE);
const CHANNEL = discordBot.channels.RAFFLE
const helper = require('../helper');
const { v4 } = require('uuid');
const { post } = require('request');
startMonitoring();
let PRODUCTS = [];
const WAIT_TIME = 2000;


async function startMonitoring() {
    monitor(true)
    console.log('[Sneaker-Releases] Monitoring!')
}

async function monitor(justStarted) {
    let proxy = helper.getRandomDDProxy();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    fetch(`https://www.sneaktorious.com/sneakers.json`, {
        'headers': {
            'User-Agent': 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status !== 200) {
            monitor();
            return;
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body);
        let products = body.items
        for (let product of products) {
            let link = 'https://www.sneaktorious.com' + product.link
            let title = product.title
            let root = HTMLParser.parse(await product.thumbnail);
            let primaryImage = 'https://images.weserv.nl/?url=' + root.querySelector("source").attributes['data-srcset'].split('webp')[0] + 'webp&w=400&bg=white'
            const controller1 = new AbortController();
            const timeoutId1 = setTimeout(() => controller1.abort(), 4000)
            await fetch(`${link}/raffles.json`, {
                method: "POST",
                'headers': {
                    'User-Agent': randomUseragent.getRandom(),
                },
            }).then(async response => {
                clearTimeout(timeoutId1)
                if (response.status !== 200) {
                    monitor();
                    return;
                }
                let body = await helper.getBodyAsText(response)
                body = JSON.parse(body);
                let sites = body.items
                for (let site of sites) {
                    let url = site.link
                    if (!PRODUCTS.includes(url)) {
                        PRODUCTS.push(url)
                        let releaseType = site.headline
                        let dateStart = site.dateStart
                        let siteImage = 'https://images.weserv.nl/?url=' + site.thumbnail + '&w=200&h=200&fit=contain&cbg=white&bg=white'
                        let siteAuther = 'https://' + url.split('/')[2]
                        let delivery = ''
                        let country = ''
                        let color = ''
                        let flag = ''
                        if (site.delivery === '9bd34764-c577-445b-a8bf-67c70ae7dd37') {
                            delivery = 'Pick up 🛒'
                        }
                        if (site.delivery === '793738c7-9209-4ff9-84c8-820bf664859a') {
                            delivery = 'Shipping 📦'
                        }
                        if (site.countries[0] === '219055a6-2d7c-4cf6-9ae2-af034f98a402') {
                            country = 'AE'
                            color = "#9ed0ab"
                            flag = 'ae'
                        }
                        if (site.countries[0] === 'df766a21-5238-4c21-9877-2197646f56b0') {
                            country = 'AT'
                            color = "#dabfbf"
                            flag = '🇦🇹'
                        }
                        if (site.countries[0] === 'b39ce988-0cbc-4c15-a8ec-02fb4fe70cc2') {
                            country = 'AU'
                            color = "#a1ec83"
                            flag = '🇦🇺'
                        }
                        if (site.countries[0] === 'ce40ee2b-68af-4c14-b889-daf663903423') {
                            country = 'CA'
                            color = "#f3b5fb"
                            flag = '🇨🇦'
                        }
                        if (site.countries[0] === '759dfa14-d01e-4f23-b061-1f9893c9293f') {
                            country = 'CH'
                            color = "#a2b7d6"
                            flag = '🇨🇭'
                        }
                        if (site.countries[0] === '84f958f0-4852-4ed5-abe1-5e192e3aeea2') {
                            country = 'CN'
                            color = "#ffd589"
                            flag = '🇨🇳'
                        }
                        if (site.countries[0] === '1dfebcd8-4a85-4c02-87aa-b338c6b01611') {
                            country = 'DE'
                            color = "#f7de65"
                            flag = '🇩🇪'
                        }
                        if (site.countries[0] === 'f74942f5-2826-41c0-ad00-5f30215936c1') {
                            country = 'ES'
                            color = "#f5cd98"
                            flag = '🇪🇸'
                        }
                        if (site.countries[0] === '1ed446ee-939f-4fa6-88e1-5b13f92e1e8b') {
                            country = 'EU'
                            color = "#88c2fd"
                            flag = '🇪🇺'
                        }
                        if (site.countries[0] === 'bc0b95da-ebd7-46ec-bd1c-0fd0a3efe9b9') {
                            country = 'FR'
                            color = "#9d80ed"
                            flag = '🇫🇷'
                        }
                        if (site.countries[0] === 'c35f7ff0-a1e0-4202-9900-0e130d220c2c') {
                            country = 'IT'
                            color = "#98f5ad"
                            flag = '🇮🇹'
                        }
                        if (site.countries[0] === 'ec9bd23a-3997-4885-b8af-9b38d089db51') {
                            country = 'JP'
                            color = "#f9b8d0"
                            flag = '🇯🇵'
                        }
                        if (site.countries[0] === '36a8be44-47ca-4102-97ac-aa4b04a8d426') {
                            country = 'MX'
                            color = "#dec67d"
                            flag = '🇲🇽'
                        }
                        if (site.countries[0] === 'cfb1ea15-1969-425f-9d18-1e0d96b4021d') {
                            country = 'NL'
                            color = "#d098f5"
                            flag = '🇳🇱'
                        }
                        if (site.countries[0] === '524baa56-9f5d-4876-9998-7d4141a4cf16') {
                            country = 'NZL'
                            color = "#65f7c1"
                            flag = '🇳🇿'
                        }
                        if (site.countries[0] === '8d4fec35-12f3-4e73-9a55-a603856f9443') {
                            country = 'UK'
                            color = "#8de5f3"
                            flag = '🇬🇧'
                        }
                        if (site.countries[0] === '2b491b6b-7635-41a9-9262-818280c23692') {
                            country = 'US'
                            color = "#ffb6b6"
                            flag = '🇺🇸'
                        }
                        postRestockWebhook(url, title, primaryImage, releaseType, dateStart, siteImage, siteAuther, delivery, country, color, flag)
                    }
                }

            }).catch(error => {
                if (error.type === 'aborted') {
                    //console.log("[SNS] Timeout - " + sku, proxy)
                    monitor();
                    return;
                }
                if (error.type === 'request') {
                    //console.log("[SNS] Timeout - " + sku, proxy)
                    monitor();
                    return;
                }
                console.log(error)
                monitor();
                return
            });
        }
        await helper.sleep(WAIT_TIME);
        monitor();
    }).catch(error => {
        if (error.type === 'aborted') {
            //console.log("[SNS] Timeout - " + sku, proxy)
            monitor();
            return;
        }
        if (error.type === 'request') {
            //console.log("[SNS] Timeout - " + sku, proxy)
            monitor();
            return;
        }
        console.log(error)
        monitor();
        return
    });

}

async function postRestockWebhook(url, title, primaryImage, releaseType, dateStart, siteImage, siteAuther, delivery, country, color, flag) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor(color)
        .setTitle(title)
        .setURL(url)
        .setAuthor(siteAuther, '', siteAuther)
        .addField("**Release Type**", releaseType, true)
        .addField("**Delivery**", delivery, true)
        .addField("**Country**", country + flag, true)
        .addField("**Launch Date**", dateStart, true)
        .setThumbnail(siteImage)
        .setImage(primaryImage)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setTime()
        .setFooter("Sneaker Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    discordWebhook.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
        PRODUCTS = [];
        msg.reply("Resetted!")
        return;
    }
});