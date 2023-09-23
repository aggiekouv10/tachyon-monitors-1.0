const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/814316696281677854/iwhwolrH3gi0kofG10hM2bupP9vKdTSGzlu8jHEr8RAHRBa_lICrIYS0LR3OsaPW7gjm")
var sku = "ceee7570-ede8-4ced-9c1e-65c23ee1d4a3"
let url = `https://www.nbatopshot.com/listings/pack/${sku}`;
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
  if(dom.window.document.querySelectorAll('.Header__StyledRemainder-xb0bbe-4.ewcCSA').length > 0) {
    throw err;
  }else{}
  let title = dom.window.document.querySelector('.Header__StyledHeading-xb0bbe-1.bdjpmi').textContent;
  let price = dom.window.document.querySelector('.Heading__H3-kksint-2.Price__StyledValue-sc-14s53wf-1.iZrhpZ').textContent;
  let stock = dom.window.document.querySelector('.Header__StyledRemainder-xb0bbe-4.ewcCSA').textContent;
  let images = dom.window.document.querySelector('.Image__ImageWrapper-kmsi47-1.eYmIyV img[srcset]').srcset;
  let items = images.split(" ").join("")
  let item  = items.split(',')
  let image = item[3]

  console.log(title);
  console.log(price)
  console.log(image)
  var publichook = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.nbatopshot.com', '', 'https://www.nbatopshot.com')
  .addField("**Stock**", stock, true)
  .addField("**Price**", price, true)
  .addField("**Sku**", sku, true)
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
  .setTime()
  .setFooter("Target | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
await publichooks.send(publichook);
  wait(300000);
}).catch(err => {
  console.log('Sold Out');
});
})