/**
 * Session management middleware for API Gateway
 */
const redis = require('redis');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const config = require('../config');

// Create Redis client
let redisClient;

// Initialize Redis client if Redis URL is configured
if (process.env.REDIS_URL) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        // Exponential backoff with max delay of 10 seconds
        return Math.min(retries * 50, 10000);
      }
    }
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  redisClient.connect().catch(console.error);
}

// Session cookie configuration
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'healthcare_session';
const SESSION_TTL = parseInt(process.env.SESSION_TTL || '86400', 10); // Default: 1 day
const SESSION_COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE === 'true';
const SESSION_COOKIE_HTTPONLY = process.env.SESSION_COOKIE_HTTPONLY !== 'false';
const SESSION_COOKIE_SAMESITE = process.env.SESSION_COOKIE_SAMESITE || 'Lax';
const MAX_SESSIONS_PER_USER = parseInt(process.env.MAX_SESSIONS_PER_USER || '5', 10);

/**
 * Middleware to manage user sessions
 */
const sessionMiddleware = async (req, res, next) => {
  // Skip session management for certain paths
  if (req.path.startsWith('/health') || req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
    return next();
  }

  try {
    // Get session ID from cookie
    const sessionId = req.cookies[SESSION_COOKIE_NAME];

    // If no session cookie, create a new session if user is authenticated
    if (!sessionId && req.user) {
      await createSession(req, res);
    }
    // If session cookie exists, validate and update session
    else if (sessionId) {
      await validateSession(req, res, sessionId);
    }

    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Session middleware error:', error.message);
    next();
  }
};

/**
 * Create a new session for an authenticated user
 */
async function createSession(req, res) {
  if (!redisClient || !req.user) {
    return;
  }

  try {
    // Generate session ID
    const sessionId = uuidv4();

    // Create session data
    const sessionData = {
      user_id: req.user.user_id || req.user.id,
      role: req.user.role,
      email: req.user.email,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent'] || ''
    };

    // Store session in Redis
    await redisClient.setEx(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(sessionData)
    );

    // Add to user's sessions set
    await redisClient.sAdd(
      `user_sessions:${sessionData.user_id}`,
      sessionId
    );

    // Enforce maximum sessions per user
    await enforceMaxSessions(sessionData.user_id);

    // Set session cookie
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_TTL * 1000,
      secure: SESSION_COOKIE_SECURE,
      httpOnly: SESSION_COOKIE_HTTPONLY,
      sameSite: SESSION_COOKIE_SAMESITE
    });

    // Store session data in request
    req.session = {
      id: sessionId,
      data: sessionData
    };
  } catch (error) {
    console.error('Error creating session:', error.message);
  }
}

/**
 * Validate and update an existing session
 */
async function validateSession(req, res, sessionId) {
  if (!redisClient) {
    return;
  }

  try {
    // Get session data from Redis
    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      // Invalid or expired session, clear cookie
      res.clearCookie(SESSION_COOKIE_NAME);
      return;
    }

    // Parse session data
    const data = JSON.parse(sessionData);

    // Update last activity
    data.last_activity = new Date().toISOString();
    data.ip_address = getClientIp(req);
    data.user_agent = req.headers['user-agent'] || '';

    // Store updated session in Redis
    await redisClient.setEx(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify(data)
    );

    // Store session data in request
    req.session = {
      id: sessionId,
      data
    };

    // Refresh session cookie
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_TTL * 1000,
      secure: SESSION_COOKIE_SECURE,
      httpOnly: SESSION_COOKIE_HTTPONLY,
      sameSite: SESSION_COOKIE_SAMESITE
    });
  } catch (error) {
    console.error('Error validating session:', error.message);
    // Clear invalid session cookie
    res.clearCookie(SESSION_COOKIE_NAME);
  }
}

/**
 * Enforce maximum number of sessions per user
 */
async function enforceMaxSessions(userId) {
  if (!redisClient) {
    return;
  }

  try {
    // Get all sessions for the user
    const sessionIds = await redisClient.sMembers(`user_sessions:${userId}`);

    // If under the limit, do nothing
    if (sessionIds.length <= MAX_SESSIONS_PER_USER) {
      return;
    }

    // Get session data for all sessions
    const sessions = [];
    for (const sessionId of sessionIds) {
      const sessionData = await redisClient.get(`session:${sessionId}`);
      if (sessionData) {
        const data = JSON.parse(sessionData);
        data.session_id = sessionId;

        // Parse last activity timestamp
        try {
          data.last_activity_timestamp = new Date(data.last_activity).getTime();
        } catch (error) {
          data.last_activity_timestamp = Date.now();
        }

        sessions.push(data);
      }
    }

    // Sort by last activity (oldest first)
    sessions.sort((a, b) => a.last_activity_timestamp - b.last_activity_timestamp);

    // Remove oldest sessions to get under the limit
    const sessionsToRemove = sessions.slice(0, sessions.length - MAX_SESSIONS_PER_USER);

    for (const session of sessionsToRemove) {
      const sessionId = session.session_id;
      if (sessionId) {
        // Delete session
        await redisClient.del(`session:${sessionId}`);
        await redisClient.sRem(`user_sessions:${userId}`, sessionId);
      }
    }
  } catch (error) {
    console.error('Error enforcing max sessions:', error.message);
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress;
}

/**
 * Middleware to handle token refresh
 */
const tokenRefreshMiddleware = (req, res, next) => {
  // Check if token is about to expire
  const tokenExpiringSoon = res.getHeader('X-Token-Expiring-Soon');

  if (tokenExpiringSoon) {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      // Add header to indicate refresh token is available
      res.setHeader('X-Refresh-Token-Available', 'true');
    }
  }

  next();
};

module.exports = {
  sessionMiddleware,
  tokenRefreshMiddleware
};
