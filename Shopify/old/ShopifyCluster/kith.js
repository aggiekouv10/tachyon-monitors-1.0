let fetch = require('node-fetch');
let fs = require('fs');
const HTTPSProxyAgent = require('https-proxy-agent');

let PROXIES = require('../proxiesFormatted.json');

const CONCURRENT_REQS = 50;

const WEBSITE = process.argv[2];
console.log(WEBSITE)

let totalPages = 0;
let pageCount = 0;
let lastPageLength = -1;
let products = [];

let startTime = new Date().getTime();

async function addProducts(homeURL, page, limit = 250) {
    let PROXY = PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length];
    console.log(PROXY)
    const proxyAgent = new HTTPSProxyAgent(PROXY);

    let req = await 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${homeURL}/products.json?page=${page}&limit=${limit}`, {
            'agent': proxyAgent,
        });
    console.log(`${homeURL}/products.json?page=${page}&limit=${limit}`)
    console.log(await req.text())
    return;
    // const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${homeURL}/products.json?page=${page}&limit=${limit}`, {
    //     'agent': null// proxyAgent,
    // });
    let body = (await req.json()).products;
    pageCount++;
    //console.log(pageCount + " - " + body.length + " - " + totalPages + " - " + page);
    products = products.concat(body);

    if(page === totalPages) {
        //console.log("LAST PAGE")
        lastPageLength = body.length;
    }

    if (pageCount === totalPages) {
        if (lastPageLength === 0) {
            console.log("Done! " + products.length + " loaded! Time: " + (new Date().getTime() - startTime) + "ms");
        } else {
            //console.log("What " + totalPages)
            let temp = totalPages;
            totalPages += CONCURRENT_REQS;
            lastPageLength = -1;
            for (let i = 0; i < CONCURRENT_REQS; i++) {
                addProducts(WEBSITE, temp  + i + 1)
            }
        }
    }
}

totalPages += CONCURRENT_REQS;
lastPageLength = -1;
async function start() {
    for (let i = 0; i < CONCURRENT_REQS; i++) {
        addProducts(WEBSITE, i + 1)
    }
}

// start()
addProducts('https://undefeated.com', 1, 250)