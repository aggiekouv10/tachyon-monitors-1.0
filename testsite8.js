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
        let proxy = helper.getRandomProxy();
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://api.samsclub.com/v2/az/products/prod25320909?type=PRODUCT_CARD", {
            "headers": {
                // 'Authority': 'www.bhphotovideo.com',
                // 'Host': 'www.bhphotovideo.com',
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
            },
            method: 'GET',
            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 60000
        });
        let body = await helper.getBodyAsText(response)
        console.log(body)
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