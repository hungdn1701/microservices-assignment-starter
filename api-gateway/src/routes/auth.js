/**
 * Authentication and session management routes
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const config = require('../config');
const { verifyToken } = require('../middleware/auth');
const redis = require('redis');

const router = express.Router();

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

/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Use refresh token to get a new access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 access_token:
 *                   type: string
 *                   description: JWT access token
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: integer
 *                   example: 3600
 *                   description: Expiration time in seconds
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/token/refresh', async (req, res) => {
  try {
    // Get refresh token from request body or cookie
    const refreshToken = req.body.refresh_token || req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtSecret, {
      algorithms: ['HS256']
    });

    // Check token type
    if (decoded.token_type !== 'refresh') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Check if token is blacklisted
    if (redisClient) {
      const blacklisted = await redisClient.get(`blacklist_token:${decoded.jti}`);
      if (blacklisted) {
        return res.status(401).json({
          status: 'error',
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        });
      }
    }

    // Create new access token
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = now + (60 * 60); // 1 hour
    const accessJti = uuidv4();

    const accessPayload = {
      iat: now,
      exp: accessTokenExpiry,
      jti: accessJti,
      token_type: 'access',
      user_id: decoded.user_id,
      role: decoded.role,
      email: decoded.email,
      first_name: decoded.first_name,
      last_name: decoded.last_name
    };

    const accessToken = jwt.sign(accessPayload, config.jwtSecret);

    // Store token metadata in Redis
    if (redisClient) {
      await redisClient.setEx(
        `token:jti:${accessJti}`,
        60 * 60, // 1 hour
        JSON.stringify({
          jti: accessJti,
          user_id: decoded.user_id,
          role: decoded.role,
          exp: accessTokenExpiry,
          created_at: now
        })
      );

      await redisClient.setEx(
        `token:user:${decoded.user_id}:${accessJti}`,
        60 * 60, // 1 hour
        JSON.stringify({
          jti: accessJti,
          user_id: decoded.user_id,
          role: decoded.role,
          exp: accessTokenExpiry,
          created_at: now
        })
      );
    }

    // Optionally rotate refresh token
    const rotateRefreshTokens = process.env.ROTATE_REFRESH_TOKENS === 'true';
    let newRefreshToken = refreshToken;
    let refreshTokenExpiry = decoded.exp;

    if (rotateRefreshTokens) {
      const refreshTokenExpiryDelta = 7 * 24 * 60 * 60; // 7 days
      refreshTokenExpiry = now + refreshTokenExpiryDelta;
      const refreshJti = uuidv4();

      const refreshPayload = {
        iat: now,
        exp: refreshTokenExpiry,
        jti: refreshJti,
        token_type: 'refresh',
        user_id: decoded.user_id,
        role: decoded.role,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name
      };

      newRefreshToken = jwt.sign(refreshPayload, config.jwtSecret);

      // Store token metadata in Redis
      if (redisClient) {
        await redisClient.setEx(
          `token:jti:${refreshJti}`,
          refreshTokenExpiryDelta,
          JSON.stringify({
            jti: refreshJti,
            user_id: decoded.user_id,
            role: decoded.role,
            exp: refreshTokenExpiry,
            created_at: now
          })
        );

        await redisClient.setEx(
          `token:user:${decoded.user_id}:${refreshJti}`,
          refreshTokenExpiryDelta,
          JSON.stringify({
            jti: refreshJti,
            user_id: decoded.user_id,
            role: decoded.role,
            exp: refreshTokenExpiry,
            created_at: now
          })
        );
      }
    }

    // Create response
    const response = {
      status: 'success',
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600 // 1 hour in seconds
    };

    // Include refresh token in response if rotated
    if (rotateRefreshTokens) {
      response.refresh_token = newRefreshToken;
    }

    // Set refresh token cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: (refreshTokenExpiry - now) * 1000
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Token refresh error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate tokens and terminate session
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               terminate_all_sessions:
 *                 type: boolean
 *                 description: Whether to terminate all user sessions
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Get access token from authorization header
    const authHeader = req.headers.authorization;
    let accessToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }

    // Get refresh token from request body or cookie
    const refreshToken = req.body.refresh_token || req.cookies.refresh_token;

    // Get session ID from cookie
    const sessionId = req.cookies[process.env.SESSION_COOKIE_NAME || 'healthcare_session'];

    // Blacklist access token
    if (accessToken && redisClient) {
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded && decoded.jti) {
          const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
          await redisClient.setEx(`blacklist_token:${decoded.jti}`, ttl, '1');
        }
      } catch (error) {
        console.error('Error blacklisting access token:', error.message);
      }
    }

    // Blacklist refresh token
    if (refreshToken && redisClient) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.jti) {
          const ttl = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
          await redisClient.setEx(`blacklist_token:${decoded.jti}`, ttl, '1');
        }
      } catch (error) {
        console.error('Error blacklisting refresh token:', error.message);
      }
    }

    // Terminate session
    if (sessionId && redisClient) {
      try {
        // Get session data to find user_id
        const sessionData = await redisClient.get(`session:${sessionId}`);
        if (sessionData) {
          const data = JSON.parse(sessionData);
          const userId = data.user_id;

          if (userId) {
            // Remove from user's sessions set
            await redisClient.sRem(`user_sessions:${userId}`, sessionId);
          }
        }

        // Delete session
        await redisClient.del(`session:${sessionId}`);
      } catch (error) {
        console.error('Error terminating session:', error.message);
      }
    }

    // Terminate all sessions if requested
    const terminateAll = req.body.terminate_all_sessions === true;
    if (terminateAll && req.user && req.user.user_id && redisClient) {
      try {
        const userId = req.user.user_id;

        // Get all sessions for the user
        const sessionIds = await redisClient.sMembers(`user_sessions:${userId}`);

        // Delete each session
        for (const sid of sessionIds) {
          await redisClient.del(`session:${sid}`);
        }

        // Delete the set
        await redisClient.del(`user_sessions:${userId}`);

        // Blacklist all user tokens
        const tokenKeys = await redisClient.keys(`token:user:${userId}:*`);
        for (const key of tokenKeys) {
          try {
            const tokenData = await redisClient.get(key);
            if (tokenData) {
              const data = JSON.parse(tokenData);
              const jti = data.jti;

              if (jti) {
                const ttl = Math.max(0, data.exp - Math.floor(Date.now() / 1000));
                await redisClient.setEx(`blacklist_token:${jti}`, ttl, '1');
              }
            }
          } catch (error) {
            console.error('Error processing token:', error.message);
          }
        }
      } catch (error) {
        console.error('Error terminating all sessions:', error.message);
      }
    }

    // Clear cookies
    res.clearCookie(process.env.SESSION_COOKIE_NAME || 'healthcare_session');
    res.clearCookie('refresh_token');

    return res.status(200).json({
      status: 'success',
      message: 'Successfully logged out'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get user sessions
 *     description: Retrieve all active sessions for the current user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Service unavailable
 */
router.get('/sessions', verifyToken, async (req, res) => {
  try {
    if (!redisClient) {
      return res.status(503).json({
        status: 'error',
        message: 'Session management not available',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const userId = req.user.user_id;

    // Get all sessions for the user
    const sessionIds = await redisClient.sMembers(`user_sessions:${userId}`);
    const sessions = [];

    // Get data for each session
    for (const sessionId of sessionIds) {
      const sessionData = await redisClient.get(`session:${sessionId}`);

      if (sessionData) {
        const data = JSON.parse(sessionData);
        data.session_id = sessionId;

        // Remove sensitive information
        delete data.user_id;

        sessions.push(data);
      }
    }

    return res.status(200).json({
      status: 'success',
      sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/sessions/{sessionId}:
 *   delete:
 *     summary: Terminate a specific session
 *     description: End a specific user session by its ID
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the session to terminate
 *     responses:
 *       200:
 *         description: Session terminated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Session not found
 */
router.delete('/sessions/:sessionId', verifyToken, async (req, res) => {
  try {
    if (!redisClient) {
      return res.status(503).json({
        status: 'error',
        message: 'Session management not available',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const userId = req.user.user_id;
    const sessionId = req.params.sessionId;

    // Get session data
    const sessionData = await redisClient.get(`session:${sessionId}`);

    if (!sessionData) {
      return res.status(404).json({
        status: 'error',
        message: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Verify that the session belongs to the user
    const data = JSON.parse(sessionData);
    if (data.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Remove from user's sessions set
    await redisClient.sRem(`user_sessions:${userId}`, sessionId);

    // Delete session
    await redisClient.del(`session:${sessionId}`);

    return res.status(200).json({
      status: 'success',
      message: 'Session terminated'
    });
  } catch (error) {
    console.error('Terminate session error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
