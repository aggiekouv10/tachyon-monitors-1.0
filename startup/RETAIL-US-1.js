require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'RETAIL Initialized!');
});



// const server = http.createServer(function (req, res) {
//     res.writeHead(200);
//     res.end();
// });
// server.listen(6000);

require('../helper').init();
// console.log("Connected to Database! (Footpatrol)");
discordBot.login();
//let topps = require('../Retail/topps')
//let bestbuyus = require('../Retail/bestbuy-us-multi.bak');
// let neweggus = require('../Retail/newegg-us');
//let homedepot = require('../Retail/homedepot');
// let target = require('../Retail/targetv2');
//let amdus = require('../Retail/amd-us');
//let amdca = require('../Retail/amd-ca');
//let microcenter = require('../Retail/microcenter');
//let shopdisneyUs = require('../Retail/shopdisney-us');
//let targetv2 = require('../Retail/targetv2');
//let playstation = require('../Retail/playstation');
//et soulmx = require('../Retail/soul-mx')
let usmint = require('../Retail/us-mint')
let topps = require('../Retail/topps')
let walmartus = require('../Retail/walmartv2');
//let gamenerdz = require('../Retail/gamenerdz')
//let samsclub = require('../Retail/samsclub')
//let ldlc = require('../Retail/idlc')
//let cardieuk = require('../Retail/cardie-uk')
//let neweggweb = require('../Retail/newegg-us.web')
//let gamenerdzweb = require('../Retail/gamenerdz-web')
// let amdusitem = require('../Retail/amd-us-item')
//let gamestopweb = require('../Retail/gamestopweb')
//let evgaus = require('../Retail/evgaus');
//let evgaasia = require('../Retail/evgaasia');
//let aldi = require('../Retail/aldi-uk');
//let ebuyer = require('../Retail/ebuyer');
//let tafmx = require('../Retail/tafmx');
//let curryuk = require('../Retail/curry-uk');
//let xboxca = require('../Retail/xbox-ca');
//let xboxus = require('../Retail/xbox-us2');
//let bjs = require('../Retail/bjs');
//let thesource = require('../Retail/thesource');
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