const HTTPSProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
const { v4 } = require('uuid');
const helper = require('../../helper')
helper.init()

let a = 0;

let size = 0;
let proxy = "EMPTY";
let type = parseInt(process.argv[3]);
let limit = parseInt(process.argv[2]);
if(type === 1) {
    proxy = helper.getRandomProxy();
}
if(type === 2) {
    proxy = 'http://5.61.58.211:4097'
}
if(type === 3) {
    proxy = 'http://5.61.58.211:4022'
}
if(type === 4) {
    proxy = process.argv[4];
}
for (let i = 0; i < 1; i++) {

if(type === 5) {
    proxy = helper.getRandomProxy();
}

    let time = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://atmos.co.id/?limit=${limit}&order=` + helper.getRandomNumber(123, 123123123123123), {
        agent: proxy === "EMPTY" ? null : new HTTPSProxyAgent(proxy),
        headers: {
             'User-Agent': 'Gigabot/3.0 (http://www.gigablast.com/spider.html)',
             'X-Real-IP': '',
             'X-ProxyUser-Ip': '',
             'X-Forwarded-Host': '',
             'X-Forwarded-Port': '',
            //  'X-Forwarded-For': `a, 192.168.0.10 , 179.60.178.130`,
             'Forwarded': '',
             'Content-Security-Policy': '',
             'Cross-Origin-Resource-Policy': '',
             'Cross-Origin-Opener-Policy': '',
        }
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await helper.getBodyAsText(response)
        console.log(response.headers.raw()['x-cache'])
        if(!response.headers.raw()['x-cache']) {
            console.log(body)
            console.log(response.headers)
            console.log(response.status)
        }
        // console.log(JSON.parse(body).products.length)
        console.log("Time-" + i + ": " + (Date.now() - time))
        console.log(proxy)
    })
}
