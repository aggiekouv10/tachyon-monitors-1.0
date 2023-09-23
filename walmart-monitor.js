  
const nodeRSA = require('node-rsa');
const fetch = require('node-fetch');

const publicKey = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCbM2br48JS2JJy8Ajy0gy33Gu5RNAFgysUp4Mj9FqzXWg7AwdGaXc0vIAGG3vmyrP906qJpiEV1aW9GhsEGNQ9Mjmngfnu1VAKZjskVToqG1ktiXZJKSlVUfGTYj+r1lKDgd2iKt4azIzoeElk1gnLovn8zEaiCT7prHlzWWb7JgW3qp1e12e5WvSC5xX9P5iKOs6WM3qTSAX3e8qGeA9wtlHdQuDjSjWA0WlYQIFKgpoCBNZeldNxel79QgR7QKG6Oo/H4aImhDW9vXH00mGVy9QX11ngovVYPhCQWzsAo+v+Y2lAJUtFdjr2t9/mJisKxpYvpMeqVo2ZSydwBmb5'
const consumerId = 'a4c258a6-8449-443f-ad9a-47f9933f6021'
const privateKey = "MIIEpAIBAAKCAQEAmzNm6+PCUtiScvAI8tIMt9xruUTQBYMrFKeDI/Ras11oOwMH\
Rml3NLyABht75sqz/dOqiaYhFdWlvRobBBjUPTI5p4H57tVQCmY7JFU6KhtZLYl2\
SSkpVVHxk2I/q9ZSg4HdoireGsyM6HhJZNYJy6L5/MxGogk+6ax5c1lm+yYFt6qd\
XtdnuVr0gucV/T+YijrOljN6k0gF93vKhngPcLZR3ULg40o1gNFpWECBSoKaAgTW\
XpXTcXpe/UIEe0ChujqPx+GiJoQ1vb1x9NJhlcvUF9dZ4KL1WD4QkFs7AKPr/mNp\
QCVLRXY69rff5iYrCsaWL6THqlaNmUsncAZm+QIDAQABAoIBAQCXocrmoSnUg1/i\
B/7WLr7aS/K7mi2blSHcFiWcVTrgj1wse7L56kTbM2fpj6SoQldEoS63OaaNjKVX\
ck/+2rtR5uZJcEXeQG7pGiSiRNqFFR81zF3S8PI/N8ZMdus6WjVX4uPFcxh5Gmx5\
HDyo1i3P1TVk9bf0zA+5ghdOyYRBzsKiX3HTRFLGn0EGEDpXwqvq43qJ49DL/YVe\
t0eKYS9E7F3MNqAQDHS4tuc0QsidFQHn50uLOIKtyAZ9lcc5X8Lw/3HLWM1+8hzD\
wX9N5C0YlUen3yGuMpY89jheLp1f5NRqE1JxHK5Rcb0MWNmMum5B5Azzg+0+NOoi\
Bi7bb98BAoGBAO3gWf9K7jrx8N15qJYb6lHIUvyTgrmu8VidbKOaFSr6Xmq/KTts\
w2F0YR15/N03cyeJBKYP/VWcTEJsyWXiy/XoFjjddLdCz8eMeMdowAMeWSDC7/DC\
B8xY2148u5QdIe/+UCCFGCFVxRSdAayYxMQjChUw0ZfFW9Cor/hA452pAoGBAKcG\
gitiez4F6bpCIelLerM8gambpC490LwILtcVCU3HzXoP+BfMd+NjgudqJpQ8Arqq\
y+1qkwfOkH0GUaBl6FHYEM0vZAfD00f4jL18Ft3wlvqCerxAU0GQWxIi2b8XYO04\
N9MtEMOwDr50bXeHKVYYhzrABNUxQ1e4NRWrazDRAoGAcC584uu4e+37tMcaHWie\
0eDSWjFK1jzNrwfW4zTYRMN8YYUzccXyQnR7FEaiXMU4tm1k1tf1ljk2saDSPg1+\
OMMyL7EoyQBmMuppT0l0PERErjGgrH8k5FcHZWLo54nxplfd++gooBft8LG2x2no\
acNIjwPN5HB7w2S6UC5x6bkCgYBafKMuv+bGvktWthdLHbI2wlP4wDJdPu4DwGcn\
7OSid9lxBI/CzOoyjanQl2iZLD3KRVe/otpPA3Cx2yeDv1HybR0FHGST9FpVhmkx\
CrYUvQ/+XYwCytKQFZXRKIJRDWhce/V6edK4QXxrYAYiGF6jnxw8DuVPXqX+MvTH\
bZvf0QKBgQCoDO0nfdW+TWGu4C9TgcX9lX+1G1Uszz0d6zmiRhh8dqconUoANpuV\
pgvIgsD2l2KOGiSrRknjdoutMPJLmdsJvi6ycO3/oOsAenfe/1/uoukpw9HGxdQ+\
NfNFwzDKLFEki8LLhbVesYeWNcAwmRkqpPqFN+GSuHt+jyYI2XoBgw=="

const keyVer = '2'

const generateWalmartHeaders = () => {
    const hashList = {
        "WM_CONSUMER.ID": consumerId,
        "WM_CONSUMER.INTIMESTAMP": Date.now().toString(),
        "WM_SEC.KEY_VERSION": keyVer,
    };

    const sortedHashString = `${hashList["WM_CONSUMER.ID"]}\n${hashList["WM_CONSUMER.INTIMESTAMP"]}\n${hashList["WM_SEC.KEY_VERSION"]}\n`;
    const signer = new nodeRSA(privateKey, "pkcs1");
    const signature = signer.sign(sortedHashString);
    const signature_enc = signature.toString("base64");

    return {
        "WM_SEC.AUTH_SIGNATURE": signature_enc,
        "WM_CONSUMER.INTIMESTAMP": hashList["WM_CONSUMER.INTIMESTAMP"],
        "WM_CONSUMER.ID": hashList["WM_CONSUMER.ID"],
        "WM_SEC.KEY_VERSION": hashList["WM_SEC.KEY_VERSION"],
        //"User-Agent": 'APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)',
        "X-Forwarded-For": '8.8.8.7'
    };
}


const getWalmartProducts = async () => {
    let pluses = ''
    let random = Math.floor(Math.random() * 10) + 1
    for (let i = 0; i < random; i++) {
        pluses += '+'
    }
    const pid = `443574645${pluses}` //change me
    const api = `https://developer.api.walmart.com/api-proxy/service/affil/product/v2/items?ids=${pid}`
    const options = {
        method: 'GET',
        headers: generateWalmartHeaders()
    }

    const response = await fetch(api, options)
    console.log(await response.json())

}


getWalmartProducts()