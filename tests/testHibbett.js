const { fstat } = require('fs');
const fetch = require('node-fetch');
const got = require('got');
const fs = require('fs');
const request = require('request');


// HIBBETT CODE BELOW

let cookieJar = request.jar();

let SKU =  "0P313";
let URL = "https://hibbett-mobileapi.prolific.io/ecommerce/products/" + SKU;
let PROXY = 'http://h8upoTGfZF:LFeLC8VbSE@45.43.178.54:6601';

let JAR = cookieJar;
let METHOD = "GET";
let HEADERS = {};

HEADERS.Host = 'hibbett-mobileapi.prolific.io';
HEADERS['content-type'] = 'application/json; charset=utf-8';
HEADERS['x-px-authorization'] = "4";
HEADERS.accept = '*/*';
HEADERS.version = '4.2.0';
HEADERS.authorization = "Bearer ";
HEADERS['x_api_key'] = '0PutYAUfHz8ozEeqTFlF014LMJji6Rsc8bpRBGB0';
HEADERS.platform = 'ios';
// HEADERS['user-agent'] = 'Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19';
HEADERS['accept-language'] = 'en-US;q=1.0';

let req = {
    'url': URL,//'https://www.google.com',
    'proxy': PROXY,
    //'jar': JAR,
    'method': METHOD,
    'headers': HEADERS,
}

// request(req, function (error, response, body) {
//     console.error('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     //console.log('body:', body); // Print the HTML for the Google homepage.
//     fs.writeFileSync('1.json', body)
// });

const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(URL, req).then(async response => {
    // console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the Google homepage.
    let body = await helper.getBodyAsText(response)
    fs.writeFileSync('2.json', body)
});