const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const uuidv4 = require('uuidv4').uuid;
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
helper.init();
let success = 0;
async function test() {
    try {
        let proxy = helper.getRandomBestBuyProxy();
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.amazon.com/gp/aod/ajax/ref=auto_load_aod?asin=B08F7PTF53&pc=dp`, {
            // headers: {
            //     'x-sig': sig.toString(),
            //     'x-ts': ts.toString(),
            //     'x-uuid': uuidv4().toString(),
            //     'X-App-Domain': '5',
            //     'User-Agent':
            //         'Zalando/4.69.2 (Linux; Android 7.1.2; ASUS_Z01QD/Asus-user 7.1.2 20171130.276299 release-keys)',
            //     'X-App-Version': '4.69.2',
            //     'X-Os-Version': '7.1.2',
            //     'X-Logged-In': true,
            //     'X-Zalando-Mobile-App': '1166c0792788b3f3a',
            //     'X-Device-Os': 'android',
            //     'X-Device-Platform': 'android',
            //     Host: storeURL.host,
            //     Accept: 'application/json',
            //     'Content-Type': 'application/json',
            //     'Accept-Encoding': 'gzip, defalte, br',
            //     'Accept-Language': '*',
            //     Connection: 'keep-alive',
            // },
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
                "cookie": "session-id=143-0932513-1862814; ubid-main=131-9378781-3727510;"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",

            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        });
        let body = await helper.getBodyAsText(response)
        fs.writeFileSync('response.html', body)
        let root = HTMLParser.parse(body);
        // if(body['data']) {
        //     console.log(++success + " - " + proxy)
        // }
        // console.log(body)
        let offerPrices = [];
        let offerIDs = [];
        // root.querySelectorAll('div[id="aod-offer"] > div span[class="a-offscreen"]').forEach((value) => {offerPrices.push(value.textContent)})
        // root.querySelectorAll('div[id="aod-offer"] > div input[name="offeringID.1"]').forEach((value) => {offerIDs.push(value.attributes.value)})
        // console.log(offerPrices.length + " - " + offerIDs.length);
        // console.log(offerPrices[0] + " - " + offerIDs[0]);
        // console.log(response.headers['x-cache'] + " - " + response.headers['x-cache-hits'])
        // if(body.includes('View details for AMD RYZEN™ 9 5900X Processor'))
        if (response.status === 200)
            console.log(++success + " - " + root.querySelector('div[id="aod-offer"] > div span[class="a-offscreen"]').textContent)
        else
            console.log("FAIL - " + proxy)
    } catch (err) { console.log(err) }
}
async function start() {
    for (let i = 0; i < 50; i++) {
        test();
        // if (i === 9) {
        //     await helper.sleep(5000);
        //     i = 0;
        // }
    }
}
start();

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