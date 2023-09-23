const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const uuidv4 = require('uuidv4').uuid;
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
let randomUseragent = require('random-useragent')
helper.init();
let success = 0;

let PROXIES = require(__dirname + "/proxiesFormatted.json");

let EXCLUDED_PROXIES = require('./walmartExcludedProxies.json')//[]

async function test(sku) {
    let proxy = getProxy();//'http://pcxkrtvq-dest:jvsjwc2a1kyk@69.58.9.76:7146'//
    if (!proxy) {
        fs.writeFileSync('walmartExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
        process.exit(0);
    }
    try {
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        // const cookie =
        // (await (await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://localhost/px-api/walmart', {
        //     method: 'POST',
        //     headers: {
        //         'content-type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         key: '330b02ad-dba3-44eb-83d0-d647a83036ff',
        //         proxy: 'vegaistheboss'//proxy
        //     })
        // })).json())
        // console.log(cookie)
        // await helper.sleep(2000);
        let useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'//randomUseragent.getRandom()
        let response = await axios.get("https://www.walmart.com/terra-firma/item/" + sku, {
            "headers": {
                'Host': 'www.walmart.com',
                'Connection': 'keep-alive',
                'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                'sec-ch-ua-mobile': '?0',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': useragent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                // 'Cookie': '_px3=36939b2e528de2df8e11a4e8d0abd7f2802f23390373d04377d2c8cd15d60501:sxo3Vajt8k0pUHe93wrb64mHmBQg2jFMmnWuRYjD4ivFjlPnEwZiuQX31AkwZShPhqpx2U/n4+sC0MfSeQEzsg==:1000:PmJdXlb+rYbh95rgAkDZ/vpfu1e6gVyNYn8mu9PhKgeJWOOMbjKD1qLhkTawXy8XMf8psqYSqrP+wAXiFbbfG9wSWIU+FBOfRHa0NNq0VfnMTPILj99lp3O1pA0gLk77jCFm78A4tbRUHtK56WTBFooEj6OTGxFegu4rNP8w9ppgBu797w2ejh4uxdlRLVhy3jofVkb92irQOzBk7Pf58w==',
                // 'Cookie': 'com.wm.reflector=reflectorid:0000000000000000000000;'
                // 'Cookie': 'TB_Latency_Tracker_100=1; TB_Navigation_Preload_01=1; TB_SFOU-100=; TB_DC_Flap_Test=1; g=0; vtc=QVLCXZCPqFuCxAtZ_BMN8k; bstc=QVLCXZCPqFuCxAtZ_BMN8k; mobileweb=0; xpa=2nuPc|EVAMb|Y1bve|btGWA|kEHNQ|n33lo; exp-ck=EVAMb1Y1bve1kEHNQ2; TS01b0be75=01538efd7cf5206dde76fd7f5622a5253cf58c11f3ceaaf6ce96fe519c00e4ffa26e64964a592ca70d77ad6122f9f9cb10bb3a8ed6; TS013ed49a=01538efd7cf5206dde76fd7f5622a5253cf58c11f3ceaaf6ce96fe519c00e4ffa26e64964a592ca70d77ad6122f9f9cb10bb3a8ed6; xpm=1+1622573237+QVLCXZCPqFuCxAtZ_BMN8k~+0'
            },
            // proxy: {
            //     host: '127.0.0.1',
            //     port: 8888
            // },

            'httpsAgent': new HTTPSProxyAgent(proxy),
            'timeout': 6000
        });
        if (response.status === 444) {
            console.log("ERR 444 - " + proxy);
            // await helper.sleep(500);
            EXCLUDED_PROXIES.push(proxy)
            test(sku);
            return;
        }
        let body = await response.data;
        // console.log(response.status);
        // console.log(body)
        // if (success > 3000) {
        //     fs.writeFileSync('walmartExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
        //     process.exit(0);
        // }
        if (body.status) {
            console.log(++success + " - " + EXCLUDED_PROXIES.length + " - " + body.status + " - " + proxy + " - " + sku + " - " + useragent)
            // await helper.sleep(helper.getRandomNumber(9000, 10000));
            // test();
        }
        else {
            console.log("FAIL - " + proxy + " - " + sku + " - " + useragent)
            // console.log(body)
        }
        await helper.sleep(500);
        test(sku);
    } catch (err) {
        if (err.response && err.response.status && err.response.status === 444) {
            console.log("ERR 444 - " + proxy);
            // await helper.sleep(500);
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
        console.log(err)
        test(sku);
    }
}

let a = 0;
function getProxy() {
    let proxy = helper.getRandomProxy()//PROXIES[a++];
    if (EXCLUDED_PROXIES.includes(proxy))
        return getProxy();
    return proxy;
}

let SKUs = [165545420, 363472942, 520468661, 493824815, 443574645, 606518560, 925543563, 861317493, 416088644, 329025428, 768801266, 496855103, 546167963, 597457882, 753404921, 937940830, 878560755, 391466325, 346077886, 377461077, 185595001, 461023791, 735657346, 572608250, 769099311, 415632183, 500335814, 674730375, 398841847, 743165744, 170986765, 953848932, 55190461, 478459646, 40720870, 666186689, 43939427, 788298905, 932138676, 193442830, 829324717, 910715018, 699715322, 167298231, 609305373, 812533932, 144765930, 582515798, 424283881, 48745828, 972334579, 715253838, 55084296, 49660635, 279456480, 45058113]

async function start() {
    for (let i = 0; i < 10; i++) {
        test(SKUs[0]);
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