FROM python:3.9-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies
RUN apt-get update && apt-get install -y netcat-openbsd postgresql-client curl
COPY services/billing-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and install common-auth
COPY services/common-auth /app/common-auth
RUN pip install -e /app/common-auth

# Copy project
COPY services/billing-service /app

# Copy entrypoint script from /app to /
RUN cp /app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8003"]
