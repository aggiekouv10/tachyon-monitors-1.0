require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'Deals');
});

require('../helper').init();
discordBot.login();
let salesaholic = require('../Freebies/salesaholic');
let amazondeals = require('../Freebies/amazondeals');
let walmartdeals = require('../Freebies/walmartdeals');
let bestbuydeals = require('../Freebies/bestbuydeals');
let targetdeals = require('../Freebies/targetdeals');
let macysdeals = require('../Freebies/macysdeals');
let dailydeals = require('../Freebies/dailydeals');
let brickseek = require('../Retail/brickseek');
