const fetch = require('node-fetch')
const helper = require('../helper')
helper.init();
const HTTPSProxyAgent = require('https-proxy-agent')

async function test() {
    let proxy = helper.getRandomProxy();
    let offerID = '7z09p0%2BdT2gvVIe5OELUaN3%2BFY041my0d2NkwJt0y%2BbT92CR%2BbWlkkAc70yTJJ71Vf188%2Bpu52%2FTKEZUrXInMYXE7ZWG%2FamAxPV%2B4joxSiWNED58eAaB0PC2VQSDpUHr85CwCnxTcEgLPHOOgBdD%2Fw%3D%3D'
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`https://www-amazon-com.translate.goog/gp/aws/cart/add.html?OfferListingId.1=${offerID}&Quantity.1=1&tag=mms321-20&_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=en-GB&_x_tr_pto=nui`, {
        "headers": {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
            "Connection": "keep-alive",
            'User-Agent': 'Postasdatime/7.28.4',
        },
        // agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
        let text = await response.text();
        console.log(text.includes('XFX Speedster MERC319 AMD Radeon RX 6900 XT Black Gaming Graphics Card with 16GB GDDR6, HDMI 2,1, 2xDP, USB-C, AMD RDNA 2 RX-69XTACBD9') + "  " + response.status);
        // console.log(response.headers)
        console.log
    })
}

for (let i = 0; i < 100; i++)
    test();