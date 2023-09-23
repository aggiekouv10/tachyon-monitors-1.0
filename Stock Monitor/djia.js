const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/821508924989505616/NICrmqA8L2qy25Y8STYs8lRLadMHqe1JZyySnzBR_1Y5dbqeXQ0T4I6D_aYOTL6h2P7X")
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }
cron.schedule("*/3 * * * * *", function(){
let crypto = 'djia'
let url = `https://www.marketwatch.com/investing/index/${crypto}`
const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(url).then(async response => {
  const dom = new JSDOM(await response.text());
  let price = dom.window.document.querySelector('.intraday__price').textContent;
  let market = dom.window.document.querySelector('.intraday__status .status').textContent;
  let change1 = "$" + dom.window.document.querySelector('.change--point--q').textContent;
  let change2 = dom.window.document.querySelector('.change--percent--q').textContent;
  console.log(price)
  var publichook = new webhook.MessageBuilder()
  .setName(`${crypto} price`)
  .setColor("#6cb3e3")
  .setTitle(`${crypto} price`)
  .setURL(url)
  .setAuthor('https://www.marketwatch.com/', '', 'https://www.marketwatch.com/')
  .addField("**Price**", price, true)
  .addField("**Change Value**", change1, true)
  .addField("**Change %**", change2, true)
  .addField("**Market**", market, true)
  .addField("**Links**", `[Robinhood](https://robinhood.com/stocks/DIA) | ` + `[Yahoo](https://finance.yahoo.com/quote/%5EDJI/) | `)
  .setThumbnail('https://cdn.discordapp.com/attachments/820804762459045910/821513983373606937/Untitled_design_15.png')
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531")
  .setTime()
  .setFooter("Stocks | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
await publichooks.send(publichook);
wait(3600000);
}).catch(err => {
  console.log(err);
});
})