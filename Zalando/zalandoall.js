const discordBot = require('../discord-bot');
let MeshMonitor = require('./mesh_base')

let sites = [
    {
        SITE: 'zalandouk',
        URL: 'https://www.zalando.co.uk',
        DATABASE_TABLE: 'zalandouk',
        discordWebhook: discordBot.webhooks.ZALANDOUK,
        CHANNEL: discordBot.channels.ZALANDOUK
    },
]





module.exports = {
    initateAll: function(bot) {
        for (let i = 0; i < sites.length; i++) {
            let site = sites[i];
            let monitor = new MeshMonitor(site.SITE, site.URL, site.DATABASE_TABLE, site.discordWebhook, site.CHANNEL);
            monitor.initiate(bot);
            sites[i].MONITOR = monitor;
        }
    },
    getSites: function() {
        return sites;
    }
}