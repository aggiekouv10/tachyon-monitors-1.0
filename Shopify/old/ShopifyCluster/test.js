const ShopifyMonitor = require('./shopify-base');
let PROXIES = require('../proxiesFormatted.json');
const fetch = require('node-fetch');
const fs = require('fs');
const sites = [
    'https://eflash.doverstreetmarket.com/ 3',
    'https://shop.exclucitylife.com/ 4',
    'https://socialstatuspgh.com/ 8',
    'https://wishatl.com/ 5',
    'https://apbstore.com/ 5',
    'https://cncpts.ae 8',
    'https://a-ma-maniere.com/ 9',
    'https://undefeated.com 5',
    'https://stay-rooted.com/ 12',
    'https://shop.havenshop.com/ 9',
    'https://stay-rooted.com/ 12',
    'https://atmos.co.id/ 5',
    'https://1290sqm.com/ 10',
    'https://sneakerpolitics.com/ 8',
    'https://offthehook.ca/ 13',
    'https://shopnicekicks.com/ 14',
    'https://extrabutterny.com/ 38',
    'https://ycmc.com/ 31',
    'https://dtlr.com/ 58',
    'https://kith.com/ 46'
]

let startTime = new Date().getTime();
let total = 0;
let pages = 0;
let onPollComplete = async function () {
    total += 1;
    pages += this.pageCount;
    if (sites.length * parseInt(process.argv[3]) === total) {
        console.log("Completed in " + (new Date().getTime() - startTime) + "ms Page count: " + pages);
    }
}

for (let i = 0; i < sites.length; i++) {
    for (let j = 0; j < parseInt(process.argv[3]); j++) {
        setTimeout(async function () {
            let str = sites[i].split(" ")
            let monitor = new ShopifyMonitor(str[0], parseInt(str[1]), PROXIES);
            monitor.onPollComplete = onPollComplete;
            try {
            monitor.poll();
            } catch(err){}
        }, j * 100)
    }
}

// const fetch = require('node-fetch');

// const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://127.0.0.1:8000/', {
//     method: "POST",
//     body: JSON.stringify({
//         url: `https://kith.com/products.json?page=1&limit=250`,
//         options: {
//             'agent': null,
//         }
//     })
// }).then(res => res.json()).then(json => console.log("Loaded " + json.products.length))