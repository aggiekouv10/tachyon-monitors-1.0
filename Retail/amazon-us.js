// var _0x30f3fb = "https://www.amazon.com/gp/aod/ajax?ref_=dp_aod_ALL_mbc&asin=" + this["itemID"] + "&m=ATVPDKIKX0DER&pinnedofferhash=&qid=122351237754&smid=166663&sourcecustomerorglistid=32123&sourcecustomerorglistitemid=34324234&sr=234234&pldnSite=1",
//                 _0x3ced42 = {
//                     'accept': "*/*",
//                     'accept-encoding': "gzip, deflate, br",
//                     'accept-language': "en-US,en;q=0.9",
//                     'content-type': "application/x-www-form-urlencoded",
//                     'downlink': 0xa,
//                     'ect': '4g',
//                     'origin': "https://www.amazon.com",
//                     'referer': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk",
//                     'rtt': 0x32,
//                     'sec-fetch-dest': "empty",
//                     'sec-fetch-mode': "cors",
//                     'sec-fetch-site': "same-origin",
//                     'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
//                     'x-amz-checkout-entry-referer-url': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk",
//                     'x-amz-support-custom-signin': 0x1,
//                     'x-amz-turbo-checkout-dp-url': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk"
//                 };
//             this["monitorCookies"] && (_0x3ced42["cookie"] = this["monitorCookies"]);
//             const _0x4af9ae = axios["CancelToken"]["source"]();
//             var _0x304173 = {
//                 'url': _0x30f3fb,
//                 'timeout': 0x9 * 0x3e8,
//                 'method': "get",
//                 'headers': _0x3ced42,
//                 'cancelToken': _0x4af9ae["token"],
//                 'httpsAgent': this["agent"]
//             };
//             try {
//                 let _0x162de2 = null;
//                 setTimeout(() => {
//                     _0x162de2 === null && (_0x4af9ae["cancel"](), console["log"]("TIMEOUT"));
//                 }, 0x1f40), _0x162de2 = await axios["request"](_0x304173);
//                 if (_0x162de2 == null) {
//                     await this["logger"]("Timeout", ![]);
//                     throw new Error("Timeout!");
//                 }
//                 var _0x1fafb6 = cheerio["load"](_0x162de2["data"]);
//                 let _0xe0f74c = _0x1fafb6(".a-offscreen")["text"]()["replace"](/^\s+|\s+$/g, ''),
//                     _0x5c6958 = _0x1fafb6("#aod-offer-soldBy")["first"]()["find"](".a-color-base")["first"]()["text"]()["replace"](/^\s+|\s+$/g, '');
//                 if (_0xe0f74c && parseFloat(_0xe0f74c["split"]('$')[0x1]["replace"](',', '')) < this["maxPrice"] && _0x5c6958["startsWith"]("Amazon.com")) {
//                     this["pTitle"] = _0x1fafb6("#aod-asin-title-block")["text"]()["trim"](), this["pImage"] = _0x1fafb6("#aod-asin-image-id")["attr"]("src"), this["pPrice"] = _0xe0f74c["split"]('$')[0x1], this["listingId"] = _0x1fafb6(`input[name="offeringID.1"]`)["val"]();
//                     this["pTitle"] != '' && this["pTitle"] != '\x20' && this["pTitle"] && this["event"]["sender"]["send"]("change-task-title", this["taskID"], this["pTitle"]);
//                     return;
//                 } else {
//                     this["monitorCookies"] = '';
//                     for (var _0x16f925 of _0x162de2["headers"]["set-cookie"]) {
//                         this["monitorCookies"] += _0x16f925["split"](';')[0x0] + ';\x20';
//                     }
//                     await this["logger"]("OOS", !![]), await sleep(this["monitorDelay"]);
//                 }
//             } catch (_0x497a58) {
//                 this["monitorCookies"] = null, await this["logger"]("Monitoring Error", !![]), this["agent"] = await this["random_proxy"](), await sleep(0x1388);
//             }

const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const got = require('got');
const HTMLParser = require('node-html-parser');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.AMAZONUS);
const helper = require('../helper');
const HTTPSProxyAgent = require('https-proxy-agent');
const DATABASE_TABLE = 'amazonus';

let totalData = 0;
let tempCookies = [];
let cookies = [];
const COOKIE_SIZE = 5;
const COOKIE_GEN_TIME = 10 * 1000;
const COOKIE_ERROR_DELAY = 150;
const COOKIE_GEN_DELAY = 180 * 1000;

genCookies();
startMonitoring();

async function startMonitoring() {
    if (cookies.length === 0) {
        setTimeout(function () {
            startMonitoring()
        }, 500);
        return;
    }
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.sku);
    }
    console.log('[AMAZON-US] Monitoring all SKUs!')
}

async function genCookies() {
    if (!tempCookies.length === 0) {
        setTimeout(function () {
            genCookies();
        }, 10000);
        return;
    }
    console.log("Starting Genning")
    for (let i = 0; i < COOKIE_SIZE; i++)
        genCookie1(helper.getRandomProxy());
}

async function finishGenning() {
    cookies = tempCookies;
    tempCookies = [];
    console.log(cookies);
    setTimeout(function () {
        genCookies();
    }, COOKIE_GEN_DELAY);
}

async function genCookie1(proxy) {
    console.log("Genning 1 " + proxy)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.amazon.com/gp/overlay/display.html', {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",

        'agent': new HTTPSProxyAgent(proxy),
        'timeout': 3000
    }).then(async response => {
        clearTimeout(timeoutId)
        let sessionIDCookie = "session-id=" + response.headers.get('set-cookie').split("session-id=")[1].substr(0, 19);
        genCookie2(proxy, sessionIDCookie)
    }).catch(err => {
        console.log("********************AMAZON-US-COOKIE (1)-ERROR********************")
        console.log("Proxy: " + proxy);
        console.log(err);
        setTimeout(function () {
            genCookie1(proxy);
        }, COOKIE_ERROR_DELAY);
    });
}

async function genCookie2(proxy, sessionIDCookie) {
    console.log("Genning 2 " + proxy)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.amazon.com/gp/overlay/display.html`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": sessionIDCookie + ";"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",

        'agent': new HTTPSProxyAgent(proxy),
        'timeout': 3000
    }).then(async response => {
        clearTimeout(timeoutId)
        let ubidCookie = response.headers.get('set-cookie').split("ubid-main=")[1].substr(0, 19)
        if (!ubidCookie)
            throw new Error("Could not gen ubid on " + sessionIDCookie);
        let cookie = sessionIDCookie + "; " + "ubid-main=" + ubidCookie + ";"
        tempCookies.push(cookie);
        if (tempCookies.length === COOKIE_SIZE) {
            finishGenning();
        }
    }).catch(err => {
        console.log("********************AMAZON-US-COOKIE (2)-ERROR********************")
        console.log("Proxy: " + proxy);
        console.log(err);
        setTimeout(function () {
            genCookie1(proxy);
        }, COOKIE_ERROR_DELAY);
    });
}

async function monitor(sku) {
    let url = `https://www.amazon.com/Tachyon-Monitors/dp/${sku}/`;
    let pdpURL = `https://www.amazon.com/gp/aod/ajax?ref_=dp_aod_ALL_mbc&asin=${sku}`;
    let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
    if (query.rows.length === 0)
        return;

    let PROXY = helper.getRandomProxy();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpURL, {
        headers: {
            'accept': "*/*",
            'accept-encoding': "gzip, deflate, br",
            'accept-language': "en-US,en;q=0.9",
            'content-type': "application/x-www-form-urlencoded",
            'downlink': 0xa,
            'ect': '4g',
            'origin': "https://www.amazon.com",
            // 'referer': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk",
            'rtt': 0x32,
            'sec-fetch-dest': "empty",
            'sec-fetch-mode': "cors",
            'sec-fetch-site': "same-origin",
            'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
            // 'x-amz-checkout-entry-referer-url': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk",
            // 'x-amz-support-custom-signin': 0x1,
            // 'x-amz-turbo-checkout-dp-url': "https://www.amazon.com/gp/product/" + this["itemID"] + "?pf_rd_r=93T3ZVFMYYBR3WSE25VZ&pf_rd_p=5ae2c7f8-e0c6-4f35-9071-dc3240e894a8&pd_rd_r=04cfb4ae-5ce0-4c74-a438-00dd2fa05c39&pd_rd_w=dmzCg&pd_rd_wg=qRvAq&ref_=pd_gw_unk"
        },
        agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        totalData += ((body.length * 1) / 1000000);
        if (body.includes('561 Proxy Unreachable')) {
            console.log('[AMAZON-US] Proxy Fucking Unreachable - ' + sku + ' - ' + PROXY);
            monitor(sku);
            return;
        }
        if (body.includes('Are you a human?')) {
            console.log('[AMAZON-US] DETECTED CAPTCHA - ' + sku + ' - ' + PROXY);
            monitor(sku);
            return;
        }
        if (body.includes('It appears our systems have detected the possible use of an automated program')) {
            console.log('[AMAZON-US] DETECTED AUTOMATION - ' + sku + ' - ' + PROXY);
            monitor(sku);
            return;
        }
        if (body.toLowerCase().includes('many requests')) {
            console.log('[AMAZON-US] 429, SKU: ' + sku);
            monitor(sku);
            return;
        }
        if (body.includes('Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.')) {
            console.log('[AMAZON-US] Unauthenticated Proxy: ' + PROXY);
            monitor(sku);
            return;
        }
        if (!body || body === undefined) {
            console.log('[AMAZON-US] Null body - ' + sku + ' - ' + PROXY);
            monitor(sku);
            return;
        }
        let offer = query.rows[0].offer;
        // try {
        //     body["split"];
        // } catch (err) {
        //     console.log('[AMAZON-US] Null body - ' + sku + ' - ' + PROXY);
        //     monitor(sku);
        //     return;
        // }
        let root = HTMLParser.parse(body);
        let title = root.querySelector('h5[id="aod-asin-title-text"]').textContent;
        let image = root.querySelector('img[id="aod-asin-image-id"]').src;
        $('div[id="aod-price-11"]')[0].children[0].children[0].innerText.substr(1)
        console.log(body["split"]("<onlineAvailability>"))
        if (body["split"]("<onlineAvailability>")[0x1]["split"]('<')[0x0] === "true") {
            let title = body["split"]("<name>")[0x1]["split"]('<')[0x0];
            let price = body["split"]("<salePrice>")[0x1]["split"]('<')[0x0];
            let image = body["split"]("<href>")[0x1]["split"]('<')[0x0];
            if (status !== "In-Stock") {
                console.log(url)
                console.log(title)
                console.log(price)
                console.log(image)
                console.log(sku)
                await postRestockWebhook(url, title, sku, price, image);
                console.log(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                await database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                await database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }
        if (query.rows.length > 0) {
            setTimeout(function () {
                monitor(sku);
            }, query.rows[0].waittime);
        }
    }).catch(err => {
        console.log("********************BESTBUY-US-ERROR********************")
        console.log("SKU: " + sku);
        console.log("Proxy: " + PROXY);
        console.log(err);
        setTimeout(function () {
            monitor(sku);
        }, 150);
    });
}

async function postRestockWebhook(url, title, sku, price, image) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#121a2d")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.bestbuy.com/', '', 'https://www.bestbuy.com/')
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Sku**", sku, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
        .setTime()
        .setFooter("BestBuy-US | v1.0 |", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
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
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '[]', ${waitTime})`);
        monitor(sku);
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === discordBot.channels.BESTBUYUS) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Amazon-US Monitor");
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
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}