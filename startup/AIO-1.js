require('events').EventEmitter.defaultMaxListeners = 0
const database = require('../database/database');
const discordBot = require('../discord-bot');
const Discord = require('discord.js');
const http = require('http');

discordBot.getClient.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'AIO-1 Initialized!');
});



// const server = http.createServer(function (req, res) {
//     res.writeHead(200);
//     res.end();
// });
// server.listen(6000);

require('../helper').init();
// console.log("Connected to Database! (Footpatrol)");
discordBot.login();
//let finishline2 = require('../AIO Sites/finishline2')
//let jdsportsus = require('../AIO Sites/jdsports-us')
//let revolve = require('../AIO Sites/revolve');
//let sportchek = require('../AIO Sites/sportchek')
//let nordrequest = require('../AIO Sites/nordrequest');
//let footpatrol = require('../AIO Sites/footpatrol');
//let snipesusa = require('../AIO Sites/snipesusa');
//let hottopic = require('../AIO Sites/hottopic');
//let boxlunch = require('../AIO Sites/boxlunch');
//let soleboxreleases = require('../AIO Sites/soleboxreleases');
//let endclothing = require('../AIO Sites/endclothing');
//let endreleases = require('../AIO Sites/endreleases');
//let emiliopucci = require('../AIO Sites/emiliopucci');
//let slamjamreleases = require('../AIO Sites/slamjamreleases');
//let dsg = require('../AIO Sites/dsg');
//let dsgreleases = require('../AIO Sites/dsgreleases');
//let mrporter = require('../AIO Sites/mrporter');
//let netaporter = require('../AIO Sites/netaporter');
//let farfetch = require('../AIO Sites/farfetch');
//let lacosterestock = require('../AIO Sites/lacosterestock');
//let lacoste = require('../AIO Sites/lacoste');
//let asosrestock = require('../AIO Sites/asosrestock');
//let shopwss = require('../AIO Sites/shopwss');
//let footshop = require('../AIO Sites/footshop');
//let snipeseureleses = require('../AIO Sites/snipeseureleses');
//let snipesusareleases = require('../AIO Sites/snipesusareleases');
//let titoloshop = require('../AIO Sites/titoloshop'); cloud flare
//let svdonline = require('../AIO Sites/svdonline');
//let golftownall = require('../AIO Sites/golftownall');
//let finishlinereleses = require('../AIO Sites/finishlinereleses');
//let shopcapacity = require('../AIO Sites/shopcapacity');
//let sns = require('../AIO Sites/sns');
//let newbalance = require('../AIO Sites/newblanace')
//let finishline2 = require('../AIO Sites/finishline2')
//let jdsports2 = require('../AIO Sites/jdsports2')
//let snipesusa = require('../AIO Sites/snipesusa2');
let revolve = require('../aio sites/revolve')
//let yeeysupply = require('../AIO Sites/yeezysupply')
let dsg = require('../AIO Sites/dsg2')
let asos = require('../AIO Sites/asos')
discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "status") {
        let dataUsage = {
            //footpatrol: Math.round(footpatrol.totalData() * 1000) / 1000
            nordrequest: Math.round(nordrequest.totalData() * 1000) / 1000,
            offspring: Math.round(offspring.totalData() * 1000) / 1000,
            snipeseu: Math.round(snipeseu.totalData() * 1000) / 1000,
            sportchek: Math.round(sportchek.totalData() * 1000) / 1000,
        }
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#32CD32')
            .setTitle('AIO-1 ONLINE')
            .addField('**Usages**',
                `Nordstrom: ${dataUsage.nordrequest}MB\n` + 
                `Offspring: ${dataUsage.offspring}MB\n` +
                `Snipes-EU: ${dataUsage.snipeseu}MB\n` +
                `Sportchek-CA: ${dataUsage.sportchek}MB\n`+
                `**Total**: ${Math.round((dataUsage.nordrequest + dataUsage.offspring + dataUsage.snipeseu + dataUsage.sportchek) * 1000) / 1000}MB`)
            .setThumbnail('https://media.discordapp.net/attachments/820804762459045910/825960085213282354/Tachyon_Logo.png?width=630&height=630')

        msg.channel.send(exampleEmbed);
    }
})