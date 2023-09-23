const discordBot = require('../discord-bot');
const axios = require('axios')
const Discord = require('discord.js');
const fetch = require('node-fetch');
const extra = require('../discord-bot/extra-commands');
const randomUseragent = require('random-useragent');
const HTTPSProxyAgent = require('https-proxy-agent')
const helper = require('../helper');
const { v4 } = require('uuid');
process.setMaxListeners(0)
let client = discordBot.getClient;
//Lets go baby
client.once('ready', () => {
    discordBot.sendChannelMessage(discordBot.channels.BOT_LOGS, 'Home Initialized!');
});

//Help Command
client.on('message', async function (msg) {
    if (msg.content.startsWith(discordBot.commandPrefix + 'help')) {
        const command = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('Monitor Commands')
            .setDescription('**!monitorSKU <sku> <waitTime>**\n Add sku to database\n\n**!downloads**\n Sends bot download links\n\n**!fee <number>**\n Check StockX and Goat fees\n\n**!view <link> <amount>**\n Sends ebay views (500MAX) \n\n**!sitelist** Check the Tachyon sitelist\n\n**!varients**\n Check shopify variants')
        msg.reply(command);
    }
});
//Bot Downloads
client.on('message', async function (msg) {
    if (msg.content.startsWith(discordBot.commandPrefix + 'downloads')) {
        const command = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .addField("**Downloads**", "[Cyber](https://cybersole.io/download)\n[EVE](http://eve-robotics.com/updates/EveAIOX_Setup.zip)\n[Dashe](http://updater.dashe.io/)\n[Ghost Snkrs](https://ghost.shoes/l/snkrs)\n[Latchkey](http://download.latchkeybots.io/)\n[TKS](http://thekickstationapi.com/downloads/Installer.msi)\n[PD Shopify](https://shopify.projectdestroyer.com/download)\n[PD Nike](https://swoosh.projectdestroyer.com/download)\n[Tohru](https://tohru.io/download)\n[SoleAIO](https://drive.google.com/open?id=1GRpzE8Ofc2fY_ueNwvut4QjoKm4SdpGr)\n[HawkMesh](http://download.hawkmesh.com/)\n[Hastey](https://update.hastey.io/)\n[Balko Windows](https://s3.amazonaws.com/balkodiscordBot.com/Balkobot2-0/balkobot2-setup.exe)\n[Balko Mac](https://s3.amazonaws.com/balkodiscordBot.com/Balkobot2-0/Balkobot2-0.dmg)", true)
            .addField("**Downloads**", "[BNB](http://bnba.io/download-bnb)\n[NSB](https://nsb.nyc3.digitaloceanspaces.com/NSB-win-latest.exe)\n[NSB MAC](https://nsb.nyc3.digitaloceanspaces.com/NSB-mac-latest.exe)\n[Splashforce](https://update.splashforce.io/)\n[Mekpreme Windows](https://mekpreme-auto-updater.sfo2.digitaloceanspaces.com/latest/MEKpreme%20Setup%200.4.99.exe)\n[Mekpreme Mac](https://mekpreme-auto-updater.sfo2.digitaloceanspaces.com/latest/MEKpreme%20Setup%200.4.99.exe)\n[Kodai](https://kodai.io/download)\n[Phantom](https://ghost.shoes/l/phantom)\n[ANB](https://s3-us-west-2.amazonaws.com/aio-v2/AIO+Bot+-+V2+Setup.exe)\n[TSB Windows](https://tsb-build.s3.us-east-2.amazonaws.com/TSB-win-latest.exe)\n[TSB Mac](https://tsb-build.s3.us-east-2.amazonaws.com/TSB-mac-latest.dmg)\n[Wrath](https://download.wrathbots.co/)\n[Velox Windows](https://veloxpreme.io/download)\n[Velox Mac](https://velox.nyc3.cdn.digitaloceanspaces.com/Velox-4.4.2.dmg)", true)
        msg.reply(command);
    }
});
//Snowflake Command
client.on('message', async function (msg) {
    if (msg.content.startsWith(discordBot.commandPrefix + 'snowflake')) {
        let snowflake = parseFloat(msg.content.split(" ")[1])
        let timestamp = Math.floor(snowflake / 4194304 + 1420070400000)
        var date = new Date(timestamp * 1000);
        // Hours part from the timestamp
        var hours = date.getHours();
        // Minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
        // Seconds part from the timestamp
        var seconds = "0" + date.getSeconds();
        // Will display time in 10:30:23 format
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        msg.reply(formattedTime)
    }
});
//Varients Command
client.on('message', async function (msg) {
    const embed = new Discord.MessageEmbed()
    if (msg.content.startsWith(discordBot.commandPrefix + 'variants')) {
        if (msg.content.split(' ').length == 2) {
            let url = msg.content.split(' ')[1]
            axios.get(`${url}.json`)
                .then((response) => {
                    if (response.data.product.variants) {
                        const { product } = response.data
                        embed.setTitle(product.title)
                        embed.setURL(url)
                        embed.setThumbnail(product.images[0].src)
                        product.variants.forEach((variant) => {
                            embed.addField(variant.title, variant.id)
                        })
                        embed.setColor('#6cb3e3')
                        msg.channel.send(embed)
                    }
                    else {
                        embed.setTitle('Error')
                        embed.setDescription('No variants found')
                        msg.channel.send(embed)
                    }
                }, (error) => {
                    embed.setTitle('Error')
                    embed.setDescription('There was an error with the shopify API. Please try again later.')
                    msg.channel.send(embed)
                })
        }
        else {
            embed.setTitle('Error')
            embed.setDescription('Link Is required')
            msg.channel.send(embed)
        }
    }
});
//Sitelist Command
client.on('message', async function (msg) {
    if (msg.content.startsWith(discordBot.commandPrefix + 'sitelist')) {
        const command = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('Sitelist')
            .addField('Adidas/ys', '```\nYeezysupply\nAdidas-mx\nAdidas-ar\nAdidas-my\nAdidas-nl\nAdidas-au\nAdidas-nz\nAdidas-be\nAdidas-pe\nAdidas-br\nAdidas-co\nAdidas-ca\nAdidas-ph\nAdidas-th\nAdidas-cl\nAdidas-gb\nAdidas-ch\nAdidas-ru\nAdidas-de\nAdidas-es\nAdidas-sg\nAdidas-fr\nAdidas-us\nAdidas-ie\nAdidas-it\n```', true)
            .addField('Mesh', '```\nFootpatrol-gb\nFootpatrol-fr\nSize-uk\nSize-nl\nSize-de\nSize-fr\nSize-es\nSize-it\nSize-se\nSize-dk\nJize-ie\nJd-sports-uk\nJd-sports-ie\nJd-sports-fr\nJd-sports-nl\nJd-sports-es\nJd-sports-de\nJd-sports-it\nJd-sports-se\nJd-sports-dk\nJd-sports-be\nJd-sports-au\nJd-sports-at\nJd-sports-fi\nJd-sports-pt\n```', true)
            .addField('Footsites', '```\nKids Footlocker\nChamps Sports\nFootaction\nEastbay\nFootlocker-at\nFootlocker-be\nFootlocker-ca\nFootlocker-cz\nFootlocker-de\nFootlocker-dk\nFootlocker-es\nFootlocker-fr\nFootlocker-gr\nFootlocker-hu\nFootlocker-ie\nFootlocker-it\nFootlocker-lu\nFootlocker-nl\nFootlocker-no\nFootlocker-pl\nFootlocker-pt\nFootlocker-se\nFootlocker-uk\nFootlocker us\n```', true)
            .addField('Reddit', '```\nBuildapcsales Deals\nDeals\nFreebies\nGame Deals\nSneaker Deals\n```', true)
            .addField('Slickdeals', '```\nFreebies\nCoupons\nHot deals\nPopular deals\n```', true)
            .addField('Releases', '```\nRaffle Monitor\n- All regions\nSupreme releases\nPalace releases\n```', true)
            .addField('Shopify', '```\nFiltered-us\nFiltered-eu\nUnfiltered-us\nUnfiltered-eu\nBots\nPassword\nCheckpoint\nThrottle\nKith\nKith-eu\nUndefeated\nDsm-us\nDsm-sg\nDsm-jp\nDsm-uk\nPalace-us\nPalace-uk\nTravis\nCpfm\nDtlf\nKaws\nPescolo\nBape\nJimmyjazz\nSnk\nYcmc\nShoeplace\nFunko\nPacker\nLust\nHats\nUnion\n+250 more```', true)
            .addField('Stocks/Crypto', '```\nNew Crypto\nCrypto News\nBitcoin\nBinance\nDoge\nXrp\nMonero\nstellar\nLitecoin\nchainlink\nEthirium\nPolkadot\nNew Stocks/ETFs\nStocks News\nPenny stocks\nEtfs\nS&P 500\nGoogle\nNetflix\nSpotify\nAmazon\nEbay\nApple\nGamestop\nGoogle\nDow Jones\nCrude oil\nGold\n```', true)
            .addField('AIO', '```\nFinishline\nSolebox\nOffspring\nNordstrom\nNordstrom-ca\nHibbett\nSsense\nSlamjam\nSnipes-usa\nSnipes-eu\nBoxlunch\nHot-topic\nLacoste\nShopwss\nFootshop\nSvd\nAsos\nCourir\nMr-porter\nNet-a-porter\nCrocs\nNew Balance\nDSG\nFar-Fetch\nSNS\nSportschek-ca\nGolftown\n\n```', true)
            .addField('Retail', '```\nWalmart-us\nWalmart-ca\nUS-mint\nNewegg\nBestbuy-us\nBestbuy-ca\nBestbuy-mx\nCanada Computers\nToysrus\nCurry-uk\nHome Depot\nTop Shot\nTarget\nDisney\nMicrocenter\nGamenerdz\nSams Club\nPlaystation\nPokemon Center\ntopps\namd-us\nAmd-ca\ngamestop\nargos-uk\nAmazon-us\nAmazon-uk\nAmazon-ca\nAmazon-de\nAmazon-es\nAmazon-fr\nAmazon-it\nScotty Carmeron\nBnh Photo\nCadie\nIdlc\nSoul-mx\nEbuyer\nEbagames-ca\nAldi\nOffice Depot\nTaf-mx\nBrickseek\nEvga-us\nSmith Toys\n```', true)
            .addField('Nike', '```\nSnkrs-au\nSnkrs-be\nSnkrs-ca\nSnkrs-cl\nSnkrs-cn\nSnkrs-de\nSnkrs-es\nSnkrs-fr\nSnkrs-gb\nSnkrs-id\nSnkrs-ie\nSnkrs-in\nSnkrs-it\nSnkrs-jp\nSnkrs-mx\nSnkrs-my\nSnkrs-nl\nSnkrs-nz\nSnkrs-ph\nSnkrs-pl\nSnkrs-ru\nSnkrs-sg\nNike-us\nNike-gb\nNike-ca\nNike-mx\nNike-cn\nNike-jp\nNike-th\nNike-ph\nNike-sg\n```', true)
            .addField('Supreme', '```\nSupreme us\nSupreme uk\nSupreme eu\nSupreme gb\nSupreme jp\n```', true)

        msg.reply(command);

    }
});
//Crypto Command
client.on('message', async function (msg) {
    if (msg.content.startsWith("$" + "crypto")) {
        if (msg.content.split(' ').length > 1) {
            let value = msg.content.split(' ')[1]
            let url = `https://api.nomics.com/v1/currencies/ticker?key=c2528d7581aaf1bdfcd04798204778913a321dd1&ids=${value}&interval=1d&convert=USD&per-page=100&page=1`
            fetch(url, {
                'headers': {
                    'accept': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                },
            }).then(async response => {
                let body1 = await helper.getBodyAsText(response)
                let body = JSON.parse(body1);
                let caps = ''
                if (body1.includes('"market_cap"')) {
                    let capz = body[0].market_cap
                    let capsz = capz.split(".")
                    caps = capsz[0]
                } else {
                    caps = '0'
                }
                let name = body[0].name
                let image = "https://images.weserv.nl/?url=" + body[0].logo_url
                let price = body[0].price
                let symbol = body[0].symbol
                let exchanges = body[0].num_exchanges
                let pairs = body[0].num_pairs
                let priceChange = body[0]["1d"].price_change_pct
                let volumez = body[0]["1d"].volume
                let volumezs = volumez.split(".")
                let volumes = volumezs[0]
                let volume = (intToString(volumes))
                function intToString(volumes) {
                    var newValue = volumes;
                    if (volumes >= 1000) {
                        var suffixes = ["", "K", "M", "B", "T"];
                        var suffixNum = Math.floor(("" + volumes).length / 3);
                        var shortValue = '';
                        for (var precision = 2; precision >= 1; precision--) {
                            shortValue = parseFloat((suffixNum != 0 ? (volumes / Math.pow(1000, suffixNum)) : volumes).toPrecision(precision));
                            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                            if (dotLessShortValue.length <= 2) { break; }
                        }
                        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
                        newValue = shortValue + suffixes[suffixNum];
                    }
                    return newValue;
                }
                let cap = (intToString(caps))
                function intToString(caps) {
                    var newValue = caps;
                    if (caps >= 1000) {
                        var suffixes = ["", "K", "M", "B", "T"];
                        var suffixNum = Math.floor(("" + caps).length / 3);
                        var shortValue = '';
                        for (var precision = 2; precision >= 1; precision--) {
                            shortValue = parseFloat((suffixNum != 0 ? (caps / Math.pow(1000, suffixNum)) : caps).toPrecision(precision));
                            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                            if (dotLessShortValue.length <= 2) { break; }
                        }
                        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
                        newValue = shortValue + suffixes[suffixNum];
                    }
                    return newValue;
                }
                const embed = new Discord.MessageEmbed();
                embed.setColor('#6cb3e3')
                embed.setTitle(`${name} Price`)
                embed.setURL(`https://coinmarketcap.com/currencies/${name.split(' ').join('-').toLowerCase()}`)
                embed.addField("**Symbol**", symbol, true)
                embed.addField("**Price**", '$' + price, true)
                embed.addField("**Market Cap**", cap, true)
                embed.addField("**Exchanges**", exchanges, true)
                embed.addField("**Number Pairs**", pairs, true)
                embed.addField("**Price Change**", priceChange + '%', true)
                embed.addField("**Volume**", '$' + volume, true)
                embed.setThumbnail(image)
                embed.setFooter("Crypto | v1.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
                await msg.reply(embed)
            }).catch(async err => {
                console.log(err)
                msg.reply("Invalid Coin")
            })
        } else {
            msg.reply("Wrong Format")
        }
    }
})

//DSG Stock
client.on('message', async function (msg) {
    if (msg.content.startsWith("!" + "dsg")) {
        if (msg.content.split(' ').length > 1) {
            let value = msg.content.split(' ')[1]
            let url = `https://www.dickssportinggoods.com/p/spring/msvc/product/v5/store/15108/products/${value}?abcz=${v4()}`
            fetch(url, {
                'headers': {
                    'accept': 'application/json',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                },
            }).then(async response => {
                if (response.status !== 200) {
                    return
                }
                let body1 = await helper.getBodyAsText(response)
                let body = JSON.parse(body1);
                let name = body.data.title
                let image = `https://dks.scene7.com/is/image/GolfGalaxy/${body.data.id}_${body.data.skus[0].defAttributes[0].swatchImage.replace('_swatch', '')}`
                let link = 'https://www.dickssportinggoods.com/' + body.data.pdpSeoUrl
                let price = "$" + body.data.price.maxOffer
                let sizes = body.data.skus
                let stock = 0
                let sku = body.data.id
                for (let size of sizes) {
                    if (size.atsInventory > 0 && size.defAttributes[1].value.trim().length > 0) {
                        sizes += `${size.defAttributes[1].value.trim()} (${size.atsInventory}) - ${size.id} \n`;
                        stock += size.atsInventory
                    }
                }
                sizes = sizes.split('[object Object],').join('').replace('[object Object]', '')
                let sizeright = sizes.trim().split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                if (sizeleft.length < 1)
                    sizeright = ['-']
                const embed = new Discord.MessageEmbed();
                embed.setColor('#6cb3e3')
                embed.setURL(link)
                embed.setTitle(name)
                embed.setAuthor('https://www.dickssportinggoods.com', '', 'https://www.dickssportinggoods.com')
                embed.addField("**Stock**", stock, true)
                embed.addField("**SKU**", sku, true)
                embed.addField("**Price**", price, true)
                embed.addField("**Sizes**", sizeleft.join('\n'), true)
                embed.addField("**Sizes**", sizeright.join('\n'), true)

                embed.setThumbnail(image)
                embed.setFooter("DSG Stock | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
                await msg.reply(embed)
            }).catch(async err => {
                console.log(err)
                msg.reply("Invalid SKU!")
            })
        } else {
            msg.reply("Wrong Format!")
        }
    }
})

//Nordstrom Stock
client.on('message', async function (msg) {
    if (msg.content.startsWith("!" + "nordstrom")) {
        if (msg.content.split(' ').length > 1) {
            let value = msg.content.split(' ')[1]
            let url = `https://www.nordstrom.com/api/style/${value}?abcz=${v4()}`
            fetch(url, {
                'headers': {
                    'user-agent': 'msnbot-131-253-38-20.search.msn.com',
                    'Accept': 'application/vnd.nord.pdp.v1+json',
                },
            }).then(async response => {
                if (response.status !== 200) {
                    return
                }
                let body1 = await helper.getBodyAsText(response)
                let body = JSON.parse(body1);
                if (body.isAvailable === true) {
                    let title = body.productTitle
                    let sku = value
                    let parse = body.defaultGalleryMedia.styleMediaId
                    let image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop
                    let stock = 0
                    let price = ''
                    let link = `https://www.nordstrom.com/s/tachyon/${sku}`
                    let sizes = ''
                    let ids = body.skus.allIds
                    for (let id of ids) {
                        if (body.skus.byId[id].isAvailable === true) {
                            sizes += `${body.skus.byId[id].sizeId} (${body.skus.byId[id].totalQuantityAvailable})\n`
                            stock += Number(body.skus.byId[id].totalQuantityAvailable)
                            price = body.price.bySkuId[id].priceString
                        }
                    }
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    if (sizeleft.length < 2)
                        sizeright = ['-']
                    const embed = new Discord.MessageEmbed();
                    embed.setColor('#6cb3e3')
                    embed.setURL(link)
                    embed.setTitle(title)
                    embed.setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
                    embed.addField("**Stock**", stock, true)
                    embed.addField("**SKU**", sku, true)
                    embed.addField("**Price**", price, true)
                    embed.addField("**Sizes**", sizeleft.join('\n'), true)
                    embed.addField("**Sizes**", sizeright.join('\n'), true)
                    embed.setThumbnail(image)
                    embed.setFooter("Nordstrom Stock | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
                    await msg.reply(embed)
                } else {
                    msg.reply("Stock Not Available!")
                }
            }).catch(async err => {
                console.log(err)
                msg.reply("Invalid SKU!")
            })
        } else {
            msg.reply("Wrong Format!")
        }
    }
})

//Finishline Stock
client.on('message', async function (msg) {
    if (msg.content.startsWith("!" + "finishline")) {
        if (msg.content.split(' ').length > 1) {
            let sku = msg.content.split(' ')[1]
            let productID = sku.split(',')[0]
            let styleID = sku.split(',')[1]
            let colorID = sku.split(',')[2]
            fetch(`https://www.finishline.com/store/browse/json/productSizesJson.jsp?productId=${productID}&styleId=${styleID}&colorId=${colorID}&productId=${v4()}`, {
                'headers': {
                    'User-Agent': 'SSL Labs (https://www.ssllabs.com/about/assessment.html); on behalf of 69.179.157.70'
                },
            }).then(async response => {
                if (response.status !== 200) {
                    return
                }
                let body = await helper.getBodyAsText(response)
                body = JSON.parse(body);
                let sizes = ''
                let sizesparse = body.productSizes
                let stock = 0
                let link = `https://www.finishline.com/store/product/tachyon/${productID}?styleId=${styleID}&colorId=${colorID}`
                let title = ''
                let image = ''
                let price = ''
                for (let size of sizesparse) {
                    if (size.sizeValue) {
                        if (size.productId === styleID + '_' + colorID) {
                            if (size.sizeClass !== 'unavailable') {
                                stock += Number(Buffer.from(size.stockLevel, 'base64'))
                                sizes += `${size.sizeValue} (${Buffer.from(size.stockLevel, 'base64').toString()})\n`
                            }
                        }
                    }
                }
                if (sizes.length < 1) {
                    msg.reply("Stock Not Available!")
                    return
                }
                await fetch(`https://www.finishline.com/store/recommendations/json/productRecommendationsEndecaJson.jsp?renderType=pdp&products=${productID}:${styleID}:${colorID}%7C`, {
                    'headers': {
                        'User-Agent': 'SSL Labs (https://www.ssllabs.com/about/assessment.html); on behalf of 69.179.157.70'
                    },
                }).then(async response => {
                    if (response.status !== 200) {
                        return
                    }
                    let body2 = await helper.getBodyAsText(response)
                    body2 = JSON.parse(body2);
                    title = body2.productsArray[0].displayName
                    image = body2.productsArray[0].image
                    price = '$' + body2.productsArray[0].price.nowPrice
                }).catch(async err => {
                    console.log(err)
                    msg.reply("Something Went Wrong!")
                })
                let sizeright = sizes.split('\n')
                let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                if (sizeleft.length < 2)
                    sizeright = ['-']
                const embed = new Discord.MessageEmbed();
                embed.setColor('#6cb3e3')
                embed.setURL(link)
                embed.setTitle(title)
                embed.setAuthor('https://www.finishline.com', '', 'https://www.finishline.com')
                embed.addField("**Stock**", stock, true)
                embed.addField("**SKU**", sku, true)
                embed.addField("**Price**", price, true)
                embed.addField("**Sizes**", sizeleft.join('\n'), true)
                embed.addField("**Sizes**", sizeright.join('\n'), true)
                embed.setThumbnail(image)
                embed.setFooter("Finishline Stock | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
                await msg.reply(embed)
            }).catch(async err => {
                console.log(err)
                msg.reply("Invalid SKU!")
            })
        } else {
            msg.reply("Wrong Format!")
        }
    }
})

//Hibbett Stock
client.on('message', async function (msg) {
    if (msg.content.startsWith("!" + "nordstrom")) {
        if (msg.content.split(' ').length > 1) {
            let value = msg.content.split(' ')[1]
            let url = `https://www.nordstrom.com/api/style/${value}?abcz=${v4()}`
            fetch(url, {
                'headers': {
                    'user-agent': 'msnbot-131-253-38-20.search.msn.com',
                    'Accept': 'application/vnd.nord.pdp.v1+json',
                },
            }).then(async response => {
                if (response.status !== 200) {
                    return
                }
                let body1 = await helper.getBodyAsText(response)
                let body = JSON.parse(body1);
                if (body.isAvailable === true) {
                    let title = body.productTitle
                    let sku = value
                    let parse = body.defaultGalleryMedia.styleMediaId
                    let image = body.styleMedia.byId[parse].imageMediaUri.smallDesktop
                    let stock = 0
                    let price = ''
                    let link = `https://www.nordstrom.com/s/tachyon/${sku}`
                    let sizes = ''
                    let ids = body.skus.allIds
                    for (let id of ids) {
                        if (body.skus.byId[id].isAvailable === true) {
                            sizes += `${body.skus.byId[id].sizeId} (${body.skus.byId[id].totalQuantityAvailable})\n`
                            stock += Number(body.skus.byId[id].totalQuantityAvailable)
                            price = body.price.bySkuId[id].priceString
                        }
                    }
                    let sizeright = sizes.split('\n')
                    let sizeleft = sizeright.splice(0, Math.floor(sizeright.length / 2))
                    if (sizeleft.length < 2)
                        sizeright = ['-']
                    const embed = new Discord.MessageEmbed();
                    embed.setColor('#6cb3e3')
                    embed.setURL(link)
                    embed.setTitle(title)
                    embed.setAuthor('https://www.nordstrom.com', '', 'https://www.nordstrom.com')
                    embed.addField("**Stock**", stock, true)
                    embed.addField("**SKU**", sku, true)
                    embed.addField("**Price**", price, true)
                    embed.addField("**Sizes**", sizeleft.join('\n'), true)
                    embed.addField("**Sizes**", sizeright.join('\n'), true)
                    embed.setThumbnail(image)
                    embed.setFooter("Nordstrom Stock | v2.0", 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531')
                    await msg.reply(embed)
                } else {
                    msg.reply("Stock Not Available!")
                }
            }).catch(async err => {
                console.log(err)
                msg.reply("Invalid SKU!")
            })
        } else {
            msg.reply("Wrong Format!")
        }
    }
})

//Fee Command
client.on('message', async function (msg) {
    if (msg.content.startsWith(discordBot.commandPrefix + 'fee')) {
        const fees = {
            'StockX Level 1 (9.5%)': n => .095 * n,
            'StockX Level 2 (9%)': n => .09 * n,
            'StockX Level 3 (8.5%)': n => .085 * n,
            'StockX Level 4 (8%)': n => .08 * n,
            'Goat 90+ (9.5% + $5.00 + 2.9%)': n => 0.095 * n + 5 + (0.905 * n * 0.029),
            'Goat 70-89 (15% + $5.00 + 2.9%)': n => 0.15 * n + 5 + (0.85 * n * 0.029),
            'Goat 50-69 (20% + $5.00 + 2.9%)': n => 0.20 * n + 5 + (0.80 * n * 0.029),
            'Ebay (12.9% + $0.30': n => 0.129 * n + 0.3,
            'Paypal (2.9% + $0.30)': n => (0.029 * n) + 0.3,
            'Grailed (9% + 2.9%)': n => 0.089 * n + 0.911 * n * 0.029,
        }
        const embed = new Discord.MessageEmbed();
        embed.setTitle("Fee Calculator")
        if (msg.content.split(" ").length == 2) {
            if (isNaN(msg.content.split(" ")[1])) {
                embed.setDescription('Please input a number');
            }
            else {
                const [, number] = msg.content.split(' ');
                Object.keys(fees).forEach(fee => {
                    embed.addField(`${fee} Payout`, `$${Number(number - fees[fee](number)).toFixed(2)}`);
                    embed.setColor('#6cb3e3')
                });
            }
        }
        else if (msg.content.split(" ").length > 2) {
            embed.setDescription("This command takes only 1 argument");
        }
        else if (msg.content.split(" ").length == 1) {
            embed.setDescription("Please put a price to calculate fees");
            embed.setColor('#6cb3e3')
        }
        else {
            embed.setDescription("Please input a price")
            embed.setColor('#6cb3e3')
        }
        msg.reply(embed);
    }
});

//viewbot
client.on('message', async function (msg) {
    if (msg.content.startsWith("!" + "view")) {
        if (msg.content.split(' ').length > 1) {
            let value = msg.content.split(' ')[1]
            let amount = msg.content.split(' ')[2]
            let total = 0
            if (!value.includes('ebay')) {
                msg.reply("Invalid url!")
                return
            }
            if (amount > 500) {
                msg.reply("Max views are 500!")
                return
            }
            let add = await msg.channel.send(`Adding ${amount} views to your listing!`)
            while (amount >= total) {
                let proxy = 'http://global.rotating.proxyrack.net:9000'
                await fetch(`${value}?_trkparms=${v4()}`, {
                    'headers': {
                        'user-agent': randomUseragent.getRandom(),
                        'timeout': 2000,
                        agent: await new HTTPSProxyAgent(proxy),
                    },
                }).then(async response => {
                    if (response.status !== 200) {
                        return
                    }
                }).catch(async err => {
                    console.log(err)
                    return
                })
                total++
                await helper.sleep(200);
            }
            add.edit(`Added ${amount} views!`)
        } else {
            msg.reply("Wrong Format!")
        }
    }
})
//Status Command
// discordBot.getClient.on('message', (msg) => {
//     if (msg.content === discordBot.commandPrefix + "status") {
//         const exampleEmbed = new Discord.MessageEmbed()
//             .setColor('#32CD32')
//             .setTitle('Tachyon-Monitors Status')
//             .addFields(
//                 { name: 'Regular field title', value: ':white_check_mark:' },
//             )
//             .setThumbnail('https://media.discordapp.net/attachments/811261940524384296/825732234597367868/14-147660_footlocker-inc-clearance-sale-footsites-logo-hd-png.png')

//         msg.channel.send(exampleEmbed);
//     }
// })

//Ping Command
discordBot.getClient.on('message', (msg) => {
    if (msg.content === discordBot.commandPrefix + "ping") {
        msg.channel.send(`Ping: ${Math.round(msg.client.ws.ping)}ms`);
    }
})

discordBot.login();