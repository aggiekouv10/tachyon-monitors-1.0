const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const { JSDOM } = jsdom;
const discordWebhook = new webhook.Webhook(discordBot.webhooks.FINISHLINE);
const helper = require('../helper');
const axios = require('axios')
const HTTPSProxyAgent = require('https-proxy-agent')

const DATABASE_TABLE = 'finishline';

// startMonitoring();
monitor('prod2770771', 'CW6973', '600');

async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        await helper.sleep(helper.getRandomNumber(1500, 3000));
        monitor(row.productid, row.styleid, row.colorid);
    }
}

async function monitor(productID, styleID, colorID) {
    let productsURL = `https://www.finishline.com/store/browse/json/productSizesJson.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}`;
    let url = `https://www.finishne.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}`;
    // let query = await database.query(`SELECT * from ${DATABASE_TABLE} where productid='${productID}' AND styleid='${styleID}' AND colorid='${colorID}'`);

    let HEADERS = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-users': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
    }

    // const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(productsURL, {
        //     headers: HEADERS,
        //     'agent': new HTTPSProxyAgent('http://h8upoTGfZF:LFeLC8VbSE@45.43.182.4:8175'),
        // })

        axios.get(productsURL, {
            //httpsAgent: new HTTPSProxyAgent('http://h8upoTGfZF:LFeLC8VbSE@45.43.182.4:8175'),
            headers: HEADERS
        })
            .then(async (response) => {
                let text = response.data;
                console.log(text);
                let body = JSON.parse(text);
                let productSizes = body.productSizes;
                let sizes = '';
                let sizeList = [];
                let oldSizeList = []//JSON.parse(query.rows[0].sizes);
                let inStock = false;
                for (let size of productSizes) {
                    if (size.sizeClass === 'unavailable')
                        continue;
                    if (!size.sizeValue)
                        continue;
                    if (sizeList.includes(size.sizeValue.trim()))
                        continue;
                    sizes += `size.sizeValue.trim() + ${Buffer.from(size.stockLevel, 'base64')}\n`;
                    sizeList.push(size.sizeValue.trim());
                    if (!oldSizeList.includes(size.sizeValue.trim()))
                        inStock = true;
                }
                // await database.query(`update ${DATABASE_TABLE} set sizes='${JSON.stringify(sizeList)}' where productid='${productID}' AND styleid='${styleID}' AND colorid='${colorID}'`);
                if (inStock) {
                    let data = (await axios.get(`https://www.finishline.com/store/recommendations/json/productRecommendationsEndecaJson.jsp?renderType=pdp&products=${productID}%3A${styleID}%3A${colorID}%7C`, {
                        headers: HEADERS
                    })).data.productsArray[0];
                    let title = data.displayName;
                    let price = data.price.nowPrice;
                    let image = `https://media.finishline.com/i/finishline/${styleID}_${colorID}_P1?$default$&w=671&&h=671`; //or use data.image
                    console.log('Restock Finishline');
                    postRestockWebhook(url, title, productID, styleID, colorID, sizes, price, image);
                }
                // if (query.rows.length > 0) {
                //     setTimeout(function () {
                //         monitor(productID, styleID, colorID);
                //     }, query.rows[0].waittime);
                // }
            }).catch(err => {
                console.log("Erorr occured!");
                console.log(err);
            });
    }

async function postRestockWebhook(url, title, productID, styleID, colorID, sizes, price, image) {
            var webhookMessage = new webhook.MessageBuilder()
                .setName("Tachyon Monitors")
                .setColor("#6cb3e3")
                .setTitle(title)
                .setURL(url)
                .setAuthor('https://www.finishline.com', '', 'https://www.finishline.com')
                .addField("**Stock**", "In Stock", true)
                .addField("**Price**", price, true)
                .addField("**SKU**", productID + ", " + styleID + ", " + colorID)
                .addField("**Sizes**", sizes)
                .setThumbnail(image)
                .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
                .setTime()
                .setFooter("Finishline | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
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
                if (args.length !== 5) {
                    discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <productID> <styleID> <colorID> <waitTime>");
                    return;
                }
                let productID = args[1];
                let styleID = args[2];
                let colorID = args[3];
                let waitTime = args[4];
                let query = await database.query(`SELECT * from ${DATABASE_TABLE} where productid='${productID}' AND styleid='${styleID}' AND colorid='${colorID}'`);
                if (query.rows.length > 0) {
                    await database.query(`delete from ${DATABASE_TABLE} where productid='${productID}' AND styleid='${styleID}' AND colorid='${colorID}'`);
                    discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring Item '${productID} ${styleID} ${colorID}'!`);
                    return;
                }
                await database.query(`insert into ${DATABASE_TABLE}(productid, styleid, colorid, sizes, waittime) values('${productID}', '${styleID}', '${colorID}', '[]', ${waitTime})`);
                monitor(productID, styleID, colorID);
                discordBot.sendChannelMessage(msg.channel.id, `Started monitoring Item '${productID} ${styleID} ${colorID}'!  (waitTime ${waitTime})`);
            }
            if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
                if (msg.channel.id === discordBot.channels.FINISHLINE) {
                    let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
                    const embed = new Discord.MessageEmbed();
                    embed.setTitle("Finishline Monitor");
                    embed.setColor('#6cb3e3')
                    if (query.rows.length > 0) {
                        let SKUList = [];
                        for (let row of query.rows) {
                            SKUList.push(`${row.productid} ${row.styleid} ${row.colorid}`);
                        }
                        embed.addField("**Monitored Items**", SKUList)
                    }
                    else {
                        embed.setDescription("Not Monitoring any Item!")
                    }
                    msg.reply(embed);
                }
            }
        });
