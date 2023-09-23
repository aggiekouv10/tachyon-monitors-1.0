const { webkit, devices } = require('playwright');
const iPhone11 = devices['iPhone 11 Pro'];
const fetch = require('node-fetch');
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent')
const helper = require('./helper');
helper.init()
let proxy = helper.getRandomProxy();
const launchOptions = {
    proxy: {
        server: proxy
    }
};
akamaigen()
async function akamaigen() {
    
    const browser = await webkit.launch({ headless: false, launchOptions, userAgent: randomUseragent.getRandom()});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
          ? route.abort()
          : route.continue()
      })
    await page.goto('https://www.amd.com/en/direct-buy/products/us');
    await page.waitForSelector('div[class="row-flex"]')
    await page.close()
    akamaigen()
 }




