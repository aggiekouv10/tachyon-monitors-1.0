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
    fetch(`https://www.microcenter.com/quickView/618131/Tachyon-Monitors`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0',
                'from': 'blakewalterss@gmail.com' // # This is another valid field
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",

            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        });
        let body = await helper.getBodyAsText(response)
        fs.writeFileSync('response.html', body.toString())
        // let root = HTMLParser.parse(body);
        // // if(body['data']) {
        // //     console.log(++success + " - " + proxy)
        // // }
        body = JSON.parse(body.split(`<script type="application/ld+json">`)[1].split("</script>")[0].split(`,"aggregateRating":`)[0] + "}");
        // let offerPrices = [];
        // let offerIDs = [];
        // root.querySelectorAll('div[id="aod-offer"] > div span[class="a-offscreen"]').forEach((value) => {offerPrices.push(value.textContent)})
        // root.querySelectorAll('div[id="aod-offer"] > div input[name="offeringID.1"]').forEach((value) => {offerIDs.push(value.attributes.value)})
        // console.log(offerPrices.length + " - " + offerIDs.length);
        // console.log(offerPrices[0] + " - " + offerIDs[0]);
        console.log(body.offers.availability)
        // // console.log(response.headers['x-cache'] + " - " + response.headers['x-cache-hits'])
        // // if(body.includes('View details for AMD RYZEN™ 9 5900X Processor'))
        if (body.name)
            console.log(++success + " - " + proxy)
        else
            console.log("FAIL - " + proxy)
    } catch (err) { console.log(err) }
}
async function start() {
    for (let i = 0; i < 1; i++) {
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