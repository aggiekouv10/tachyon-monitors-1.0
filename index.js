require('events').EventEmitter.defaultMaxListeners = 0
const database = require('./database/database');
const discordBot = require('./discord-bot');

const extra = require('./discord-bot/extra-commands');

extra.addExtrasToBot(discordBot);

database.connect().then(() => {
    console.log("Connected to Database!");
    require('./helper').init();
    
    //Footsites
    let footlocker = require('./Footsites/footlocker');
    // let footaction = require('./Footsites/footaction');
    // let champssports = require('./Footsites/champssports');
    // let eastbay = require('./Footsites/eastbay');
    // let kidsfootlocker = require('./Footsites/kidsfoot');
    // let ladyfootlocker = require('./Footsites/ladyfootlocker');

    // let footlockerat = require('./Footsites/footlocker-at');
    // let footlockerbe = require('./Footsites/footlocker-be');
    // let footlockerca = require('./Footsites/footlocker-ca');
    // let footlockercz = require('./Footsites/footlocker-cz');
    // let footlockerde = require('./Footsites/footlocker-de');
    // let footlockerdk = require('./Footsites/footlocker-dk');
    // let footlockeres = require('./Footsites/footlocker-es');
    // // let footlockerfr = require('./Footsites/footlocker-fr');  //Dosent work!
    // let footlockergr = require('./Footsites/footlocker-gr');
    // let footlockerhu = require('./Footsites/footlocker-hu');
    // let footlockerie = require('./Footsites/footlocker-ie');
    // let footlockerit = require('./Footsites/footlocker-it');
    // let footlockerlu = require('./Footsites/footlocker-lu');
    // // let footlockernl = require('./Footsites/footlocker-nl');  //Dosent work!
    // let footlockerno = require('./Footsites/footlocker-no');
    // let footlockerpl = require('./Footsites/footlocker-pl');
    // let footlockerpt = require('./Footsites/footlocker-pt');
    // let footlockerse = require('./Footsites/footlocker-se');
    //let footlockeruk = require('./Footsites/footlocker-uk');  //Dosent work!


    // //AIO Sites
    // //let solebox = require('./AIO Sites/solebox');
    // let finishline = require("./AIO Sites/finishline");
    // let nordstrom = require('./AIO Sites/nordrequest');

})

discordBot.login();