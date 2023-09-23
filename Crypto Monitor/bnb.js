const request = require('request')
const cheerio = require('cheerio')
const fetch = require('node-fetch');
const cron = require("node-cron")
const webhook = require("webhook-discord")
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/821473119785058304/iPVvwVYJG0xp3LXsiIAktS7tyvP53cUhNYVN77U-2LevNq9PN_PsJNRQoDt9HGTyRqNv")

let crypto = 'BNB'

let url = `https://api.nomics.com/v1/currencies/ticker?key=c2528d7581aaf1bdfcd04798204778913a321dd1&ids=${crypto}&interval=1d&convert=USD&per-page=100&page=1`
cron.schedule("*/1 * * * *", function(){
  const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(url, {
    'headers': {
      'accept': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    },
  }).then(async response => {
        clearTimeout(timeoutId)
    let body = await helper.getBodyAsText(response)
    body = JSON.parse(body);
    let name = body[0].name
    let image = body[0].logo_url
    let price = body[0].price
    let symbol = body[0].symbol
    let capz = body[0].market_cap
    let capsz = capz.split(".")
    let caps = capsz[0]
    let exchanges = body[0].num_exchanges
    let pairs =  body[0].num_pairs
    let priceChange = body[0]["1d"].price_change_pct
    let volumez = body[0]["1d"].volume
    let volumezs = volumez.split(".")
    let volumes = volumezs[0]
    let volume = (intToString(volumes))
    function intToString(volumes) {
      var newValue = volumes;
      if (volumes >= 1000) {
          var suffixes = ["", "K", "M", "B","T"];
          var suffixNum = Math.floor( (""+volumes).length/3 );
          var shortValue = '';
          for (var precision = 2; precision >= 1; precision--) {
              shortValue = parseFloat( (suffixNum != 0 ? (volumes / Math.pow(1000,suffixNum) ) : volumes).toPrecision(precision));
              var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
              if (dotLessShortValue.length <= 2) { break; }
          }
          if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
          newValue = shortValue+suffixes[suffixNum];
      }
      return newValue;
    }
    let cap = (intToString(caps))
    function intToString(caps) {
      var newValue = caps;
      if (caps >= 1000) {
          var suffixes = ["", "K", "M", "B","T"];
          var suffixNum = Math.floor( (""+caps).length/3 );
          var shortValue = '';
          for (var precision = 2; precision >= 1; precision--) {
              shortValue = parseFloat( (suffixNum != 0 ? (caps / Math.pow(1000,suffixNum) ) : caps).toPrecision(precision));
              var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
              if (dotLessShortValue.length <= 2) { break; }
          }
          if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
          newValue = shortValue+suffixes[suffixNum];
      }
      return newValue;
  }
  if(priceChange.includes('-')) {
  var publichook = new webhook.MessageBuilder()
  .setName(name)
  .setColor('#FF1616')
  .setTitle(`${name} Price`)
  .setURL(`https://coinmarketcap.com/currencies/${name}`)
  .addField("**Symbol**", symbol, true)
  .addField("**Price**",'$' + price, true)
  .addField("**Market Cap**", '$' + cap, true)
  .addField("**Exchanges**", exchanges, true)
  .addField("**Number Pairs**", pairs, true)
  .addField("**Price Change**", priceChange + '%', true)
  .addField("**Volume**", '$' + volume, true)
  .setThumbnail('https://images-ext-1.discordapp.net/external/TFv6fumsiXp4LBkocOuG7fh13dV23E_DI3gOeAyVQMY/https/media.discordapp.net/attachments/820804762459045910/822935956860174336/1839.png')
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531")
  .setTime()
  .setFooter("Crypto | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
await publichooks.send(publichook);
  }else {
    var publichook = new webhook.MessageBuilder()
  .setName(name)
  .setColor('#7ED957')
  .setTitle(`${name} Price`)
  .setURL(`https://coinmarketcap.com/currencies/${name}`)
  .addField("**Symbol**", symbol, true)
  .addField("**Price**",'$' + price, true)
  .addField("**Market Cap**", '$' + cap, true)
  .addField("**Exchanges**", exchanges, true)
  .addField("**Number Pairs**", pairs, true)
  .addField("**Price Change**", priceChange + '%', true)
  .addField("**Volume**", '$' + volume, true)
  .setThumbnail('https://images-ext-1.discordapp.net/external/TFv6fumsiXp4LBkocOuG7fh13dV23E_DI3gOeAyVQMY/https/media.discordapp.net/attachments/820804762459045910/822935956860174336/1839.png')
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531")
  .setTime()
  .setFooter("Crypto | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
await publichooks.send(publichook);
  }
})
})