const { fstat } = require('fs');
const fetch = require('node-fetch');
const got = require('got');
const fs = require('fs');
const request = require('request');
const HTTPSProxyAgent = require('https-proxy-agent');
const { HttpsProxyAgent } = require('hpagent');

// WALMART

let cookieJar = request.jar();

let SKU = "701-03737";
let URL = "https://www.pokemoncenter.com/tpci-ecommweb-api/product/" + SKU;

let PROXIES = require('./proxiesFormatted.json');

async function test() {
    let random = Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length;
    let PROXY = 'http://pcxkrtvq-dest:jvsjwc2a1kyk@138.122.194.152:7228'//PROXIES[random];
    const proxyAgent = new HTTPSProxyAgent(PROXY);

    let JAR = cookieJar;
    let px3 = '8cd24aa5251da007a14fd20170bcba31ccfc09d467c7a2fa759044dc2e75a7c9:2x5FVzPlFxw2MZ0vUyrAPp/SOH5DfbH/tmtuF0hHHyNN3aQJsIlZCcMHDScRclpOMZgo8UtjMSIKLFhIS5ULXQ==:1000:/wOiQCaqIw2S9nkDAlPtbEDv9o0xJqJA1Zhbgu32R3rCYsqXI4ek/pQqSkqBdOnTRkNNqdsHpqko99CoX1/D8RzHamd+tndqfxex/iK9g/+9XkpS3G4oQq0QVllz/g+jhNJug81XsP3amSSXCGubuXNJNy3Rx7Pky5x0VF6y468=';
    let pxvid = '6649d2c8-96f3-11eb-a6d0-0242ac120008';
    let pxde = 'cbe56fe5a17091548f2f6ec135dc27c07e8ceb39a6a55354a326052202b57783:eyJ0aW1lc3RhbXAiOjE2MTc3MzIwNzkwNTgsImZfa2IiOjAsImlwY19pZCI6W119';
    let METHOD = "GET";
    let HEADERS = {
        "accept": "*/*",
        "accept-encoding": 'gzip, deflate, br',
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        'cookie': 'correlationId=11b3dd7b-7ee6-45bf-9cc8-eb7a1a8d839a; _ga=GA1.2.697159117.1614267462; nmstat=52bcece3-680f-8c3c-a93a-3cc04e75ac6f; SERVERID=144a67951f33a7329ad03d2d8de4ddb1; _sp_ses.02f2=*; amp_logged_in_status=N; amp_correlationID=11b3dd7b-7ee6-45bf-9cc8-eb7a1a8d839a; amp_storefront=US; amp_97bb13=SvvIGAUWGRvpRpbtRYfvrt...1f2lmb2j9.1f2lmb2jh.a.6.g; _gid=GA1.2.326977976.1617783262; _uetsid=41fef050977911eb8303972da1cf83c4; _uetvid=41ff2320977911ebb1de0503f5adac47; auth={"access_token":"50b0e5ba-4163-497a-85d7-82621be52c6d","token_type":"bearer","expires_in":604799,"scope":"pokemon","role":"PUBLIC","roles":["PUBLIC"]}; _br_uid_2=uid=6608297954828:v=12.0:ts=1614267463586:hc=10; datadome=Ckg7onknSHy5S689i-rMmh-Q8DL6.po7rQd7B1JeV2c6HalxTHJNWSSzWB0e4BHecnof0Zgzl4k~HWRwtw~6kiVJTvWACmb4dAs4j35AnJ; _sp_id.02f2=248a18ee79f47b9d.1614267461.2.1617783321.1614267808; _gat_UA-625471-3=1',
        "pragma": "no-cache",
        "sec-ch-ua": "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        "x-store-scope": "pokemon"
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
    let sku = 12321312;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www.footlocker.com/api/products/pdp/${sku}?timestamp=${Date.now()}`, {
        "headers": {
            "Host": 'www.footlocker.com',
            'Connection': 'keep-alive',
            "accept": "application/json",
            // "accept-language": "en-US,en;q=0.9",
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
            "cache-control": "no-cache",
            'x-fl-request-id': requestId(),
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': "cors",
            'Sec-Fetch-Dest': 'empty',
            'Referer': `https://www.footlocker.com/product/~/${sku}.html`,
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': "en-US,en;q=0.9"
            //"cookie": `PrestaShop-057bf586429233ffbee1f12383261cc1=b12dbe993b8bdffee66c2a93f38bdeeea6debfe79d8dc665093e67e83c532a3a%3AdQ%2F1309C6DFxzenQ%2BgnNp3Ov0yILBgTf02TIysS3md%2BTqMXGByXkss7yFwiAhAA0xaGNWiuw4VuYYEJwi2%2FMELulMHiliwN4G%2BGWpTSJu0U%3D; _vsid=21e31648-5370-4ad0-9805-9387068726f8; _gcl_au=1.1.424455350.1618517506; _uetsid=cde5dc609e2611ebb25abbf0a4dbd6e6; _uetvid=cde60a409e2611eb94e9112c4dbf1031; _ga=GA1.2.393327732.1618517507; _gid=GA1.2.1433058723.1618517507; _dc_gtm_UA-42919622-3=1; _gat_UA-42919622-9=1; _gat_UA-42919622-4=1; _gat_UA-42919622-17=1; cb-enabled=enabled; _dc_gtm_UA-42919622-17=1; _dc_gtm_UA-42919622-4=1; _dc_gtm_UA-42919622-9=1; _fbp=fb.1.1618517507621.1765826404; geoIpTravel={"shopId":6,"data":{"popup_country":"US","popup_current_shop_id":6,"popup_redirect_shop_id":12,"popup_redirect_possible":true,"geoIpData":[]}}`
        },
        // "referrer": "https://www.footshop.eu/en/mens-shoes/113533-nike-air-force-1-experimental-lt-smoke-grey-court-purple-total-orange.html",
        // "referrerPolicy": "strict-origin-when-cross-origin",
        // "body": null,
        "method": "HEAD",
        // "mode": "cors"
        // agent: proxyAgent
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.error('error:', error); 
        let body = (await response.text());// Print the error if one occurred
        console.log('statusCode:', response.status + " - " + random + " - " + body.length); // Print the response status code if a response was received
        // console.log('body:', body);
        console.log('headers:', response.headers)
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

function requestId() {
    var _0x58278a = {
        'gNXUG': function (_0x467560, _0x525e1a) {
            return _0x467560 - _0x525e1a;
        },
        'kVcvN': function (_0x314893, _0x565ac5) {
            return _0x314893 | _0x565ac5;
        },
        'vFXPG': function (_0xb9c5ca, _0x1eb015) {
            return _0xb9c5ca * _0x1eb015;
        },
        'HakrX': function (_0x433a68, _0x494acc) {
            return _0x433a68 === _0x494acc;
        },
        'rQRQu': function (_0x26ed58, _0x138159) {
            return _0x26ed58 & _0x138159;
        },
        'nCnBj': "xHrSX",
        'LmTsY': function (_0x5e44be, _0x3636b4) {
            return _0x5e44be | _0x3636b4;
        },
        'IIiOJ': function (_0x53b6d8, _0xc4dd7b) {
            return _0x53b6d8 == _0xc4dd7b;
        },
        'julZB': function (_0x55f004, _0x40b642) {
            return _0x55f004 & _0x40b642;
        }
    };
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"["replace"](/[xy]/g, function (_0x496be2) {
        if (_0x58278a["HakrX"](_0x58278a["nCnBj"], _0x58278a["nCnBj"])) {
            let _0x4f8edf = _0x58278a["LmTsY"](Math["random"]() * 0x10, 0x0),
                _0x4d7f16 = _0x58278a["IIiOJ"](_0x496be2, 'x') ? _0x4f8edf : _0x58278a["julZB"](_0x4f8edf, 0x3) | 0x8;
            return _0x4d7f16["toString"](0x10);
        } else {
            for (var _0x3ed0d0 = [], _0x49f52a = 0x1; _0x49f52a < arguments["length"]; _0x49f52a++) _0x3ed0d0[_0x58278a["gNXUG"](_0x49f52a, 0x1)] = arguments[_0x49f52a];
            var _0x1196f2 = _0x58278a["kVcvN"](_0x58278a["vFXPG"](0x10, Math["random"]()), 0x0);
            return (_0x58278a["HakrX"]('x', t) ? _0x1196f2 : _0x58278a["kVcvN"](_0x58278a["rQRQu"](0x3, _0x1196f2), 0x8))["toString"](0x10);
        }
    });
};

for (let i = 0; i < 1; i++)
    test();