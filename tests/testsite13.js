const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const { HttpsProxyAgent } = require('hpagent')
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
    let proxy = helper.getRandomProxy()//getProxy();
    // if (!proxy) {
    //     fs.writeFileSync('adoramaExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
    //     process.exit(0);
    // }
    try {
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        // console.log("TEST")
        let response = await got("https://catalog.usmint.gov/on/demandware.store/Sites-USM-Site/default/Product-Variation?pid=20PB&format=ajax", {
            "headers": {
                // 'Host': 'www.titoloshop.com',
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                'Accept-Language': "en-US,en;q=0.5",
                'Upgrade-Insecure-Requests': '1'
            },
            'agent': {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: 'http://pcxkrtvq-dest:jvsjwc2a1kyk@104.144.109.15:6100'
                })
            },
            // 'agent': new HTTPSProxyAgent('http://pcxkrtvq-dest:jvsjwc2a1kyk@104.144.109.15:6100'),
            http2: true,
            'timeout': 20000
        });
        let body = await response.body;
        // let root = HTMLParser.parse(body);
        // console.log(root.querySelector('div[class="b-product-tile js-product-tile"]').attributes['data-pid'].substring(1))
        // fs.writeFileSync('soul.html', body.toString())
        // console.log(body);
        fs.writeFileSync('usmint2.html', body);
        console.log(response.statusCode)
        // console.log(response.headers)
    } catch (err) {
        if (err.response && err.response.data && err.response.data.includes('human')) {
            console.log("ERR CAPTCHA - " + proxy);
            EXCLUDED_PROXIES.push(proxy)
            // test(sku);
            return;
        }
        if (err.response && err.response.data && err.response.data === 'Not authenticated or invalid authentication credentials. Make sure to update your proxy address, proxy username and port.') {
            console.log("ERR NOT AUTH - " + proxy);
            // await helper.sleep(500);
            EXCLUDED_PROXIES.push(proxy)
            // test(sku);
            return;
        }
        if(!err.response) {
            console.log(err);
            return;
        }
        fs.writeFileSync('usmint.html', err.response.body);
        console.log(err.response.statusCode)
        // test(sku);
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
    for (let i = 0; i < 1; i++) {
        test(i);
        // if (i === 50) {
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