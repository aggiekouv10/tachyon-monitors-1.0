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
let regionalProxies = {}

async function test(i) {
    try {
        await helper.sleep(helper.getRandomNumber(0, 15000))
        let proxy = PROXIES[i]//getProxy();
        let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://mylocation.org", {
            'headers': {
                'Accept': "application/json",
                'X-Requested-With': "XMLHttpRequest",
                'Accept-Encoding': "gzip, deflate",
                'Accept-Language': "en-us",
                'Origin': "https://www.supremenewyork.com",
                'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150",
                'Referer': "https://www.supremenewyork.com/mobile",
                'Proxy-Connection': "keep-alive"
            },
            'agent': new HTTPSProxyAgent(proxy),
            'timeout': 60000
        }).catch(err => {
            console.log(err.message)
            done++;
            console.log(done)
            if (done === PROXIES.length - 1) {
                for(let location of Object.keys(regionalProxies))
                fs.writeFileSync(`./regional_proxies/webshare_${location}_proxies.json`, JSON.stringify(regionalProxies[location]))
            }
            return;
        });
        if (!response) return;
        let body = await helper.getBodyAsText(response)
        done++;
        let root = HTMLParser.parse(body);
        if (response.status === 200) {
            let location = root.querySelectorAll('tr')[3].querySelectorAll('td')[1].textContent;
            if (!regionalProxies[location])
                regionalProxies[location] = [proxy];
            else
                regionalProxies[location].push(proxy);
            console.log(done + " - " + proxy + " - " + (location))
        } else {
            console.log(done + " - " + proxy + " - " + "AAA");
        }
        if (done === PROXIES.length - 1) {
            for(let location of Object.keys(regionalProxies))
            fs.writeFileSync(`./regional_proxies/webshare_${location}_proxies.json`, JSON.stringify(regionalProxies[location]))
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
    for (let i = 0; i < PROXIES.length; i++) {
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