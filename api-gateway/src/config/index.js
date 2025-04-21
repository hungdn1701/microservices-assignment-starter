require('dotenv').config();

const COMMON_JWT_SECRET = 'django-insecure-key'; 

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || COMMON_JWT_SECRET, 
  services: {
    user: process.env.USER_SERVICE_URL || 'http://localhost:8000',
    medicalRecord: process.env.MEDICAL_RECORD_SERVICE_URL || 'http://localhost:8001',
    appointment: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8002',
    billing: process.env.BILLING_SERVICE_URL || 'http://localhost:8003',
    pharmacy: process.env.PHARMACY_SERVICE_URL || 'http://localhost:8004',
    lab: process.env.LAB_SERVICE_URL || 'http://localhost:8005',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006'
  }
};
