const crypto = require("crypto");

var key = new Uint8Array([-114, -89, -101, -50, -61, -43, 69, -105, -17, -31, -122, 120, 10, -125, 92, 7, 84, 0, 98, 58, 17, 72, 29, 61, 23, -35, -110, -23, 5, -37, -74, 21]); //Production KEY

var startTime = Math.floor((Date.now() - 300000) / 1000);
var endTime = Math.floor((Date.now() + 1800000) / 1000);

var data = `st=${startTime}~exp=${endTime}~acl=*`;
var hmac = hmacsha256(key, data);

console.log(`__lvr_mobile_api_token__: ${data}~hmac=${hmac}`);

function hmacsha256(key, data) {
    return crypto.createHmac("SHA256", key).update(data).digest("hex");
}