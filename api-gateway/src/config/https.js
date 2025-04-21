/**
 * HTTPS configuration for API Gateway
 */
const fs = require('fs');
const path = require('path');

// Default paths for SSL certificates
const defaultKeyPath = path.join(__dirname, '../../ssl/private.key');
const defaultCertPath = path.join(__dirname, '../../ssl/certificate.crt');

// Check if SSL certificates exist
const sslEnabled = () => {
  try {
    return (
      process.env.HTTPS_ENABLED === 'true' &&
      fs.existsSync(process.env.SSL_KEY_PATH || defaultKeyPath) &&
      fs.existsSync(process.env.SSL_CERT_PATH || defaultCertPath)
    );
  } catch (error) {
    console.warn('SSL certificates not found, HTTPS will not be enabled');
    return false;
  }
};

// Get SSL options
const getSSLOptions = () => {
  if (!sslEnabled()) {
    return null;
  }

  try {
    return {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || defaultKeyPath),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH || defaultCertPath)
    };
  } catch (error) {
    console.error('Error loading SSL certificates:', error.message);
    return null;
  }
};

module.exports = {
  sslEnabled,
  getSSLOptions
};
