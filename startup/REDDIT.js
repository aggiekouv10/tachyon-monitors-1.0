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


let deals = require('../Reddit Monitors/deals');
let freebies = require('../Reddit Monitors/freebies');
let dgamedeals = require('../Reddit Monitors/gamedeals');
let Buildapcsales = require('../Reddit Monitors/Buildapcsales');
let sneakerdeals = require('../Reddit Monitors/sneakerdeals');