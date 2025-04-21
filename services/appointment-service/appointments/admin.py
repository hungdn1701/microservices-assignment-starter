from django.contrib import admin
from .models import DoctorAvailability, TimeSlot, Appointment, AppointmentReminder


@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'weekday', 'start_time', 'end_time', 'is_available', 'is_active', 'schedule_type', 'location')
    list_filter = ('weekday', 'is_available', 'is_active', 'schedule_type')
    search_fields = ('doctor_id', 'location')


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'date', 'start_time', 'end_time', 'status', 'is_active', 'location')
    list_filter = ('date', 'status', 'is_active')
    search_fields = ('doctor_id', 'location')
    date_hierarchy = 'date'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_id', 'get_doctor_id', 'get_appointment_date', 'get_start_time', 'get_end_time', 'status')
    list_filter = ('status', 'time_slot__date')
    search_fields = ('patient_id', 'time_slot__doctor_id')
    date_hierarchy = 'time_slot__date'

    def get_doctor_id(self, obj):
        return obj.doctor_id
    get_doctor_id.short_description = 'Doctor ID'

    def get_appointment_date(self, obj):
        return obj.appointment_date
    get_appointment_date.short_description = 'Appointment Date'

    def get_start_time(self, obj):
        return obj.start_time
    get_start_time.short_description = 'Start Time'

    def get_end_time(self, obj):
        return obj.end_time
    get_end_time.short_description = 'End Time'


@admin.register(AppointmentReminder)
class AppointmentReminderAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'reminder_type', 'scheduled_time', 'status', 'sent_at')
    list_filter = ('reminder_type', 'status')
    search_fields = ('appointment__patient_id', 'appointment__doctor_id')
    date_hierarchy = 'scheduled_time'
