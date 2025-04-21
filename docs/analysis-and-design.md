# 📊 Microservices System - Analysis and Design

This document outlines the **analysis** and **design** process for our healthcare microservices-based system.

---

## 1. 🎯 Problem Statement

Our healthcare management system aims to create a comprehensive platform connecting all healthcare stakeholders, streamlining healthcare processes, and improving service delivery.

- **Users**: 
  - Patients: End-users seeking healthcare services, booking appointments, and accessing their medical records
  - Doctors: Healthcare professionals providing diagnoses and treatment plans
  - Nurses: Supporting medical staff assisting in patient care and records management
  - Administrators: System and organization managers overseeing all operations
  - Pharmacists: Medication dispensing professionals managing prescriptions
  - Insurance Providers: Entities handling coverage verification and claims processing
  - Laboratory Technicians: Staff conducting diagnostic tests and uploading results

- **Main Goals**:
  - Provide secure, role-based access to healthcare information
  - Streamline appointment scheduling and management
  - Enable effective management of electronic health records
  - Facilitate medication prescription and dispensing processes
  - Support diagnostic testing workflows from ordering to results
  - Simplify billing and insurance claim processing
  - Ensure timely communication through notifications

- **Data Processed**:
  - Patient demographic and contact information
  - Medical records and treatment history
  - Appointment schedules and doctor availability
  - Prescriptions and medication inventory
  - Laboratory test orders and results
  - Medical billing and insurance claims
  - User activity logs and authentication data

---

## 2. 🧩 Identified Microservices

| Service Name | Responsibility | Tech Stack |
|--------------|----------------|------------|
| User Service | Manages user accounts, authentication, profiles for all user types | Django, PostgreSQL, JWT |
| Medical Record Service | Manages patient health records, medical history | Django, PostgreSQL |
| Appointment Service | Handles scheduling, doctor availability, visit management | Django, PostgreSQL |
| Pharmacy Service | Processes prescriptions, medication inventory | Django, PostgreSQL |
| Laboratory Service | Manages lab tests, sample processing, results | Django, PostgreSQL |
| Billing Service | Processes invoices, payments, insurance claims | Django, PostgreSQL |
| Notification Service | Manages system notifications via email/SMS | Django, PostgreSQL, Celery, Redis |
| API Gateway | Routes requests, handles authentication, authorization | Node.js, Express |
| Common Auth | Shared authentication library for all services | Python library |

---

## 3. 🔄 Service Communication

The system uses a hybrid communication architecture:

- **API Gateway Pattern**:
  - All client requests pass through the centralized API Gateway
  - Gateway authenticates users, validates JWT tokens, and adds user context headers (X-User-ID, X-User-Role, etc.)
  - Gateway routes requests to appropriate services via HTTP/REST

- **Service-to-Service Communication**:
  - Direct synchronous REST calls for required data
  - Authentication context passed via HTTP headers
  - User and permission context propagation across service boundaries

- **Event-Driven Communication**:
  - Celery and Redis used for asynchronous notifications
  - Message-based communication for events like appointment reminders, test result notifications

- **Security**:
  - JWT-based authentication at the API Gateway level
  - Token blacklisting and management via Redis
  - Context propagation ensures consistent access control across services

---

## 4. 🗂️ Data Design

Each service maintains its own database schema focused on its specific domain:

- **User Service**:
  - User: Core authentication model with role-based access control
  - UserPermission: Granular user permissions
  - Profiles: Specific profiles for each user type (PatientProfile, DoctorProfile, etc.)
  - ContactInfo, Address: Shared user information
  - UserActivity: Audit trails for user actions

- **Medical Record Service**:
  - Patient medical histories
  - Diagnoses and treatments
  - Allergies and medication history

- **Appointment Service**:
  - Appointments: Scheduled visits
  - DoctorAvailability: Doctor scheduling and availability slots

- **Pharmacy Service**:
  - Prescriptions: Medication orders
  - Medications: Drug information and inventory

- **Laboratory Service**:
  - TestOrders: Lab test requests
  - TestResults: Diagnostic findings
  - TestTypes: Available lab test categories

- **Billing Service**:
  - Invoices: Payment records
  - InsuranceClaims: Health insurance processing
  - Payments: Transaction records

- **Data Consistency**:
  - Services use consistent IDs for related entities
  - Foreign keys to user IDs maintained across services
  - Service-level validation ensures data integrity

---

## 5. 🔐 Security Considerations

The system implements a comprehensive, layered security approach:

- **Authentication**:
  - JWT token-based authentication via API Gateway
  - Token management with access (1 hour) and refresh (7 days) tokens
  - Token blacklisting for logout and revocation via Redis

- **Authorization**:
  - Fine-grained role-based access control (RBAC)
  - Seven primary roles: ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECHNICIAN, INSURANCE_PROVIDER
  - Resource-specific permission classes for each service domain
  - Object-level permissions based on resource ownership

- **Permission Hierarchy**:
  - Base permissions (IsAuthenticated, AllowAny, ReadOnly)
  - Role-based permissions (HasRole, IsAdmin, IsDoctor, etc.)
  - Resource-specific permissions (AppointmentPermissions, MedicalRecordPermissions, etc.)
  - Action-specific permissions (CanViewAppointments, CanCreatePrescription, etc.)

- **Audit Logging**:
  - Comprehensive logging of access events
  - UserActivity tracking for security monitoring
  - Failed authentication attempt tracking

- **Data Protection**:
  - HTTPS/TLS for all communications
  - Strict validation of input data
  - Prevention of unauthorized cross-service access

---

## 6. 📦 Deployment Plan

- **Containerization**:
  - Docker containers for all services
  - Individual Dockerfile for each service with appropriate dependencies
  - Docker Compose orchestration for local development

- **Service Dependencies**:
  - PostgreSQL database with separate logical databases per service
  - Redis for caching, session management, and message brokering
  - Health checks to ensure proper startup sequence

- **Configuration Management**:
  - Environment variables for service configuration
  - Shared JWT secrets across services
  - Service discovery through API Gateway

- **Scaling**:
  - Horizontal scaling capability for each service
  - Stateless design enables multiple instances
  - Load balancing through API Gateway

---

## 7. 🎨 Architecture Diagram

```
                      ┌─────────────────┐
                      │                 │
                      │  API Gateway    │◄────── Clients (Web/Mobile)
                      │  (Node.js)      │
                      │                 │
                      └────────┬────────┘
                               │
          ┌──────────┬────────┼───────────┬────────────┬──────────┐
          │          │        │           │            │          │
┌─────────▼────┐ ┌───▼───┐ ┌──▼───┐ ┌────▼─────┐ ┌────▼─────┐ ┌──▼───────┐
│              │ │       │ │      │ │          │ │          │ │          │
│ User Service │ │Medical│ │Appt. │ │ Pharmacy │ │ Billing  │ │Laboratory│
│              │ │Records│ │      │ │          │ │          │ │          │
└──────────────┘ └───────┘ └──────┘ └──────────┘ └──────────┘ └──────────┘
       ▲                       ▲                                    │
       │                       │                                    │
       └───────────────────────┴───────────────────────┬───────────┘
                                                       │
                                              ┌────────▼─────┐
                                              │ Notification │
                                              │   Service    │
                                              └──────────────┘
                                                   
┌─────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL Database                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          Redis (Cache & Sessions)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary

The healthcare microservices architecture offers significant advantages for this domain:

1. **Role-Based Functionality**: The system provides specific features for each healthcare role, ensuring all stakeholders have appropriate access and capabilities.

2. **Security and Compliance**: The comprehensive permission system enforces strict access controls essential for healthcare data, supporting regulatory compliance.

3. **Modular Development**: Each service focuses on a specific healthcare domain (appointments, records, pharmacy), allowing specialized teams to work independently.

4. **Scalability**: Services can scale independently based on demand patterns - for example, the appointment service might need more resources during peak booking periods.

5. **Resilience**: Service isolation prevents system-wide failures. If the billing service experiences issues, critical patient care functions continue operating.

6. **Flexibility**: The architecture supports different communication patterns (synchronous REST, asynchronous events) appropriate to different use cases.

The common-auth library provides consistent authentication and authorization across all services, while the API Gateway centralizes routing, security, and cross-cutting concerns. The system's design follows healthcare best practices with a focus on security, privacy, and workflow optimization.