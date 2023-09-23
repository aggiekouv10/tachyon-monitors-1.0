const { fstat } = require('fs');
const fetch = require('node-fetch');
const got = require('got');
const fs = require('fs');
const request = require('request');
const HTTPSProxyAgent = require('https-proxy-agent');
const { HttpsProxyAgent } = require('hpagent');

// SOLEBOX CODE BELOW

let cookieJar = request.jar();

let SKU = "5445302";
let URL = "https://www.solebox.com/de_DE/p/comme_des_garcons_play-chuck_taylor_low-black-01654751.html";

let PROXIES = require('./proxiesFormatted.json');

const HEADLIST = [
    "AdsBot-Google (+http://www.google.com/adsbot.html)",
    "Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)",
    "AdsBot-Google-Mobile-Apps",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 (compatible; Google-Read-Aloud;  +https://support.google.com/webmasters/answer/1061943)",
    "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36 (compatible; Google-Read-Aloud; +https://support.google.com/webmasters/answer/1061943)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)  Chrome/49.0.2623.75 Safari/537.36 Google Favicon",
    "Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19"
];


async function test() {
    let PROXY = PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];
    const proxyAgent = new HTTPSProxyAgent(PROXY);

    let JAR = cookieJar;
    let METHOD = "GET";
    let HEADERS = {};

    HEADERS.Host = 'www.solebox.com';
    HEADERS.accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    let number = Math.floor(Math.random() * (0 - HEADLIST.length)) + HEADLIST.length;
    HEADERS['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'//HEADLIST[number];
    HEADERS['accept-language'] = 'en-US';

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
        console.log('statusCode:', response.status + " - " + number); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the Google homepage.
        // let body = await helper.getBodyAsText(response)
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

for(let i = 0; i < 100; i++)
    test();