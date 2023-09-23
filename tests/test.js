const database = require('../database/database')
const fetch = require('node-fetch');

async function create() {
    let s = 'gb fr'
    let list = s.split(' ')
    for (let x of list) {
        console.log('footpatrol' + x)
        try {
            await database.query(`create table footpatrol${x}(sku text, sizes text, waittime text)`);
        } catch(err) {
            console.log(err.message)
        }
    }
    console.log("DONE!")
    process.exit(0);
}

create()

let a = ['1'];
let b = ['b'];


// const fs = require('fs');
// let file = fs.readFileSync('./test.txt').toString();

// let pattern = new RegExp(/mobile_stock.json/g);

// let text = `'https://www.supremenewyork.com/mobile_stock.json?0kl7grn32ck84y2ico34whry7lmtydk9jl=snaavr59h5voz35xw7qyh4j3fly3q4b','https://www.supremenewyork.com/mobile_stock.json?xasdrn32ck84y2ico34whry7lmtydk9jl=snaavr59h5voz35xw7qyh4j3fly3q4b',`

// let x = pattern.exec(text);
// console.log(JSON.stringify(x));
// txt = "'https://www.supremenewyork.com/mobile_stock.json?0kl7grn32ck84y2ico34whry7lmtydk9jl=snaavr59h5voz35xw7qyh4j3fly3q4b',";
// var regex = /\'https:\/\/www\.supremenewyork\.com\/mobile_stock.json?.+\',/g
// var matches = [];
// var match = regex.exec(txt);
// while (match != null) {
//     matches.push(match[1]);
//     match = regex.exec(txt);
// }
// console.log(matches)