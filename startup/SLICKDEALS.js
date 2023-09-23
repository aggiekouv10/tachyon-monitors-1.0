require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'SLICKDEALS Initialized!');
});

require('../helper').init();
discordBot.login();
let freebies = require('../slickdeals/freebies');
let hotdeals = require('../slickdeals/hotdeals');
let coupons = require('../slickdeals/coupons');
let populardeals = require('../slickdeals/populardeals');