require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'SNKRS-1 Initialized!');
});



require('../helper').init();
discordBot.login();

let MONITOR = require('../Nike/SNKRS/ALL_SNKRS'); 
MONITOR.initateAll(discordBot)

discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        // let dataUsage = {
        //     footpatrolgb: Math.round(footpatrolgb.totalData() * 1000) / 1000,
        //     sizeuk: Math.round(sizeuk.totalData() * 1000) / 1000,
        //     sizedk: Math.round(sizedk.totalData() * 1000) / 1000,
        //     jdsportsuk: Math.round(jdsportsuk.totalData() * 1000) / 1000,
        // }
        // const exampleEmbed = new Discord.MessageEmbed()
        //     .setColor('#32CD32')
        //     .setTitle('MESH ONLINE')
        //     .addField('**Usages**',
        //      `Footpatrol-GB: ${dataUsage.footpatrolgb}MB\n` +
        //      `Size-UK: ${dataUsage.sizeuk}MB\n` +
        //      `Size-DK: ${dataUsage.sizedk}MB\n` +
        //      `JDSports-UK: ${dataUsage.sizedk}MB\n` +
        //      `**Total**: ${Math.round((dataUsage.footpatrolgb + dataUsage.sizeuk + dataUsage.sizedk + dataUsage.jdsportsuk) * 1000) / 1000}MB`)
        //     .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')

        let total = 0;
        let list = '';
        for(let site of MONITOR.getSites()) {
            // console.log(site)
            let data = Math.round(site.MONITOR.totalData * 1000) / 1000;
            total += data;
            list += `${site.MARKETPLACE}: ${data}MB\n`;
        }
        total = Math.round(total * 1000) / 1000;
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('SNKRS ONLINE')
            .addField('**Usages**',
             list + 
             `**Total**: ${total}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
        msg.channel.send(exampleEmbed);
    }
})