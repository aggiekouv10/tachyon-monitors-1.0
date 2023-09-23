let ShopifyMonitor = require('./shopify-base');
const helper = require('../../helper');

helper.init();

let monitors = [];
//monitors.push(new ShopifyMonitor("https://shop.kanyewest.com", helper.getProxyList(), 'https://discord.com/api/webhooks/867903740019474512/ogAI7V10qf8WCINnVhXblyltuuy45VvoNvSeHwhZMNe49GJdGFElJTcKzs0katnQ4t4T'));
//monitors.push(new ShopifyMonitor("https://www.deadstock.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/872851053907951637/4F27UYSmngQf2mU-KkvU8SOiSGxxV_-_18NR2EXkw_99Gambv-50Pd-N8Tg1-LbaY1Qw'));
//monitors.push(new ShopifyMonitor("https://shop.havenshop.com", helper.getProxyList(), 'https://discord.com/api/webhooks/879982071043465286/KvXRFxH5RGb_qxk2bG8I-2GCg9zTjT8ME1j89Mhw2jm8y3NZzsuKUtbHcXLlq4N0uOXN'));
//monitors.push(new ShopifyMonitor("https://microplay.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/907126134473388053/XnyoqdRJio4UdYHc-gXpM6VvyB4DKVcYUoN4KKUALg9WgY4o48XKC1Q0xaU3deLfISWY'));
//monitors.push(new ShopifyMonitor("https://finalmouse.com", helper.getProxyList(), 'https://discord.com/api/webhooks/907126481287790622/fyvGb76id1a-8D-GV4m9zutbgBcsrpMIHh-FsmqoDei-lBEbko17ocSG6CgP_iw7WC5d'));
// monitors.push(new ShopifyMonitor("https://www.squidindustries.co", helper.getProxyList(), 'https://discord.com/api/webhooks/907773724361629706/bhkdEsVKk731xMCnlPo7ASBl2v-w6GY-Z9EzyTgcaH03aI-c2aGGeqZQ-f6hAhTDgkml'));
//monitors.push(new ShopifyMonitor("https://jdsports.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/907776073360605234/AChxBzrdh7h-P4oFB3toAcbXqI7DEzTk1OwvMFRjRAN1s8BMKLTYPH30NdwgReO423ay'));
//monitors.push(new ShopifyMonitor("https://ca.octobersveryown.com", helper.getProxyList(), 'https://discord.com/api/webhooks/911119715001319464/e0mFZH4JKJsfDDdz65rZmgw9bwligtKPO_r5VpjtVQDe9mWKr7XziPBdqFemWxmu-qcz'));
//monitors.push(new ShopifyMonitor("https://size.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/911459766075801650/MNh5Btu75vBbEgNc7K6BqxJFFylQdjdsYgv6sQh114R7kx1Rg0FW_IGS_kXg5h5BVfjr'));
//monitors.push(new ShopifyMonitor("https://www.a-ma-maniere.com", helper.getProxyList(), 'https://discord.com/api/webhooks/913096476056485898/IudKBB3lFjIrtkQjpAAVI8k7RCLP2cRTEi0RAH5FbScabK7YnDWoZuhET02em814cROu'));

monitors.push(new ShopifyMonitor("https://www.deadstock.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/976351499917619262/nEx7SfPvu4-OveYTy3eEmDkY3qI6GP8eg1q8EYrEgnvXxZQ58Yk09b2_JDX7q4hEA5fb'));
monitors.push(new ShopifyMonitor("https://nrml.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/976351924519591977/fH-IzroORjKTsGQ6Nykb0j8b-kFnsgdY_HnAEHdHstqQA_ioHfqmj01PF9W4bGduKl07'));
monitors.push(new ShopifyMonitor("https://shop.havenshop.com", helper.getProxyList(), 'https://discord.com/api/webhooks/976351995973758996/3V4OnizlXP0U5cRh93DyqYZY1CyYqnIec9vFilP_CrtfZucqPP0hK4dkVNeljD87_943'));
monitors.push(new ShopifyMonitor("https://jdsports.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/976352093021560892/mGNrML7_IIuVimKz6UuCydQEuMSeEiOY4saFN9aErMsFp2OVBtybf4hA0XkAvmwtUpue'));
monitors.push(new ShopifyMonitor("https://www.capsuletoronto.com", helper.getProxyList(), 'https://discord.com/api/webhooks/976352211573551184/U3ieWNA0D9kgDIX3nrxW25soTHMPNO9viH4vbcz4H8VMPDvOYZfBrMLvnk9Ks46gth0J'));
monitors.push(new ShopifyMonitor("https://nomadshop.net", helper.getProxyList(), 'https://discord.com/api/webhooks/976352287003934770/AzTOOmGBlzUeKIdIi2eVDAQHKrtRIiOBzn7J-XFAnwxmRfdyeb-dYWo3-rYltkRnd4NU'));
monitors.push(new ShopifyMonitor("https://size.ca", helper.getProxyList(), 'https://discord.com/api/webhooks/976351560156184616/9ytrnHr7Dvm1cQ_7Q6LOw6vWk_PusoO4w7ywmFXdTujPTUh3jPtju1Q2xnY2gt8KnVAF'));



//monitors.push(new ShopifyMonitor("https://www.capsuletoronto.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842735905341308948/XO84o30zaE-7h1y4G0dtHyF6l7JC1H4jwmF4nVrjEl7Rvc7GY-9VqNY_tj2cpsOKACnN'));  //just spams shit thats oos
//*/
console.log("Starting Shopify Monitor..")
for(let monitor of monitors) {
    monitor.monitor();
}