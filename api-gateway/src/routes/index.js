const express = require('express');
const config = require('../config');
const {
  userServiceProxy,
  authServiceProxy,
  appointmentServiceProxy,
  medicalRecordServiceProxy,
  billingServiceProxy,
  pharmacyServiceProxy,
  labServiceProxy,
  notificationServiceProxy
} = require('../services/proxy');

const router = express.Router();

// ========== AUTH ROUTES (PUBLIC) ==========
// Direct pass-through to auth service for login and register
router.use('/api/auth/login', authServiceProxy);
router.use('/api/auth/register', authServiceProxy);

// Use local auth routes for token refresh, logout, and sessions
router.use('/api/auth/token/refresh', require('./auth'));
router.use('/api/auth/logout', require('./auth'));
router.use('/api/auth/sessions', require('./auth'));

// Token validation endpoint for microservices
router.get('/api/auth/validate-token', (req, res) => {
  res.status(200).json({
    id: req.user ? req.user.id : null,
    email: req.user ? req.user.email : null,
    role: req.user ? req.user.role : null,
    first_name: req.user ? req.user.first_name : null,
    last_name: req.user ? req.user.last_name : null
  });
});

// ========== USER SERVICE ROUTES ==========
// Special route for /api/users/me/
router.get('/api/users/me/', (req, res) => {
  // Forward request directly to User Service
  const userServiceUrl = config.services.user;
  const targetUrl = `${userServiceUrl}/api/users/me/`;
  console.log('Forwarding to:', targetUrl);

  // Use axios to forward the request
  const axios = require('axios');
  axios.get(targetUrl, {
    headers: {
      'Authorization': req.headers.authorization
    }
  })
  .then(response => {
    res.status(response.status).json(response.data);
  })
  .catch(error => {
    console.error('Error forwarding request:', error.message);
    res.status(error.response?.status || 500).json({
      message: error.message,
      details: error.response?.data
    });
  });
});

// User profile and management routes
router.use('/api/users', userServiceProxy);
router.use('/api/doctors', userServiceProxy);
router.use('/api/specialties', userServiceProxy);
router.use('/api/patient-profile', userServiceProxy);
router.use('/api/doctor-profile', userServiceProxy);
router.use('/api/nurse-profile', userServiceProxy);
router.use('/api/admin-profile', userServiceProxy);
router.use('/api/lab-technician-profile', userServiceProxy);
router.use('/api/pharmacist-profile', userServiceProxy);
router.use('/api/insurance-provider-profile', userServiceProxy);

// User data routes
router.use('/api/addresses', userServiceProxy);
router.use('/api/contact-info', userServiceProxy);
router.use('/api/documents', userServiceProxy);
router.use('/api/admin', userServiceProxy);
router.use('/api/insurance-information', userServiceProxy);
router.use('/api/preferences', userServiceProxy);
router.use('/api/activities', userServiceProxy);

// ========== APPOINTMENT SERVICE ROUTES ==========
// Test endpoint for debugging
router.get('/api/appointments/test', (req, res, next) => {
  console.log('[DEBUG] Forwarding to test endpoint');
  console.log('User from token:', req.user);

  // Forward directly to Appointment Service
  const axios = require('axios');
  const appointmentServiceUrl = config.services.appointment;

  // Add headers from token
  const headers = {
    'Authorization': req.headers.authorization,
    'X-User-ID': req.user ? (req.user.user_id || req.user.id) : '',
    'X-User-Role': req.user ? req.user.role : '',
    'X-User-Email': req.user ? req.user.email : ''
  };

  // Call the service directly
  axios.get(`${appointmentServiceUrl}/api/test/`, { headers })
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      console.error('Error calling test endpoint:', error.message);
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    });
});

// Direct access to patient-appointments endpoint
router.get('/api/direct/patient-appointments', (req, res) => {
  console.log('[DEBUG] Direct access to patient-appointments');
  console.log('User from token:', req.user);

  // Forward directly to Appointment Service
  const axios = require('axios');
  const appointmentServiceUrl = config.services.appointment;

  // Add headers from token
  const headers = {
    'Authorization': req.headers.authorization,
    'X-User-ID': req.user ? (req.user.user_id || req.user.id) : '',
    'X-User-Role': req.user ? req.user.role : '',
    'X-User-Email': req.user ? req.user.email : '',
    'X-User-First-Name': req.user ? req.user.first_name || '' : '',
    'X-User-Last-Name': req.user ? req.user.last_name || '' : ''
  };

  console.log('Sending request to:', `${appointmentServiceUrl}/api/appointments/patient-appointments/`);
  console.log('With headers:', headers);

  // Call the service directly
  axios.get(`${appointmentServiceUrl}/api/appointments/patient-appointments/`, { headers })
    .then(response => {
      console.log('Response received:', response.status);
      res.status(200).json(response.data);
    })
    .catch(error => {
      console.error('Error calling patient-appointments endpoint:', error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    });
});

// Main appointment routes
router.use('/api/appointments', appointmentServiceProxy);
router.use('/api/doctors/available', appointmentServiceProxy);
router.use('/api/departments', appointmentServiceProxy);
router.use('/api/doctor-availabilities', appointmentServiceProxy);
router.use('/api/time-slots', appointmentServiceProxy);
router.use('/api/appointment-reminders', appointmentServiceProxy);
router.use('/api/appointment-reasons', appointmentServiceProxy);
router.use('/api/patient-visits', appointmentServiceProxy);
router.use('/api/appointment-types', appointmentServiceProxy);
router.use('/api/locations', appointmentServiceProxy);
router.use('/api/priorities', appointmentServiceProxy);
router.use('/api/verify-insurance', appointmentServiceProxy);

// ========== MEDICAL RECORD SERVICE ROUTES ==========
router.use('/api/medical-records', medicalRecordServiceProxy);
router.use('/api/encounters', medicalRecordServiceProxy);
router.use('/api/diagnoses', medicalRecordServiceProxy);
router.use('/api/treatments', medicalRecordServiceProxy);
router.use('/api/allergies', medicalRecordServiceProxy);
router.use('/api/immunizations', medicalRecordServiceProxy);
router.use('/api/medical-histories', medicalRecordServiceProxy);
router.use('/api/medications', medicalRecordServiceProxy);
router.use('/api/vital-signs', medicalRecordServiceProxy);
router.use('/api/lab-tests', medicalRecordServiceProxy);
router.use('/api/lab-results', medicalRecordServiceProxy);

// Special route for creating encounters from appointments
router.post('/api/appointments/:appointment_id/create-encounter', (req, res, next) => {
  console.log('[MEDICAL_RECORD] Creating encounter from appointment');
  medicalRecordServiceProxy(req, res, next);
});

// ========== PHARMACY SERVICE ROUTES ==========
router.use('/api/prescriptions', pharmacyServiceProxy);
router.use('/api/medications', pharmacyServiceProxy);
router.use('/api/pharmacy', (req, res, next) => {
  // Add user role to headers
  if (req.user && req.user.role) {
    console.log(`[PHARMACY] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  // Add user info to headers
  console.log(`[PHARMACY] User info: ${JSON.stringify(req.user)}`);

  // Forward the request to the pharmacy service
  pharmacyServiceProxy(req, res, next);
});

// ========== BILLING SERVICE ROUTES ==========
// Main billing routes with user info headers
router.use('/api/invoices', (req, res, next) => {
  // Add user role to headers
  if (req.user && req.user.role) {
    console.log(`[BILLING] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
    console.log(`[BILLING] User info: ${JSON.stringify(req.user)}`);
  }

  // Forward the request to the billing service
  billingServiceProxy(req, res, next);
});

// Invoice related routes
router.use('/api/invoice-items', (req, res, next) => {
  // Add user role and info to headers
  if (req.user && req.user.role) {
    req.headers['X-User-Role'] = req.user.role;
  }

  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
  }

  billingServiceProxy(req, res, next);
});

// Payments routes
router.use('/api/payments', (req, res, next) => {
  // Add user role and info to headers
  if (req.user && req.user.role) {
    req.headers['X-User-Role'] = req.user.role;
  }

  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
  }

  billingServiceProxy(req, res, next);
});

// Insurance claims routes
router.use('/api/insurance-claims', (req, res, next) => {
  // Add user role and info to headers
  if (req.user && req.user.role) {
    console.log(`[BILLING] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
    console.log(`[BILLING] Insurance claim request from: ${JSON.stringify(req.user)}`);
  }

  console.log(`[BILLING] Insurance claim request URL: ${req.url}`);
  billingServiceProxy(req, res, next);
});

// Special routes for creating invoices from other services
router.use('/api/create-from-lab-test', (req, res, next) => {
  console.log('[BILLING] Creating invoice from lab test');
  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }
  billingServiceProxy(req, res, next);
});

router.use('/api/create-from-prescription', (req, res, next) => {
  console.log('[BILLING] Creating invoice from prescription');
  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }
  billingServiceProxy(req, res, next);
});

router.use('/api/create-from-medical-record', (req, res, next) => {
  console.log('[BILLING] Creating invoice from medical record');
  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }
  billingServiceProxy(req, res, next);
});

router.use('/api/create-from-appointment', (req, res, next) => {
  console.log('[BILLING] Creating invoice from appointment');
  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }
  billingServiceProxy(req, res, next);
});

// ========== LABORATORY SERVICE ROUTES ==========
router.use('/api/laboratory', (req, res, next) => {
  // Add user role to headers
  if (req.user && req.user.role) {
    console.log(`[LABORATORY] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  // Add user info to headers
  console.log(`[LABORATORY] User info: ${JSON.stringify(req.user)}`);

  // Forward the request to the laboratory service
  labServiceProxy(req, res, next);
});

router.use('/api/test-types', labServiceProxy);
router.use('/api/test-results', labServiceProxy);
router.use('/api/sample-collections', labServiceProxy);

// ========== NOTIFICATION SERVICE ROUTES ==========
router.use('/api/notifications', (req, res, next) => {
  // Add user role to headers
  if (req.user && req.user.role) {
    console.log(`[NOTIFICATION] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
    console.log(`[NOTIFICATION] User info: ${JSON.stringify(req.user)}`);
  }

  // Forward the request to the notification service
  notificationServiceProxy(req, res, next);
});

// In-app notifications route
router.use('/api/in-app-notifications', (req, res, next) => {
  console.log('[NOTIFICATION] In-app notification request');

  // Add user role to headers
  if (req.user && req.user.role) {
    console.log(`[NOTIFICATION] Setting role ${req.user.role} for user_id ${req.user.user_id}`);
    req.headers['X-User-Role'] = req.user.role;
  }

  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Email'] = req.user.email;
    req.headers['X-User-First-Name'] = req.user.first_name || '';
    req.headers['X-User-Last-Name'] = req.user.last_name || '';
    console.log(`[NOTIFICATION] In-app notification request from: ${JSON.stringify(req.user)}`);
  }

  // Create a direct request to the notification service
  const axios = require('axios');
  const notificationServiceUrl = config.services.notification;

  // Add headers from token
  const headers = {
    'Authorization': req.headers.authorization,
    'X-User-ID': req.user ? (req.user.user_id || req.user.id) : '',
    'X-User-Role': req.user ? req.user.role : '',
    'X-User-Email': req.user ? req.user.email : ''
  };

  console.log(`[NOTIFICATION] Sending request to: ${notificationServiceUrl}/api/in-app/`);

  // Call the service directly
  axios.get(`${notificationServiceUrl}/api/in-app/`, { headers })
    .then(response => {
      console.log('[NOTIFICATION] Response received');
      res.status(200).json(response.data);
    })
    .catch(error => {
      console.error('[NOTIFICATION] Error calling in-app notifications:', error.message);
      if (error.response) {
        console.error('[NOTIFICATION] Error response data:', error.response.data);
        console.error('[NOTIFICATION] Error response status:', error.response.status);
      }
      res.status(error.response?.status || 500).json({
        error: error.message,
        details: error.response?.data
      });
    });
});

// WebSocket notifications route
router.use('/ws/notifications', (req, res, next) => {
  console.log('[NOTIFICATION] WebSocket connection request');

  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }

  // Forward the request to the notification service
  notificationServiceProxy(req, res, next);
});

// Special route for service-to-service event notifications
router.post('/api/notifications/events', (req, res, next) => {
  console.log('[NOTIFICATION] Received event notification');

  // Add service info to headers
  req.headers['X-Service-Name'] = req.body.service || 'UNKNOWN';

  // Add user info to headers
  if (req.user) {
    req.headers['X-User-ID'] = req.user.user_id;
    req.headers['X-User-Role'] = req.user.role;
    req.headers['X-User-Email'] = req.user.email;
  }

  // Forward the request to the notification service events endpoint
  req.url = '/api/events';
  console.log(`[NOTIFICATIONS] Target URL: http://notification-service:8006${req.url}`);
  console.log(`[NOTIFICATIONS] Headers: ${JSON.stringify(req.headers)}`);
  notificationServiceProxy(req, res, next);
});

// ========== HEALTH CHECK ENDPOINTS ==========
// Main API Gateway health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is running'
  });
});

router.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway'
  });
});

// Service-specific health checks - Simplified paths
router.use('/api/laboratory/health', (req, res, next) => {
  req.url = '/health/';
  labServiceProxy(req, res, next);
});

router.use('/api/pharmacy/health', (req, res, next) => {
  req.url = '/health/';
  pharmacyServiceProxy(req, res, next);
});

// Direct responses for Medical Record Service health checks
router.get('/api/medical-records/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'medical-record-service'
  });
});

router.get('/api/medical-records/health/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'medical-record-service'
  });
});

router.use('/api/billing/health', (req, res, next) => {
  req.url = '/health/';
  billingServiceProxy(req, res, next);
});

router.use('/api/users/health', (req, res, next) => {
  req.url = '/health/';
  userServiceProxy(req, res, next);
});

router.use('/api/appointments/health', (req, res, next) => {
  req.url = '/health/';
  appointmentServiceProxy(req, res, next);
});

router.use('/api/notifications/health', (req, res, next) => {
  req.url = '/health/';
  notificationServiceProxy(req, res, next);
});

// Backward compatibility - Legacy paths
router.use('/api/laboratory/api/health', labServiceProxy);
router.use('/api/pharmacy/api/health', pharmacyServiceProxy);
router.use('/api/medical-records/api/health', medicalRecordServiceProxy);
router.use('/api/billing/api/health', billingServiceProxy);
router.use('/api/users/api/health', userServiceProxy);
router.use('/api/appointments/api/health', appointmentServiceProxy);
router.use('/api/notifications/api/health', notificationServiceProxy);

module.exports = router;