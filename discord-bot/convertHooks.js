const fs = require('fs')

function convert() {
    let json = require(__dirname + '/webhooks/' + process.argv[2])
    let result = {}
    for (let obj of json) {
        result[obj.name] = ""
    }
    fs.writeFileSync(__dirname + "/converted.json", JSON.stringify(result))
    console.log("Converted!")
}

convert()

