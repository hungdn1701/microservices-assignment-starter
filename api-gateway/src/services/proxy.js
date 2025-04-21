const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

/**
 * Create proxy middleware for a service
 * @param {string} serviceName - Name of the service
 * @param {string} serviceUrl - URL of the service
 * @param {Object} options - Additional options for the proxy
 * @returns {Function} Proxy middleware
 */
const createServiceProxy = (serviceName, serviceUrl, options = {}) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: options.pathRewrite || null,
    // Tăng thời gian timeout
    timeout: 60000,
    proxyTimeout: 60000,
    // Quan trọng: Đảm bảo token và các headers được chuyển tiếp
    onProxyReq: (proxyReq, req, res) => {
      // Log thông tin request
      console.log(`[${serviceName.toUpperCase()}] ${req.method} ${req.originalUrl}`);
      console.log(`[${serviceName.toUpperCase()}] Target URL: ${serviceUrl}${req.url}`);
      
      // QUAN TRỌNG: Luôn chuyển tiếp Authorization header nguyên vẹn
      if (req.headers.authorization) {
        console.log(`[${serviceName.toUpperCase()}] Forwarding Authorization header`);
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }

      // Xóa headers không cần thiết để tránh xung đột
      proxyReq.removeHeader('X-User-ID');
      proxyReq.removeHeader('X-User-Role');
      proxyReq.removeHeader('X-User-Email');
      proxyReq.removeHeader('X-User-First-Name');
      proxyReq.removeHeader('X-User-Last-Name');

      // Thêm thông tin người dùng từ token vào header
      if (req.user) {
        if (req.user.user_id || req.user.id) {
          proxyReq.setHeader('X-User-ID', (req.user.user_id || req.user.id).toString());
          console.log(`[${serviceName.toUpperCase()}] Setting X-User-ID: ${req.user.user_id || req.user.id}`);
        }

        if (req.user.role) {
          proxyReq.setHeader('X-User-Role', req.user.role);
          console.log(`[${serviceName.toUpperCase()}] Setting X-User-Role: ${req.user.role}`);
        }

        if (req.user.email) {
          proxyReq.setHeader('X-User-Email', req.user.email);
        }

        if (req.user.first_name) {
          proxyReq.setHeader('X-User-First-Name', req.user.first_name);
        }

        if (req.user.last_name) {
          proxyReq.setHeader('X-User-Last-Name', req.user.last_name);
        }

        // Debug: Log thông tin người dùng
        console.log(`[${serviceName.toUpperCase()}] User info:`, JSON.stringify(req.user));
      } else {
        console.log(`[${serviceName.toUpperCase()}] No user info in request`);
      }

      // Xử lý request body nếu có
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log response status
      console.log(`[${serviceName.toUpperCase()}] Response Status: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      // Xử lý lỗi proxy
      console.error(`[${serviceName.toUpperCase()}] Proxy Error:`, err);
      res.status(500).json({
        status: 'error',
        message: `Service ${serviceName} is unavailable: ${err.message}`,
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  });
};

// Create proxies for all services
const userServiceProxy = createServiceProxy('users', config.services.user);

const authServiceProxy = createProxyMiddleware({
  target: config.services.user,
  changeOrigin: true,
  // Don't rewrite path for auth service
  pathRewrite: null,
  // Increase timeout
  timeout: 60000,
  proxyTimeout: 60000,
  // Log everything
  logLevel: 'debug',
  // Handle request body
  onProxyReq: (proxyReq, req, res) => {
    // Log the request
    console.log(`[AUTH] ${req.method} ${req.originalUrl}`);
    // Log the target URL
    console.log(`[AUTH] Target URL: ${config.services.user}${req.url}`);

    // Handle request body
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // Write body data to the proxy request
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    // Handle proxy error
    console.error(`[AUTH] Proxy Error:`, err);
    res.status(500).json({
      status: 'error',
      message: `Auth service is unavailable`,
      error: err.message
    });
  }
});

const appointmentServiceProxy = createServiceProxy('appointments', config.services.appointment);
const medicalRecordServiceProxy = createServiceProxy('medical-records', config.services.medicalRecord);
const billingServiceProxy = createServiceProxy('billing', config.services.billing, {
  pathRewrite: {
    '^/api/billing': '/api'
  }
});
const pharmacyServiceProxy = createServiceProxy('pharmacy', config.services.pharmacy);
const labServiceProxy = createServiceProxy('lab', config.services.lab, {
  pathRewrite: {
    '^/api/laboratory': '/api'
  }
});
const notificationServiceProxy = createServiceProxy('notifications', config.services.notification, {
  pathRewrite: {
    '^/api/notifications': '/api'
  }
});

module.exports = {
  userServiceProxy,
  authServiceProxy,
  appointmentServiceProxy,
  medicalRecordServiceProxy,
  billingServiceProxy,
  pharmacyServiceProxy,
  labServiceProxy,
  notificationServiceProxy
};
