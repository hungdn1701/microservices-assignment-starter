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
PGPASSWORD=postgres psql -h postgres -U postgres -lqt | cut -d \| -f 1 | grep -qw healthcare_user
if [ $? -ne 0 ]; then
  echo "Creating database healthcare_user..."
  PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE healthcare_user;"
  echo "Database created successfully."
else
  echo "Database already exists."
fi

# Apply database migrations
echo "Applying migrations..."
python manage.py makemigrations authentication
python manage.py makemigrations users
python manage.py migrate

# Install common-auth if it exists
if [ -d "/common-auth" ]; then
  echo "Installing common-auth..."
  pip install -e /common-auth
  echo "common-auth installed successfully."
fi

# Start server in background and fetch swagger spec
echo "Starting server in background..."
"$@" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5
echo "Fetching swagger.yaml..."
curl -f http://localhost:8000/user-service.yaml -o /app/user-service.yaml || echo "Swagger fetch failed"
cp /app/user-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Wait for server process to exit
wait $SERVER_PID
