const database = require('../database/database')
const fs = require('fs')

function getWehooks() {
    let webhooks = []
    let fileNames = fs.readdirSync('./webhooks')
    for(let file of fileNames) {
        let hooooks = require('./webhooks/' + file)
        for(let hook of hooooks) {
            let unique = true
            for(let a of webhooks) {
                if(a.name === hook.name) {
                    unique = false
                    break
                }
            }
            if(unique) {
                webhooks.push(hook)
            }
        }
    }
    return webhooks
}

async function main() {
    let webhooks = getWehooks()
    console.log(webhooks.length)
    await database.query("DELETE FROM webhook_list")

    let PROMISES = []
    for (let obj of webhooks) {
        PROMISES.push(database.query(`INSERT INTO webhook_list(name, url, enabled) VALUES('${obj.name}', '${obj.webhook}', ${!obj.disabled})`));
    }
    const results = await Promise.all(PROMISES.map(p => p.catch(e => e)));
    const invalidResults = results.filter(result => (result instanceof Error));
    console.log(invalidResults)
    console.log("DONE!")
    process.exit(0)
}

// async function convertJStoJSON() {
//     let index = require('./index')
//     let webhooks = index.webhooks
//     let json = []
//     for (let key of Object.keys(webhooks)) {
//         // console.log(key, webhooks[key])
//         json.push({ name: key, webhook: webhooks[key] })
//     }
//     fs.writeFileSync("webhooks.json", JSON.stringify(json))
//     console.log("Converted!")
//     process.exit(0)
// }

main()