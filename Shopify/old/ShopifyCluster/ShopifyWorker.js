var cluster = require('cluster');
var http = require('http');
var os = require('os');


if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    const ShopifyMonitor = require('../shopify-base');

    http.createServer(async function (req, res) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            if (req.url !== '/') {
                //res.end();
                return;
            }
            let body = JSON.parse(data); // 'Buy the milk'
            res.writeHead(200);
            let monitor = new ShopifyMonitor(body.website, body.concurrentRequests, body.proxies);
            monitor.onPollComplete = async function () {
                let text = "Done! " + monitor.products.length + " loaded! Time: " + (new Date().getTime() - monitor.startTime) + "ms";
                console.log(text);
                res.end(text);
            }
            monitor.poll();
            res.end();
        })
    }).listen(8000);
}