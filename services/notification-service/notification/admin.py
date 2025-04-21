from django.contrib import admin
from .models import Notification, NotificationTemplate, NotificationSchedule

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient_id', 'recipient_type', 'notification_type', 'channel', 'status', 'created_at')
    list_filter = ('notification_type', 'channel', 'status', 'created_at')
    search_fields = ('recipient_id', 'recipient_email', 'recipient_phone', 'subject', 'content')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'notification_type', 'channel')
    list_filter = ('notification_type', 'channel')
    search_fields = ('name', 'subject_template', 'content_template')

@admin.register(NotificationSchedule)
class NotificationScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient_id', 'recipient_type', 'notification_type', 'scheduled_at', 'status')
    list_filter = ('notification_type', 'status', 'scheduled_at')
    search_fields = ('recipient_id', 'subject', 'content')
    readonly_fields = ('created_at', 'updated_at')
