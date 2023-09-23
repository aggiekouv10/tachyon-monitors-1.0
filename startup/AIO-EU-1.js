require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    //discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'Master Initialized!');
});

require('../helper').init();
discordBot.login();
let solebox = require('../AIO Sites/solebox');
let snipeseu = require('../AIO Sites/snipeseu-new');
let onygo2 = require('../AIO Sites/onygo2');
let lvr  = require('../AIO Sites/lvr');
//let asos = require('../AIO Sites/asos');
