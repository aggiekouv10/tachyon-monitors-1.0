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

const { v4 } = require('uuid');
const { default: axios } = require('axios');
const helper = require('../helper');

const DistributeManager = require('../Webhook-Manager/manager')

const SITENAME = 'CORSAIR'
const CHANNEL = discordBot.channels[SITENAME]
const WEBHOOK = discordBot.webhooks[SITENAME]
const CATEGORY = discordBot.categories.RETAIL //if no need CATEGORY = null
const DATABASE_TABLE = 'corsair';
let PRODUCTS = {}
let stats;
// ^^ THESE
const distributor = new DistributeManager(SITENAME); //this


startMonitoring();

async function startMonitoring() {
    await distributor.connect() //this
    stats = await helper.manageStats(SITENAME) //this

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
    console.log('[WALMART-US-2] Monitoring all SKUs!')
}
async function monitor(sku) {
    let proxy = helper.getRandomLDLCProxy()
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
    PRODUCTS[sku].lastMonitor = Date.now()
    const controller = new AbortController(); //this
    const timeoutId = setTimeout(() => controller.abort(), 4000) //this
    stats.total++; //THIS
    let cookie = 'visid_incap_1019863=QdCTYmHnS/mn7exLzQMMytxErGEAAAAAQUIPAAAAAAALnDW4xJIxHkYeYOZQu3RT; _gcl_au=1.1.1327259699.1638679780; _ga=GA1.2.1438392545.1638679780; b_s_id=f0026811-e4ec-4bf4-8fe9-eb0f7456e088; ab.storage.deviceId.b8901cbf-e952-46ba-ae5b-b6b0aa1a3cfc=%7B%22g%22%3A%22ad2bff92-14af-c059-c4e6-6cfa6b88cd77%22%2C%22c%22%3A1638679780177%2C%22l%22%3A1638679780177%7D; ab.storage.userId.b8901cbf-e952-46ba-ae5b-b6b0aa1a3cfc=%7B%22g%22%3A%22-8534519752789600611%22%2C%22c%22%3A1638679780304%2C%22l%22%3A1638679780304%7D; _conv_r=s%3Awww.google.com*m%3Aorganic*t%3A*c%3A; ku1-vid=82ab36cd-e500-0e31-63c4-bcb1b981e59b; gig_bootstrap_3__xo1IhJq53iFwB6NpRs-RLC-DhjLN_Xb69-ObPEBTdSE6d8kfAjgGXVq_8veujwv=login_ver4; __attentive_id=5e6fc5e0ff84440295e2c762ff6567d1; __attentive_cco=1638679782757; _fbp=fb.1.1638679782771.280180883; __zlcmid=17OkWzEZSWjA9ZX; JSESSIONID=3509A66123E7D5D32C21EE21CD32056B.accstorefront-597cc89f7-7pmkw; ROUTE=.accstorefront-597cc89f7-7pmkw; Pref_Lang=en; Zip_Code=11576; Country_Code=US; nlbi_1019863=X6l7cTKOFibDmcA2XuGjbgAAAABfieNCxy1aiOKBCaBPb2lu; gig_canary=false; ku1-sid=Gy7TxjdScXrwmIGMFHfns; _gid=GA1.2.233355139.1639451224; b_pg_v=12%2F13%2F2021%2C%2010%3A07%3A04%20PM; __btr_id=cf85e8cf-efc2-4cc9-8a44-f98d3f3777ff; Pref_Country=us; incap_ses_8217_1019863=LGTcXVH5cHLwzX10QaYIcm4UuGEAAAAAipPIvK8A9Cuz37KDAerXPQ==; apay-session-set=ZjPx01Wvokg6iQdzFLqsdXIxxdzqGdjKwxzkjg8J8VN2KDCvXQ5pME4fokgtJzY%3D; IR_gbd=corsair.com; __attentive_ss_referrer="https://www.corsair.com/us/en/"; __attentive_dv=1; 56259661-s28RevenueTrack-client=%7B%2256259661%22%3A%7B%22productId%22%3A%22CA-9011185-NA%22%2C%22reviewId%22%3A%22%22%2C%22eventType%22%3A0%7D%7D; s28_activity_viewRnr_56259661=%7B%22productIds%22%3A%5B%22CA-9011185-NA%22%5D%7D; b_wr_rvps=%5B%7B%22productId%22%3A%22CA-9011185-NA%22%2C%22timeStamp%22%3A1639453844220%7D%5D; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Dec+13+2021+22%3A55%3A20+GMT-0500+(Eastern+Standard+Time)&version=6.27.0&isIABGlobal=false&hosts=&consentId=ebd8875e-01a2-4bf3-8a45-8e43f25b34e9&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0002%3A1%2CC0004%3A1&AwaitingReconsent=false; IR_8513=1639454120521%7C0%7C1639454120521%7C%7C; __attentive_pv=4; _ce.s=v11.rlc~1639454120890; _gat_UA-5938436-1=1; AKA_A2=A; gig_canary_ver=12639-3-27324240; _conv_v=vi%3A1*sc%3A6*cs%3A1639453807*fs%3A1638679782*pv%3A53*exp%3A%7B%7D*ps%3A1639451223; _conv_s=si%3A6*sh%3A1639453807082-0.5293352501008548*pv%3A6; nlbi_1019863_2147483646=zKw4CikB3ggLYfatXuGjbgAAAAC7U4Ls0RWHKEallMxSYBLZ; reese84=3:JXg5jWhe1uhzQwW8LDXmlg==:q9ucTD7pgvxAV//OKA8ILU7lpl5tcJHkszT5Ft260u4MmmzqbMm/VjGa51DOeikC2GSjBz00aSzTynX6fZrAl4rYW0X+pfkQPx9W5L3/aog6jw3FAN8mC/Y8wRAY9IlHXZoBYYwJqwT1DXf3j/PRjqGr/L20YbX6VP59emtS4k734kH7gg4Vr4Yu66qCQZvFLY0HxkbBsG9NGOTObK5C/jxQC5PeDUp5vskuUUwKaJky4Qecb3MPIcmUtrESjgRD4NydusPyQtd9V1B4goBlpf3XaqrUfpwx+D/gwggAy+1boeWLTTCqsSz4OgeLysRvbULR5LgTun9lW12Hy89JRdCbVs3Eamp/Taj6loIV80/Mfr8r+xZ8McEh7yxougxyoqmoEK3fQK9Fve9lX4o+apNt2/P5LWp1GkK1B6ykpz4=:FXcdZMIJ0eVd5EqEe2qrtMz4n/V3bg+h99+h5oNJDDM=; ab.storage.sessionId.b8901cbf-e952-46ba-ae5b-b6b0aa1a3cfc=%7B%22g%22%3A%22574ce870-b11d-b4b8-4e99-2d513fa0df80%22%2C%22e%22%3A1639456695896%2C%22c%22%3A1639453809233%2C%22l%22%3A1639454895896%7D; RT="z=1&dm=www.corsair.com&si=68963953-e183-41fa-b389-4282b601bd9d&ss=kx5knfiv&sl=2&tt=6fv&bcn=%2F%2F0217991b.akstat.io%2F&nu=161o44af6&cl=gq4q&ld=gq61&ul=gqa2"'
    fetch(`https://www.corsair.com/us/en/p/json/${sku}`, {
        'headers': {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'cookie': cookie,
            'pragma': 'no-cache',
            'referer': 'https://www.corsair.com/us/en/Categories/Products',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'same-origin',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36'
            
        },
        //agent: new HTTPSProxyAgent(proxy),
        signal: controller.signal

    }).then(async response => {
        clearTimeout(timeoutId)
        //THIS
        console.log(response.status)
        if (response.status === 200) {
            stats.success++; //THIS
            // console.log("200")
        }

        if (response.status !== 200) {
            console.log(`[WALMART-US-2] ${response.status}! - ${proxy}`);
            monitor(sku)
            return
        }
        let body = await helper.getBodyAsText(response, 3000)
        // console.log('Good 2', sku, Date.now())
        try {
            body = JSON.parse(body.trim())
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
        if (body.blockScript) {
            console.log(`[WALMART-US-2] Blocked! - ${proxy}`);
            monitor(sku)
            return
        }
        if (body.stock.stockLevel > 0) {
            let url = `https://www.corsair.com/us/en/Categories/Products/tachyon/p/${sku}`
            let stock = body.stock.stockLevel
            let title = body.name
            let price = body.price.formattedValue
            let image = 'http://proxy.hawkaio.com/https://www.corsair.com' + body.images[0].url
            if (status !== "In-Stock") {
                postRestockWebhook(url, title, sku, price, image, stock);
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

async function postRestockWebhook(url, title, sku, price, image, stock) {
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.corsair.com', '', 'https://www.corsair.com')
        .addField("**Stock**", stock, true)
        .addField("**Price**", price, true)
        .addField("**SKU**", sku, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829")
        .setFooter("Corsair US | v1.0 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    distributor.distributeWebhook(webhookMessage, WEBHOOK, CATEGORY)
    archook.send(webhookMessage);
}
discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }

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