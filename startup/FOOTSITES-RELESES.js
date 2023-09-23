require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'FOOTSITES-US Initialized!');
});




// const server = http.createServer(function (req, res) {
//     res.writeHead(200);
//     res.end();
// });
// server.listen(6000);

require('../helper').init();
// console.log("Connected to Database! (Footsites)");
discordBot.login();
let footlockerreleases = require('../Footsites/releases/footlocker-releases');
let champsreleases = require('../Footsites/releases/champs-releases');
let eastbayreleases = require('../Footsites/releases/eastbay-releases');
let footactionreleases = require('../Footsites/releases/footaction-releases');
let kidsreleases = require('../Footsites/releases/kids-releases');
let footlockeratreleases = require('../Footsites/releases/footlocker-at-releases');
let footlockerbereleases = require('../Footsites/releases/footlocker-be-releases');
let footlockercareleases = require('../Footsites/releases/footlocker-ca-releases');
let footlockerczreleases = require('../Footsites/releases/footlocker-cz-releases');
let footlockerdereleases = require('../Footsites/releases/footlocker-de-releases');
let footlockerdkreleases = require('../Footsites/releases/footlocker-dk-releases');
let footlockeresreleases = require('../Footsites/releases/footlocker-es-releases');
let footlockerfrreleases = require('../Footsites/releases/footlocker-fr-releases');
let footlockergrreleases = require('../Footsites/releases/footlocker-gr-releases');
let footlockerhureleases = require('../Footsites/releases/footlocker-hu-releases');
let footlockeriereleases = require('../Footsites/releases/footlocker-ie-releases');
let footlockeritreleases = require('../Footsites/releases/footlocker-it-releases');
let footlockerlureleases = require('../Footsites/releases/footlocker-lu-releases');
let footlockernlreleases = require('../Footsites/releases/footlocker-nl-releases');
let footlockernoreleases = require('../Footsites/releases/footlocker-no-releases');
let footlockerplreleases = require('../Footsites/releases/footlocker-pl-releases');
let footlockersereleases = require('../Footsites/releases/footlocker-se-releases');
let footlockerptreleases = require('../Footsites/releases/footlocker-pt-releases');
let footlockerukreleases = require('../Footsites/releases/footlocker-uk-releases');

discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('FOOTSITES-US ONLINE')
            .addField('**Usages**', `Footlocker US: ${dataUsage.footlocker}MB\nFootaction: ${dataUsage.footaction}MB\nKids Footlocker: ${dataUsage.kidsfootlocker}MB\nChampsports: ${dataUsage.champssports}MB\nEastbay: ${dataUsage.eastbay}MB\nLady Footlocker: ${dataUsage.ladyfootlocker}MB\n**Total**: ${Math.round((dataUsage.footlocker + dataUsage.footaction + dataUsage.kidsfootlocker + dataUsage.champssports + dataUsage.eastbay + dataUsage.ladyfootlocker) * 1000)/1000}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/811261940524384296/825732234597367868/14-147660_footlocker-inc-clearance-sale-footsites-logo-hd-png.png')

        msg.channel.send(exampleEmbed);
    }
})