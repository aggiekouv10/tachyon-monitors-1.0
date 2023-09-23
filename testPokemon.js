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
    let PROXY = PROXIES[random];
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://www.canadacomputers.com/product_info.php?cPath=22_1953_1958&item_id=140271", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": "sid=spdgvam196ptumu42hgmbheth4; geolocation=49.36.43.183%7C%7C%7C%7CIndia%7CIN%7CAsia%7CAS%7C%7C1000%7C20%7C77%7CAsia%2FKolkata; recently_viewed_sli=140271; recently_viewed=140271; cc_user_id=f0f6c299-ca49-4631-9e7c-240ba7e8f730; flixgvid=flix606deb67000000.51427511; __utma=230348558.1041930360.1617816433.1617816433.1617816433.1; __utmc=230348558; __utmz=230348558.1617816433.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmt=1; inptime0_3924_en=0; popupadded=yes; __utmb=230348558.3.9.1617816434387"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    }).then(async response => {
        clearTimeout(timeoutId)
        // console.error('error:', error); 
        let body = (await response.text());// Print the error if one occurred
        console.log('statusCode:', response.status + " - " + random + " - " + body.length); // Print the response status code if a response was received
        // console.log('body:', body);
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

for (let i = 0; i < 3; i++)
    test();