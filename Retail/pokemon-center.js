const fetch = require('node-fetch');
const fs = require('fs')

const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch('https://www.pokemoncenter.com/product/701-06560/', {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
        }
    }).then(response => response.text()).then(text => console.log(text));