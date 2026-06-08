const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 4173;
const base = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const cleanPath = path.normalize(urlPath).replace(/^\\+/, '').replace(/^\/+/, '');
  const filePath = path.join(base, cleanPath);

  if (!filePath.startsWith(base)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`SDEN3 Trainer running at http://localhost:${port}`);
});
