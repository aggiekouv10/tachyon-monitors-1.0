// var _0x2c28b1 = {
//     'accept-encoding': "gzip, deflate, br",
//     'accept-language': "en-US,en;q=0.9",
//     'referer': this["url"],
//     'sec-fetch-dest': "empty",
//     'sec-fetch-mode': "cors",
//     'sec-fetch-site': "same-origin",
//     'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
//     'x-requested-with': "XMLHttpRequest"
// },
// _0x296428 = {
//     'method': "get",
//     'headers': _0x2c28b1,
//     'url': "https://www.gamestop.com/on/demandware.store/Sites-gamestop-us-Site/default/Product-Variation?dwvar_" + this["itemID"] + "_condition=New&pid=" + this["itemID"] + "&quantity=1&redesignFlag=true&rt=productDetailsRedesign",
//     'jar': this["cookieJar"],
//     'withCredentials': !![],
//     'httpsAgent': this["agent"],
//     'timeout': 0x3c * 0x1 * 0x3e8
// };
// try {
// let _0x52d59e = await axios["request"](_0x296428),
//     _0x41fa58 = _0x52d59e["data"]["product"],
//     _0x21ac69 = _0x41fa58["available"];
// this["itemPrice"] = _0x41fa58["price"]["sales"]["value"];
// if (_0x21ac69 && this["itemPrice"] < this["maxPrice"]) {
//     this["itemImage"] = _0x41fa58["images"]["large"][0x0]["url"], this["itemName"] = _0x41fa58["productName"], this["event"]["sender"]["send"]("change-task-title", this["taskID"], this["itemName"]);
//     return;
// } else await sleep(this["monitorDelay"]);
// } catch (_0x5257b5) {
// await this["logger"]("Error Monitoring", ![]), log["error"]('[' + this["taskID"] + "] [GameStop] - Error Monitoring"), this["agent"] = await this["random_proxy"](), await sleep(this["errorDelay"]);
// }