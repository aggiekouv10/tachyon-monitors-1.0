let fetch = require('node-fetch');
let fs = require('fs');
const HTTPSProxyAgent = require('https-proxy-agent');

class ShopifyMonitor {
    totalPages;
    pageCount;
    lastPageLength;
    products;
    shouldBreakAll;
    startTime;

    constructor(website, concurrentRequests = 50, proxies = [], maxPageLimit = Infinity, responseLimit = 250) {
        this.WEBSITE = website;
        this.CONCURRENT_REQS = concurrentRequests;
        this.PROXIES = proxies;
        this.maxPageLimit = maxPageLimit;
        this.responseLimit = responseLimit;
    }

    async addProducts(homeURL, page, limit = 250) {
        if (this.shouldBreakAll)
            return;

        let PROXY = this.PROXIES.length > 0 ? this.PROXIES[Math.floor(Math.random() * (0 - this.PROXIES.length)) + this.PROXIES.length] : null;
        const proxyAgent = this.PROXIES.length > 0 ? new HTTPSProxyAgent(PROXY) : null;

        let req;
        let isCluster = process.argv[2] === "true";
        if (isCluster) {
            req = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('http://127.0.0.1:8000/', {
                method: "POST",
                body: JSON.stringify({
                    url: `${homeURL}/products.json?page=${page}&limit=${limit}`,
                    proxy: PROXY
                })
            })
        }
        else {
            req = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(`${homeURL}/products.json?page=${page}&limit=${limit}`, {
                'agent': proxyAgent,
            });
        }
        
        let body;
        try { 
            body = (await req.json()).products;
        } catch (err) {
            console.warn("Error parsing shopify link " + `${homeURL}/products.json?page=${page}&limit=${limit}`);
            console.log(err);
            return;
        }
        this.pageCount++;
        //console.log(pageCount + " - " + body.length + " - " + totalPages + " - " + page);
        this.products = this.products.concat(body);

        if (page === this.totalPages) {
            //console.log("LAST PAGE")
            this.lastPageLength = body.length;
        }

        if (this.pageCount === this.totalPages) {
            if (this.lastPageLength === 0) {
                this.shouldBreakAll = true;
                this.onPollComplete();
            } else {
                //console.log("What " + totalPages)
                let temp = this.totalPages;
                this.totalPages += this.CONCURRENT_REQS;
                this.lastPageLength = -1;
                for (let i = 0; i < this.CONCURRENT_REQS; i++) {
                    this.addProducts(homeURL, temp + i + 1)
                }
            }
        }
    }

    async poll() {
        this.pageCount = 0;
        this.totalPages = this.CONCURRENT_REQS;
        this.lastPageLength = -1;
        this.products = [];
        this.shouldBreakAll = false;
        this.startTime = new Date().getTime();
        for (let i = 0; i < this.CONCURRENT_REQS; i++) {
            this.addProducts(this.WEBSITE, i + 1)
        }
    }

    async onPollComplete() {
        //console.log("Done! " + this.products.length + " loaded! Time: " + (new Date().getTime() - this.startTime) + "ms");
    }
}

module.exports = ShopifyMonitor;