var cluster = require('cluster');
var http = require('http');
var os = require('os');
var fetch = require('node-fetch')
const HTTPSProxyAgent = require('https-proxy-agent')

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Request Cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        if (--numWorkers === 0)
            console.log("All workers online!");
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    http.createServer(async function (req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', async () => {
            if (req.url !== '/') {
                //res.end();
                return;
            }
            let body = JSON.parse(data); // 'Buy the milk'
            res.writeHead(200);
            let options = body.options ? body.options : {};
            let proxyAgent = body.proxy ? new HTTPSProxyAgent(body.proxy) : null;
            options.agent = proxyAgent;
            let request = await const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(body.url, options);
            let text = await request.text();
            res.end(text);
        })
    }).listen(8000);
}