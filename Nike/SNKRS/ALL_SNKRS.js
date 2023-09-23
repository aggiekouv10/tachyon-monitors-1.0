const discordBot = require('../../discord-bot');
let SnkrsMonitor = require('./base')

let sites = [
    {
        MARKETPLACE: 'IN',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSIN,
        CHANNEL: discordBot.channels.SNKRSIN
    },
    {
        MARKETPLACE: 'GB',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSGB,
        CHANNEL: discordBot.channels.SNKRSGB
    },
    {
        MARKETPLACE: 'US',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en',
        discordWebhook: discordBot.webhooks.SNKRSUS,
        CHANNEL: discordBot.channels.SNKRSUS
    },
    {
        MARKETPLACE: 'CN',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'zh-Hans',
        discordWebhook: discordBot.webhooks.SNKRSCN,
        CHANNEL: discordBot.channels.SNKRSCN
    },
    {
        MARKETPLACE: 'FR',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'fr',
        discordWebhook: discordBot.webhooks.SNKRSFR,
        CHANNEL: discordBot.channels.SNKRSFR
    },
    {
        MARKETPLACE: 'JP',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'ja',
        discordWebhook: discordBot.webhooks.SNKRSJP,
        CHANNEL: discordBot.channels.SNKRSJP
    },
    {
        MARKETPLACE: 'CA',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSCA,
        CHANNEL: discordBot.channels.SNKRSCA
    },
    {
        MARKETPLACE: 'AU',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSAU,
        CHANNEL: discordBot.channels.SNKRSAU
    },

    {
        MARKETPLACE: 'SG',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSSG,
        CHANNEL: discordBot.channels.SNKRSSG
    },
    {
        MARKETPLACE: 'MY',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSMY,
        CHANNEL: discordBot.channels.SNKRSMY
    },
    {
        MARKETPLACE: 'PH',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSPH,
        CHANNEL: discordBot.channels.SNKRSPH
    },
    {
        MARKETPLACE: 'ID',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSID,
        CHANNEL: discordBot.channels.SNKRSID
    },
    {
        MARKETPLACE: 'TH',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'th',
        discordWebhook: discordBot.webhooks.SNKRSTH,
        CHANNEL: discordBot.channels.SNKRSTH
    },
    {
        MARKETPLACE: 'BE',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'de',
        discordWebhook: discordBot.webhooks.SNKRSBE,
        CHANNEL: discordBot.channels.SNKRSBE
    },
    {
        MARKETPLACE: 'CL',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'es-419',
        discordWebhook: discordBot.webhooks.SNKRSCL,
        CHANNEL: discordBot.channels.SNKRSCL
    },
    {
        MARKETPLACE: 'DE',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'de',
        discordWebhook: discordBot.webhooks.SNKRSDE,
        CHANNEL: discordBot.channels.SNKRSDE
    },
    {
        MARKETPLACE: 'ES',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'es-ES',
        discordWebhook: discordBot.webhooks.SNKRSES,
        CHANNEL: discordBot.channels.SNKRSES
    },
    {
        MARKETPLACE: 'IE',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSIE,
        CHANNEL: discordBot.channels.SNKRSIE
    },
    {
        MARKETPLACE: 'IT',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'it',
        discordWebhook: discordBot.webhooks.SNKRSIT,
        CHANNEL: discordBot.channels.SNKRSIT
    },
    /* {
        MARKETPLACE: 'MX',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'es-419',
        discordWebhook: discordBot.webhooks.SNKRSMX,
        CHANNEL: discordBot.channels.SNKRSMX
    }, */
    {
        MARKETPLACE: 'NZ',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'en-GB',
        discordWebhook: discordBot.webhooks.SNKRSNZ,
        CHANNEL: discordBot.channels.SNKRSNZ
    },
    {
        MARKETPLACE: 'NL',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'nl',
        discordWebhook: discordBot.webhooks.SNKRSNL,
        CHANNEL: discordBot.channels.SNKRSNL
    },
    {
        MARKETPLACE: 'PL',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'pl',
        discordWebhook: discordBot.webhooks.SNKRSPL,
        CHANNEL: discordBot.channels.SNKRSPL
    },
    {
        MARKETPLACE: 'RU',
        CHANNELID: '010794e5-35fe-4e32-aaff-cd2c74f89d61',
        LANGUAGE: 'ru',
        discordWebhook: discordBot.webhooks.SNKRSRU,
        CHANNEL: discordBot.channels.SNKRSRU
    },
]




module.exports = {
    initateAll: function(bot) {
        for (let i = 0; i < sites.length; i++) {
            let site = sites[i];
            let monitor = new SnkrsMonitor(site.MARKETPLACE, site.CHANNELID, site.LANGUAGE, site.discordWebhook, site.CHANNEL);
            monitor.initiate(bot);
            sites[i].MONITOR = monitor;
        }
    },
    getSites: function() {
        return sites;
    }
}