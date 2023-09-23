const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/814565586058084402/WYz2pi9mJeSpoy33M0NQQ-VhISRvhAO8mxbpx98lD4aRuqUBQ1g2HnkKgIHvNmuNUwGR")

  var publichook = new webhook.MessageBuilder()
  .setName("Space Notify")
  .setColor("#121a2d")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.target.com/', '', 'https://www.target.com/')
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
