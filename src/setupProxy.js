const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const proxyOptions = {
    target: 'http://localhost:4000',
    changeOrigin: true,
    secure: false, // Allow self-signed certificates in development
    logLevel: 'debug', // Enable logging for debugging
    // Increase header size limit for proxy
    agent: new (require('http').Agent)({
      maxHeaderSize: 16384
    }),
    // WebSocket support
    ws: true,
    // Handle errors
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      console.error('Request URL:', req.url);
      console.error('Target:', 'http://localhost:4000');
      
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          error: 'Proxy error', 
          message: err.message,
          details: 'Backend server at http://localhost:4000 may not be running'
        }));
      }
    },
    // Log proxy requests in development
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.url} -> http://localhost:4000${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[PROXY] ${req.method} ${req.url} <- ${proxyRes.statusCode}`);
    }
  };

  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware(proxyOptions)
  );

  // Proxy uploads to backend (user uploaded files)
  app.use(
    '/uploads',
    createProxyMiddleware({
      ...proxyOptions,
      // Don't log every upload request (can be noisy)
      onProxyReq: undefined,
      onProxyRes: undefined,
    })
  );

  // NOTE: /images is NOT proxied - it's served from public/images folder
  // Only /images/hero/* that are uploaded should go through /uploads/hero/
};
