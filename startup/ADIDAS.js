require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'ADIDAS Initialized!');
});

require('../helper').init();
discordBot.login();
let adidasar = require('../Adidas/adidas-ar');
let adidasau = require('../Adidas/adidas-au');
let adidasbe = require('../Adidas/adidas-be');
let adidasbr = require('../Adidas/adidas-br');
let adidasch = require('../Adidas/adidas-ch');
let adidascl = require('../Adidas/adidas-cl');
let adidasco = require('../Adidas/adidas-co');
let adidasus = require('../Adidas/adidas-us');
let adidasde = require('../Adidas/adidas-de');