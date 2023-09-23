require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'Releases Initialized!');
});

require('../helper').init();
discordBot.login();
let sneaktorious = require('../Raffle Monitors/sneaktorious');
let palacedrops = require('../Raffle Monitors/palacedrops');