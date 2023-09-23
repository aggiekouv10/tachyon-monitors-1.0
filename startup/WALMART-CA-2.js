require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'walmart Initialized!');
});

require('../helper').init();
discordBot.login();
let walmartca2 = require('../Retail/walmart-ca-v2');
let walmartpre =  require('../Retail/walmartcapre') 
discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
            walmartca: Math.round(walmartca.totalData() * 1000) / 1000,
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('RETAIL ONLINE')
            .addField('**Usages**',
             `Walmart-CA: ${dataUsage.walmartca}MB\n` +
             `**Total**: ${Math.round((dataUsage.walmartca) * 1000) / 1000}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/829057240815501352/red-shopping-bag-with-circle-retail-logo-design-vector-21283467.jpg')

        msg.channel.send(exampleEmbed);
    }
})