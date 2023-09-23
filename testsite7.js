const axios = require('axios').default;
const fetch = require('node-fetch');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent');
const { HttpsProxyAgent } = require('hpagent');
const uuidv4 = require('uuidv4').uuid;
const fs = require('fs');
const HTMLParser = require('node-html-parser');
const helper = require('./helper');
helper.init();
let success = 0;
let time = Date.now()
async function test() {
    try {
        let proxy = helper.getRandomProxy();
        let url = '/api/mobile/v3/article/ni112o0bt-q11.json';
        let b = '9bde64a09e825d35a4128c813a05b5eff24b6ab6';
        let ts = Date.now();
        let sig = helper.sha1(url + b + ts);
        const storeURL = new URL('https://www.zalando.nl');
        let response = await got("https://www.shopdisney.com/on/demandware.store/Sites-shopDisney-Site/default/Product-Variation?&pid=412341238576&quantity=1", {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "cookie": "__cfduid=dd3d6d2fedee0efdf86065fb80d74e51b1620547768; dwac_ce1778d758bedaf518fe9c128f=AXxQc8nBR8uGpoOqAKWjaMZOZyUf1lHGoq0%3D|dw-only|||USD|false|US%2FPacific|true; cqcid=ceSmbQpocLcW7aLIFRCFIKgScz; cquid=||; dwanonymous_ca51daa3b1c83e95cf912612718c3c38=ceSmbQpocLcW7aLIFRCFIKgScz; sid=AXxQc8nBR8uGpoOqAKWjaMZOZyUf1lHGoq0; dwsecuretoken_ca51daa3b1c83e95cf912612718c3c38=\"hP8IZ02tRkeswY7kCyb0PRtwI1GynJqhSA==\"; __cq_dnt=0; dw_dnt=0; dwsid=mWnseAI8aBpp6TZWateOHF5b2y7UK34XTeIyHdrG3caZ2uQ7Kia78i0OLSelxl-5ddbWjSreL83Yg4aOPsxDlw==; bm_sz=97E27938C114F1C5FD5B1CC14293B216~YAAQ53MsMX7iujN5AQAAKpQsUAsPrFjxPiB53M3ih+a8Igx4lWfZvlauA1jzA84QDDASLfiPw5Mj8Xenkg6FZY/m0HLu0LHnPtonQ+RYn0v38qpfoVTtI2bnk597JNMeYQ1lvGvmJdrv0QtRIpfKd3Xog26DQrTBQk/oa7ntHBWtfFPW8BfJKableAEYOw39mGaP; bm_mi=E563C3F0A7E8EB1A8CD97C0BE27B40D0~FCtQWK+t98mm88Eekb8yixBc+8c/2mslPnaGG3BhoVFpOQtvLSmvJnU1OH8vP7QWjNw5WkgWwtXSlSuEjgMsw6/2MswieVcWHFjHXxrP74Cvi25fLP4LJSkkVbo16M20vB4Ex5Iy3qTqWnZOEmZR9cfRtaIJc3tlNbRoTJXDMGSTbe1IIVg0K958gheoAOoTFBQCJP3nfoc8L80hO/0pe/fL8eK9x7OYLOsJgB8198YdZ4ckPBjpaQuk0kF/wurrF5U1xFZbLAIhgAXnhyPukw==; wr_entry_path=/resource/79280b906brn252a6c8e5c049cd72580; check=true; mbox=session#15c410a6fa2e43188030872a9ec7beb0#1620550189; SWID=20aec774-d2e2-4eea-9ea3-1189e7a22722; bm_sv=57907A619EEAA4A666FC8442578C2D51~RW2QvB2kJ6jAYc8NaOSjVkdIpCmV3Blb5xcXw00ghYD/2K5pJxEHCt/1xWRTsHruxWclsGalwXb7wJ8hjoEQCqICGkT8bVHic8kaPgxIL4z0dtb1XfRUvvM7QhIv6MqgPTzxQdh92ZsQDMCMxNd3XTs3zE88xBKWq1L823U+L+M=; ak_bmsc=47932975ADDAF542D55DA91A18A7D889312C73E77E610000B99897606F27AE64~plWs0JTFVz5RgJho4vkKO5xOjlK+Wifh0F6KYf5yuzaYaE20nKyP7dF/zoBKPN3mN3moXDfiEHnBIm4cL6dZni7WpjIs9yjV7zs7jXa5P4L3ZrQocLHvSEAaiVy7sQN9j0YyzMUV/G5xfvzxE+grvdl4KF7aBkthoYqC6pdCAIg92ZpHfu4m20+VJb5y8gx8qtQ0GYYyAkX83RSNgD8LVhy//XNmCm3oT6CwLxgmpQFccfWx6cIh3j4i3sIf+1QNpg; AMCVS_EDA101AC512D2B230A490D4C%40AdobeOrg=1; AMCV_EDA101AC512D2B230A490D4C%40AdobeOrg=281789898%7CMCIDTS%7C18757%7CMCMID%7C38093731874519097482721646400068226893%7CMCAAMLH-1621153130%7C12%7CMCAAMB-1621153130%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1620555530s%7CNONE%7CvVersion%7C4.1.0; mp_disney_mixpanel=%7B%22distinct_id%22%3A%20%221795035233b26-0e92fcc1ca48aa-d7e1739-1fa400-1795035233cad8%22%2C%22bc_persist_updated%22%3A%201620548330301%7D; akavpau_vpii8skdhf4=1620548582~id=8aa8ba5c06deaae343f283a760cad2cd; _abck=C6584AFE235AD0D5681CB70EF61731A1~0~YAAQ53MsMWrkujN5AQAAOmk0UAWhMuKsynmY/54FXNRdi9snCdZijT7+UcqS/+BOx9/SHIe99Hrl1ztBpHq7QEclZg8fe9j5WROXWHGpQGA2wfw+XfK18TZEM+j2Q8ek9z+FDBielhw9kES8P/QBZ0ZGBnmF4G4PgGTiQeRujIkZB72Mj/Lnq1CsAYwYaU4inoCTjtD1NN2Gu+85Ty5z0YYQQVbhZeGTqV2pmNtrVcifDBMXgsO4eM5ddxiUG6i9MtxXZl3pr9jU1hZcbToP6og1zbqi1SObUjHQaAtOEryvNIAAi7L9Ix/kFjwnRgOiKJHHcH22rRkJR4j1XD2c84gCQFj6+kUrmiWj0YG8O/skZFZS15Q/Ii+kD7TlVn399G1cXfC2NYu8mEAOJDA03GUCCmyxz9HOFs2+cQ==~-1~||1-lIwmGAfKkd-1-10-1000-2||~-1"
            },
            agent: {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo',
                    proxy: proxy
                })
            },
            'timeout': 60000
        });
        let body = response.body
        console.log(body)
        // if (body.product.availability.messages) {
        //     console.log(++success + " - " + proxy)
        // }
        // else
        //     console.log("FAIL - " + proxy)
        // await helper.sleep(500);
        // test();
    } catch (err) { console.log(err); }// success=0;await helper.sleep(2500); test(); }
}
async function start() {
    for (let i = 0; i < 1; i++) {
        test();
        // if (i === 15) {
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