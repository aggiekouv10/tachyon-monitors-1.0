const fs = require('fs');
const fetch = require('node-fetch');
const AbortController = require('abort-controller')
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent')
const { HttpsProxyAgent } = require('hpagent')
const database = require('../database/database')
const webhook = require("webhook-discord");
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const randomUseragent = require('random-useragent');
const nodeRSA = require('node-rsa');
const { v4 } = require('uuid');
const { default: axios } = require('axios');
const helper = require('../helper');
const DistributeManager = require('../Webhook-Manager/manager')
const SITENAME = 'WALMARTUS2'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'walmartus2';
let PRODUCTS = {}

// ^^ THESE
const distributor = new DistributeManager(SITENAME); //this
const synthiysis = new webhook.Webhook('https://discord.com/api/webhooks/935982755114807326/ULsA3DIvd42y0MaMOo675EfCHkMdIOTPYdjp5ybbgdu9T1qYj_sP7GFvrjQb88Xj65Id');
const discordWebhook = new webhook.Webhook('https://discord.com/api/webhooks/814493251678765057/Cua-kQhOYfTrfBzu1fEumgmMlJoTtMe0EajqiPhEpfCp7RXYLw3H5LFnBm-nva_qekcr');
const fbhhook = new webhook.Webhook('https://discord.com/api/webhooks/889548324628201583/Jic0MGfVe6nPOVtXKZnnTwJsX8Sqn0t7-MNggBKN_v9XPKoCISox1zEcaeZ1tmWZn9tp');
const slaphook = new webhook.Webhook('https://discord.com/api/webhooks/888964706012901396/yIKYthF1n3E6MO4Nk2ikoEq85vPguRzieSYVwTjcphQoI61mYAgLHXEkKJYPra4FbEgr');
const spacehook = new webhook.Webhook('https://discord.com/api/webhooks/912554293410799616/efPN3_oXJnlGcvS9oYZFgKp3VxFMYsk8C-HngYeNnAUUJsIYTR73ZxQFuWM9F5mKNuR3');
const publicKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbM2br48JS2JJy8Ajy0gy33Gu5RNAFgysUp4Mj9FqzXWg7AwdGaXc0vIAGG3vmyrP906qJpiEV1aW9GhsEGNQ9Mjmngfnu1VAKZjskVToqG1ktiXZJKSlVUfGTYj+r1lKDgd2iKt4azIzoeElk1gnLovn8zEaiCT7prHlzWWb7JgW3qp1e12e5WvSC5xX9P5iKOs6WM3qTSAX3e8qGeA9wtlHdQuDjSjWA0WlYQIFKgpoCBNZeldNxel79QgR7QKG6Oo/H4aImhDW9vXH00mGVy9QX11ngovVYPhCQWzsAo+v+Y2lAJUtFdjr2t9/mJisKxpYvpMeqVo2ZSydwBmb5'
const consumerId = 'a4c258a6-8449-443f-ad9a-47f9933f6021'
const privateKey = "MIIEpAIBAAKCAQEAmzNm6+PCUtiScvAI8tIMt9xruUTQBYMrFKeDI/Ras11oOwMH\
Rml3NLyABht75sqz/dOqiaYhFdWlvRobBBjUPTI5p4H57tVQCmY7JFU6KhtZLYl2\
SSkpVVHxk2I/q9ZSg4HdoireGsyM6HhJZNYJy6L5/MxGogk+6ax5c1lm+yYFt6qd\
XtdnuVr0gucV/T+YijrOljN6k0gF93vKhngPcLZR3ULg40o1gNFpWECBSoKaAgTW\
XpXTcXpe/UIEe0ChujqPx+GiJoQ1vb1x9NJhlcvUF9dZ4KL1WD4QkFs7AKPr/mNp\
QCVLRXY69rff5iYrCsaWL6THqlaNmUsncAZm+QIDAQABAoIBAQCXocrmoSnUg1/i\
B/7WLr7aS/K7mi2blSHcFiWcVTrgj1wse7L56kTbM2fpj6SoQldEoS63OaaNjKVX\
ck/+2rtR5uZJcEXeQG7pGiSiRNqFFR81zF3S8PI/N8ZMdus6WjVX4uPFcxh5Gmx5\
HDyo1i3P1TVk9bf0zA+5ghdOyYRBzsKiX3HTRFLGn0EGEDpXwqvq43qJ49DL/YVe\
t0eKYS9E7F3MNqAQDHS4tuc0QsidFQHn50uLOIKtyAZ9lcc5X8Lw/3HLWM1+8hzD\
wX9N5C0YlUen3yGuMpY89jheLp1f5NRqE1JxHK5Rcb0MWNmMum5B5Azzg+0+NOoi\
Bi7bb98BAoGBAO3gWf9K7jrx8N15qJYb6lHIUvyTgrmu8VidbKOaFSr6Xmq/KTts\
w2F0YR15/N03cyeJBKYP/VWcTEJsyWXiy/XoFjjddLdCz8eMeMdowAMeWSDC7/DC\
B8xY2148u5QdIe/+UCCFGCFVxRSdAayYxMQjChUw0ZfFW9Cor/hA452pAoGBAKcG\
gitiez4F6bpCIelLerM8gambpC490LwILtcVCU3HzXoP+BfMd+NjgudqJpQ8Arqq\
y+1qkwfOkH0GUaBl6FHYEM0vZAfD00f4jL18Ft3wlvqCerxAU0GQWxIi2b8XYO04\
N9MtEMOwDr50bXeHKVYYhzrABNUxQ1e4NRWrazDRAoGAcC584uu4e+37tMcaHWie\
0eDSWjFK1jzNrwfW4zTYRMN8YYUzccXyQnR7FEaiXMU4tm1k1tf1ljk2saDSPg1+\
OMMyL7EoyQBmMuppT0l0PERErjGgrH8k5FcHZWLo54nxplfd++gooBft8LG2x2no\
acNIjwPN5HB7w2S6UC5x6bkCgYBafKMuv+bGvktWthdLHbI2wlP4wDJdPu4DwGcn\
7OSid9lxBI/CzOoyjanQl2iZLD3KRVe/otpPA3Cx2yeDv1HybR0FHGST9FpVhmkx\
CrYUvQ/+XYwCytKQFZXRKIJRDWhce/V6edK4QXxrYAYiGF6jnxw8DuVPXqX+MvTH\
bZvf0QKBgQCoDO0nfdW+TWGu4C9TgcX9lX+1G1Uszz0d6zmiRhh8dqconUoANpuV\
pgvIgsD2l2KOGiSrRknjdoutMPJLmdsJvi6ycO3/oOsAenfe/1/uoukpw9HGxdQ+\
NfNFwzDKLFEki8LLhbVesYeWNcAwmRkqpPqFN+GSuHt+jyYI2XoBgw=="

const keyVer = '2'

const generateWalmartHeaders = () => {
    const hashList = {
        "WM_CONSUMER.ID": consumerId,
        "WM_CONSUMER.INTIMESTAMP": Date.now().toString(),
        "WM_SEC.KEY_VERSION": keyVer,
    };

    const sortedHashString = `${hashList["WM_CONSUMER.ID"]}\n${hashList["WM_CONSUMER.INTIMESTAMP"]}\n${hashList["WM_SEC.KEY_VERSION"]}\n`;
    const signer = new nodeRSA(privateKey, "pkcs1");
    const signature = signer.sign(sortedHashString);
    const signature_enc = signature.toString("base64");

    return {
        "WM_SEC.AUTH_SIGNATURE": signature_enc,
        "WM_CONSUMER.INTIMESTAMP": hashList["WM_CONSUMER.INTIMESTAMP"],
        "WM_CONSUMER.ID": hashList["WM_CONSUMER.ID"],
        "WM_SEC.KEY_VERSION": hashList["WM_SEC.KEY_VERSION"],
    };
}

startMonitoring();

async function startMonitoring() {
    await distributor.connect() //this

    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status,
            lastMonitor: 0
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
        // break;
    }
    console.log('[WALMART-US-3] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getMixedRotatingProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    // console.log('Good 0', sku, Date.now())
    const controller = new AbortController(); //this
    const timeoutId = setTimeout(() => controller.abort(), 4000) //this
    fetch(`https://developer.api.walmart.com/api-proxy/service/affil/product/v2/items/${sku}`, {
        'headers': generateWalmartHeaders(),
        agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal
    }).then(async response => {
        clearTimeout(timeoutId)
         //THIS

        if (response.status !== 200) {
            //console.log(`[WALMART-US-2] ${response.status}! - ${proxy}`);
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 3000)
        // console.log('Good 2', sku, Date.now())
        try {
            body = JSON.parse(body)
            // console.log('Good 3', sku, Date.now())
        } catch (err) {
            if (body.includes('Forbidden')) {
                //console.log(`[WALMART-US-2] Forbidden!! - ${proxy}`);
                monitor(sku)
                return
            }
            console.log("***********WALMART-US-2-ERROR JSON PARSING***********");
            console.log("SKU: " + sku);
            console.log("Proxy: " + proxy);
            console.log("Status: " + response.status)
            console.log(err);
            console.log(body);
            await helper.sleep(200);
            monitor(sku)
            return;
        }
        let status = productCache.status
        if (body.stock === "Available" && body.sellerInfo === "Walmart.com" ) {
            let url = `https://www.walmart.com/ip/tachyon/${sku}`
            let title = body.name
            let price = "$" + body.msrp
            let image = ''
            for(entit of body.imageEntities) {
                if(entit.entityType === "PRIMARY")
                image = entit.largeImage
            }

            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image);
                console.log(`[WALMART-US-2] In Stock! ${sku}`)
                PRODUCTS[sku].status = 'In-Stock'
                database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
            }
        } else {
            if (status !== "Out-of-Stock") {
                console.log(`[WALMART-US-2] OOS! ${sku}`)
                PRODUCTS[sku].status = 'Out-of-Stock'
                database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
            }
        }

        // console.log('Good', sku, Date.now())
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if (err.response && err.response.statusCode === 444) {
            //console.log(`[WALMART-US-2] Forbidden! - ${proxy}`);
            monitor(sku)
            return
        }
        if (err.type === 'aborted' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            //console.log("[WALMART-US-2] 
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ECONNRESET') {
            //console.log("[WALMART-US-2] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        if (err.code === 'ERR_SOCKET_CLOSED') {
            //console.log("[WALMART-US-2] ECONNRESET: " + " - " + proxy);
            await helper.sleep(150);
            monitor(sku)
            return;
        }
        console.log("********************WALMART-US-2-ERROR********************")
        console.log("SKUs: " + sku);
        console.log("Proxy: " + proxy);
        console.log(err);
        // console.log(body)
        await helper.sleep(150);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image) {
    let ATC = `http://goto.walmart.com/c/2242082/565706/9383?veh=aff&sourceid=imp_000011112222333344&prodsku=${sku}&u=http%3A%2F%2Faffil.walmart.com%2Fcart%2Fbuynow%3F%3Dveh%3Daff%26affs%3Dsdk%26affsdkversion%3D%26affsdktype%3Djs%26affsdkcomp%3Dbuynowbutton%26colorscheme%3Dorange%26sizescheme%3Dprimary%26affsdkreferer%3Dhttp%253A%252F%252Faffil.walmart.com%26items%3D${sku}%7C1%26upcs%3D`
    let cart = `https://www.walmart.com/cart`
    let checkout = `https://www.walmart.com/account/checkout`
    let login = `https://www.walmart.com/account/login`
    let phantom = `https://api.ghostaio.com/quicktask/send?site=WALMART&input=${url}`
    let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
    let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
    let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
    var webhookMessage = new webhook.MessageBuilder()
      .setName("Tachyon Monitors")
      .setColor("#6cb3e3")
      .setTitle(title)
      .setURL(url)
      .setAuthor('https://www.walmart.com', '', 'https://www.walmart.com')
      .addField("**Stock**", '1+', true)
      .addField("**Price**", price, true)
      .addField("**SKU**", sku, true)
      .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
      .setThumbnail(image)
      .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        // .setTime()
        .setFooter("Walmart US | v3.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    fbhhook.send(webhookMessage);
    synthiysis.send(webhookMessage);

}
discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;


    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
        let args = msg.content.split(" ");
        if (args.length !== 3) {
            discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
            return;
        }
        let sku = args[1];
        let waitTime = args[2];
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length > 0) {
            PRODUCTS[sku] = null
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCTS[sku] = {
            sku: sku,
            waittime: waitTime,
            status: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
        monitor(sku);
        // console.log("added " + sku)
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
        let splits = msg.content.split(" ")
        if (splits.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        let args = splits[1].split('\n');
        if (!args || args.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        // console.log(args)
        let waitTime = parseInt(args[0].trim());
        let skus = args.splice(1);
        let monitoringSKUs = [];
        let notMonitoringSKUs = [];
        let errorSKUs = [];
        let tempSKUs = [];
        for (let sku of skus) {
            if (!tempSKUs.includes(sku))
                tempSKUs.push(sku);
        }
        skus = tempSKUs;
        // console.log(skus);
        for (let sku of skus) {
            sku = sku.trim();
            // console.log(sku);
            try {
                if (sku === '')
                    continue;
                let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
                if (query.rows.length > 0) {
                    PRODUCTS[sku] = null
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCTS[sku] = {
                    sku: sku,
                    waittime: waitTime,
                    status: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********SAMSCLUB-SKU-ERROR*********");
                console.log("SKU: " + sku);
                console.log(err);
            }
        }
        // console.log(notMonitoringSKUs.length)
        const monitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('Now monitoring')
            .setDescription(monitoringSKUs.join('\n'))
        if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
        const notMonitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('NOW NOT monitoring')
            .setDescription(notMonitoringSKUs.join('\n'))
        if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
        const monitoringErrorMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('ERROR monitoring')
            .setDescription(errorSKUs.join('\n'))
        if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === CHANNEL) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`WALMART v2 Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku}`);
                }
                embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
        }
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorTimes')) {
        if (msg.channel.id === CHANNEL) {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`WALMART v2 Monitor Times`);
            embed.setColor('#6cb3e3')
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(`WALMART v2 Monitor Times`);
            embed2.setColor('#6cb3e3')
            if (Object.keys(PRODUCTS).length > 0) {
                let SKUList1 = [];
                let SKUList2 = [];
                let i = 0;
                for (let sku of Object.keys(PRODUCTS)) {
                    if (i < Object.keys(PRODUCTS).length / 2)
                        SKUList1.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    else
                        SKUList2.push(`${sku} - ${Date.now() - PRODUCTS[sku].lastMonitor}ms ago`);
                    i++;
                }
                embed.addField(`**Monitored SKUs 1** (${SKUList1.length})`, SKUList1)
                embed2.addField(`**Monitored SKUs 2** (${SKUList2.length})`, SKUList2)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
            msg.reply(embed2);
        }
    }

    
});

module.exports = {
    totalData: function () {
        return totalData;
    }
}