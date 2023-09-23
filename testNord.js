const fetch = require('node-fetch');
const got = require('got');
const fs = require('fs');
const request = require('request');
const HTTPSProxyAgent = require('https-proxy-agent')

// const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.pokemoncenter.com/product/701-06560/', {
//         headers: {
            // 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            // 'accept-encoding' : 'gzip, deflate, br',
            // 'accept-language': 'en-US,en;q=0.9',
            // 'sec-ch-ua': '"Chromium";v="88", "Google Chrome";v="88", ";Not A Brand";v="99"',
            // 'sec-ch-ua-mobile': '?0',
            // 'sec-fetch-dest': 'document',
            // 'sec-fetch-mode': 'navigate',
            // 'sec-fetch-site': 'none',
            // 'sec-fetch-users': '?1',
            // 'upgrade-insecure-requests': '1',
    //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
    //     }
    // }).then(response => response.text()).then(text => fs.writeFileSync('1.html', text));
// const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.eastbay.com/en/product/~/K5424006.html').then(response => response.text()).then(text => fs.writeFileSync('2.html', text));


// NORDSTROM CODE BELOW

let cookieJar = request.jar();

let SKU =  "5512377";
let URL = 'https://www.nordstrom.com/s/5837320'//"https://www.nordstrom.ca/api/style/" + SKU;
let PROXIES = require('./proxiesFormatted.json');
const helper = require('./helper');
helper.init()
let PROXY = PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];

let JAR = cookieJar;
let METHOD = "GET";
let HEADERS = {};

HEADERS.Host = 'www.nordstrom.com';
HEADERS.accept = 'application/vnd.nord.pdp.v1+json';
HEADERS['user-agent'] = 'Mozilla/5.0\x20(Macintosh;\x20Intel\x20Mac\x20OS\x20X\x2010_15_6)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/14.0.2\x20Safari/605.1.15 bot';
HEADERS['accept-language'] = 'en-US';

let req = {
    // 'url': URL,//'https://www.google.com',
    // 'agent': new HTTPSProxyAgent(PROXY),
    //'jar': JAR,
    'method': METHOD,
    'headers': HEADERS,
    // 'redirect': 'manual'
}

// request(req, function (error, response, body) {
//     console.error('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     //console.log('body:', body); // Print the HTML for the Google homepage.
//     fs.writeFileSync('1.json', body)
// });
let time = Date.now();
// const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(URL, req).then(async response => {
//     // console.error('error:', error); // Print the error if one occurred
//     // console.log('statusCode:', response); // Print the response status code if a response was received
//     //console.log('body:', body); // Print the HTML for the Google homepage.
//     let body = await helper.getBodyAsText(response)
//     console.log(response.headers)
//     // if (!body.price) {
//     //     //Out of stock or invalid sku
//     //     console.log("Not in stock")
//     //     return;
//     //   }
//     console.log(Date.now() - time)
//     console.log(response.status)
//     fs.writeFileSync('nord-test-json-3b.html', body)
// });

request['defaults']({
    'ciphers': 'ALL:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
    'tunnel': !![],
    'gzip': !![],
    'timeout': 0x3a98
})({
    'url': 'https://www.nordstrom.com/s/5905161',
    'proxy': 'http://markgingco:zDwdL8KNg1HkFvHo_country-UnitedStates_session-vBn2PUY4@proxy.packetstream.io:31112',
    'jar': cookieJar,
    'followRedirect': ![],
    'method': 'GET',
    'headers': {
        'Host': 'www.nordstrom.com',
        'accept': 'application/vnd.nord.pdp.v1+json',
        'user-agent': 'Mozilla/5.0\x20(Macintosh;\x20Intel\x20Mac\x20OS\x20X\x2010_15_6)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/14.0.2\x20Safari/605.1.15',
        'accept-language': 'en-us',
        // 'cookie': this['cookieString']
    }}, (err, response, body) => {
            console.log(Date.now() - time)
            console.log(response.headers)
            console.log(response.statusCode)
            fs.writeFileSync('nord-test-json-3c.html', body.toString())

    });