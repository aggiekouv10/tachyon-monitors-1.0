const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent');
const fs = require('fs');
const { start } = require('repl');

let CONCURRENT = 50;
let currentTotal = 0;
let currentCycle = 0;

const total = 1000;

let proxyFile = fs.readFileSync('proxies.txt').toString();
console.log("[PROXY-TESTER] Read all proxies");
let proxies = require('./proxiesFormatted.json');//proxyFile.split('\n');
console.log("[PROXY-TESTER] Loaded all proxies");
let pr = [];

// fs.writeFileSync('proxiesFormatted.json', JSON.stringify(pr))

async function test(proxy, unformattedProxy) {
    proxy = unformattedProxy
    const proxyAgent = new HTTPSProxyAgent(proxy);//http://h8upoTGfZF:LFeLC8VbSE@45.43.182.4:8175
    const time = new Date().getTime();
    let dead = false;
    const response = await
        //  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://127.0.0.1:8000/', {
        //     method: "POST",
        //     body: JSON.stringify({
        //         url: `https://www.kidsfootlocker.com/api/products/pdp/W3239001`,
        //         proxy: proxy
        //     })
        // })
        const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.footlocker.com/apigate/products/pdp/D5301045', { agent: proxyAgent, 
            console.log("*************************ERROR*************************")
            console.log("PROXY: " + proxy)
            console.log(err);
            dead = true;
        });
    currentTotal++;
    // if (!dead)
    //     console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
    currentCycle++;
    if (currentTotal > total) {
        return;
    }
    if (currentCycle === CONCURRENT && currentTotal !== total) {
        currentCycle = 0;
        for (let i = currentTotal; i < currentTotal + CONCURRENT; i++) {
            let proxy = proxies[i];
            let arr = proxy.trim().split(":");
            test(`http://${arr[2]}:${arr[3]}@${arr[0]}:${arr[1]}`, proxy)
            //pr.push(`http://${arr[2]}:${arr[3]}@${arr[0]}:${arr[1]}`);
        }
    }
    if(dead)
        return;
    if(response.status === 429) {
        console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
        return
    }
    if(response.status === 403) {
        console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
        return
    }
    let body = await helper.getBodyAsText(response)
    try {
        body = JSON.parse(body);
    } catch (err) {
          console.log("********************CHAMPSPORTS-ERROR********************")
        //   console.log("SKU: " + sku);
          console.log("Proxy: " + proxy);
          console.log(err);
          console.log(body)
        return;
    }
    if (!body.variantAttributes) {
        if (body.url && body.url.includes('geo.captcha')) {
            console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
            console.log("[PROXY-TESTER] DATADOME ANTI-BOT: " + proxy);
            return;
        }
        console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
        console.log("[PROXY-TESTER] WEIRD RESPONSE: " + proxy);
        console.log(body);
    }
    // fs.appendFileSync('datadomeProxyResults.txt', (new Date().getTime() - time) + "  -  " + proxy.trim() + '\n');
    
    console.log(`[PROXY-TESTER] Testing ${currentTotal}/${total} - ${response.status} - ${proxy}`);
}

for (let i = 0; i < CONCURRENT; i++) {
    let proxy = proxies[i];
    let arr = proxy.trim().split(":");
    test(`http://${arr[2]}:${arr[3]}@${arr[0]}:${arr[1]}`, proxy)
    //  pr.push(`http://${arr[2]}:${arr[3]}@${arr[0]}:${arr[1]}`);
}

// let readProxies = fs.readFileSync('./datadomeProxyResults.txt');
// let PROXIES = []
// for(let line of readProxies.toString().trim().split('\n')) {
//     // if(parseInt(line.split(' - ')[0]) < 300)
//     if(!PROXIES.includes((line.split(' - ')[1].trim())))
//         PROXIES.push(line.split(' - ')[1].trim());
// }

// fs.writeFileSync('datadomeProxies.json', JSON.stringify(PROXIES))
// console.log(PROXIES.length)