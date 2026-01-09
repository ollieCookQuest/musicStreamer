const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// SSL certificate paths
const certPath = path.join(__dirname, 'certs', 'server.crt');
const keyPath = path.join(__dirname, 'certs', 'server.key');

// Check if certificates exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('❌ SSL certificates not found!');
  console.error('   Please run: chmod +x generate-certs.sh && ./generate-certs.sh');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname === '0.0.0.0' ? 'localhost' : hostname}:${port}`);
    console.log(`> Also available on https://${hostname === '0.0.0.0' ? require('os').networkInterfaces().eth0?.[0]?.address || 'your-ip' : hostname}:${port}`);
  });
});
