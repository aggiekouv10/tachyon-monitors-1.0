const axios = require('axios').default;
// const fetch = require('node-fetch');
const got = require('got');
const { fetch } = require('fetch-h2')
const HTTPSProxyAgent = require('https-proxy-agent');
const { HttpsProxyAgent } = require('hpagent')
const helper = require('./helper');
helper.init();
let success = 0;
async function test() {
    let time = Date.now();
    try {
        let proxy = helper.getRandomBestBuyProxy();
        let response = await got("https://www.bestbuy.com/api/3.0/priceBlocks?cache=441503da-899a-4012-8a46-d094201e4229&skus=6430624,6432399,6432400,6432445,6432446,6432447,6432653,6432654,6432655,6432656,6432657,6432658,6434198,6436191,6436192,6436193,6436194,6436196,6436219,6436223,6437565,6437909,6437910,6437912,6438278,6439127", {
            // 'url': "https://www.bestbuy.com/api/3.0/priceBlocks?skus=6373513",
            'method': "get",
            'headers': {
                'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                // 'accept-encoding': "gzip, deflate, br",
                'accept-language': "en-US,en;q=0.9",
                'sec-fetch-dest': "document",
                'sec-fetch-mode': "navigate",
                'sec-fetch-site': "none",
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
                // 'cookie': `s_vi=[CS]v1|302EE9EC18822E33-600004B76131C1AD[CE]; CTT=f32cc81067430b913f14ea47ea8b36d2; aam_uuid=82442975793338955882218680944790847428; vt=3b015f7c-91f6-11eb-959a-0aa5e870a381; 52245=; _gcl_au=1.1.1423393355.1617177233; oid=1331048236; optimizelyEndUserId=oeu1617177235030r0.8515090075336509; __gads=ID=899d02765f1bbb95:T=1617177240:S=ALNI_MaMo8bfuu9YY2r4nqM1LiFASco9NA; _cs_c=1; analyticsStoreId=852; analyticsToken=3b015f7c-91f6-11eb-959a-0aa5e870a381; locDestZip=96939; locStoreId=852; sc-location-v2={"meta":{"CreatedAt":"2021-03-31T09:09:49.439Z","ModifiedAt":"2021-03-31T09:09:49.859Z","ExpiresAt":"2022-03-31T09:09:49.859Z"},"value":"{\"physical\":{\"zipCode\":\"96939\",\"source\":\"A\",\"captureTime\":\"2021-03-31T09:09:49.438Z\"},\"destination\":{\"zipCode\":\"96939\"},\"store\":{\"storeId\":852,\"zipCode\":\"96701\",\"storeHydratedCaptureTime\":\"2021-03-31T09:09:49.859Z\"}}"}; sto__vuid=8b08f35ed8395e3fd699b0a545c68cca; bby_rdp=l; SID=41d03756-df4c-40af-bf8d-03da7b455868; _abck=5A1B86AAFF2A7279A29E5D4C1C800535~0~YAAQjowsMVSV5dh4AQAA8olo6wUsgMGiUVj0PruBltZynq+FEZhJIJZ6oSzZnHSmpos0le/zlcIFeyqVnvdf1tn3zRCW1uEpVW4efJJc/GsbL0RCw4qzyeSkaFq0pcfKFPB+RJD+oI26lQ0iTY67F2pTz4sa4rxupK8JMwkAr+JbjVuX9YDbqvYarCMjpfaXVaTMQPLb4i+Emeim0Foy8xuAyaR9Q3V65Bw/Q/s7LZUzAKIHKbuVVhryiRW7THvmLS4FjjqmTgDhPjuRZ4pptmYiN+xwJxpFDzFBovTdBOw5tRnT5gEoH1w/OxqMjJOWKs29dkDNCGbc1yRjj/Z7K7JphS16VUgqYFgSx6kEZsVqPHqGpZF/NWsUzNqz8kMCCdwMeUlfDa3wdyx1SXORnD7zCSpb688i+sQawKDOHSQrKoEuLy+UElOBf9c8Fc4d~-1~-1~-1; bm_sz=C41E673E57EC2D2AF22718D58AD35888~YAAQjowsMVOV5dh4AQAA8Ylo6wuxVqSF700UDSDirZl2bZO3hxE+RQj17i1gSvr3rgvg9qobT2OPHwCmRMW7KN1bbzCPrCyFRJMEejKtkfDDmycoSxCHgXMsa5bQQ+fMIS0S3sulc/c5LfPzITh3/kxU1DdxanChGfttQW1tRm4AoZ/K7cH5GHEsKN0UMVIIyQp1wd5S3BUtw9FjkYoORS1qI+uLp6BgQKi+aTqiVKtL+SpX5qUVdIBjgkkAeHD0qdjPE3FUuJrEH7mHCRmLxldSUQv3Yagy6+8GL7M=; AMCVS_F6301253512D2BDB0A490D45@AdobeOrg=1; AMCV_F6301253512D2BDB0A490D45@AdobeOrg=1585540135|MCAID|302EE9EC18822E33-600004B76131C1AD|MCMID|88842506232165449021722843157705365222|MCAAMLH-1619462010|12|MCAAMB-1619462010|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1618864410s|NONE|MCCIDH|2072372747|vVersion|4.4.0; _cs_mk=0.05632229196970817_1618857210412; s_cc=true; intl_splash=false; rxVisitor=1618857323818P7EUVLOTE62I5L3HJ1DOMNG9UB89LLHC; dtSa=-; COM_TEST_FIX=2021-04-19T18:35:25.265Z; c6db37d7c8add47f1af93cf219c2c682=7fd7dce73cfdc56562e3ae05cdc674f2; basketTimestamp=1618857327426; bby_cbc_lb=p-browse-e; ltc= ; bby_prc_lb=p-prc-w; dtCookie=v_4_srv_8_sn_KP4H30GTU16K7QM1HVPRFFEDVSC7AR4P_app-3Aea7c4b59f27d43eb_1_app-3A1b02c17e3de73d2a_1_ol_0_perc_100000_mul_1; c2=Computers & Tablets: Tablets: iPad: pdp; _cs_id=e5da63f6-3b8e-a663-d420-5f1eea2139fe.1617177265.8.1618858118.1618857365.1614963257.1651341265979.Lax.0; _cs_s=2.1; CRTOABE=0; s_sq=bbymainprod=%26pid%3DComputers%2520%2526%2520Tablets%253A%2520Tablets%253A%2520iPad%253A%2520pdp%26pidt%3D1%26oid%3Dhttps%253A%252F%252Fwww.bestbuy.com%252Fsite%252Fcombo%252Fapple-ipad%252F3cd8a4f5-569d-44f7-be59-583a8e9dbc1f%26ot%3DA; dtLatC=5; rxvt=1618860345852|1618857323827; dtPC=8$58545834_121h1vVRUUJUPWLRTMAGKRJUHHIMAQPAPWKAFC-0e3`
            },
            //'withCredentials': true,
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
            // "proxy": {
            //     host: '127.0.0.1',
            //     port: '8888'
            // },
            http2: true,
            'timeout': 7000
        });
        let body = JSON.parse(response.body);
        // if(body[0]['sku']['skuId']) {
        //     console.log(++success + " - " + proxy)
        // }
        console.log(body.length)
    } catch (err) { console.log(err) }
    console.log(Date.now() - time)
}
for (let i = 0; i < 1; i++)
    test();

// const fs = require('fs');
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