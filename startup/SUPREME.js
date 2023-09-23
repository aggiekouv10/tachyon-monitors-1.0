require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'SUPREME Initialized!');
});



// const server = http.createServer(function (req, res) {
//     res.writeHead(200);
//     res.end();
// });
// server.listen(6000);

require('../helper').init();
// console.log("Connected to Database! (Footpatrol)");
discordBot.login();

let supremeus = require('../Supreme Sites/supreme-us');
let supremeeu = require('../Supreme Sites/supreme-eu');
discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
            supremeus: Math.round(supremeus.totalData() * 1000) / 1000,
            supremeeu: Math.round(supremeeu.totalData() * 1000) / 1000,
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('SUPREME ONLINE')
            .addField(
                '**Usages**',
                `Supreme-US: ${dataUsage.supremeus}MB\n` +
                `Supreme-EU: ${dataUsage.supremeeu}MB\n` +
                `**Total**: ${Math.round((dataUsage.supremeus + dataUsage.supremeeu) * 1000) / 1000}MB`
            )
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/825960085213282354/Tachyon_Logo.png?width=630&height=630')

        msg.channel.send(exampleEmbed);
    }
})