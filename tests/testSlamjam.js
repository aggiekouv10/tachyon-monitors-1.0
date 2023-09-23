const fetch = require('node-fetch')

const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch("https://www.slamjam.com/on/demandware.store/Sites-slamjam-Site/en_IT/Product-Variation?dwvar_J234713_color=F21-001&dwvar_J234713_size=WFOX02-8&pid=J234713&quantity=1", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    'referer': 'https://www.slamjam.com/en_DK/man/footwear/sneakers/low/asics/gel-1130-sneakers/J215177.html',
    "cookie": `dwac_496bb2c3f69aa0ccb6fd3f42c4=lVXOkGkqufftYoDtIJ579PNddpd_hHE6PAM=|dw-only|||EUR|false|Europe/Rome|true; cqcid=ab3cukTRy4vF5Po487FJXDLV1I; cquid=||; sid=lVXOkGkqufftYoDtIJ579PNddpd_hHE6PAM; dwanonymous_45aa0f5b66c2339d1f2dbcca0394a60d=ab3cukTRy4vF5Po487FJXDLV1I; __cq_dnt=0; dw_dnt=0; dwsid=kxpuXnUKgFne2AioXg0v6PUS1lljpEiUD7mokq6FfqbVeXRfe54aqGtnzBxwht8uSl0cnl02vSz6BnuplH8Grw==; __cf_bm=NUYVi8kSBAmDPmiupA4RfPtvcg0M2C6jN10fLWO7.4Q-1634586870-0-AUDWQSLSvkJJcF6Iv2ZDA/3IUpNVe9kVm1CulN6XD3c6M23cGifMKXDOlv5m3cdsRx0yF1zLYl+lbEsfqDkzqII=; _ga=GA1.2.1258282686.1634586873; _gid=GA1.2.1190792847.1634586873; __cq_uuid=ab3cukTRy4vF5Po487FJXDLV1I; consentTrackingCookie=1; __cq_bc={"bdhr-slamjam":[{"id":"GZ0473","type":"vgroup","alt_id":"J234713"},{"id":"KKAW21FT01-67","type":"vgroup","alt_id":"J219779"},{"id":"L41672100","type":"vgroup","alt_id":"J219794"}]}; __cq_seg=0~-0.11!1~-0.33!2~-0.25!3~0.47!4~-0.55!5~0.22!6~-0.05!7~-0.24!8~-0.37!9~0.22!f0~15~9; datadome=IJAnAo.KIogD3z~zYASpXXrd_esPkNhPP9B9EUBuaSzxiFgOV2IKpzRvs4zm6A.0Y2x~T4qQ1tJcrCJlGOdVt83hk6SFPV~hO.O3B9j_UX`
  },
  "referrer": "https://www.slamjam.com/en_IT/man/footwear/sneakers/low/yeezy/yeezy-boost-380-sneakers/J234713.html",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors"
}).then(async response => {
        clearTimeout(timeoutId)
    let text = await response.text();

    console.log(text);
    console.log(response.headers);
    console.log(response.status);
})