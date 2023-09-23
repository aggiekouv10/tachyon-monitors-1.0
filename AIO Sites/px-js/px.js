const fetch = require('node-fetch');
const fs = require('fs');
const helper = require('../../helper');
const webhook = require("webhook-discord");
const { v4 } = require('uuid');
const { fstat } = require('fs');
const webhook2 = new webhook.Webhook('https://discord.com/api/webhooks/1017614709769375754/H2s4r8_LF9Kbrtyf2ionvNL1cMt1O-rUtqr9jWjQU_S61dy7GorEKxTX8Ia7tj2Wg81s');
MonitorPX()
let oldbody = ''
async function MonitorPX() {
    const response = await fetch(`https://www.hibbett.com/on/demandware.store/Sites-Hibbett-US-Site/default/PXFP-Handle;.js?src=AJDckzHD%2finit%2ejs&abcz=${v4()}`);
    if(response.status !== 200) {
        console.log('error')
        MonitorPX()
        return
    }
    const body = await response.text();
    if (body !== oldbody && oldbody !== '') {
        posthook()
     fs.writeFileSync(`${(new Date()).getTime()}.txt`, body)
    }
    oldbody = body
    await helper.sleep(60000);
    MonitorPX()
}

async function posthook() {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle('PX Changed!!!')
        .setURL('https://www.hibbett.com')
        .setAuthor('https://www.hibbett.com', '', 'https://www.hibbett.com')
        .setThumbnail('https://www.perimeterx.com/site-images/PerimeterX.png')
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("PX | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await webhook2.send(webhookMessage);
}
