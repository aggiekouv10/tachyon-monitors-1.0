let ShopifyMonitor = require('./shopify-base copy');
const helper = require('../helper');

helper.init();

let monitors = [];

monitors.push(new ShopifyMonitor("https://undefeated.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841634672214057/9RE2v_p-iOsR28XmAmyvFm0afACR1jZca42bPEfkGmuVmYrhH0VjE15c1Rw3IbmKRnM-'));
monitors.push(new ShopifyMonitor("https://kith.com", helper.getProxyList(), 'https://discord.com/api/webhooks/847555035566571560/BELijCeebAc3HB4cNMsk1U5IMYmmltU62nUTHB6jB_l2wiB0emEXFtkJpD8pUfg5kT09'));
monitors.push(new ShopifyMonitor("https://www.shoepalace.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841706596401222/nwN3-kyGh_4QU3fSX9GlAoL2hsLTIbfWxNCmOaR5afFean0hbqrttnI-7t46eU4ILRpf'));
monitors.push(new ShopifyMonitor("https://ycmc.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841823382470666/t_p3GE7Eooz5d2Hnc3HEbnpDifWNN0FIidmUjoR7WWc5zrNuHXi5p95rq8Mx00xboSrz'));
monitors.push(new ShopifyMonitor("https://amigoskateshop.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841873470718032/-wYaV2wqKyko7O4rbQfXzvuai_sU8j8gR5wMn8hDEYYUi06dNUufo7jbpikAAgLNqxsw'));
monitors.push(new ShopifyMonitor("https://njskateshop.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841873470718032/-wYaV2wqKyko7O4rbQfXzvuai_sU8j8gR5wMn8hDEYYUi06dNUufo7jbpikAAgLNqxsw'));
monitors.push(new ShopifyMonitor("https://checkout.funko.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842842600385019935/oo8KiraJRotiYj9cFOMiz7m67WICLErjTThlRkO2dacOgKdwfeg3WZ8qt5Mg4NgiJJLh'));
monitors.push(new ShopifyMonitor("https://packershoes.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842842662591135764/tWt-RC5vm4yXiZfb56i9ZIncwoLGLyd0WjkDpEJHh0C-tUsG0ff0hVnUEcY16ArXDWqR'));
monitors.push(new ShopifyMonitor("https://owlandgoosegifts.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842842662591135764/tWt-RC5vm4yXiZfb56i9ZIncwoLGLyd0WjkDpEJHh0C-tUsG0ff0hVnUEcY16ArXDWqR'));
monitors.push(new ShopifyMonitor("https://eu.kith.com", helper.getProxyList(), 'https://discord.com/api/webhooks/848247378993741865/dNXTjy-b1qMDZBwAbX3gqd-3Hdg7NMnI4EfGETnKQBf9ijgNwnn96dHoPg3E5vKHUTSL'));
monitors.push(new ShopifyMonitor("https://www.lustmexico.com", helper.getProxyList(), 'https://discord.com/api/webhooks/848247681725366322/by1uJoAIWCB6OlOe98p4RKWchtgYZZe5-VJ6EvD-J3MG6gByrvarcNL7exk9rH1YsZcr'));
monitors.push(new ShopifyMonitor("https://www.hatclub.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350630658605058/Ez0unPdcYPXjbf9v3MGetqUgAu0glvZgqZ2S_lYIm1yIn7FEQjdJDN0vPyU2x82c2pu5'));
monitors.push(new ShopifyMonitor("https://shop.travisscott.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350440649162753/WEEF8n6-WDCixnb8EqYT_8q1ajeTn8NZqd0ESlzcENMUy31J7EFv--_9C7-uL0qda01-'));
monitors.push(new ShopifyMonitor("https://shop-us.doverstreetmarket.com", helper.getProxyList(), 'https://discord.com/api/webhooks/842841776078323732/GWz8c5GrXeZ4s1Tle5313KuTjlDdEMY0KyNDTcMML2e2RZJ0xodD7PbeY8XM9Bp6BzJg'));

monitors.push(new ShopifyMonitor("https://shop-sg.doverstreetmarket.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843353097850060820/_1yu-PQcFscufaojLQ97XYHykd0XI0oD70T9K9nVbiyJokdmNWtkkQMCq2MA-7vBfsb3'));
monitors.push(new ShopifyMonitor("https://shop-jp.doverstreetmarket.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843353209993035807/5gq2jMoMsIAsFpsWOJq57MfuDEvY9NPrQi79eicHwLL1bdSPdlF54fMmRArIs6JQAm6F'));
monitors.push(new ShopifyMonitor("https://shop.doverstreetmarket.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843353260295585822/74gPEENcsnTkYs5TNb3su8NGea0MjD1Z07a34VwB-bGehPeMBHFMzM_MQOp3vQICzv3L'));
monitors.push(new ShopifyMonitor("https://shop.palaceskateboards.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350311347027968/2AEd6HFlRae8vDbZMKdOZluTJ0dC8zdphn6wobnrIr8bxsyO_VJIddTvGc-QkcHqmyJp'));
monitors.push(new ShopifyMonitor("https://shop-usa.palaceskateboards.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350389214281728/Wzhv81E1MTnLnNQNnEiH3tph85RReDKfQhFrABQgAG5fyjFGHmvVPITEfFoJMgHStXo3'));
monitors.push(new ShopifyMonitor("https://cactusplantfleamarket.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843356072822571018/gSLqhZHjJEcCWTwbpIFxOjnz9cfzA9aW7KolC9cdZ0HtV6RY4mDFXbK4H26yS7X2hE4y'));
monitors.push(new ShopifyMonitor("https://www.dtlr.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350533070913536/p-Cv5ILcLYfOSyQeOfx-0lQNWH-NCo4vPhFvWBy2CIl6DAzv-qMU9RSu6XINTxwEO3HP'));
monitors.push(new ShopifyMonitor("https://kawsone.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350581703213066/2F3ctEzd3G6CWyiwOIoKohU3r8zC-9l0SOrj8QYKuVpn-iAonHifUt9aAbHD12XRqjby'));
monitors.push(new ShopifyMonitor("https://pesoclo.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843350700603604992/h_3pmWvXVZdYO88S-2c0OjH8OjMnACKmd_TvjiGaJIgVXdRDzKdkcre3UqIZ3jIFUIUk'));
monitors.push(new ShopifyMonitor("https://bape.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843351226245972008/TE551E9uzFHiFuPysDTS7mY_NBuv5dAIeWwD8M_62gXQUMLH8TO03kKaKlh1z2sNEUhK'));
monitors.push(new ShopifyMonitor("https://www.jimmyjazz.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843353551110668288/noNqnGX4uVJgH2nY_J898CJHhuJ5kzPFcJFBTlrZlMqes0d34HVvC0uz-LGBi_pA5jns'));
monitors.push(new ShopifyMonitor("https://shopnicekicks.com", helper.getProxyList(), 'https://discord.com/api/webhooks/843356865949466675/d4d_IjtpUBmr_Me8gAQ6EiHHfk0TIfoJIcB6NdwbnUil3atY_CPWWFnlEtfLCCig-fg4'));
monitors.push(new ShopifyMonitor("https://exclusivefitted.com", helper.getProxyList(), 'https://discord.com/api/webhooks/865860288171606047/_toahERPbNnxRcDTrzLyDV9enX1x5Y7pURApbs1RWeK4C_3ofUnGMzXyj7lmMshI_bca'));
monitors.push(new ShopifyMonitor("https://www.myfitteds.com", helper.getProxyList(), 'https://discord.com/api/webhooks/865860427766169650/zfZjeipwgXHk7RftzVRX_tCI8xp-6QCnt0OWQVskGjFl0_NLox6o57n0-xxii8TPMCAU'));
monitors.push(new ShopifyMonitor("https://sportsworld165.com", helper.getProxyList(), 'https://discord.com/api/webhooks/865860349336748053/9JkldyxBgtcTE_j66Di_GiZ2AFPYIJpRdlvGhU-Vump6H3ZHWFY0kZX57y9r5bv8b1lZ'));
// monitors.push(new ShopifyMonitor("https://shop.kanyewest.com", helper.getProxyList(), 'https://discord.com/api/webhooks/867903740019474512/ogAI7V10qf8WCINnVhXblyltuuy45VvoNvSeHwhZMNe49GJdGFElJTcKzs0katnQ4t4T'));

console.log("Starting Shopify Monitor..")
for(let monitor of monitors) {
    monitor.monitor();
}