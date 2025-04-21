#!/bin/bash

set -e

# Function to check if postgres is ready
postgres_ready() {
    python << END
import sys
import psycopg2
import os
import dj_database_url

try:
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        db_url = 'postgres://postgres:postgres@postgres:5432/postgres'

    config = dj_database_url.parse(db_url)
    conn = psycopg2.connect(
        dbname='postgres',
        user=config['USER'],
        password=config['PASSWORD'],
        host=config['HOST'],
        port=config['PORT']
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

# Wait for postgres to be ready
until postgres_ready; do
    echo "PostgreSQL is unavailable - waiting..."
    sleep 2
done
echo "PostgreSQL is up - continuing..."

# Create database if it doesn't exist
echo "Checking if database exists..."
python << END
import sys
import psycopg2
import os
import dj_database_url

try:
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        db_url = 'postgres://postgres:postgres@postgres:5432/postgres'

    config = dj_database_url.parse(db_url)
    db_name = 'healthcare_pharmacy'

    # Connect to postgres database
    conn = psycopg2.connect(
        dbname='postgres',
        user=config['USER'],
        password=config['PASSWORD'],
        host=config['HOST'],
        port=config['PORT']
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
    exists = cursor.fetchone()

    if not exists:
        print(f"Creating database {db_name}...")
        cursor.execute(f"CREATE DATABASE {db_name}")
        print(f"Database {db_name} created successfully!")
    else:
        print(f"Database {db_name} already exists.")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(-1)
END

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

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
curl -f http://localhost:8004/pharmacy-service.yaml -o /app/pharmacy-service.yaml || echo "Swagger fetch failed"
cp /app/pharmacy-service.yaml /api-specs/ || echo "Copy to api-specs failed"

# Wait for server process to exit
wait $SERVER_PID
