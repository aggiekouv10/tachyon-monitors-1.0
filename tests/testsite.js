const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const uuidv4 = require('uuidv4').uuid;
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
helper.init();
let success = 0;
async function test() {
    try {
        let proxy = helper.getRandomProxy();
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        let response = await const controller = new AbortController();
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
                // "cookie": "session-id=147-5362351-9370933;"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",

            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        });
        let body = await helper.getBodyAsText(response)
        let sessionIDCookie = "session-id=" + response.headers.get('set-cookie').split("session-id=")[1].substr(0, 19);
        response = await const controller = new AbortController();
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
        });
        console.log(`[SUCCESS-${++success}] ` + sessionIDCookie + "; " + "ubid-main=" + response.headers.get('set-cookie').split("ubid-main=")[1].substr(0, 19) + ";  - " + proxy)

    } catch (err) { console.log(err) }
}
async function start() {
    for (let i = 0; i < 50; i++) {
        test();
        if (i === 49) {
            await helper.sleep(5000);
            i = 0;
        }
    }
}
start();

// const fs = require('fs');
// let file = fs.readFileSync('./bbproxies.txt');
// let proxies = [];
// for(let x of file.toString().split('\n')) {
//     x = x.split(" - ")
//     if(!proxies.includes(x[1].trim())) {
//         proxies.push(x[1].trim());
//     }
// }
// fs.writeFileSync('./bbproxies.json', JSON.stringify(proxies))
// console.log("Done " + proxies.length)