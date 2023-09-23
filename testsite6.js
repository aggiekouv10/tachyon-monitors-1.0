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
let time = Date.now()

let PROXIES = require('./proxiesFormatted.json');
let EXCLUDED_PROXIES = []//require('./adoramaExcludedProxies.json')

async function test(sku) {
    let proxy = getProxy();
    if (!proxy) {
        fs.writeFileSync('adoramaExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
        process.exit(0);
    }
    try {
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        let response = await axios.get("https://www.adorama.com/api/catalog/GetProductData?svfor=7day&cacheVersion=1691&sku=" + sku, {
            "headers": {
                'Host': 'www.adorama.com',
                'Connection': 'keep-alive',
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
                'cookie': '_pxvid=68590c86-aff9-11eb-90a7-0242ac120007; _px2=eyJ1IjoiODNkNDA1YzAtYWZmOS0xMWViLTg4MmUtNTE4OWVmMjQ4YmMyIiwidiI6IjY4NTkwYzg2LWFmZjktMTFlYi05MGE3LTAyNDJhYzEyMDAwNyIsInQiOjE2MjA0NzcyNTA4NTMsImgiOiJmZjQ2NzJkY2Y2NjAxNjhmYjk5YzlkNjZjNzUzYmEwNThiMTI4MWQ1MjAzNTUzZWQ5MGNjMWM5NDg3Y2Y4NjE5In0='
            },

            'httpsAgent': new HTTPSProxyAgent(proxy),
            'timeout': 5000
        });
        let body = await response.data;
        // fs.writeFileSync('response.html', body.toString())
        // let root = HTMLParser.parse(body);
        // // if(body['data']) {
        // //     console.log(++success + " - " + proxy)
        // // }
        // body = JSON.parse(body.split(`<script type="application/ld+json">`)[1].split("</script>")[0].split(`,"aggregateRating":`)[0] + "}");
        // let offerPrices = [];
        // let offerIDs = [];
        // root.querySelectorAll('div[id="aod-offer"] > div span[class="a-offscreen"]').forEach((value) => {offerPrices.push(value.textContent)})
        // root.querySelectorAll('div[id="aod-offer"] > div input[name="offeringID.1"]').forEach((value) => {offerIDs.push(value.attributes.value)})
        // console.log(offerPrices.length + " - " + offerIDs.length);
        // console.log(offerPrices[0] + " - " + offerIDs[0]);
        success++;
        // if (success > 3000) {
        //     fs.writeFileSync('adoramaExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
        //     process.exit(0);
        // }
        // if(success !== 4)
        //     test()
        // else
        //     console.log(Date.now() - time)
        // // console.log(response.headers['x-cache'] + " - " + response.headers['x-cache-hits'])
        // // if(body.includes('View details for AMD RYZEN™ 9 5900X Processor'))
        if (body.status) {
            console.log(success + " - " + EXCLUDED_PROXIES.length + " - " + body.data.XB1V800001.stock + " - " + proxy)
        }
        else
            console.log("FAIL - " + proxy)
        await helper.sleep(500);
        test(sku);
    } catch (err) {
        if (err.response && err.response.data && err.response.data.includes('human')) {
            console.log("ERR CAPTCHA - " + proxy);
            EXCLUDED_PROXIES.push(proxy)
            test(sku);
            return;
        }
        if (err.response && err.response.data && err.response.data === 'Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.') {
            console.log("ERR NOT AUTH - " + proxy);
            // await helper.sleep(500);
            EXCLUDED_PROXIES.push(proxy)
            test(sku);
            return;
        }
        // console.log(err);
        test(sku);
    }// success=0;await helper.sleep(2500); test(); }
}

let a = 0;
function getProxy() {
    let proxy = PROXIES[helper.getRandomNumber(0, PROXIES.length)];
    if (EXCLUDED_PROXIES.includes(proxy))
        return getProxy();
    return proxy;
}


async function start() {
    for (let i = 0; i < 500; i++) {
        test('XB1V800001');
        if (i === 50) {
            await helper.sleep(5000);
            i = 0;
        }
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