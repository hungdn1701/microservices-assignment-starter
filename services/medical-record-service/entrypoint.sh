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
PGPASSWORD=postgres psql -h postgres -U postgres -lqt | cut -d \| -f 1 | grep -qw healthcare_medical
if [ $? -ne 0 ]; then
  echo "Creating database healthcare_medical..."
  PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE healthcare_medical;"
  echo "Database created successfully."
else
  echo "Database already exists."
fi

# Apply database migrations
echo "Applying migrations..."
python manage.py makemigrations records
python manage.py migrate

# Create superuser if needed
if [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser..."
  python manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL --username admin || true
fi

# Start server in background and fetch swagger spec
echo "Starting server in background..."
"$@" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5
echo "Fetching swagger.yaml..."
curl -f http://localhost:8001/medical-record-service.yaml -o /app/medical-record-service.yaml || echo "Swagger fetch failed"
cp /app/medical-record-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Wait for server process to exit
wait $SERVER_PID
