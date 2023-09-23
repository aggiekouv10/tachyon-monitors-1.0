const discordBot = require('../discord-bot');
let MeshMonitor = require('./mesh_base')

let sites = [
    {
        SITE: 'footpatrolgb',
        URL: 'https://www.footpatrol.com',
        credentials: {
            id: '253ae55594',
            key: '33367a7dc65731b695e0882f12d5f707',
            algorithm: 'sha256'
        },
        API_KEY: '52F096E285134DF2A9E1AFAF979BB415',
        DATABASE_TABLE: 'footpatrolgb',
        discordWebhook: discordBot.webhooks.FOOTPATROLGB,
        CHANNEL: discordBot.channels.FOOTPATROLGB
    },
    {
        SITE: 'footpatrolfr',
         URL: 'https://www.footpatrol.fr',
         credentials: {
             id: '9100705ee0',
             key: 'b6b631e9c6866ad0fb654e29bcd22b7c',
             algorithm: 'sha256'
         },
         API_KEY: '536AE78F060D458F8342241C6A2A7190',
         DATABASE_TABLE: 'footpatrolfr',
         discordWebhook: discordBot.webhooks.FOOTPATROLFR,
         CHANNEL: discordBot.channels.FOOTPATROLFR
     },
    {
        SITE: 'jdsportsuk',
        URL: 'https://www.jdsports.co.uk',
        credentials: {
            id: 'd1bdff50c5',
            key: '3442497330233aecfe132ddfbbd4d46d',
            algorithm: 'sha256'
        },
        API_KEY: '4CE1177BB983470AB15E703EC95E5285',
        DATABASE_TABLE: 'jdsportsuk',
        discordWebhook: discordBot.webhooks.JDSPORTSUK,
        CHANNEL: discordBot.channels.JDSPORTSUK
    },
    // {
    //     SITE: 'jdsportsie',
    //     URL: 'https://www.jdsports.ie',
    //     credentials: {
    //         id: 'd3cbd87f10',
    //         key: '3c279838fd48cf45a397898344eedad8',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '451FE27E0BD544C4B07C395CD5888547',
    //     DATABASE_TABLE: 'jdsportsie',
    //     discordWebhook: discordBot.webhooks.JDSPORTSIE,
    //     CHANNEL: discordBot.channels.JDSPORTSIE
    // },
    // {
    //     SITE: 'jdsportsfr',
    //     URL: 'https://www.jdsports.fr',
    //     credentials: {
    //         id: 'f2188a5b06',
    //         key: '8bb6bd51c83f2ec9821e1bda5c77b25b',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: 'B3B51B56ADC34016A6FEF7F8C337B836',
    //     DATABASE_TABLE: 'jdsportsfr',
    //     discordWebhook: discordBot.webhooks.JDSPORTSFR,
    //     CHANNEL: discordBot.channels.JDSPORTSFR
    // },
     {
         SITE: 'jdsportsnl',
         URL: 'https://www.jdsports.nl',
         credentials: {
             id: '6805a9f237',
             key: '60f38ccd64b72be47eef4638edb489ae',
             algorithm: 'sha256'
         },
         API_KEY: '9D93C082EA864FF5884FD4763B856C6D',
         DATABASE_TABLE: 'jdsportsnl',
         discordWebhook: discordBot.webhooks.JDSPORTSNL,
         CHANNEL: discordBot.channels.JDSPORTSNL
     },
    // {
    //     SITE: 'jdsportses',
    //     URL: 'https://www.jdsports.es',
    //     credentials: {
    //         id: 'a15e99c07a',
    //         key: '364e1006ccf7959fc33ce5eef9486bbe',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: 'EB396335754A48D795BB903B49E3AD91',
    //     DATABASE_TABLE: 'jdsportses',
    //     discordWebhook: discordBot.webhooks.JDSPORTSES,
    //     CHANNEL: discordBot.channels.JDSPORTSES
    // },
     {
         SITE: 'jdsportsde',
         URL: 'https://www.jdsports.de',
         credentials: {
             id: '3d44230df4',
             key: 'f266ed9166db7af4351fa88841b8c300',
             algorithm: 'sha256'
         },
         API_KEY: '195F25A2910341CBA49535BC5941F445',
         DATABASE_TABLE: 'jdsportses',
         discordWebhook: discordBot.webhooks.JDSPORTSDE,
         CHANNEL: discordBot.channels.JDSPORTSDE
    },
    // {
    //     SITE: 'jdsportsit',
    //     URL: 'https://www.jdsports.it',
    //     credentials: {
    //         id: '3dc77f7e7f',
    //         key: '089587c2316656881bbf17661bbf0d33',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '7B6B83F76BAA41DDB90D4147FB3D3C63',
    //     DATABASE_TABLE: 'jdsportsit',
    //     discordWebhook: discordBot.webhooks.JDSPORTSIT,
    //     CHANNEL: discordBot.channels.JDSPORTSIT
    // },
    // {
    //     SITE: 'jdsportsse',
    //     URL: 'https://www.jdsports.se',
    //     credentials: {
    //         id: '9ea5ecdfaa',
    //         key: '80a73c56e06ef76337c6efaf94460b78',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '69A3F58BA52C4DB88CB5585707A3C0F4',
    //     DATABASE_TABLE: 'jdsportsse',
    //     discordWebhook: discordBot.webhooks.JDSPORTSSE,
    //     CHANNEL: discordBot.channels.JDSPORTSSE
    // },
    // {
    //     SITE: 'jdsportsdk',
    //     URL: 'https://www.jdsports.dk',
    //     credentials: {
    //         id: 'd094b9a365',
    //         key: '7144518ade2e82ca6385561dcc02b383',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '00B2CE710BD64AC2AD7A34FEB2A7B296',
    //     DATABASE_TABLE: 'jdsportsdk',
    //     discordWebhook: discordBot.webhooks.JDSPORTSDK,
    //     CHANNEL: discordBot.channels.JDSPORTSDK
    // },
    // // {
    // //     SITE: 'jdsportsbe',
    // //     URL: 'https://www.jdsports.be',
    // //     credentials: {
    // //         id: 'c4fb0734be',
    // //         key: 'ef9a27be3268cdbc3240ae643b32a4fa',
    // //         algorithm: 'sha256'
    // //     },
    // //     API_KEY: '61100D5FA36F4F248D5DE6D546D47921',
    // //     DATABASE_TABLE: 'jdsportsbe',
    // //     discordWebhook: discordBot.webhooks.JDSPORTSBE,
    // //     CHANNEL: discordBot.channels.JDSPORTSBE
    // // },
    /*{
        SITE: 'jdsportsmy',
        URL: 'https://www.jdsports.my',
        credentials: {
            id: '560ce0f179',
            key: '293dcaa194ee71b0ca9e482c2d527fcf',
            algorithm: 'sha256'
        },
        API_KEY: '031F193F1FF7401E96D29BA8072F7251',
        DATABASE_TABLE: 'jdsportsmyf',
        discordWebhook: discordBot.webhooks.JDSPORTSMY,
        CHANNEL: discordBot.channels.JDSPORTSMY
    }, */
    // {
    //     SITE: 'jdsportsau',
    //     URL: 'https://www.jdsports.au',
    //     credentials: {
    //         id: '60122c4543',
    //         key: '066268d08e45b34290f553f9f4e56906',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '1753F69D6B4F48F9956DEE1002A83491',
    //     DATABASE_TABLE: 'jdsportsau',
    //     discordWebhook: discordBot.webhooks.JDSPORTSAU,
    //     CHANNEL: discordBot.channels.JDSPORTSAU
    // },
    // // {
    // //     SITE: 'jdsportsat',
    // //     URL: 'https://www.jdsports.at',
    // //     credentials: {
    // //         id: '60122c4543',
    // //         key: '066268d08e45b34290f553f9f4e56906',
    // //         algorithm: 'sha256'
    // //     },
    // //     API_KEY: '23E9D73FA2A64957BA367515970333A4',
    // //     DATABASE_TABLE: 'jdsportsat',
    // //     discordWebhook: discordBot.webhooks.JDSPORTSAT,
    // //     CHANNEL: discordBot.channels.JDSPORTSAT
    // // },
    // // {
    // //     SITE: 'jdsportsfi',
    // //     URL: 'https://www.jdsports.fi',
    // //     credentials: {
    // //         id: '2a31c0c80f',
    // //         key: '8a2efdb8e9d5a6d081884e3d334abcc6',
    // //         algorithm: 'sha256'
    // //     },
    // //     API_KEY: 'D8F6CCA07E3549348647B8DE8AA6E9D5',
    // //     DATABASE_TABLE: 'jdsportsfi',
    // //     discordWebhook: discordBot.webhooks.JDSPORTSFI,
    // //     CHANNEL: discordBot.channels.JDSPORTSFI
    // // },
    {
        SITE: 'jdsportssg',
        URL: 'https://www.jdsports.sg',
        credentials: {
            id: '94e8c7ae06',
            key: 'cf4205cb322026a0e120f63dcdece0f4',
            algorithm: 'sha256'
        },
        API_KEY: '1447E7A429A54DCB80E03D56EF6924DC',
        DATABASE_TABLE: 'jdsportssg',
        discordWebhook: discordBot.webhooks.JDSPORTSSG,
        CHANNEL: discordBot.channels.JDSPORTSSG
    },
    // {
    //     SITE: 'jdsportspt',
    //     URL: 'https://www.jdsports.pt',
    //     credentials: {
    //         id: '54c90d126d',
    //         key: '236a4ef99afaeb06cf1023586f0ae41b',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '85675FFA06A6462CACCF241DA705A6A0',
    //     DATABASE_TABLE: 'jdsportspt',
    //     discordWebhook: discordBot.webhooks.JDSPORTSPT,
    //     CHANNEL: discordBot.channels.JDSPORTSPT
    // },




     {
         SITE: 'size',
         URL: 'https://www.size.co.uk',
         credentials: {
             id: 'fbc28a16ec',
             key: 'd7c7872a58138c995430dd957b18c85b',
             algorithm: 'sha256'
         },
         API_KEY: '9039BF1C29724461881ACD80232F5313',
         DATABASE_TABLE: 'sizeuk',
         discordWebhook: discordBot.webhooks.SIZEUK,
         CHANNEL: discordBot.channels.SIZEUK
     },
    {
         SITE: 'sizenl',
         URL: 'https://www.size.nl',
         credentials: {
             id: '42d159adbc',
             key: 'fa796f80ae3a9790b1796e491fa19ced',
             algorithm: 'sha256'
         },
         API_KEY: '509EF36F9882470089AACAC99135B9CB',
         DATABASE_TABLE: 'sizenl',
         discordWebhook: discordBot.webhooks.SIZENL,
         CHANNEL: discordBot.channels.SIZENL
     },
    {
         SITE: 'sizede',
         URL: 'https://www.size.de',
         credentials: {
             id: '9242ac82fe',
             key: '1c2962f6f2e346c0165e43726176fc7b',
             algorithm: 'sha256'
         },
         API_KEY: 'B9AB7B6B5CD74497A4C2348F5F5E89F7',
         DATABASE_TABLE: 'sizede',
         discordWebhook: discordBot.webhooks.SIZEDE,
        CHANNEL: discordBot.channels.SIZEDE
     },
    // {
    //     SITE: 'sizefr',
    //     URL: 'https://www.size.fr',
    //     credentials: {
    //         id: '2a54a4bd66',
    //         key: 'b64d50a93b0c907c109b29fa9b3ca5a2',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '59DCF6F765D346619E3409F1F1FE7D10',
    //     DATABASE_TABLE: 'sizefr',
    //     discordWebhook: discordBot.webhooks.SIZEFR,
    //     CHANNEL: discordBot.channels.SIZEFR
    // },
    // {
    //     SITE: 'sizees',
    //     URL: 'https://www.size.es',
    //     credentials: {
    //         id: 'b1a7868a8c',
    //         key: '5679a7c7f8cb13d58253625a81bca52b',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '907108D8F6754F588927ED81B37D2E05',
    //     DATABASE_TABLE: 'sizees',
    //     discordWebhook: discordBot.webhooks.SIZEES,
    //     CHANNEL: discordBot.channels.SIZEES
    // },
    // {
    //     SITE: 'sizeit',
    //     URL: 'https://www.size.it',
    //     credentials: {
    //         id: '138d698519',
    //         key: '9acd9eecc04be281930c8b16f143e4b0',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: 'D0C9A901F06A4C7AA00FAD92B0783C64',
    //     DATABASE_TABLE: 'sizeit',
    //     discordWebhook: discordBot.webhooks.SIZEIT,
    //     CHANNEL: discordBot.channels.SIZEIT
    // },
    // {
    //     SITE: 'sizese',
    //     URL: 'https://www.size.se',
    //     credentials: {
    //         id: '782bdb38d8',
    //         key: 'fa7827cc513e9fe843be12124d013b25',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: 'A99C7C5147414D58BFEBDC58D2DF9A95',
    //     DATABASE_TABLE: 'sizese',
    //     discordWebhook: discordBot.webhooks.SIZESE,
    //     CHANNEL: discordBot.channels.SIZESE
    // },
    // {
    //     SITE: 'sizedk',
    //     URL: 'https://www.size.dk',
    //     credentials: {
    //         id: '6af2364998',
    //         key: '6f81172915d84691817dd22040f0b4f9',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '4E728C6150EE4396A8BACB0DD627DA2F',
    //     DATABASE_TABLE: 'sizedk',
    //     discordWebhook: discordBot.webhooks.SIZEDK,
    //     CHANNEL: discordBot.channels.SIZEDK
    // },
    // {
    //     SITE: 'sizeie',
    //     URL: 'https://www.size.ie',
    //     credentials: {
    //         id: 'a3c0389e3d',
    //         key: '2df03a2387ea458a25df9b609b09a972',
    //         algorithm: 'sha256'
    //     },
    //     API_KEY: '4422119FE17E4F5B8E775B32673DDB64',
    //     DATABASE_TABLE: 'sizeie',
    //     discordWebhook: discordBot.webhooks.SIZEIE,
    //     CHANNEL: discordBot.channels.SIZEIE
    // },
]





module.exports = {
    initateAll: function(bot) {
        for (let i = 0; i < sites.length; i++) {
            let site = sites[i];
            let monitor = new MeshMonitor(site.SITE, site.URL, site.credentials, site.API_KEY, site.DATABASE_TABLE, site.discordWebhook, site.CHANNEL);
            monitor.initiate(bot);
            sites[i].MONITOR = monitor;
        }
    },
    getSites: function() {
        return sites;
    }
}