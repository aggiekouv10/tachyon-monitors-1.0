
const webhook = require("webhook-discord");
const DistributeManager = require('./manager')

var webhookMessage = new webhook.MessageBuilder()
    .setName("Tachyon Monitors")
    .setColor("#6cb3e3")
    .setAuthor('https://www.walmart.com', '', 'https://www.walmart.com')
    .addField("**Stock**", '1+', true)
    .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")

const SITENAME = 'TEST'
const distributor = new DistributeManager(SITENAME);


distributor.distributeWebhook(webhookMessage, "https://discord.com/api/webhooks/858170629404622848/70YgNy6X274KkOZyBomETD0bbVaEzAAAcHlATfrQXQrsgGyGs1riJBOYFryux1zLz7jK")