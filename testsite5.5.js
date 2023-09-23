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
        let response = await axios("https://www.walmart.com/api/v3/cart/:CRT/item", {
            "method": "POST",
            "headers": {
                'Host': 'www.walmart.com',
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
                'Referer': 'https://www.walmart.com/ip/Skechers-Women-s-GOwalk-Joy-Slip-On-Sneaker/864544984?selected=true',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cookie': 'DL=94066%2C%2C%2Cip%2C94066%2C%2C; vtc=aFUD8oJ3kYbs6JHVbMiReI; _pxvid=43f2a567-8df1-11eb-8967-0242ac120006; _gcl_au=1.1.1696350024.1616735293; _fbp=fb.1.1616735294168.1087169262; type=GUEST; hasACID=1; auth=MTAyOTYyMDE4JBTbXLkHt1V%2FFBeB89gHVlJ86Xq1Z%2BYmsnzRZoNgo4BcKWvzXNZEJL%2BR5GqiQCPKxwe2gtrQKuA3aGDQ%2F3O%2BZy0BjEA3rzQ0%2FZuS9MMjLJ4%2BH4boxpF7JyhK6VWrlN4e767wuZloTfhm7Wk2KcjygkeeSCv4Chv5IarMOQ7pqjc%2FZwzCKD1CqozUDM%2FDvt9byd996WWEiazmIen8HuQA6Oe%2B8%2FefYdT7Eis2J%2FV%2FYmYUMk70P8glgOEpLOprhDfMywI05adPtwc9%2Fm5r1ONHR2kbfNA7f0lx12%2FOJtVbRUm7cpz8cx%2BsWosqwPMSLrNoR2QQcQPHPufHTlI6XfjYR4STVEq9OvZ3lhdI9BbYzw4%2FLwB6%2F1JgQ3kc94KgfkijR4Su6UkPaVgNGxI3s8Y%2BTA%3D%3D; ACID=f3e2e1de-9a35-41a1-8401-73e6fdf2c52d; TBV=7; tb_sw_supported=true; _abck=g5v1wfblnbj9dmxcmy6q_1946; next-day=1622754000|true|false|1622808000|1622662836; location-data=94066%3ASan%20Bruno%3ACA%3A%3A0%3A0|21k%3B%3B15.22%2C46y%3B%3B16.96%2C1kf%3B%3B19.87%2C1rc%3B%3B23.22%2C46q%3B%3B25.3%2C2nz%3B%3B25.4%2C2b1%3B%3B27.7%2C4bu%3B%3B28.38%2C2er%3B%3B29.12%2C1o1%3B%3B30.14|2|7|1|1xun%3B16%3B0%3B2.44%2C1xtf%3B16%3B1%3B4.42%2C1xwj%3B16%3B2%3B7.04%2C1ygu%3B16%3B3%3B8.47%2C1xwq%3B16%3B4%3B9.21; TB_Latency_Tracker_100=1; TB_Navigation_Preload_01=1; TB_SFOU-100=1; TB_DC_Flap_Test=0; g=0; bstc=UrT_loQPFCiKF94XjXFXu0; mobileweb=0; xpa=A3Uzd|EVAMb|iKsvw|s-848|tWDgk|txztR; exp-ck=A3Uzd2EVAMb1iKsvw1s-8481tWDgk1; TS01b0be75=01538efd7c213191144a2ebf6406129ce0f7cff03841f9b36a52481eccc7183a1bf9a1e804c8ba58bfdc853557631e7f57a8823529; TS013ed49a=01538efd7c213191144a2ebf6406129ce0f7cff03841f9b36a52481eccc7183a1bf9a1e804c8ba58bfdc853557631e7f57a8823529; CRT=96bc8c36-4452-4d29-bbee-064affd0560d; hasCRT=1; tb-c30=eus2-t1; xpm=1%2B1622662836%2BaFUD8oJ3kYbs6JHVbMiReI~%2B0; _pxff_cfp=1; ndcache=d; viq=Walmart; athrvi=RVI~h3ade85fd-h2e6d313-h2771f3af-h1239fb4c-h15aa282e-h118b3a4e-h727ad1d-h1c9243a3-h19b09a7e-h1b46d2ed; cart-item-count=0; com.wm.reflector=\"reflectorid:0000000000000000000000@lastupd:1622662860125@firstcreate:1622578125103\"; akavpau_p8=1622663460~id=b03df682fe92ebfe53287b1c29683937; s_sess_2=c32_v%3DS2H%2Cnull%3B%20prop32%3DS2H-V%2CS2H; _sp_ses.ad94=*; _uetsid=5237d240c30811ebb2995b890b0ef9bf; _uetvid=213816b0b70111eb8e926d302e5be053; _sp_id.ad94=cfbfe76f-f7c0-4a0b-969c-d8a33bca9615.1617539581.5.1622662974.1622572876.db3eec53-7cda-425c-aa8c-7e4d71044484; _px3=a287d9663bd54787d2675efb60ebb9345e82e50210ff2a6aeea0ac6df0501310:cWsT6f11te9MEuxHxZ2+u3Q0SzhBaLPAB0lFgD0KS/4TvezRWlkOl5o+WygvAjaWunrGOGRtw34U+vZj8gNglQ==:1000:E+gxCx05PSNCMkJms/IVu4Ufqx2I3Ka9nyu4CPWQ6cPbzALUV0glqBIK1HcENb9KObAEt511QBPdxvijMdvqZpKaeRxBRAUn+TSfQ/+ChcTpCBDF0Nhli73JtyJRtfsrRln+ylwkRpdDKVhYDzJm6m3SuLBfQvYhLPxmTuJrnZTknBHmIE1VvvpOaGatS9fxPt5SlJPV6rmdHSej9TvnLg==; _pxde=2e7329ea94053a54483309eb2afd75ff73e304d67166df21be09fe1353a6ffb4:eyJ0aW1lc3RhbXAiOjE2MjI2NjI4NzQyNDAsImZfa2IiOjAsImlwY19pZCI6W119'
            },
            data: JSON.parse("{\"offerId\":\"24EB0B25A4394E6D9903C3FB4E30C76F\",\"quantity\":1,\"location\":{\"postalCode\":\"94066\",\"city\":\"San Bruno\",\"state\":\"CA\",\"isZipLocated\":false},\"shipMethodDefaultRule\":\"SHIP_RULE_1\",\"storeIds\":[2648,5434,2031,2280,5426]}"),
            // "redirect": "manual",
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
        console.log(body)
        console.log(response.status);

        // test(sku);
        return;
        // console.log(body)
        // if (success > 3000) {
        //     fs.writeFileSync('walmartExcludedProxies.json', JSON.stringify(EXCLUDED_PROXIES));
        //     process.exit(0);
        // }
        if (body.status) {
            console.log(++success + " - " + EXCLUDED_PROXIES.length + " - " + body.status + " - " + proxy + " - " + sku)
            // await helper.sleep(helper.getRandomNumber(9000, 10000));
            // test();
        }
        else {
            console.log("FAIL - " + proxy + " - " + sku)
            // console.log(body)
        }

        await helper.sleep(500);
        test(sku);
    } catch (err) {
        console.log(err.response.data)
        console.log(proxy)
        // test(sku)
        return;
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
    }
}

let a = 0;
function getProxy() {
    let proxy = helper.getRandomProxy()//PROXIES[a++];
    if (EXCLUDED_PROXIES.includes(proxy))
        return getProxy();
    return proxy;
}

let SKUs = [363472942, 493824815, 443574645, 606518560, 925543563, 861317493, 416088644, 329025428, 768801266, 496855103, 546167963, 597457882, 753404921, 937940830, 878560755, 391466325, 346077886, 377461077, 185595001, 461023791, 735657346, 572608250, 769099311, 415632183, 500335814, 674730375, 398841847, 743165744, 170986765, 953848932, 55190461, 478459646, 40720870, 666186689, 43939427, 788298905, 932138676, 193442830, 829324717, 910715018, 699715322, 167298231, 609305373, 812533932, 144765930, 582515798, 424283881, 48745828, 972334579, 715253838, 55084296, 49660635, 279456480, 45058113]

async function start() {
    for (let i = 0; i < 1; i++) {
        test(SKUs[i]);
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