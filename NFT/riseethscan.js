const fetch = require('node-fetch');
const database = require('../database/database')
const HTTPSProxyAgent = require('https-proxy-agent');
const HTMLParser = require('node-html-parser');
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.RISENFT);
const CHANNEL = '975126632987787335'
const AbortController = require('abort-controller')
const randomUseragent = require('random-useragent');
const helper = require('../helper');
const { v4 } = require('uuid');
startMonitoring();
let PRODUCTS = [];
let justStarted = true;
const WAIT_TIME = 3000;

async function startMonitoring() {
    monitor()
}
async function monitor() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    fetch(`https://api.etherscan.io/api?module=account&action=txlist&address=0x019A5f73B994b24EF1673Ed3E7B5203Ad5a2ad51&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=W3RJA6G1X1SMGJ1GTAS6JADP15BA9E143F`, {
        'headers': {
            'user-agent': randomUseragent.getRandom(),
        },
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        if (response.status != 200) {
            monitor();
            return
        }
        let body = await helper.getBodyAsText(response)
        body = JSON.parse(body)
        for (let transaction of body.result) {
            let name = ''
            let side = ''
            if (transaction.from === "0x019a5f73b994b24ef1673ed3e7b5203ad5a2ad51") {
                name = `Sent ${transaction.value.substring(0, 1)} ETH to wallet Address\n${transaction.to}`
                side = 'Sent'
            }
            if (transaction.to === "0x019a5f73b994b24ef1673ed3e7b5203ad5a2ad51") {
                name = `Received ${transaction.value.substring(0, 1)} ETH from wallet Address\n${transaction.from}`
                side = 'Received'
            }
            let pid = transaction.hash
            let url = `https://etherscan.io/tx/${transaction.hash}`
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            fetch(url, {
                'headers': {
                    'user-agent': randomUseragent.getRandom(),
                },
                signal: controller.signal
            }).then(async response => {
                clearTimeout(timeoutId)
                if (response.status != 200) {
                    monitor();
                    return
                }
                let body2 = await helper.getBodyAsText(response)
                let root = HTMLParser.parse(body2);
                if (!PRODUCTS.includes(pid)) {
                    PRODUCTS.push(pid)
                    if (!justStarted) {
                        let price = root.querySelector('#ContentPlaceHolder1_spanValue').textContent
                        let time = "("+ root.querySelector('#ContentPlaceHolder1_divTimeStamp .col-md-9').textContent.split('(')[1]
                        let confirmations = transaction.confirmations
                        await postLoadHook(url, name, price, time, side, confirmations)
                    }

                }
            }).catch(error => {
                console.log(error)
                monitor();
                return
            });
        }
        await helper.sleep(WAIT_TIME);
        if(justStarted)
        justStarted = false;
        monitor();
        return
    }).catch(error => {
        console.log(error)
        monitor();
        return
    });

}

async function postLoadHook(url, name, price, time, side, confirmations) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#f4dcb8")
        .setTitle(name)
        .setURL(url)
        .setAuthor('https://risenft.io', '', 'https://risenft.io')
        .addField("**Type**", side, true)
        .addField("**Amount**", price, true)
        .addField("**Confirmations**", confirmations, true)
        .addField(`**Time ${side}**`, time)
        .setThumbnail('https://media.discordapp.net/attachments/965736004541624330/975123257692946492/06D7AA65-2AC0-4FD4-AED4-B841E6BFE273.jpg')
        .setAvatar("https://media.discordapp.net/attachments/965736004541624330/975123257692946492/06D7AA65-2AC0-4FD4-AED4-B841E6BFE273.jpg")
        .setFooter("Rise Wallet by Tachyon | v2.0", 'https://media.discordapp.net/attachments/965736004541624330/975123257692946492/06D7AA65-2AC0-4FD4-AED4-B841E6BFE273.jpg')
    discordWebhook.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + "reset")) {
        PRODUCTS = [];
        msg.reply("Resetted!")
        return;
    }
});