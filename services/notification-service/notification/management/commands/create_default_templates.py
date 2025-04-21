"""
Command to create default notification templates.
"""
from django.core.management.base import BaseCommand
from notification.models import NotificationTemplate, Notification


class Command(BaseCommand):
    help = 'Creates default notification templates'

    def handle(self, *args, **options):
        self.stdout.write('Creating default notification templates...')
        
        # Define default templates
        templates = [
            # Appointment templates
            {
                'name': 'Appointment Confirmation',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Xác nhận lịch hẹn: {{ appointment_type }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Lịch hẹn của bạn đã được xác nhận vào ngày {{ appointment_date }}.

Chi tiết lịch hẹn:
- Loại: {{ appointment_type }}
- Bác sĩ: {{ doctor_name }}
- Địa điểm: {{ location }}
{% if notes %}
- Ghi chú: {{ notes }}
{% endif %}

Vui lòng đến trước 15 phút để hoàn thành thủ tục đăng ký.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Appointment Reminder',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Nhắc nhở lịch hẹn: {{ appointment_type }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Đây là lời nhắc nhở về lịch hẹn sắp tới của bạn vào ngày {{ appointment_date }}.

Chi tiết lịch hẹn:
- Loại: {{ appointment_type }}
- Bác sĩ: {{ doctor_name }}
- Địa điểm: {{ location }}

Vui lòng đến trước 15 phút để hoàn thành thủ tục đăng ký.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Appointment Reminder SMS',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.SMS,
                'subject_template': '',
                'content_template': 'Nhắc nhở: Bạn có lịch hẹn {{ appointment_type }} vào ngày {{ appointment_date }} với bác sĩ {{ doctor_name }}.'
            },
            {
                'name': 'Appointment Cancellation',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Hủy lịch hẹn',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Lịch hẹn của bạn vào ngày {{ appointment_date }} đã bị hủy.

{% if reason %}
Lý do: {{ reason }}
{% endif %}

Nếu bạn muốn đặt lại lịch hẹn, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Appointment Rescheduled',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Thay đổi lịch hẹn: {{ appointment_type }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Lịch hẹn của bạn đã được thay đổi.

Lịch hẹn cũ: {{ old_appointment_date }}
Lịch hẹn mới: {{ appointment_date }}

Chi tiết lịch hẹn:
- Loại: {{ appointment_type }}
- Bác sĩ: {{ doctor_name }}
- Địa điểm: {{ location }}

Nếu thời gian mới không phù hợp, vui lòng liên hệ với chúng tôi để sắp xếp lại.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Follow-up Appointment Reminder',
                'notification_type': Notification.NotificationType.APPOINTMENT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Nhắc nhở lịch tái khám',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Đây là lời nhắc nhở rằng bạn cần đặt lịch tái khám theo khuyến nghị của bác sĩ {{ doctor_name }}.

{% if recommended_date %}
Ngày khuyến nghị: {{ recommended_date }}
{% endif %}

Vui lòng liên hệ với chúng tôi để đặt lịch tái khám.

Trân trọng,
Đội ngũ Y tế
'''
            },
            
            # Laboratory templates
            {
                'name': 'Lab Test Ordered',
                'notification_type': Notification.NotificationType.LAB_RESULT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Xét nghiệm mới đã được yêu cầu: {{ test_name }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Một xét nghiệm mới đã được yêu cầu cho bạn.

Chi tiết xét nghiệm:
- Tên xét nghiệm: {{ test_name }}
- Ngày xét nghiệm: {{ test_date }}
{% if notes %}
- Ghi chú: {{ notes }}
{% endif %}

Vui lòng đến phòng xét nghiệm vào ngày giờ đã hẹn.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Lab Results Ready',
                'notification_type': Notification.NotificationType.LAB_RESULT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Kết quả xét nghiệm đã sẵn sàng: {{ test_name }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Kết quả xét nghiệm của bạn đã sẵn sàng.

Chi tiết xét nghiệm:
- Tên xét nghiệm: {{ test_name }}
- Ngày xét nghiệm: {{ test_date }}

Vui lòng đăng nhập vào tài khoản của bạn để xem kết quả hoặc liên hệ với bác sĩ của bạn.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Abnormal Lab Results',
                'notification_type': Notification.NotificationType.LAB_RESULT,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Kết quả xét nghiệm bất thường: {{ test_name }}',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Kết quả xét nghiệm của bạn có một số giá trị bất thường.

Chi tiết xét nghiệm:
- Tên xét nghiệm: {{ test_name }}
- Ngày xét nghiệm: {{ test_date }}

Vui lòng liên hệ với bác sĩ của bạn để thảo luận về kết quả này.

Trân trọng,
Đội ngũ Y tế
'''
            },
            {
                'name': 'Abnormal Lab Results SMS',
                'notification_type': Notification.NotificationType.LAB_RESULT,
                'channel': Notification.Channel.SMS,
                'subject_template': '',
                'content_template': 'QUAN TRỌNG: Kết quả xét nghiệm {{ test_name }} của bạn có một số giá trị bất thường. Vui lòng liên hệ với bác sĩ của bạn.'
            },
            
            # Billing templates
            {
                'name': 'Invoice Created',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Hóa đơn mới đã được tạo',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Một hóa đơn mới đã được tạo cho bạn.

Chi tiết hóa đơn:
- Số hóa đơn: {{ invoice_number }}
- Số tiền: {{ amount }} VND
- Ngày đến hạn: {{ due_date }}
{% if description %}
- Mô tả: {{ description }}
{% endif %}

Vui lòng thanh toán trước ngày đến hạn.

Trân trọng,
Phòng Tài chính
'''
            },
            {
                'name': 'Payment Due Reminder',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Nhắc nhở thanh toán',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Đây là lời nhắc rằng khoản thanh toán của bạn sẽ đến hạn vào ngày {{ due_date }}.

Chi tiết hóa đơn:
- Số hóa đơn: {{ invoice_number }}
- Số tiền: {{ amount }} VND

Vui lòng thanh toán trước ngày đến hạn để tránh phí trễ hạn.

Trân trọng,
Phòng Tài chính
'''
            },
            {
                'name': 'Payment Due Reminder SMS',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.SMS,
                'subject_template': '',
                'content_template': 'Nhắc nhở: Khoản thanh toán của bạn với số tiền {{ amount }} VND sẽ đến hạn vào ngày {{ due_date }}.'
            },
            {
                'name': 'Payment Received',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Đã nhận thanh toán',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Chúng tôi đã nhận được khoản thanh toán của bạn với số tiền {{ amount }} VND.

Chi tiết thanh toán:
- Số hóa đơn: {{ invoice_number }}
- Ngày thanh toán: {{ payment_date }}
- Phương thức thanh toán: {{ payment_method }}

Cảm ơn bạn đã thanh toán.

Trân trọng,
Phòng Tài chính
'''
            },
            {
                'name': 'Insurance Claim Submitted',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Đã gửi yêu cầu bảo hiểm',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Một yêu cầu bảo hiểm đã được gửi cho hóa đơn của bạn.

Chi tiết yêu cầu:
- Số hóa đơn: {{ invoice_number }}
- Số tiền yêu cầu: {{ claim_amount }} VND
- Nhà cung cấp bảo hiểm: {{ provider_name }}

Chúng tôi sẽ thông báo cho bạn khi nhận được phản hồi từ nhà cung cấp bảo hiểm của bạn.

Trân trọng,
Phòng Tài chính
'''
            },
            {
                'name': 'Insurance Claim Approved',
                'notification_type': Notification.NotificationType.BILLING,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Yêu cầu bảo hiểm đã được chấp nhận',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Yêu cầu bảo hiểm của bạn đã được chấp nhận.

Chi tiết yêu cầu:
- Số hóa đơn: {{ invoice_number }}
- Số tiền được chấp nhận: {{ approved_amount }} VND
- Nhà cung cấp bảo hiểm: {{ provider_name }}

Số tiền được chấp nhận sẽ được áp dụng vào hóa đơn của bạn.

Trân trọng,
Phòng Tài chính
'''
            },
            
            # Pharmacy templates
            {
                'name': 'Prescription Ready',
                'notification_type': Notification.NotificationType.PRESCRIPTION,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Đơn thuốc sẵn sàng để lấy',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Đơn thuốc của bạn đã sẵn sàng để lấy.

Chi tiết đơn thuốc:
{% if medication_name %}
- Thuốc: {{ medication_name }}
{% endif %}
{% if pickup_date %}
- Ngày lấy: {{ pickup_date }}
{% endif %}

Vui lòng mang theo giấy tờ tùy thân khi đến lấy thuốc.

Trân trọng,
Nhà thuốc
'''
            },
            {
                'name': 'Prescription Ready SMS',
                'notification_type': Notification.NotificationType.PRESCRIPTION,
                'channel': Notification.Channel.SMS,
                'subject_template': '',
                'content_template': 'Đơn thuốc của bạn đã sẵn sàng để lấy tại nhà thuốc của chúng tôi.{% if medication_name %} Thuốc: {{ medication_name }}.{% endif %}'
            },
            {
                'name': 'Medication Refill Due',
                'notification_type': Notification.NotificationType.PRESCRIPTION,
                'channel': Notification.Channel.EMAIL,
                'subject_template': 'Nhắc nhở tái cấp thuốc',
                'content_template': '''Kính gửi {{ first_name }} {{ last_name }},

Đây là lời nhắc rằng thuốc của bạn sẽ cần được tái cấp vào ngày {{ refill_date }}.

Chi tiết thuốc:
- Thuốc: {{ medication_name }}

Vui lòng liên hệ với bác sĩ của bạn để được kê đơn mới hoặc tái cấp thuốc.

Trân trọng,
Nhà thuốc
'''
            },
            {
                'name': 'Medication Refill Due SMS',
                'notification_type': Notification.NotificationType.PRESCRIPTION,
                'channel': Notification.Channel.SMS,
                'subject_template': '',
                'content_template': 'Nhắc nhở: Thuốc của bạn ({{ medication_name }}) sẽ cần được tái cấp vào ngày {{ refill_date }}.'
            },
        ]
        
        # Create templates
        created_count = 0
        updated_count = 0
        
        for template_data in templates:
            template, created = NotificationTemplate.objects.update_or_create(
                name=template_data['name'],
                defaults={
                    'notification_type': template_data['notification_type'],
                    'channel': template_data['channel'],
                    'subject_template': template_data['subject_template'],
                    'content_template': template_data['content_template'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} and updated {updated_count} notification templates.'))
