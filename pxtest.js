const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
puppeteer.launch({ headless: false }).then(async browser => {
    console.log('Running tests..')
    const page = await browser.newPage()
    async function monitor() {
    await page.goto('https://www.walmart.com/terra-firma/item/898664782')
    for (let i = 0; i < 10; i++) {
    await page.reload()
    await page.waitForTimeout(1000)
    if(await page.$('.sign-in-widget')) {
    for (let i = 0; i < 1000; i++) {
    await page.click('.sign-in-widget')
}
    }
    }
    await page.close()
    }
    monitor()
  })