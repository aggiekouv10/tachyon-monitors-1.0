const request = require('request-promise');
const genCookie = require('./hibbett/px-payload');
const helper = require('../helper');
async function getProduct() {
    //console.log(await genCookie())
    //let cookie = await genCookie()
    //let proxy = await helper.getRandomDDProxy()
    //console.log(cookie)
    const options = {
        method: 'GET',
        url: 'https://hibbett-mobileapi.prolific.io/ecommerce/products/7P072',
        headers: {
            'X-PX-AUTHORIZATION': ` 3:3:11dafad20895d03c97148e0c97e2f877827128c48a13232544c3aba38531ca9c:P/GJEwdm8WLJeZX55szH1RtWbNAjV1hdQ9L07YBveaoPhTZBBFksLaApmbFxZiH5SRQRdByvrzKff9fYFXvYHw==:1000:g+Aen8T40xsS6V7n/EvgfSJzQ6bO+T7azg6jQRLQA/lLdy/vCd1ywsjVf/SllBE1+l6rvDX3FJfXpQ8+iM69g+hYTIpqMzmdGx7U7Kk0uJqrFIFmvPqUzFTxviqi2o63ce36hTtivy1rg2e0DGnKT4ICcuihj66nJnQBItXLL4423Uje9O4stUV2BnYR/e3hlMnfO2DQrPaS2SJu3a/VFg==`,
            //'cookie': '_px3=7795d36bcf5993b36354554786bc9efad2164715d48402b135f55d14b1e6bbed:IAp0RsoCUhyRNdfrWovS9+0yrnx7cZeC72vI+OANmd4oEJNWcNpkxA8cgpRTynqTMzenN5KUbQ8SvGXIWLHu6w==:1000:mldhNkE1+tmp3eci08cpM+RICOdDxK9f7jg1JPfR9ttqveDMlVENg+ngPVehUd+KtZuFr6B19uXjL6M2elCuE0/ZuyFLzxEa26bpBRjDx5YulELc0iOHVwrpTbbJwxl3id4AW7yz5sfzpJwUeWSOlsC5QtKTkW5fcOWu1hFNyZ+6u/wAChQ2rd22RBm8L+8fquMhrXsG6UwIGsVU2UILnw==',
            //'user-agent': 'Hibbett | CG/5.8.0 (com.hibbett.hibbett-sports; build:10351; iOS 16.0.0) Alamofire/5.0.0-rc.3',
        },
        //agent: await new HTTPSProxyAgent(proxy),
    };

    await request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
}
getProduct()