'use strict';
// Zero-dependency static server. Works on AWS Elastic Beanstalk (Node.js platform).
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
    "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
};

function send(res, status, headers, body, method) {
  res.writeHead(status, Object.assign({}, SECURITY_HEADERS, headers));
  res.end(method === 'HEAD' ? undefined : body);
}

function sendNotFound(req, res) {
  const file = path.join(PUBLIC_DIR, '404.html');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not Found', req.method);
    send(res, 404, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' }, data, req.method);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' }, 'Method Not Allowed', req.method);
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    return send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request', req.method);
  }
  if (pathname.indexOf('\0') !== -1) {
    return send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request', req.method);
  }

  // Health check endpoint for load balancer / EB
  if (pathname === '/health') {
    return send(res, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, 'OK', req.method);
  }

  let filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (filePath !== PUBLIC_DIR && filePath.indexOf(PUBLIC_DIR + path.sep) !== 0) {
    return send(res, 403, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Forbidden', req.method);
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return sendNotFound(req, res);

      const ext = path.extname(filePath).toLowerCase();
      const headers = {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      };

      const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
      if (acceptsGzip && COMPRESSIBLE.has(ext)) {
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        return send(res, 200, headers, zlib.gzipSync(data), req.method);
      }
      send(res, 200, headers, data, req.method);
    });
  });
});

server.listen(PORT, () => {
  console.log('Portfolio running on port ' + PORT);
});
