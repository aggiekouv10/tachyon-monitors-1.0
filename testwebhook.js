const webhook = require("webhook-discord");
const discordWebhook = new webhook.Webhook('https://discord.com/api/webhooks/858170629404622848/70YgNy6X274KkOZyBomETD0bbVaEzAAAcHlATfrQXQrsgGyGs1riJBOYFryux1zLz7jK')
const Discord = require('discord.js');
postRestockWebhook()
async function postRestockWebhook() {
    var webhookMessage = new webhook.MessageBuilder()
      .setName("Tachyon Monitors")
      .setColor("#6cb3e3")
      .setTitle('ROSAMONDE - Bum bag - schwarz  matt')
      .setURL('https://en.zalando.de/adidas-performance-sports-shorts-orbit-greenblack-ad542e2cp-n11.html')
      .setAuthor('https://www.offspring.co.uk', '', 'https://www.offspring.co.uk')
      .addField("**New Release**", 'true', true)
      .addField("**Price**", '**$10**', true)
      .addField("**Sku**", '``121002``', true)
      .addField("**Links**", '[Checkout](' + 'https://en.zalando.de/adidas-performance-sports-shorts-orbit-greenblack-ad542e2cp-n11.html' + ')')
      .setThumbnail('https://www.sneakersnstuff.com/images/299738/sneakers-13.png')
      .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
      .setTime()
      .setFooter("Offspring Releases | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
  }