const fs = require('fs');
const got = require('got');
const jsdom = require("jsdom");
const { createConnection } = require('net');
const webhook = require("webhook-discord")
const cron = require("node-cron")
const { JSDOM } = jsdom;
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/818261921442037781/f1nzILk3TIGlfcS8Wr5Zk4X8dmCDw5Eu5Wn-RythMxyDE75FFbyT0fCK769qBjQ1VbeH")
let pageUp = false
let url = `https://www.nbatopshot.com/`;

cron.schedule("*/3 * * * * *", function(){
got(url).then(async response => {
  let status 
  const dom = new JSDOM(response.body);
  if(dom.window.document.querySelectorAll('.Container__StyledContainer-sc-1hznfta-0.UDIGY.MessageBar__StyledContainer-sc-12jw4je-1.dYlUVP').length > 0) {
    status = false
  }else{
    status = true
  }
  console.log(status)
  if(status === pageUp) {
    return
  }
  pageUp = status
  let title
  if(pageUp) {
    title = 'Marketplace Up'
  }
  else{
    title = 'Marketplace Down'
  }
  var publichook = new webhook.MessageBuilder()
  .setName("Tachyon Monitors")
  .setColor("#6cb3e3")
  .setTitle(title)
  .setURL(url)
  .setAuthor('https://www.nbatopshot.com', '', 'https://www.nbatopshot.com')

  .setThumbnail('https://mma.prnewswire.com/media/1294997/Dapper_Labs__Inc__Dapper_Labs_Opens_NBA_Top_Shot_Beta_to_All_Fan.jpg?p=facebook')
  .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
  .setTime()
  .setFooter("Topshot | v1.0 |", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
await publichooks.send(publichook);
}).catch(err => {
  console.log(err);
});
})