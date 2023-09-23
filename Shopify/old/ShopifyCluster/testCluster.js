const fetch = require('node-fetch');

// let website = "https://kith.com";
let concurrentRequests = 50;
let proxies = [];

let PROXIES = require('../../../proxiesFormatted.json');

const sites = [
    // 'https://culturekings.com.au/',
    "https://kith.com",

]

async function test(website) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://127.0.0.1:8000/', {
        method: "POST",
        body: JSON.stringify({
            website,
            concurrentRequests,
            proxies: PROXIES
        })
    });
}

for(let site of sites) {
    test(site);
    test(site);
    test(site);
    test(site);
    test(site);
    test(site);
    test(site);
    test(site);
}