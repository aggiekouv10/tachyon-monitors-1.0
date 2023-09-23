const helper = require('./helper');
const got = require('got')
const HTTPSProxyAgent = require('https-proxy-agent')
const { default: axios } = require('axios');
helper.init()
let proxy = helper.getRandomProxy();
let useragent = ''
let cookie = ''
test()
async function test() {
  let response = await got('https://slapio.com/px/gen', {
    method: "POST",
    headers: {
      'authkey': 'aggie-header-key-thxbb'
    },
    form: {
      proxy: 'http://pcxkrtvq-dest:jvsjwc2a1kyk@144.168.137.103:8645',
      key: 'thx-4-monitor'
    },
    
    retry: 0
  })
  let body2 = await response.body
  body2 = await JSON.parse(body2)
  useragent = body2.result.useragent
  cookie = '_px3=' + body2.result._px3
console.log(cookie)
console.log(useragent)

}