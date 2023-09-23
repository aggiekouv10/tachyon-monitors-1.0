require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'Master Initialized!');
});

require('../helper').init();
discordBot.login();
let reddit = require('./REDDIT');
let releases = require('./RELEASES');
let slickdeals = require('./SLICKDEALS');
let home = require('./HOME');