const { fstat } = require('fs');
const fetch = require('node-fetch');
const got = require('got');
const fs = require('fs');
const request = require('request');
const HTTPSProxyAgent = require('https-proxy-agent');
const { HttpsProxyAgent } = require('hpagent');

// WALMART

let cookieJar = request.jar();

let SKU = "4162799";
let URL = "https://www.walmart.com/terra-firma/item/" + SKU;

let PROXIES = require('./proxiesFormatted.json');

async function test() {
    let random = 74;Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length;
    let PROXY = PROXIES[random];
    const proxyAgent = new HTTPSProxyAgent(PROXY);

    let JAR = cookieJar;
    let px3 = '8cd24aa5251da007a14fd20170bcba31ccfc09d467c7a2fa759044dc2e75a7c9:2x5FVzPlFxw2MZ0vUyrAPp/SOH5DfbH/tmtuF0hHHyNN3aQJsIlZCcMHDScRclpOMZgo8UtjMSIKLFhIS5ULXQ==:1000:/wOiQCaqIw2S9nkDAlPtbEDv9o0xJqJA1Zhbgu32R3rCYsqXI4ek/pQqSkqBdOnTRkNNqdsHpqko99CoX1/D8RzHamd+tndqfxex/iK9g/+9XkpS3G4oQq0QVllz/g+jhNJug81XsP3amSSXCGubuXNJNy3Rx7Pky5x0VF6y468=';
    let pxvid = '6649d2c8-96f3-11eb-a6d0-0242ac120008';
    let pxde = 'cbe56fe5a17091548f2f6ec135dc27c07e8ceb39a6a55354a326052202b57783:eyJ0aW1lc3RhbXAiOjE2MTc3MzIwNzkwNTgsImZfa2IiOjAsImlwY19pZCI6W119';
    let METHOD = "GET";
    let HEADERS = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'no-cache',
        // 'cookie': 'DL=94066,,,ip,94066,,; vtc=ZvezqkFPjiwgOYn9ZJLZFM; cart-item-count=0; _pxvid=6515cf9f-3055-11eb-9cb7-0242ac12000e; __gads=ID=6e351cd25a96f0a1:T=1606442889:S=ALNI_MZC1ze0pAZGDoaeQg8EeYLEJkloXA; location-data=94066:San Bruno:CA::0:0|21k;;15.22,46y;;16.96,1kf;;19.87,1rc;;23.22,46q;;25.3,2nz;;25.4,2b1;;27.7,4bu;;28.38,2er;;29.12,1o1;;30.14|2|7|1|1xun;16;0;2.44,1xtf;16;1;4.42,1xwj;16;2;7.04,1ygu;16;3;8.47,1xwq;16;4;9.21; TB_Latency_Tracker_100=1; TB_Navigation_Preload_01=1; TB_DC_Flap_Test=0; bstc=cxlS2UvkxOpDcf24u603W0; mobileweb=0; xpa=5n-Dd|CrKQ0|jhfa-|qnjoe|s-848|yoFi1; exp-ck=5n-Dd1jhfa-1s-8481yoFi11; TBV=7; ndcache=d; xpm=1+1617730168+ZvezqkFPjiwgOYn9ZJLZFM~+0; _gcl_au=1.1.383111117.1617730171; _fbp=fb.1.1617730171109.1808363043; viq=Walmart; cbp=315543095-1617730176468; tb_sw_supported=true; TB_SFOU-100=1; athrvi=RVI~hd22e900-h12cece37; s_sess_2=c32_v=S2H,PUT,null; prop32=S2H-V,PUT-V,PUT,S2H; _sp_id.ad94=ba3c2624-18a6-4aec-937e-4adbad799bcb.1617730181.1.1617730193.1617730181.c4b4c84e-18ab-4275-b803-a1cf35d64004; next-day=null|true|true|null|1617731722; TS01b0be75=01538efd7c7bbf44f499e9cefa076462c38d2bf7226e885bc0606e82fe67e6e8cb6aea4cf89e0ccb66fca82add5f84ab1521087c19; TS013ed49a=01538efd7c7bbf44f499e9cefa076462c38d2bf7226e885bc0606e82fe67e6e8cb6aea4cf89e0ccb66fca82add5f84ab1521087c19; com.wm.reflector="reflectorid:0000000000000000000000@lastupd:1617731960579@firstcreate:1606442887350"; akavpau_p8=1617732563~id=6c4a5afe6b9b167fd1ab9e07503f9136; _uetsid=a564591096fd11eb820a59ef45b6461e; _uetvid=a564895096fd11ebb1cbdf402b39b909; _pxff_rf=1; _pxff_fp=1; _pxff_cfp=1; _px3=8cd24aa5251da007a14fd20170bcba31ccfc09d467c7a2fa759044dc2e75a7c9:2x5FVzPlFxw2MZ0vUyrAPp/SOH5DfbH/tmtuF0hHHyNN3aQJsIlZCcMHDScRclpOMZgo8UtjMSIKLFhIS5ULXQ==:1000:/wOiQCaqIw2S9nkDAlPtbEDv9o0xJqJA1Zhbgu32R3rCYsqXI4ek/pQqSkqBdOnTRkNNqdsHpqko99CoX1/D8RzHamd+tndqfxex/iK9g/+9XkpS3G4oQq0QVllz/g+jhNJug81XsP3amSSXCGubuXNJNy3Rx7Pky5x0VF6y468=; _pxde=cbe56fe5a17091548f2f6ec135dc27c07e8ceb39a6a55354a326052202b57783:eyJ0aW1lc3RhbXAiOjE2MTc3MzIwNzkwNTgsImZfa2IiOjAsImlwY19pZCI6W119',//'viq=Walmart; _px3=' + px3 + "; _pxde=" + pxde + "; _pxvid=" + pxvid + ';',
        'pragma': 'no-cache',
        'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    }

    let req = {
        'url': URL,//'https://www.google.com',
        'agent': proxyAgent,
        //'jar': JAR,
        'method': METHOD,
        'headers': HEADERS,
    }

    // request(req, function (error, response, body) {
    //     console.error('error:', error); // Print the error if one occurred
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     //console.log('body:', body); // Print the HTML for the Google homepage.
    //     fs.writeFileSync('1.json', body)
    // });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(URL, req).then(async response => {
        // console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response.status + " - " + random + " - " +(await response.text()).length); // Print the response status code if a response was received
        console.log('body:', (await response.text()));
        // fs.writeFileSync('2.html', body)
    });
    // got(URL, {
    //     agent: {
    //       https: new HttpsProxyAgent({
    //         keepAlive: true,
    //         keepAliveMsecs: 1000,
    //         maxSockets: 256,
    //         maxFreeSockets: 256,
    //         scheduling: 'lifo',
    //         proxy: PROXY
    //       })
    //     }
    //   }).then(async response => {
        clearTimeout(timeoutId)
    //       console.log(response.status);
    //   }).catch(err => {
    //       console.log(err)
    //   })
}

for (let i = 0; i < 1; i++)
    test();