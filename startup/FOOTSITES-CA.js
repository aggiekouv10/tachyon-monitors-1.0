require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'footsites ca Initialized!');
});
require('../helper').init();
discordBot.login();

let footlockerca = require('../Footsites2/footlocker-ca')
let champssportsca = require('../Footsites2/champssports-ca')