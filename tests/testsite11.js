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
async function test() {
    try {
        let proxy = helper.getRandomBestBuyProxy();
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        let response = await axios.request("https://www.snipesusa.com/on/demandware.store/Sites-snipesusa-Site/en_US/Product-Variation?dwvar_1000089863_size=9&pid=1000089863&quantity=1", {
            "headers": {
                // 'authority': 'www.adorama.com',
                'cache-control': 'max-age=0',
                'upgrade-insecure-requests': '1',
                'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36`,
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'service-worker-navigation-preload': 'true',
                'sec-fetch-site': 'none',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-user': '?1',
                'sec-fetch-dest': 'document',
                'cookie' : `_pxvid=29f6c793-aca7-11eb-824f-0242ac120007; _px3=dca8d4a0b55523dda67cb0becf72074a8696f93b8963441e94d99de51e7c35f1:RlsLGOzqOGyFp+FHxgBBRkdRtsi4avIHvide6vKjJP80QpozMw4CrlKEybe2QtOFMbnUyBjrk1t4d5Cr8BLY6w==:1000:+lJb/PqmTdoKn2prQDIKc3MttK6aH2Wy0fEMZv3L0hZM6yj3pLmancDkcz20bGJy8FOH+UDYZtaRMevVDNZ82rrJfEGDiUm7TAIghuqRJblnY5Dt9KgZ6FpF0bf5ZP/a9DJ9flGENEeMgPXbeFlQvt25RlyHxH2aRYTABa8b+IQ=;`
            },

            'httpsAgent': new HTTPSProxyAgent(proxy),
            'timeout': 60000
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
        console.log(body.product.availability.messages)
        success++;
        // if(success !== 4)
        //     test()
        // else
        //     console.log(Date.now() - time)
        // // console.log(response.headers['x-cache'] + " - " + response.headers['x-cache-hits'])
        // // if(body.includes('View details for AMD RYZEN™ 9 5900X Processor'))
        // if (body.status)
        // {
        //     console.log(++success + " - " + proxy)
        // }
        // else
        //     console.log("FAIL - " + proxy)
    } catch (err) { console.log("FAIL");}// success=0;await helper.sleep(2500); test(); }
}
async function start() {
    for (let i = 0; i < 300; i++) {
        test();
        if (i === 15) {
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