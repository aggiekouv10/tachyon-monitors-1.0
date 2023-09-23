const pxHelper = require('./px-helper');
const collector = require('../collector/index')
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid')
const https = require('https')
const HTTPSProxyAgent = require('https-proxy-agent');
const httpsAgent = new https.Agent({ keepAlive: true });
const moment = require('moment');

let userAgent = "";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function ln(t, n) {
    for (var e = "", r = 0; r < t.length; r++) e += String.fromCharCode(n ^ t.charCodeAt(r));

    return e;
}


function genPX3Payload(px2, collector) {
    let payload =     {
        "t": "PX10303",
        "d": {
            "PX11264": false, //set to false !1 in script
            "PX10141": parseInt(px2.sts),
            "PX10418": "15038076762406862813",
            "8<9:19>?>?;=9?1?;18:": "9=8;08?>?>:<8>0>:09;",
            "PX11147": "58869344085088852765",
            "PX11181": 345,
            "PX10249": "cef339a3",
            "PX10238": "",
            "PX10995": "6ca82c5b",
            "PX10567": "6ca82c5b",
            "PX11192": "6a7358db",
            "PX10065": true,
            "PX11153": true,
            "PX10509": true,
            "PX10227": true,
            "PX11249": true,
            "PX11253": "4YCR4YCd4YCf4YGc4YCT4YCC4YCC4YCe4YCX4YGc4YCE4YCd4YCb4YCR4YCX4YGc4YCR4YCd4YCf4YCC4YCT4YCR4YCG4YGc4YCI4YCa4YGf4YCm4YCl4YGc4YC/4YCX4YCb4YCY4YCb4YCT",
            "PX11256": "d4acbe702b2ce9d7b185cbf0062c8dea",
            "PX10379": "c506169f",
            "PX11072": "717401f4",
            "PX11115": "",
            "PX10601": "50d4f170",
            "PX10680": "26bf0183",
            "PX11211": "50d4f170",
            "PX11135": [],
            "PX10162": "a6a7cb10",
            "PX10940": "65d826e0",
            "PX11209": "a9269e00",
            "PX10498": "50a5ec55",
            "PX10790": [],
            "PX11010": 0,
            "PX10289": true,
            "PX11043": true,
            "PX10604": false,
            "PX10296": "en-US",
            "PX11186": "iPhone",
            "PX10397": [
                "en-US"
            ],
            "PX10472": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "PX10758": false,
            "PX10099": 240,
            "PX10373": 1,
            "PX10802": "Gecko",
            "PX10628": "20030107",
            "PX11039": "5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "PX10547": true,
            "PX10174": true,
            "PX10775": -1,
            "PX10539": "Netscape",
            "PX10189": "Mozilla",
            "PX10390": true,
            "PX10595": true,
            "PX10822": true,
            "PX11205": true,
            "PX11277": false,
            "PX10929": 0,
            "PX10248": 1,
            "PX10705": "wt@https://client.perimeterx.net/PX9Qx3Rve4/main.min.js:2:19868\nfc@https://client.perimeterx.net/PX9Qx3Rve4/main.min.js:2:40723\nlc@https://client.perimeterx.net/PX9Qx3Rve4/main.min.js:2:39757\n@https://client.perimeterx.net/PX9Qx3Rve4/main.min.js:2:39731",
            "PX10360": "https://perimeterx.net/",
            "PX10311": [],
            "PX10744": "",
            "PX10046": true,
            "PX10565": true,
            "PX11002": true,
            "PX10410": false,
            "PX11018": false,
            "PX11244": "TypeError: undefined is not an object (evaluating 'n.width')",
            "PX11245": "webkit",
            "PX11246": 37,
            "PX11247": false,
            "PX11274": false,
            "PX10757": true,
            "PX11081": true,
            "PX10232": true,
            "PX10926": true,
            "PX10558": "Tue Oct 04 2022 01:08:15 GMT-0400 (Eastern Daylight Time)",
            "PX10236": false,
            "PX10276": 0,
            "PX10400": false,
            "PX10530": false,
            "PX11060": true,
            "PX10801": 5,
            "PX10394": true,
            "PX10058": "visible",
            "PX11123": false,
            "PX10096": 0,
            "PX10872": 390,
            "PX11028": false,
            "PX10366": 844,
            "PX10585": "missing",
            "PX10976": true,
            "PX10250": false,
            "PX10259": true,
            "PX10156": false,
            "PX10774": true,
            "PX10750": false,
            "PX11158": 0,
            "PX10213": true,
            "PX10283": true,
            "PX10116": true,
            "PX11176": true,
            "PX10351": false,
            "PX10365": true,
            "PX10712": 1,
            "PX10555": 0,
            "PX10347": 0,
            "PX10119": 2,
            "PX10561": 390,
            "PX10499": 844,
            "PX10843": 390,
            "PX10850": 844,
            "PX11113": "390X844",
            "PX10724": 32,
            "PX10089": 32,
            "PX10204": 390,
            "PX11138": 797,
            "PX11170": 0,
            "PX11174": 0,
            "PX10243": true,
            "PX10800": true,
            "PX11055": "",
            "PX10422": 123,
            "PX10659": true,
            "PX10316": true,
            "PX10742": "false",
            "PX11148": "false",
            "PX10846": 1,
            "PX10323": 1,
            "PX11015": "",
            "PX10599": [],
            "PX10010": false,
            "PX10225": false,
            "PX10855": false,
            "PX11065": false,
            "PX10456": false,
            "PX10441": false,
            "PX10098": false,
            "PX10557": false,
            "PX10170": false,
            "PX10824": false,
            "PX10087": false,
            "PX11042": false,
            "PX10522": "c88a86982d88bdb87551f3095990deaf",
            "PX10840": "cctrvfs43f0md8nt5460",
            "PX10464": "b4a8be654466b4722f4e62fb70a52af7",
            "PX10080": "31e3f586c8b04cc66af0096df312d7a8",
            "PX11230": "3b5dc0adcaab6dfb48172532e619924d",
            "PX10891": 2,
            "PX10622": 1,
            "PX10272": 1048,
            "PX10041": 1664860095453,
            "PX10970": 3600,
            "PX10094": 1664860095218,
            "PX11004": 1664860096160,
            "PX10206": "8cc01872-43a2-11ed-89cd-7562564a5672",
            "PX10088": false,
            "PX11031": "PX10463",
            "PX10384": "pxhc",
            "PX11073": true
        }
    }
    return [{ "t": "PX10303", d: payload }];
}

async function postPX3(payloadEncrypted, px2, appID, tag, fTag, uuid, seq, en, cs, pc, sid, vid, cts, rsc, agent) {
    let t = `payload=${payloadEncrypted}&appId=${appID}&tag=${tag}&uuid=${uuid}&ft=${fTag}&seq=${seq}&en=${en}&cs=${cs}&pc=${pc}`
    if (sid)
        t += `&sid=${sid}` + pxHelper.Do(px2.sts);
    if (vid)
        t += `&vid=${vid}`
    if (cts)
        t += `&cts=${cts}`

    t += `&rsc=${rsc}`
    // console.log(t)
    let response = await fetch('https://collector-px9qx3rve4.px-cloud.net/assets/js/bundle', {
        headers: {
            'Host': 'collector-px9qx3rve4.px-cloud.net',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://perimeterx.net',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Referer': 'https://perimeterx.net/',
            'Content-Length': '2227',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        agent: agent,
        // proxy: {
        //     host: '127.0.0.1',
        //     port: 8888
        // },
        "body": t,
        "method": "POST",
    });
    let body = await response.json();
    return body;
}


function genPX2Payload(uuid) {
    let payload = [
        {
            "t": "PX10816",
            "d": {
                "PX10360": "https://perimeterx.net/", //Url
                "PX10929": 0,// set 0
                "PX11186": "iPhone",
                "PX10622": 0,// set 0
                "PX10272": getRandomInt(1700, 3000),// random int
                "PX10970": 3600,//set to 3600
                "PX10094": Date.now(),//date now
                "PX11004": Date.now() + getRandomInt(3, 7),//date now + random int
                "PX10206": uuid, //uuid from script
                "PX10088": false, //some bool set true
                "PX11031": "PX10463", //set to hold captcha
                "PX10384": "pxhc",// set to pxhc
                "PX11073": true //is mobile
            }
        }
    ];
    return payload;
}

async function postPX2(payloadEncrypted, appID, tag, fTag, uuid, seq, en, pc, sid, vid, cts, rsc, agent) {
    // console.log(`payload=${payloadEncrypted}&appId=${appID}&tag=${tag}&uuid=${uuid}&ft=${fTag}&seq=${seq}&en=${en}&pc=${pc}&sid=${sid}&vid=${vid}&rsc=${rsc}`);
    // await sleep(10000);
    // const params = new URLSearchParams()
    // params.append('payload', payloadEncrypted)
    // params.append('appId', appID)
    // params.append('tag', tag)
    // params.append('uuid', uuid)
    // params.append('fTag', fTag)
    // params.append('seq', seq)
    // params.append('en', en)
    // params.append('pc', pc)
    // params.append('sid', sid)
    // params.append('vid', vid)
    // params.append('src', rsc)
    let t = `payload=${payloadEncrypted}&appId=${appID}&tag=${tag}&uuid=${uuid}&ft=${fTag}&seq=${seq}&en=${en}&pc=${pc}`
    if (sid)
        t += `&sid=${sid}`;
    if (vid)
        t += `&vid=${vid}`
    if (cts)
        t += `&cts=${cts}`
    t += `&rsc=${rsc}`
    // console.log(t)
    let response = await fetch('https://collector-px9qx3rve4.px-cloud.net/assets/js/bundle', {
        headers: {
            'Host': 'collector-px9qx3rve4.px-cloud.net',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://perimeterx.net',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            'Referer': 'https://perimeterx.net/',
            'Content-Length': '2227',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        agent: agent,
        // proxy: {
        //     host: '127.0.0.1',
        //     port: 8888
        // },
        "body": t,
        "method": "POST",
    });
    let body = await response.json();
    return body;
}

function getPX2(px2Response, px2Payload, sid, vid, cts, uuid) {
    let px2 = {
        sid: sid,
        vid: vid,
        cts: cts,
        uuid: uuid
    };
    for (let str of px2Response) {
        let args = str.split("|");
        if (args[0] === 'sid') {
            px2['sid'] = args[1];
        }
        if (args[0] === 'cls') {
            px2['cls'] = args[1] + "|" + args[2];
        }
        if (args[0] === 'sts') {
            px2['sts'] = args[1];
        }
        if (args[0] === 'wcs') {
            px2['wcs'] = args[1];
        }
        if (args[0] === 'drc') {
            px2['drc'] = args[1];
        }
        if (args[0] === 'cs') {
            px2['cs'] = args[1];
        }
        if (args[0] === 'vid') {
            px2['vid'] = args[1];
        }
        if (args[0] === 'cts') {
            px2['cts'] = args[1];
        }
    }
    px2.d = px2Payload[0].d;
    return px2;
}



async function genCookie(proxy) {
    //console.log("+++++++++HIBBETT-COOKIE+++++++++")
    //console.log("PROXY: " + proxy)
    let agent = await new HTTPSProxyAgent(await proxy)
    let startTime = Date.now()

    let uuid = pxHelper.Kr();
    // console.log(uuid)
    let px2Payload = genPX2Payload(uuid);
    // console.log("PX2 payload: ");
    // console.log(px2Payload)
    let px2PayloadEncrypted = pxHelper.encodePayload(JSON.stringify(px2Payload), uuid)
    // console.log("PX2 Encryted: " + px2PayloadEncrypted)
    let pc = pxHelper.genPC(px2Payload, uuid, 'v8.0.2', '278');
    // console.log("PX2 PC: " + pc);
    let sid = null;
    let vid = null;
    let cts = null;
    // // console.log('sid=' + sid);
    // // console.log('vid=' + vid)
    let px2Time = Date.now();
    let px2Result = await postPX2(px2PayloadEncrypted, 'PXAJDckzHD', 'v8.0.2', '278', uuid, '0', 'NTA', pc, sid, vid, vid, '1', agent);
    //console.log(`PX2 payload time: ${Math.round(((Date.now() - px2Time) / 1000) * 1000) / 1000}s`);
    //console.log("PX2 Result: ");
    //console.log(px2Result)
    let collectorData = collector.getRandomFiltered();
    let px2 = getPX2(px2Result.do, px2Payload, sid, vid, cts, uuid);
    // console.log("PX2 Filtered: ")
    // console.log(px2);
    let px3Time = Date.now();
    let px3Payload = genPX3Payload(px2, collectorData, sid, vid);
    //console.log(`PX3 payload time: ${Math.round(((Date.now() - px3Time) / 1000) * 1000) / 1000}s`);
    //console.log("PX3 Payload: ");
    //console.log(JSON.stringify(px3Payload));
    let px3PayloadEncrypted = pxHelper.encodePayload(JSON.stringify(px3Payload), uuid, px2.sts)
    //console.log("PX3 Payload Encrypted: ");
    //console.log(px3PayloadEncrypted)
    //console.log("UUID: " + uuid)
    // console.log("sts: " + px2.sts)
    let pcPX3 = pxHelper.genPC(px3Payload, uuid, 'v8.0.2', '278');
    //console.log("PX3 PC: " + pcPX3);
    let px3Result = await postPX3(px3PayloadEncrypted, px2, 'PXAJDckzHD', 'v8.0.2', '278', uuid, '1', 'NTA', px2.cs, pcPX3, sid ? sid : px2.sid, vid ? vid : px2.vid, cts ? cts : px2.cts, '2', agent);
    // console.log(px3Result)
    let px3Cookie = ''
    let pxdeCookie = ''
    let pxvid = vid || px2.vid;
    for (let a of px3Result.do) {
        let args = a.split("|");
        if (args[1] === '_px3') {
            px3Cookie = args[3];
        }
        if (args[1] === '_pxde') {
            pxdeCookie = args[3];
        }
    }
    //console.log(userAgent)
    //console.log('_px3='+px3Cookie)
    //console.log('PX Cookie: ');
    return px3Result.do[0].split('|')[3]
    // console.log(`_px3=${px3Cookie}; _pxde=${pxdeCookie}; _pxvid=${pxvid};`)
    // console.log(`Time Elapsed: ${Math.round(((Date.now() - startTime) / 1000) * 1000) / 1000}s`);
    // return `_px3=${px3Cookie}; _pxde=${pxdeCookie}; _pxvid=${pxvid};`;
}


//genCookie()

module.exports = genCookie