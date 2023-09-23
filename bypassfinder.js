const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent')
const { HttpsProxyAgent } = require('hpagent')
const database = require('./database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('./discord-bot');
const randomUseragent = require('random-useragent');
const { v4 } = require('uuid');
const helper = require('./helper');

monitor()
monitor()
monitor()
monitor()
monitor()
monitor()
monitor()
async function monitor() {
    let proxy = helper.getRandomUA()
    console.log()
    let ua = randomUseragent.getRandom()
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000)
    fetch(`https://www.walmart.ca/api/ip/6000201919198?isUPC=false&includePriceOfferAvailability=true&allOffers=true`, {
        'headers': {
            'user-agent': ua,
        },
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        console.log(response.status)
        if (response.status !== 200) {
            console.log(response.status)
            monitor()
            return
        }
        let body = await helper.getBodyAsText(response, 2500)
            if (body.includes('Forbidden')) {
                console.log(`Forbidden`);
                monitor()
                return
            }
            if (body.includes('blockScript')) {
                console.log(`Forbidden!`);
                monitor()
                return
            }
            body = JSON.parse(await body.trim())
        if (response.status === 200) {
            console.log(ua, body.productName)
        }
        monitor()
    }).catch(async err => {
        //console.log(err);
        // console.log(body)
        monitor()
    });
}
