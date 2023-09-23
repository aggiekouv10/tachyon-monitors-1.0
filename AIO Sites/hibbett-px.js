const { firefox } = require('playwright');
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent')
const helper = require('../helper');
async function shapegen() {
    let proxy = helper.getMixedRotatingProxy();
    //let credentials = proxy.split("@")[0].replace("http://", "").split(":")
    //let server = proxy.split("@")[1]
    const browser = await firefox.launch({
        headless: false,
        userAgent: ' Hibbett | CG/5.8.0 (com.hibbett.hibbett-sports; build:10351; iOS 16.0.0) Alamofire/5.0.0-rc.3',
        extraHTTPHeaders: {
            'X-PX-AUTHORIZATION': '3',
            'Accept': '*/*',
            'version': '5.8.0',
            'Authorization': 'Bearer eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjE2NjI3NjgwMzMsImlhdCI6MTY2Mjc2NjIzMywiaXNzIjoibm9ybWFsLWNsaWVudC1pZCIsInN1YiI6IntcIl92XCI6XCIxXCIsXCJjdXN0b21lcl9pbmZvXCI6e1wiY3VzdG9tZXJfaWRcIjpcImJjWWFxMWt1aENjdGxiOUNxajk1ZTdCVlZrXCIsXCJndWVzdFwiOmZhbHNlLFwidmlzaXRfaWRcIjpcIjdkZWRmYWIwNWEyNmM1NGMwZDM4NmI3YWY5XCJ9fSJ9.dl8XgldAVo8SGRDrrSAdnbD_tnRnfYwIrohjhsPW78JgTif2kukQqnB74RgKHRx6U5CTBee8ktTVwqnmtguRTyo1A01rbUqqVE2Yri4Um4ReIhPK7wGCY7M4C1xeRcK1ppPSjZywELvHHRYyqTVkZ4kjnaAOf3VMpsCXYT2DGOa-2UGcCB7lhR4-n6J2s5fojr_WLylVIOr6_5lObwhMHl0L2GISdQd3cg1tlYwQmDB6Y2NpG_mOX_gOmYm_m7hJzKuY4zU90SGc-GYkbBKfRPK3GthTr0LNXVsknydirpsZDI1hlBjrCxNz689-ogulWwbUFwiHGaRhe6GZl3T7mEOzjQf1k-5Nk0sWwjx2dkvePdThz7vrG6sTpzEj5Mj03AKxCA1ThkkSq_6OsXroLf7dIstCSj8bbe-POGM6bXNk_fGBgl6h8jCkyYqkEnTpAZV2a3ZKa3y5lgjKvFFj9DpgNZgnmd5vfPCAjjQg9Ph_LsleG1ByLJ75Jj2J4qJE88rjq9p-PDDxGyymcpQIWzmVpY2eVtjUr0D4h40mLSr5fY_74v0jqn35P6rgmhmX',
            'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
            'x-api-key': '0PutYAUfHz8ozEeqTFlF014LMJji6Rsc8bpRBGB0',
            'platform': 'ios',
            'Accept-Language': 'en-US;q=1.0',
            'If-None-Match': 'W/"37ac-rX8M/pLZj7opv2JB1Qf0pfRCay8"',
            'User-Agent': 'Hibbett | CG/5.8.0 (com.hibbett.hibbett-sports; build:10351; iOS 16.0.0) Alamofire/5.0.0-rc.3',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json; charset=utf-8',
            'X-PX-ORIGINAL-TOKEN': '3:1a68fc940961b75d3d94097a8f9ef7e0a69ea40682432420518076267dca3e95:SK9tNWNrbcIfVbHHw4d46xSXECYCCFm/fLxI5lYwZMY44BNbU8NeUua93jrRCYkpAQlce0OgrXSaNYW5TalzTw==:1000:3v2fF0I6rPR86PAEZrkd5zlhD+pQD5wlv9jddZTp9NyXTqGz7jDUJVdeUAQ3qVUguBFmqovLdwP/4Skz5Q+aOd71ECnxjh3ECFKTxpsW9GY+KHLULA+xsywKUIZrcMaSvejGOj8eympY8c0NGWFzYB72SFKNZxiD9sGPX6pvF1C50WajPVN5+pnuquCDsmQoLmb5WK34aejDqF0eYh27fQ==',
        
        }
    });
    const context = await browser.newContext({
        extraHTTPHeaders: {
            'X-PX-AUTHORIZATION': '3',
            'Accept': '*/*',
            'version': '5.8.0',
            'Authorization': 'Bearer eyJfdiI6IjEiLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfdiI6IjEiLCJleHAiOjE2NjI3NjgwMzMsImlhdCI6MTY2Mjc2NjIzMywiaXNzIjoibm9ybWFsLWNsaWVudC1pZCIsInN1YiI6IntcIl92XCI6XCIxXCIsXCJjdXN0b21lcl9pbmZvXCI6e1wiY3VzdG9tZXJfaWRcIjpcImJjWWFxMWt1aENjdGxiOUNxajk1ZTdCVlZrXCIsXCJndWVzdFwiOmZhbHNlLFwidmlzaXRfaWRcIjpcIjdkZWRmYWIwNWEyNmM1NGMwZDM4NmI3YWY5XCJ9fSJ9.dl8XgldAVo8SGRDrrSAdnbD_tnRnfYwIrohjhsPW78JgTif2kukQqnB74RgKHRx6U5CTBee8ktTVwqnmtguRTyo1A01rbUqqVE2Yri4Um4ReIhPK7wGCY7M4C1xeRcK1ppPSjZywELvHHRYyqTVkZ4kjnaAOf3VMpsCXYT2DGOa-2UGcCB7lhR4-n6J2s5fojr_WLylVIOr6_5lObwhMHl0L2GISdQd3cg1tlYwQmDB6Y2NpG_mOX_gOmYm_m7hJzKuY4zU90SGc-GYkbBKfRPK3GthTr0LNXVsknydirpsZDI1hlBjrCxNz689-ogulWwbUFwiHGaRhe6GZl3T7mEOzjQf1k-5Nk0sWwjx2dkvePdThz7vrG6sTpzEj5Mj03AKxCA1ThkkSq_6OsXroLf7dIstCSj8bbe-POGM6bXNk_fGBgl6h8jCkyYqkEnTpAZV2a3ZKa3y5lgjKvFFj9DpgNZgnmd5vfPCAjjQg9Ph_LsleG1ByLJ75Jj2J4qJE88rjq9p-PDDxGyymcpQIWzmVpY2eVtjUr0D4h40mLSr5fY_74v0jqn35P6rgmhmX',
            'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
            'x-api-key': '0PutYAUfHz8ozEeqTFlF014LMJji6Rsc8bpRBGB0',
            'platform': 'ios',
            'Accept-Language': 'en-US;q=1.0',
            'If-None-Match': 'W/"37ac-rX8M/pLZj7opv2JB1Qf0pfRCay8"',
            'User-Agent': 'Hibbett | CG/5.8.0 (com.hibbett.hibbett-sports; build:10351; iOS 16.0.0) Alamofire/5.0.0-rc.3',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json; charset=utf-8',
            'X-PX-ORIGINAL-TOKEN': '3:1a68fc940961b75d3d94097a8f9ef7e0a69ea40682432420518076267dca3e95:SK9tNWNrbcIfVbHHw4d46xSXECYCCFm/fLxI5lYwZMY44BNbU8NeUua93jrRCYkpAQlce0OgrXSaNYW5TalzTw==:1000:3v2fF0I6rPR86PAEZrkd5zlhD+pQD5wlv9jddZTp9NyXTqGz7jDUJVdeUAQ3qVUguBFmqovLdwP/4Skz5Q+aOd71ECnxjh3ECFKTxpsW9GY+KHLULA+xsywKUIZrcMaSvejGOj8eympY8c0NGWFzYB72SFKNZxiD9sGPX6pvF1C50WajPVN5+pnuquCDsmQoLmb5WK34aejDqF0eYh27fQ==',
        }
    });
    const page = await context.newPage();
    await page.goto('https://hibbett-mobileapi.prolific.io/ecommerce/products/1P145');



    //await page.waitForSelector('div[class="_2h2RA"]')
}

shapegen()