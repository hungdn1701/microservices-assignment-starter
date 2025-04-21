#!/bin/bash

# Wait for postgres
echo "Waiting for postgres..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Create database if it doesn't exist
echo "Checking if database exists..."
PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1
if [ $? -ne 0 ]; then
  echo "Database $DATABASE_NAME does not exist. Creating..."
  PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -U $DATABASE_USER -c "CREATE DATABASE $DATABASE_NAME"
  echo "Database created successfully!"
else
  echo "Database $DATABASE_NAME already exists."
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Create superuser if needed
echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(email='$DJANGO_SUPERUSER_EMAIL').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD');
    print('Superuser created.');
else:
    print('Superuser already exists.')
"

# Setup notifications
echo "Setting up notifications..."
./setup_notifications.sh

# Start Celery worker
echo "Starting Celery worker..."
celery -A core worker --loglevel=info &

# Start Celery beat
echo "Starting Celery beat..."
celery -A core beat --loglevel=info &

# Start Redis notification consumer
echo "Starting Redis notification consumer..."
python manage.py consume_notifications --sleep 1 --batch-size 10 &

# Fetch Swagger YAML and copy to api-specs directory
echo "Fetching Swagger YAML..."
sleep 5
curl -f http://localhost:8006/notification-service.yaml -o /app/notification-service.yaml || echo "Swagger fetch failed"
cp /app/notification-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Start server with Daphne for WebSocket support
echo "Starting server with Daphne for WebSocket support..."
exec daphne -b 0.0.0.0 -p 8006 core.asgi:application
