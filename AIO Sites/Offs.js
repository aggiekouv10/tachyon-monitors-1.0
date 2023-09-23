const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const database = require('../database/database')
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/810722379230871552/eWNoBGAx6KZJgL9SqKXbSwLmroOgQSQyjY_Qb6JL8aJ8-gQ2_jnM1E0OAZW2HEpm0bdA")
var sku = "3932208339"
var url = `https://www.offspring.co.uk/view/product/offspring_catalog/21/${sku}`;
var image = `https://i1.adis.ws/i/office/${sku}_sd1.jpg`

async function monitor(sku) {
  got(url).then(async response => {
    const dom = new JSDOM(response.body);
    var title = (dom.window.document.querySelector('title').textContent);
    var price = (dom.window.document.querySelector('.price__price.js-price').textContent);
    var sizes = (dom.window.document.querySelector('.product__sizes-size-1').textContent);
    var publichook = new webhook.MessageBuilder()

      .setName("Tachyon Monitors")
      .setColor("#6cb3e3")
      .setTitle(title)
      .setURL(url)
      .setAuthor('https://www.offspring.co.uk', '', 'https://www.offspring.co.uk')
      .addField("**Stock**", "In Stock", true)
      .addField("**Sizes**", sizes, true)
      .addField("**Price**", price,)
      .addField("**Sku**", sku, true)
      .setThumbnail(image)
      .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
      .setTime()
      .setFooter("Tachyon", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await publichooks.send(publichook);
  });
}