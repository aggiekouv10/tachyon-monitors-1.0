const fetch = require('node-fetch');
const got = require('got');
const axios = require('axios')

let time = Date.now()

axios('https://www.example.com').then(async response => {
    let body = 
    console.log("AXIOS: " + (Date.now() - time))
})