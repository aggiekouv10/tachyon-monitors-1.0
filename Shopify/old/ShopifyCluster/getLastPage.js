const ShopifyMonitor = require('./shopify-base');
let PROXIES = require('../proxiesFormatted.json');
const fetch = require('node-fetch');
const fs = require('fs');
const sites = [
    'https://kith.com/',
    'https://shop.exclucitylife.com/',
    'https://socialstatuspgh.com/',
    'https://a-ma-maniere.com/',
    'https://offthehook.ca/',
    'https://eflash.doverstreetmarket.com/',
    'https://1290sqm.com/',
    'https://atmos.co.id/',
    'https://cncpts.ae',
    'https://shopnicekicks.com/',
    'https://ycmc.com/',
    'https://wishatl.com/',
    'https://apbstore.com/',
    'https://upnycstore.com/',
    'https://shop.havenshop.com/',
    'https://undefeated.com',
    'https://extrabutterny.com/',
    'https://sneakerpolitics.com/',
    'https://dtlr.com/',
    'https://stay-rooted.com/'
]

async function test(i) {
        for (let page = 0; true; page++) {
            let req = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://127.0.0.1:8000/', {
                method: "POST",
                body: JSON.stringify({
                    url: `${sites[i]}/products.json?page=${page}&limit=250`,
                    proxy: null//PROXY
                })
            })
            let json = await req.json();
            if (json.products.length === 0) {
                sites[i] = sites[i] + " " + (page + 1);
                console.log(sites[i])
                break;
            }
        }
}

for (let i = 0; i < sites.length; i++) {
    test(i)
}

fs.writeFileSync('results.json', JSON.stringify(sites));