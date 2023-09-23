const fetch = require('node-fetch')

async function test() {
    let response = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://api.capmonster.cloud/getBalance', {
        method: "POST",
        body: JSON.stringify({
            "clientKey": "7002b9f36273982ce0f09a7609b2d104"
        })
    })
    console.log(await response.json())
}

test()