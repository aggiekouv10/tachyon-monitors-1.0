const fs = require('fs');
const crypto = require('crypto')

const database = require('./database/database');
let PREFIXES;
let PROXIES;
let BIG_PROXIES;
let DD_PROXIES;
let BB_PROXIES;
let SUP_US_PROXIES;
let SUP_EU_PROXIES;
let MESH_PROXIES;
let WALMART_PROXIES;
let ZALANDO_PROXIES;
let NIKE_PROXIES;
let CA_RESI_PROXIES;
let LDLC_PROXIES;
let UAAGENTS;

let REGIONAL_PROXIES = {};

let MOBILE_USERAGENTS;

let STATS = {}

let HOOK_SOCKETS = {}

const helper = {
    init: function () {
        PREFIXES = fs.readFileSync(__dirname + '/prefixes.txt').toString().split('\n');
        PROXIES = require(__dirname + '/proxiesFormatted.json');
        BIG_PROXIES = require(__dirname + '/nordstrom.json');
        BB_PROXIES = require(__dirname + '/nordstrom.json');
        DD_PROXIES = require(__dirname + '/datadomeProxies.json');
        SUP_US_PROXIES = require(__dirname + '/supremeproxies.json')
        SUP_EU_PROXIES = require(__dirname + '/supremeEURproxies.json')
        MESH_PROXIES = require(__dirname + '/meshproxies.json')
        WALMART_PROXIES = require(__dirname + '/walmartExcludedProxies.json')
        ZALANDO_PROXIES = require(__dirname + '/zalandoProxies.json');
        NIKE_PROXIES = require(__dirname + '/nikeProxies.json');
        CA_RESI_PROXIES = require(__dirname + '/proxiesCAResidential.json');
        LDLC_PROXIES = require(__dirname + '/proxiesgoodgood.json');

        fs.readdirSync(__dirname + "/regional_proxies").forEach(file => {
            REGIONAL_PROXIES[file.replace('.json', '')] = JSON.parse(fs.readFileSync(__dirname + "/regional_proxies/" + file));
        });

        MOBILE_USERAGENTS = [
            'Mozilla/5.0 (Linux; Android 5.1.1; SAMSUNG SM-G800F Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.3 Chrome/38.0.2125.102 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_4_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53',
            'Mozilla/5.0 (Linux; Android 8.1.0; SM-J710MN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/75.0.3770.103 Mobile/15E148 Safari/605.1',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/84.0.4147.71 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Linux; Android 9; SM-N960F Build/PPR1.180610.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.157 Mobile Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 11_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E216'
        ]
    },

    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    sha1(data) {
        const hashed = crypto.createHash('sha1').update(data).digest('hex');
        return hashed;
    },

    getRandomNumber: function (min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },

    getRandomSKUPrefix: function () {
        return PREFIXES[Math.floor(this.getRandomNumber(0, PREFIXES.length))];
    },

    getRandomRegionalProxy: function (region) {
        let proxies = REGIONAL_PROXIES[`webshare_${region}_proxies`];
        return proxies[Math.floor(this.getRandomNumber(0, proxies.length))];
    },

    getRandomProxy: function () {
        return PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length]
    },

    getRandomCAResiProxy: function () {
        return CA_RESI_PROXIES[Math.floor(Math.random() * (0 - CA_RESI_PROXIES.length)) + CA_RESI_PROXIES.length]
    },

    getUSARotatingProxy: function () {
        return 'http://global.rotating.proxyrack.net:9000';
    },

    getMixedRotatingProxy: function() {
        return 'http://global.rotating.proxyrack.net:9000'
    },

    getRandomDDProxy: function () {
        return DD_PROXIES[Math.floor(Math.random() * (0 - DD_PROXIES.length)) + DD_PROXIES.length]
    },

    getRandomBigProxy: function () {
        return BIG_PROXIES[Math.floor(Math.random() * (0 - BIG_PROXIES.length)) + BIG_PROXIES.length]
    },

    getRandomBestBuyProxy: function () {
        return BB_PROXIES[Math.floor(Math.random() * (0 - BB_PROXIES.length)) + BB_PROXIES.length]
    },

    getRandomWalmartProxy: function () {
        return WALMART_PROXIES[Math.floor(Math.random() * (0 - WALMART_PROXIES.length)) + WALMART_PROXIES.length]
    },

    getRandomSupremeUSProxy: function () {
        return SUP_US_PROXIES[Math.floor(Math.random() * (0 - SUP_US_PROXIES.length)) + SUP_US_PROXIES.length]
    },

    getRandomSupremeEUProxy: function () {
        return SUP_EU_PROXIES[Math.floor(Math.random() * (0 - SUP_EU_PROXIES.length)) + SUP_EU_PROXIES.length]
    },

    getRandomMeshProxy: function () {
        return MESH_PROXIES[Math.floor(Math.random() * (0 - MESH_PROXIES.length)) + MESH_PROXIES.length]
    },

    getRandomZalandoProxy: function () {
        return ZALANDO_PROXIES[Math.floor(Math.random() * (0 - ZALANDO_PROXIES.length)) + ZALANDO_PROXIES.length]
    },

    getRandomNikeProxy: function () {
        return NIKE_PROXIES[Math.floor(Math.random() * (0 - NIKE_PROXIES.length)) + NIKE_PROXIES.length]
    },

    getRandomLDLCProxy: function () {
        return LDLC_PROXIES[Math.floor(Math.random() * (0 - LDLC_PROXIES.length)) + LDLC_PROXIES.length]
    },

    getProxyList: function () {
        return PROXIES;
    },

    getMobileUA: function () {
        return MOBILE_USERAGENTS[Math.floor(Math.random() * (0 - MOBILE_USERAGENTS.length)) + MOBILE_USERAGENTS.length]
    },

    getTime: function (utc) {
        let date = new Date()
        if (utc)
            return date.toUTCString().split(", ")[1].split("2021")[0] + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds() + "." + date.getUTCMilliseconds();

        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
    },

    getBodyAsText(response, ms = 1000) {
        let timeout = new Promise((resolve, reject) => {
            let id = setTimeout(() => {
                clearTimeout(id);
                reject('helper.js, Response to Text conversion timed out in ' + ms + 'ms.')
            }, ms)
        })

        return Promise.race([
            response.text(),
            timeout
        ])
    },

    async manageStats(sitename) {
        let query = await database.query(`SELECT * from stats where sitename='${sitename}'`)
        if(query.rows.length === 0) {
            query = await database.query(`INSERT INTO stats(sitename, success, total) VALUES('${sitename}', '0', '0')`)
            return this.manageStats(sitename)
        }

        let success = BigInt(query.rows[0].success);
        let total = BigInt(query.rows[0].total);

        STATS[sitename] = {
            total: total,
            success: success
        }

        updateStats(sitename, true)
        return STATS[sitename]
    },
}
async function updateStats(sitename, recurring, time = 10000) {
    while (true) {
        let stats = STATS[sitename]
        await database.query(`UPDATE stats SET success='${stats.success}', total='${stats.total}' WHERE sitename='${sitename}'`)
        // console.log(stats.success, stats.total)
        if(!recurring)
            break;
        await sleep(time)
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = helper;