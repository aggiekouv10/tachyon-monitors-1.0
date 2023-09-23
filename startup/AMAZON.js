require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'REDDIT Initialized!');
});

require('../helper').init();
discordBot.login();
let amaonus2 = require('../Retail/amazon-us3');
//let amaonus4 = require('../Retail/amazon-us-id');
//let amazoncaid = require('../Retail/amazon-ca-id');
let amazonca = require('../Retail/amazon-ca');