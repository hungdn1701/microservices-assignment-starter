const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// const cookieParser = require('cookie-parser');
const http = require('http');
const https = require('https');
const config = require('./config');
const { sslEnabled, getSSLOptions } = require('./config/https');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { sessionMiddleware, tokenRefreshMiddleware } = require('./middleware/session');
const { swaggerDocs } = require('./config/swagger'); // Import Swagger configuration

// Initialize Express app
const app = express();

// Apply security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// Configure CORS with secure options
const corsOptions = {
  origin: [
    'http://localhost',
    'http://localhost:80',
    'http://localhost:3000',
    'https://localhost',
    'https://localhost:443',
    'https://localhost:3000',
    // Add your production domains here
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Token-Expiring-Soon'], // Expose custom headers
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours in seconds - how long the results of a preflight request can be cached
};
app.use(cors(corsOptions));

// Apply rate limiting with different limits for different endpoints
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // The counting of the requests
  keyGenerator: (req) => {
    // Use IP address as default key
    return req.ip;
  }
});

// More strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 login attempts per hour
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
// app.use('/api/auth/login', authLimiter); // Apply to login endpoint
// app.use('/api/auth/register', authLimiter); // Apply to registration endpoint
// app.use(defaultLimiter); // Apply default limiter to all other routes

// Logging middleware
app.use(morgan('combined'));

// Add security headers middleware
app.use((req, res, next) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    // Check if request was forwarded from HTTPS
    if (req.headers['x-forwarded-proto'] !== 'https') {
      // Redirect to HTTPS
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
  }

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
// app.use(cookieParser());

// Apply session and token refresh middleware
app.use(sessionMiddleware);
app.use(tokenRefreshMiddleware);

// Apply authentication routes
app.use('/api/auth', authRoutes);

// Apply main routes
app.use(routes);

// Setup Swagger documentation
swaggerDocs(app);

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server
const httpServer = http.createServer(app);

// Get port from config
const PORT = config.port;

// Start HTTP server
httpServer.listen(PORT, () => {
  console.log(`API Gateway HTTP server running on port ${PORT}`);
});

// Start HTTPS server if SSL is enabled
if (sslEnabled()) {
  const httpsOptions = getSSLOptions();
  if (httpsOptions) {
    const HTTPS_PORT = process.env.HTTPS_PORT || 4443;
    const httpsServer = https.createServer(httpsOptions, app);

    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`API Gateway HTTPS server running on port ${HTTPS_PORT}`);
    });
  }
}

module.exports = app;
