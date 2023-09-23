const { firefox } = require('playwright');
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
shapegen()
async function shapegen() {
    let fheader = ''
    let bheader = ''
    let cheader = ''
    let dheader = ''
    let zheader = ''
    let aheader = ''
    const browser = await firefox.launch({ headless: false, launchOptions, userAgent: randomUseragent.getRandom() });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        return route.request().resourceType() === 'image' || route.request().resourceType() === 'css' || route.request().resourceType() === 'js'
            ? route.abort()
            : route.continue()
    })
    await page.goto('https://www.nordstrom.com/s/tachyon/6674896');
    await page.waitForSelector('._1xvay')

    page.on('request', async resp => {
        if (resp.url().includes('/cake')) {
            fheader = await resp.text()
            await page.close()
            console.log('x-y8s6k3db-f:' + fheader.trim())
            shapegen()
        }

    })
}






