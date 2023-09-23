const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const HTTPSProxyAgent = require('https-proxy-agent');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/811107530180526100/5eUXKvh-2ilOa7mqWe_oBZzax3M9V1xXNP_zhUxMWQyhOgqaxFO60tv9E35Ywm7qwb0f")
var sku = "01900418"
var url= 'https://www.solebox.com/de_DE/p/jordan-air_jordan_6_retro_%28gs%29_-white%2Fcarmine-black-01900418.html';
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
  var title = (dom.window.document.querySelector('title').textContent);
  var image = (dom.window.document.querySelector('.pdp-image.pdp-image--desktop img[srcset]').srcset);
  var price = (dom.window.document.querySelector('.s-row.pdp-product-price').innerText);
  //var sizes = (dom.window.document.querySelector('div.b-swatch-value-wrapper .b-swatch-value--orderable').textContent);
  console.log(title);
  console.log(image);
  console.log(price);
  var publichook = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.footpatrol.com/','','https://www.footpatrol.com/')
  .addField("**Stock**","In Stock",true)
  .addField("**Sizes**",'sizes',true)
  .addField("**Price**",price,)
  .addField("**Sku**",sku,true)
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
  .setTime()
  .setFooter("Tachyon", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
  await publichooks.send(publichook);
  wait(300000);
}).catch(err => {
  console.log(err);
});
})