const fs = require('fs');
const crypto = require('crypto')

let PREFIXES;
let PROXIES;
let BIG_PROXIES;
let DD_PROXIES;
let BB_PROXIES;

const helper = {
    init: function () {
        PREFIXES = fs.readFileSync(__dirname + '/prefixes.txt').toString().split('\n');
        PROXIES = require(__dirname + '/proxiesFormatted.json');
        BIG_PROXIES = require(__dirname + '/proxiesBigPool.json');
        BB_PROXIES = require(__dirname + '/bbproxies.json');
        DD_PROXIES = require(__dirname + '/datadomeProxies.json');
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

    getRandomProxy: function () {
        return PROXIES[Math.floor(Math.random() * (0 - PROXIES.length)) + PROXIES.length]
    },

    getRotatingProxy: function () {
        return 'http://209.205.212.36:333';
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

    distributeWebhook: function () {

    }
}

module.exports = helper;