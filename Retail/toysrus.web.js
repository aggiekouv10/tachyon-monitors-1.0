const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/814510595138519040/GkTUsKTMONJ8pL4sUYANjXL0h41kNlg3wrycZlKNPfimSh3m3RenLFNbPjaeWIu8fWa5")
var sku = "B08HVZC7Y6"
let url = `https://www.toysrus.com/tachyon-${sku}.html`;
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }


cron.schedule("*/3 * * * * *", function(){
got(url).then(async response => {
  const dom = new JSDOM(response.body);
  if(dom.window.document.querySelectorAll('.prod-ProductOffer-oosMsg.prod-PaddingTop--xxs').length > 0) {
    throw err;
  }else{}

  let title = dom.window.document.querySelector('title').textContent;
  let prices = dom.window.document.querySelector('.sales').textContent;
  let image = dom.window.document.querySelector('.carousel-inner img[src]').src;
  let price = prices.replace(" ", "");
  console.log(title);
  console.log(price)
  console.log(image)
  var publichook = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#121a2d")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.toysrus.com', '', 'https://www.toysrus.com')
  .addField("**Stock**", "In Stock", true)
  .addField("**Price**", price, true)
  .addField("**Links**", url)
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
  .setTime()
  .setFooter("ToysRus | v1.0 |", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
await publichooks.send(publichook);
  wait(300000);
}).catch(err => {
  console.log(err);
});
})