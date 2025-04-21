#!/bin/bash

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Copy Swagger YAML files from containers to docs/api-specs/
echo "Copying Swagger YAML files..."
docker cp microservices-assignment-starter_user-service_1:/app/user-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_medical-record-service_1:/app/medical-record-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_appointment-service_1:/app/appointment-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_billing-service_1:/app/billing-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_pharmacy-service_1:/app/pharmacy-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_laboratory-service_1:/app/laboratory-service.yaml docs/api-specs/
docker cp microservices-assignment-starter_notification-service_1:/app/notification-service.yaml docs/api-specs/

echo "Done!"
