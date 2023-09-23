
const fs = require('fs');
const fetch = require('node-fetch');
const got = require('got')
const HTMLParser = require('node-html-parser');
monitor()
async function monitor() {
let response = await got('https://www.walmart.ca/api/checkout-page/checkout/access-points', {
                method: "POST",
                headers: {
                },
                json: {
                    "geoCode": {
                      "latitude": 45.4215296,
                      "longitude": -75.69719309999999
                    },
                    "searchRadius": "20000",
                    "filter": [
                      "INSTORE_PICKUP"
                    ],
                    "sellers": [
                      {
                        "sellerId": "0",
                        "orderValue": 1,
                        "items": [
                          {
                            "skuId": "6000200280558",
                            "quantity": 1,
                            "price": 1
                          }
                        ]
                      }
                    ]
                  },
                responseType: 'json',
                
                retry: 0
            })
            let body2 = await response.body
            let stores = body2
            for (let store of stores) {
                console.log('71171954104,' + store.serviceAddress.geoPoint.latitude + ',' + store.serviceAddress.geoPoint.longitude + ',6000202198563')
            }
}

