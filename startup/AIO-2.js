require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'AIO-2 Initialized!');
});

require('../helper').init();
discordBot.login();

let adidasus = require('../adidas/adidas-us')
let yeezysupply = require('../AIO Sites/yeezysupply')
let sns = require('../AIO Sites/sns')
let dsg = require('../AIO Sites/dsg')

discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
            nordrequestca: Math.round(nordrequestca.totalData() * 1000) / 1000
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('AIO-2 ONLINE')
            .addField('**Usages**',
                `Nordstrom-CA: ${dataUsage.nordrequest}MB\n` +
                // `Sportchek-CA: ${dataUsage.sportchek}MB\n`+
                `**Total**: ${Math.round((dataUsage.nordrequestca) * 1000) / 1000}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/825960085213282354/Tachyon_Logo.png?width=630&height=630')

        msg.channel.send(exampleEmbed);
    }
})