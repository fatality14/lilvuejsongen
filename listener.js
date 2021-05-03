const http = require('http')

const server = http.createServer((req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        console.log(JSON.parse(data)); // 'Buy the milk'
        res.end();
    })
})

server.listen(8080);
console.log("listening on 127.0.0.1:8080");