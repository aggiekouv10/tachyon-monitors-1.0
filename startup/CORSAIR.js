require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'CORSAIR Initialized!');
});

require('../helper').init();
discordBot.login();
//let corsair = require('../Retail/corsair');
let corsairca = require('../Retail/corsair-ca');