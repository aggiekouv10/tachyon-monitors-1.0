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


let PROXIES = require('./proxiesFormatted.json');

let done = 0;
let US_PROXIES = []
let EUR_PROXIES = []

async function test(i) {
    try {
        await helper.sleep(helper.getRandomNumber(0, 15000))
        let proxy = PROXIES[i]//getProxy();
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://soul.com.mx/nuevo.html", {
            "headers": {
                'Host': 'www.soul.com',
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
            // 'agent': new HTTPSProxyAgent(proxy),
            'timeout': 15000
        }).catch(err => {
            console.log(err.message)
            done++;
            console.log(done)
            if (done === PROXIES.length - 1) {
                fs.writeFileSync('./proxies/soulproxies.json', JSON.stringify(US_PROXIES))
                // fs.writeFileSync('./proxies/soulEURproxies.json', JSON.stringify(EUR_PROXIES))
            }
            return;
        });
        if (!response) return;
        let body = await helper.getBodyAsText(response)
        done++;
        console.log(done + " - " + response.status + " - " + proxy);
        if (response.status === 200) {
            // console.log("Fetched - " + " - " + (body.includes('euro')) + " - " + proxy)
            // if (body.includes('euro'))
            //     EUR_PROXIES.push(proxy);
            // else
                US_PROXIES.push(proxy);
        }
        if (done === PROXIES.length - 1) {
            fs.writeFileSync('./proxies/soulproxies.json', JSON.stringify(US_PROXIES))
            // fs.writeFileSync('./proxies/soulEURproxies.json', JSON.stringify(EUR_PROXIES))
        }
        // fs.writeFileSync("wtf2.json", body.toString()); return
        // console.log((body.body ? ++success + " - " + "Yes" : "No") + " - " + proxy)
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
        test(i);
        // if (i === 9) {
        //     await helper.sleep(5000);
        //     i = 0;
        // }
    }
}
// console.log(PROXIES.length)
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