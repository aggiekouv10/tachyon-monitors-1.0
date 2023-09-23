require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'RETAIL-3 Initialized!');
});



// const server = http.createServer(function (req, res) {
//     res.writeHead(200);
//     res.end();
// });
// server.listen(6000);

require('../helper').init();
discordBot.login();

let target = require('../Retail/targetv2');
discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
            // neweggus: Math.round(neweggus.totalData() * 1000) / 1000,
            bestbuyus: Math.round(bestbuyus.totalData() * 1000) / 1000,
            walmartus: Math.round(walmartus.totalData() * 1000) / 1000,
            target: Math.round(target.totalData() * 1000) / 1000,
            amdus: Math.round(amdus.totalData() * 1000) / 1000,
            amdca: Math.round(amdca.totalData() * 1000) / 1000,
            samsclub: Math.round(samsclub.totalData() * 1000) / 1000,
            // homedepot: Math.round(homedepot.totalData() * 1000) / 1000,
            // curryuk: Math.round(curryuk.totalData() * 1000) / 1000,
            // microcenter: Math.round(microcenter.totalData() * 1000) / 1000,
            // shopdisneyus: Math.round(shopdisneyUs.totalData() * 1000) / 1000,
            // soulmx: Math.round(soulmx.totalData() * 1000) / 1000,
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('RETAIL ONLINE')
            .addField('**Usages**',
             `Bestbuy-US: ${dataUsage.bestbuyus}MB\n` +
             `Walmart-US: ${dataUsage.walmartus}MB\n` +
             `Target: ${dataUsage.target}MB\n` + 
             `AMD-US: ${dataUsage.amdus}MB\n` +
             `AMD-CA: ${dataUsage.amdus}MB\n` +
            //  `Soul-MX: ${dataUsage.walmartus}MB\n` +
             `Samsclub: ${dataUsage.samsclub}MB\n` + 
            //  `Microcenter: ${dataUsage.microcenter}MB\n` + 
            //  `Shop-Disney: ${dataUsage.shopdisneyus}MB\n` + 
             `**Total**: ${Math.round((dataUsage.target + dataUsage.bestbuyus + dataUsage.walmartus + dataUsage.amdus + dataUsage.amdca + dataUsage.samsclub) * 1000) / 1000}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/829057240815501352/red-shopping-bag-with-circle-retail-logo-design-vector-21283467.jpg')

        msg.channel.send(exampleEmbed);
    }
})