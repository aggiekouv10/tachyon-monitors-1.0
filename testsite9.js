const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const { v4 } = require('uuid')
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
helper.init();
let success = 0;

let KEYS = [
    'qhqws47nyvgze2mq3qx4jadt',
    'Q7rwdCDZnWPly3KzbG1KNR5F',
    'bsxgt8s4ytx7ywvg33c8tdzy',
    '08JJS1ffSirGzNn7hMjRcjBN',
    'bvn7tg3ftneqbun2h67ae7nu',
    'zbjjfx6y76g5mmp3znsetnqn',
    '0j7iapqW9cMtP87GqDaxc2Um',
    'xlTM7AGGKuDAXQEGNYD9xlY7',
    'xZzirguQPULirOqbS2fmmGuG'
]
let a = 0;
function getKey() {
    let key = KEYS[a];
    if(!key) {
        a = 0;
        key = KEYS[a];
    }
    a++;
    return key;
}
async function test() {
    try {
        let proxy = helper.getRandomBestBuyProxy();
        let key = 'xlTM7AGGKuDAXQEGNYD9xlY7'//getKey()
        let pdpUrl = `https://api.bestbuy.com//v1/products(sku%20in(6430277))?apiKey=${key}&show=onlineAvailability,sku,name,salePrice,image&format=json&cache=` + v4();
        // for(let i = 0; i < helper.getRandomNumber(2, 50); i++)
        //     pdpUrl += "," + ['a','b','c','d','e'][helper.getRandomNumber(0, 5)];
        let time = Date.now();
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(pdpUrl, {
            "headers": {
                // 'Host': 'www.bestbuy.com',
                'Connection': 'keep-alive',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'sec-ch-ua-mobile': '?0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept': 'application/json',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'manual',
            //   "body": "{\"productIds\":[\"prod24964338\"],\"type\":\"LARGE\",\"clubId\":\"\"}",
            //   "method": "POST",
            //   "mode": "cors",
            // 'agent': new HTTPSProxyAgent(proxy),
            'timeout': 6000
        });
        let body = await response.json();
        console.log((body.products ? "Yes" : "No") + " - " + key);
        // console.log(response.headers.raw()['x-cache-hit'])
        // console.log(Date.now() - time);
        // console.log(body.sku.buttonState.buttonState)
        // await helper.sleep(500);
        // test();
        // console.log("_pxhd=" + response.headers.get('set-cookie').split("_pxhd=")[1].split(";")[0])
        // if (body.status)
        // {
        //     console.log(++success + " - " + proxy)
        //     // await helper.sleep(helper.getRandomNumber(9000, 10000));
        //     // test();
        // }
        // else
        //     console.log("FAIL - " + proxy)
    } catch (err) { console.log(err) }
}
async function start() {
    for (let i = 0; i < 10; i++) {
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