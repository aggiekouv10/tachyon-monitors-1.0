
const axios = require('axios')
const Discord = require('discord.js');

function addExtrasToBot(bot) {
    let client = bot.getClient;
    //Lets go baby
    client.once('ready', () => {
        bot.sendChannelMessage(bot.channels.BOT_LOGS, 'Main Initialized!');
    });

    //Help Command
    client.on('message', async function (msg) {
        if (msg.content.startsWith(bot.commandPrefix + 'help')) {
            const command = new Discord.MessageEmbed()
                .setColor('#6cb3e3')
                .setTitle('Monitor Commands')
                .setDescription('**!monitorSKU <sku> <waitTime>**\n Add sku to database\n\n**!downloads**\n Sends bot download links\n\n**!fee <number>**\n Check StockX and Goat fees\n\n**!view <link> <amount>**\n Sends ebay views (500MAX) \n\n**!sitelist** Check the Tachyon sitelist\n\n**!varients**\n Check shopify variants')
            msg.reply(command);
        }
    });
    //Bot Downloads
    client.on('message', async function (msg) {
        if (msg.content.startsWith(bot.commandPrefix + 'downloads')) {
            const command = new Discord.MessageEmbed()
                .setColor('#6cb3e3')
                .addField("**Downloads**", "[Cyber](https://cybersole.io/download)\n[EVE](http://eve-robotics.com/updates/EveAIOX_Setup.zip)\n[Dashe](http://updater.dashe.io/)\n[Ghost Snkrs](https://ghost.shoes/l/snkrs)\n[Latchkey](http://download.latchkeybots.io/)\n[TKS](http://thekickstationapi.com/downloads/Installer.msi)\n[PD Shopify](https://shopify.projectdestroyer.com/download)\n[PD Nike](https://swoosh.projectdestroyer.com/download)\n[Tohru](https://tohru.io/download)\n[SoleAIO](https://drive.google.com/open?id=1GRpzE8Ofc2fY_ueNwvut4QjoKm4SdpGr)\n[HawkMesh](http://download.hawkmesh.com/)\n[Hastey](https://update.hastey.io/)\n[Balko Windows](https://s3.amazonaws.com/balkobot.com/Balkobot2-0/balkobot2-setup.exe)\n[Balko Mac](https://s3.amazonaws.com/balkobot.com/Balkobot2-0/Balkobot2-0.dmg)", true)
                .addField("**Downloads**", "[BNB](http://bnba.io/download-bnb)\n[NSB](https://nsb.nyc3.digitaloceanspaces.com/NSB-win-latest.exe)\n[NSB MAC](https://nsb.nyc3.digitaloceanspaces.com/NSB-mac-latest.exe)\n[Splashforce](https://update.splashforce.io/)\n[Mekpreme Windows](https://mekpreme-auto-updater.sfo2.digitaloceanspaces.com/latest/MEKpreme%20Setup%200.4.99.exe)\n[Mekpreme Mac](https://mekpreme-auto-updater.sfo2.digitaloceanspaces.com/latest/MEKpreme%20Setup%200.4.99.exe)\n[Kodai](https://kodai.io/download)\n[Phantom](https://ghost.shoes/l/phantom)\n[ANB](https://s3-us-west-2.amazonaws.com/aio-v2/AIO+Bot+-+V2+Setup.exe)\n[TSB Windows](https://tsb-build.s3.us-east-2.amazonaws.com/TSB-win-latest.exe)\n[TSB Mac](https://tsb-build.s3.us-east-2.amazonaws.com/TSB-mac-latest.dmg)\n[Wrath](https://download.wrathbots.co/)\n[Velox Windows](https://veloxpreme.io/download)\n[Velox Mac](https://velox.nyc3.cdn.digitaloceanspaces.com/Velox-4.4.2.dmg)", true)
            msg.reply(command);
        }
    });
    //Snowflake Command
    client.on('message', async function (msg) {
        if (msg.content.startsWith(bot.commandPrefix + 'snowflake')) {
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
        if (msg.content.startsWith(bot.commandPrefix + 'variants')) {
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
        if (msg.content.startsWith(bot.commandPrefix + 'sitelist')) {
            const command = new Discord.MessageEmbed()
                .setColor('#6cb3e3')
                .setTitle('Sitelist')
                .setDescription("")
            msg.reply(command);

        }
    });
    //Fee Command
    client.on('message', async function (msg) {
        if (msg.content.startsWith(bot.commandPrefix + 'fee')) {
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
}

module.exports = { addExtrasToBot };