const algoliasearch = require("algoliasearch");
const { createNullCache } = require('@algolia/cache-common');

const client = algoliasearch("KO4W2GBINK", "dfa5df098f8d677dd2105ece472a44f8", {
    // Caches responses from Algolia
    responsesCache: createNullCache(), // or createNullCache()

    // Caches Promises with the same request payload
    requestsCache: createNullCache(), // or createNullCache()
});
const index = client.initIndex("catalog_products_en");

const objects = [
    {
        objectID: 1,
        name: "vans-vault-ua-og-old-skool-lx-vn0a4p3x4no1"
    }
];

const fs = require('fs')
const helper = require('./helper')

async function test() {
    let total = [];
    let done = 0;

    let time = Date.now()
    for (let i = 0; i < 5; i++) {
        index
            .search("Latest", {
                page: i,
                hitsPerPage: 1000
            })
            .then(async ({ hits }) => {
                console.log(hits.length + " - " + i + " - " + done);
                total = total.concat(hits);
                done++;
                if (done === 5) {
                    // console.log(total.length)
                    console.log(Date.now() - time)
                    await helper.sleep(500);
                    test()
                    // fs.writeFileSync("Results.json", JSON.stringify(total))
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
}

test()