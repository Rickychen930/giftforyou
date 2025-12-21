const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      // Increase header size limit for proxy
      agent: new (require('http').Agent)({
        maxHeaderSize: 16384
      }),
      onProxyReq: (proxyReq) => {
        // Log for debugging
        console.log('Proxying API request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );

  // Proxy uploads to backend (user uploaded files)
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
      agent: new (require('http').Agent)({
        maxHeaderSize: 16384
      })
    })
  );

  // NOTE: /images is NOT proxied - it's served from public/images folder
  // Only /images/hero/* that are uploaded should go through /uploads/hero/
};
