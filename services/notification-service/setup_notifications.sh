#!/bin/bash

# Create default notification templates
echo "Creating default notification templates..."
python manage.py create_default_templates

# Schedule initial notifications
echo "Scheduling initial notifications..."
python manage.py schedule_appointment_reminders
python manage.py schedule_followup_reminders
python manage.py schedule_payment_reminders
python manage.py schedule_medication_refill_reminders
python manage.py schedule_lab_test_reminders

echo "Notification setup completed successfully!"
