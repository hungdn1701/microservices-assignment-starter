"""
Command to setup cron jobs for notification scheduling.
"""
import os
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from crontab import CronTab

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Sets up cron jobs for notification scheduling'

    def handle(self, *args, **options):
        self.stdout.write('Setting up cron jobs for notification scheduling...')
        
        # Get the current user's crontab
        cron = CronTab(user=True)
        
        # Clear existing notification cron jobs
        cron.remove_all(comment='healthcare_notification')
        
        # Get the project directory
        project_dir = settings.BASE_DIR
        
        # Get the python executable
        python_executable = os.path.join(os.path.dirname(project_dir), 'venv/bin/python')
        if not os.path.exists(python_executable):
            python_executable = 'python'  # Fall back to system python
        
        # Define the commands
        commands = [
            {
                'name': 'create_default_templates',
                'schedule': '@reboot',  # Run at system reboot
                'comment': 'Create default notification templates'
            },
            {
                'name': 'schedule_appointment_reminders',
                'schedule': '0 8 * * *',  # Run daily at 8:00 AM
                'comment': 'Schedule appointment reminders'
            },
            {
                'name': 'schedule_followup_reminders',
                'schedule': '0 9 * * *',  # Run daily at 9:00 AM
                'comment': 'Schedule follow-up appointment reminders'
            },
            {
                'name': 'schedule_payment_reminders',
                'schedule': '0 10 * * *',  # Run daily at 10:00 AM
                'comment': 'Schedule payment reminders'
            },
            {
                'name': 'schedule_medication_refill_reminders',
                'schedule': '0 11 * * *',  # Run daily at 11:00 AM
                'comment': 'Schedule medication refill reminders'
            },
            {
                'name': 'schedule_lab_test_reminders',
                'schedule': '0 12 * * *',  # Run daily at 12:00 PM
                'comment': 'Schedule lab test reminders'
            }
        ]
        
        # Add the cron jobs
        for cmd in commands:
            job = cron.new(
                command=f'cd {project_dir} && {python_executable} manage.py {cmd["name"]}',
                comment=f'healthcare_notification_{cmd["name"]}'
            )
            job.setall(cmd['schedule'])
            self.stdout.write(f'Added cron job: {cmd["name"]} ({cmd["schedule"]})')
        
        # Write the crontab
        cron.write()
        
        self.stdout.write(self.style.SUCCESS('Successfully set up notification cron jobs.'))
