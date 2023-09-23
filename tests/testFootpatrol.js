const fetch = require('node-fetch');
const webhook = require("webhook-discord")
const publichooks = new webhook.Webhook("https://discord.com/api/webhooks/810721062252970014/Dd-ZZ8KT-0Kj1HdqUeBmvrDL3jK-Be-bAmzKPgPiTL4VnCDPGsj0e2utFQ-xo6ncu1jJ")
const HTTPSProxyAgent = require('https-proxy-agent')

let SKU = '450845';
let URL = `https://www.footpatrol.com/product/tachyon-monitors/${SKU}_footpatrolcom/`

const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(URL, {
    'headers': {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
    },
    //agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
}).then(async res => {
    let input = await res.text();
    let pattern = /var dataObject = {(.|\n)*variants: \[(.|\n)*]\n};/;

    let text = pattern.exec(input);
    if (!text || text.length === 0) {
        console.log("Failed to match");
        return;
    }

    eval(text[0]);
    // console.log(dataObject)

    var title = dataObject.description;
    var image = `https://i8.amplience.net/i/jpl/fp_${SKU}_a?w=750&h=580`;
    var price = '£' + dataObject.unitPrice

    let sizes = '';
    let sizeList = [];
    let oldSizeList = []//JSON.parse(query.rows[0].sizes);
    let inStock = false;
    for (let variant of dataObject.variants) {
        let size = variant.name.trim();
        sizes += size + '\n';
        sizeList.push(size)
        if (!oldSizeList.includes(size))
            inStock = true;
    }
    console.log(title);
    console.log(image);
    console.log(price);
    var publichook = new webhook.MessageBuilder()
        .setName("Space Notify")
        .setColor("#121a2d")
        .setTitle(title)
        .setURL(URL)
        .setAuthor('https://www.footpatrol.com/', '', 'https://www.footpatrol.com/')
        .addField("**Stock**", "In Stock", true)
        .addField("**Price**", price, true)
        .addField("**Sizes**", sizes)
        .addField("**Sku**", SKU, true)
        .setThumbnail(image)
        .setAvatar("https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=612&height=612")
        .setTime()
        .setFooter("Tachyon", 'https://media.discordapp.net/attachments/801630138831470593/805010577092247552/uNgDTBW_13.png?width=611&height=611')
    await publichooks.send(publichook);
})

