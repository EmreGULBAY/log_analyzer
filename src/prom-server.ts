import { createServer, IncomingMessage, ServerResponse } from 'http';

const PORT = 4000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.url === '/get-metrics' && req.method === 'GET') {

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end("metrics server is running");
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Metrics server is running on port ${PORT}`);
});