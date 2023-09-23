const axios = require('axios').default;
const fetch = require('fetch-h2').fetch;
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const {v4} = require('uuid')
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
helper.init();
let success = 0;
async function test() {
    try {
        let proxy = helper.getRandomProxy();
        // await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://api.endclothing.com/link/rest/v2/row/catalog/link?link=palm-angels-tennis-sneaker-pmia056s21lea0010155.html", {
        //     "headers": {
        //         "accept": "*/*",
        //         "accept-language": "en-US,en;q=0.9",
        //         "sec-fetch-dest": "empty",
        //         "sec-fetch-mode": "cors",
        //         "sec-fetch-site": "same-site"
        //     },
        //     "referrer": "https://www.endclothing.com/",
        //     "referrerPolicy": "strict-origin-when-cross-origin",
        //     "body": null,
        //     "method": "OPTIONS",
        //     "mode": "cors",
        //     // 'agent': new HTTPSProxyAgent(proxy),
        // }).then(async response => console.log(await response.text()));
        let time = Date.now()
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://www.amd.com/en/direct-buy/products/us?_=" + v4(), {
            "headers": {
                // 'Host': 'www.amd.com',
                // 'Connection': 'keep-alive',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'sec-ch-ua-mobile': '?0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
                'Accept': 'application/json',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                // 'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
              },
              method: "GET",
              redirect: 'manual',
            // 'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        });
        console.log(response.headers.toJSON());
        console.log(Date.now() - time);
        return;
        let body = await helper.getBodyAsText(response)
        fs.writeFileSync("amd-us.html", body.toString()); return
        console.log(body.length)
        console.log((body.body ? ++success + " - " + "Yes" : "No") + " - " + proxy)
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