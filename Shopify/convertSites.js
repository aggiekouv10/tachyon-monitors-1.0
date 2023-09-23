const fs = require('fs');

async function convertJS() {
    let text = fs.readFileSync('./js/shopify.js').toString()

    let a = text.split("new ShopifyMonitor(")
    for (let b of a) {
        let c = b.split(`'))`)[0]
        let site = c.split(",")[0].split(`"`)[1];
        let webhook = c.split(`'`)[1].trim();
        if (!site)
            continue
        console.log(site + "  ---  " + webhook)
        fs.appendFileSync('sites.txt', `${site} ${webhook}\n`)
    }
}

async function convertTXT() {
    let text = fs.readFileSync('sites.txt').toString().trim()
    let finalJSON = require('./sites.json')
    for (let a of text.split("\n")) {
        let b = a.split(" ")
        let site = b[0]
        let webhook = b[1];
        let siteHas = false
        for (let obj of finalJSON) {
            if (obj.url === site) {
                siteHas = true
                break;
            }
        }
        if (siteHas)
            continue
        console.log(site + "  ---  " + webhook)
        finalJSON.push({
            url: site,
            webhook: webhook
        })
    }
    fs.writeFileSync('sites.json', JSON.stringify(finalJSON))
}

convertTXT()