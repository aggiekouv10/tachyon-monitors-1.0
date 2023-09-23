const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/814565586058084402/WYz2pi9mJeSpoy33M0NQQ-VhISRvhAO8mxbpx98lD4aRuqUBQ1g2HnkKgIHvNmuNUwGR")
var sku = "77419246"
let url = `https://www.target.com/p/tachyon/-/A-${sku}`;
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

  let title = dom.window.document.querySelector('title').textContent;
  let price = "$199.99"
  let image = 'https://target.scene7.com/is/image/Target/GUEST_a518da4f-4173-47d1-baf4-b326344e3721?wid=700&hei=700&qlt=80&fmt=webp'
  //let price = dom.window.document.querySelector('.style__PriceFontSize-sc-17wlxvr-0.ceEMdT').textContent;
  //let image = dom.window.document.querySelector('.ZoomedImage__Zoomed-sc-1j8d1oa-0.dmkiKr img[src]').src;
  let cart = 'https://www.target.com/co-cart'
  console.log(title);
  console.log(price)
  console.log(image)
  var publichook = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.target.com', '', 'https://www.target.com')
  .addField("**Stock**", "In Stock", true)
  .addField("**Price**", price, true)
  .addField("**Sku**", sku, true)
  .addField("**Links**", '[CART](' + cart + ')')
  .setThumbnail(image)
  .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
  .setTime()
  .setFooter("Target | v1.0 |", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
await publichooks.send(publichook);
  wait(300000);
}).catch(err => {
  console.log(err);
});
})