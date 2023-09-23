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
//let offspring = require('../AIO Sites/offspring');
let lvr = require('../AIO Sites/lvr');
let mrporter = require('../AIO Sites/mrporter');
let netaporter = require('../AIO Sites/netaporter');
