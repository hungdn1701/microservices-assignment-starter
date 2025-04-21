#!/bin/bash

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 1
  echo "Still waiting for PostgreSQL..."
done
echo "PostgreSQL started"

# Create database if it doesn't exist
echo "Checking if database exists..."
PGPASSWORD=postgres psql -h postgres -U postgres -lqt | cut -d \| -f 1 | grep -qw healthcare_appointments
if [ $? -ne 0 ]; then
  echo "Creating database healthcare_appointments..."
  PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE healthcare_appointments;"
  echo "Database created successfully."
else
  echo "Database already exists."
fi

# Apply database migrations
echo "Applying migrations..."
python manage.py makemigrations appointments
python manage.py migrate

# Start server in background and fetch swagger spec
echo "Starting server in background..."
"$@" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5
echo "Fetching swagger.yaml..."
curl -f http://localhost:8002/appointment-service.yaml -o /app/appointment-service.yaml || echo "Swagger fetch failed"
cp /app/appointment-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Wait for server process to exit
wait $SERVER_PID
