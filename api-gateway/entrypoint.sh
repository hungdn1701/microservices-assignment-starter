#!/bin/bash

# Start server in background and fetch swagger spec
echo "Starting server in background..."
"$@" &
SERVER_PID=$!

# Wait for server to be ready
sleep 5
echo "Fetching swagger.yaml..."
curl -f http://localhost:4000/api-gateway.yaml -o api-gateway.yaml || echo "Swagger fetch failed"

# Wait for server process to exit
wait $SERVER_PID