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
        let response = await axios.get("https://www.pokemoncenter.com/tpci-ecommweb-api/product/701-05802?format=zoom.nodatalinks", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-store-scope": "pokemon",
                "cookie": "correlationId=9232f20c-6ae9-46e9-9a90-a3b4f3c27a0c; _ga=GA1.2.780297417.1617772028; nmstat=7a9c3b05-154f-9e3d-fd3f-78745be787ca; SERVERID=7bff064e362b774072107dbbfa33dd95; _sp_ses.02f2=*; amp_logged_in_status=N; amp_correlationID=9232f20c-6ae9-46e9-9a90-a3b4f3c27a0c; amp_storefront=US; _gid=GA1.2.1512728201.1619375742; auth={\"access_token\":\"7ab2b6f8-ed8f-44da-af1d-da0231915ac6\",\"token_type\":\"bearer\",\"expires_in\":604799,\"scope\":\"pokemon\",\"role\":\"PUBLIC\",\"roles\":[\"PUBLIC\"]}; _uetsid=09f84df0a5f511ebbd5cc32542b558b6; _uetvid=1a52ac90975f11ebbb933bd5277d101e; datadome=DnKSEsFmJRGHc2Lsdn~sFpwcGz0Np8eES-OK~KftEkkdGA.STDzGKXYJc.vO6DJ3cbwz3_YGdssY1jtETR0EXSJ3b_3zEpIkVp0U2sxfq7; _gat_UA-625471-3=1; _br_uid_2=uid%3D4638557496057%3Av%3D12.0%3Ats%3D1617772029193%3Ahc%3D18; amp_97bb13=xenZ1jLzxV8HR37gz5i2LC...1f4551mq1.1f455dpo5.j.d.10; _sp_id.02f2=c69e94ce2e3b1043.1617772027.5.1619376140.1619045839"
              },
              "referrerPolicy": "same-origin",
              "body": null,
              "method": "GET",
              "mode": "cors",

            // 'agent': new HTTPSProxyAgent(proxy),
            'timeout': 3000
        });
        let body = await response.data;
        fs.writeFileSync('response.html', body.toString())
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
        console.log(body)
        // // console.log(response.headers['x-cache'] + " - " + response.headers['x-cache-hits'])
        // // if(body.includes('View details for AMD RYZEN™ 9 5900X Processor'))
        // if (body.status)
        //     console.log(++success + " - " + proxy)
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