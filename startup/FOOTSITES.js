require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'footlocker Initialized!');
});
require('../helper').init();
discordBot.login();

let kidsfootlocker = require('../Footsites2/kidsfootlocker-new')
let footlocker =  require('../Footsites2/footlocker-new')
let champssports = require('../Footsites2/champssports-new')