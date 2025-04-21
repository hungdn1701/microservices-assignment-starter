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
PGPASSWORD=${DATABASE_PASSWORD} psql -h ${DATABASE_HOST} -U ${DATABASE_USER} -lqt | cut -d \| -f 1 | grep -qw ${DATABASE_NAME}
if [ $? -ne 0 ]; then
  echo "Creating database ${DATABASE_NAME}..."
  PGPASSWORD=${DATABASE_PASSWORD} psql -h ${DATABASE_HOST} -U ${DATABASE_USER} -c "CREATE DATABASE ${DATABASE_NAME};"
  echo "Database created successfully."
else
  echo "Database already exists."
fi

# Apply database migrations
echo "Applying migrations..."
python manage.py makemigrations laboratory
python manage.py migrate

# Create superuser if needed
if [ "$DJANGO_SUPERUSER_EMAIL" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "Creating superuser..."
  python manage.py createsuperuser --noinput --email $DJANGO_SUPERUSER_EMAIL --username admin || true
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server in background and fetch swagger spec
echo "Starting server in background..."
"$@" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5
echo "Fetching swagger.yaml..."
curl -f http://localhost:8005/laboratory-service.yaml -o /app/laboratory-service.yaml || echo "Swagger fetch failed"
cp /app/laboratory-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Wait for server process to exit
wait $SERVER_PID
