const rp = require('request-promise-native');
const fs = require('fs-extra');

let lastPost = '';

const sendWebhook = (title, permalink, time) => {
  console.log(time);
  const payload = {
    headers: { 'Content-Type': 'application/json' },
    url: 'https://discord.com/api/webhooks/975547604240846898/YuI0I1Rhx1t5ZWDPk8mmiQ7wIBiqkwLWnkFTnWTpo8VMfpgbhl2vXATc3T_OYegpEX9A',
    method: 'POST',
    json: {
      embeds: [{
        url: permalink,
        description: '',
        title,
        color: 7123939,
        author: {
          name: 'Reddit Monitor',
          icon_url: 'https://media.discordapp.net/attachments/820804762459045910/821418521971523624/iDdntscPf-nfWKqzHRGFmhVxZm4hZgaKe5oyFws-yzA.webp?width=531&height=531'
        },
        fields: [{
          name: "Reddit post in",
          value: "[r/deals](https://www.reddit.com/r/deals/)"
        }
      ],
        footer: {
          text: `Tachyon Monitors | ${time}`,
          icon_url: "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531"
        },
      }],
      username: "Deals",
      avatar_url: "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=531&height=531"
    },
  };
  rp(payload).catch(err => console.log(err));
};

const scrape = async () => {
  rp('https://www.reddit.com/r/deals/new/.json').then((response) => {
    const json = JSON.parse(response);
    const latestPost = json.data.children[0].data.url;
    if (lastPost !== latestPost) {
      lastPost = latestPost;
      sendWebhook(json.data.children[0].data.title, lastPost, new Date(json.data.children[0].data.created_utc * 1000).toUTCString());
    }
  }).catch(err => console.log(err));
};

const run = async () => {
  setInterval(async () => {
    await scrape();
  }, 10000);
};

run();
