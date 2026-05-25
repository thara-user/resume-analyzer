const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function(app) {
  app.use("/analyze", createProxyMiddleware({ target: "http://127.0.0.1:8000", changeOrigin: true }));
  app.use("/domains", createProxyMiddleware({ target: "http://127.0.0.1:8000", changeOrigin: true }));
  app.use("/results", createProxyMiddleware({ target: "http://127.0.0.1:8000", changeOrigin: true }));
};
