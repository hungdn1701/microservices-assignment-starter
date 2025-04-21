"""
Services for interacting with other services in the healthcare system.
"""
import requests
import logging
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)

class ServiceClient:
    """
    Base client for interacting with other services.
    """
    def __init__(self, base_url):
        self.base_url = base_url

    def get(self, endpoint, headers=None):
        """
        Make a GET request to the service.
        """
        try:
            response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making GET request to {self.base_url}{endpoint}: {str(e)}")
            return None


class UserServiceClient(ServiceClient):
    """
    Client for interacting with the User Service.
    """
    def __init__(self):
        super().__init__(settings.USER_SERVICE_URL)

    def get_patient(self, patient_id, headers=None):
        """
        Get patient information from the User Service.
        """
        return self.get(f"/api/patients/{patient_id}/", headers=headers)

    def get_doctor(self, doctor_id, headers=None):
        """
        Get doctor information from the User Service.
        """
        return self.get(f"/api/doctors/{doctor_id}/", headers=headers)

    def get_insurance_provider(self, provider_id, headers=None):
        """
        Get insurance provider information from the User Service.
        """
        # Get all insurance providers and filter by ID
        providers = self.get("/api/admin/insurance-provider-profiles/", headers=headers)
        if providers:
            for provider in providers:
                if provider.get('id') == provider_id:
                    return provider
        return None

    def get_patient_insurance(self, patient_id, headers=None):
        """
        Get patient's insurance information from the User Service.
        """
        return self.get(f"/api/insurance-information/?patient_id={patient_id}", headers=headers)


class AppointmentServiceClient(ServiceClient):
    """
    Client for interacting with the Appointment Service.
    """
    def __init__(self):
        super().__init__(settings.APPOINTMENT_SERVICE_URL)

    def get_appointment(self, appointment_id, headers=None):
        """
        Get appointment information from the Appointment Service.
        """
        return self.get(f"/api/appointments/{appointment_id}/", headers=headers)


class MedicalRecordServiceClient(ServiceClient):
    """
    Client for interacting with the Medical Record Service.
    """
    def __init__(self):
        super().__init__(settings.MEDICAL_RECORD_SERVICE_URL)

    def get_medical_record(self, record_id, headers=None):
        """
        Get medical record information from the Medical Record Service.
        """
        return self.get(f"/api/medical-records/{record_id}/", headers=headers)


class LaboratoryServiceClient(ServiceClient):
    """
    Client for interacting with the Laboratory Service.
    """
    def __init__(self):
        super().__init__(settings.LABORATORY_SERVICE_URL)

    def get_lab_test(self, test_id, headers=None):
        """
        Get lab test information from the Laboratory Service.
        """
        return self.get(f"/api/lab-tests/{test_id}/", headers=headers)

    def get_test_type(self, type_id, headers=None):
        """
        Get test type information from the Laboratory Service.
        """
        return self.get(f"/api/test-types/{type_id}/", headers=headers)


class PharmacyServiceClient(ServiceClient):
    """
    Client for interacting with the Pharmacy Service.
    """
    def __init__(self):
        super().__init__(settings.PHARMACY_SERVICE_URL)

    def get_prescription(self, prescription_id, headers=None):
        """
        Get prescription information from the Pharmacy Service.
        """
        return self.get(f"/api/prescriptions/{prescription_id}/", headers=headers)

    def get_medication(self, medication_id, headers=None):
        """
        Get medication information from the Pharmacy Service.
        """
        return self.get(f"/api/medications/{medication_id}/", headers=headers)


def create_invoice_from_appointment(appointment_id, headers=None):
    """
    Create an invoice from an appointment.
    """
    from .models import Invoice, InvoiceItem

    # Get appointment information
    client = AppointmentServiceClient()
    appointment = client.get_appointment(appointment_id, headers)

    if not appointment:
        logger.error(f"Could not retrieve appointment {appointment_id}")
        return None

    # Create invoice
    invoice = Invoice.objects.create(
        patient_id=appointment['patient_id'],
        invoice_number=f"INV-APP-{appointment_id}",
        status=Invoice.Status.PENDING,
        issue_date=appointment['appointment_date'].split('T')[0],  # Extract date part
        due_date=appointment['appointment_date'].split('T')[0],  # Due same day
        total_amount=Decimal(appointment.get('fee', '0')),
        discount=Decimal('0'),
        tax=Decimal('0'),
        final_amount=Decimal(appointment.get('fee', '0')),
        notes=f"Invoice for appointment on {appointment['appointment_date']}"
    )

    # Create invoice item
    InvoiceItem.objects.create(
        invoice=invoice,
        item_type=InvoiceItem.ItemType.APPOINTMENT,
        description=f"Appointment with Dr. {appointment.get('doctor_name', 'Unknown')}",
        quantity=1,
        unit_price=Decimal(appointment.get('fee', '0')),
        total_price=Decimal(appointment.get('fee', '0')),
        reference_id=appointment_id,
        service_type='appointment',
        appointment_id=appointment_id
    )

    # Apply insurance if available
    apply_insurance_to_invoice(invoice, headers)

    return invoice


def create_invoice_from_lab_test(lab_test_id, headers=None):
    """
    Create an invoice from a lab test.
    """
    from .models import Invoice, InvoiceItem

    # Get lab test information
    client = LaboratoryServiceClient()
    lab_test = client.get_lab_test(lab_test_id, headers)

    if not lab_test:
        logger.error(f"Could not retrieve lab test {lab_test_id}")
        return None

    # Get test type information to get the price
    test_type = client.get_test_type(lab_test['test_type'], headers)

    if not test_type:
        logger.error(f"Could not retrieve test type for lab test {lab_test_id}")
        return None

    # Get current date if scheduled_date is not available
    from django.utils import timezone
    current_date = timezone.now().strftime('%Y-%m-%d')

    # Use scheduled_date if available, otherwise use current date
    issue_date = lab_test.get('scheduled_date', current_date)
    if issue_date and isinstance(issue_date, str) and 'T' in issue_date:
        issue_date = issue_date.split('T')[0]
    else:
        issue_date = current_date

    # Create invoice
    invoice = Invoice.objects.create(
        patient_id=lab_test['patient_id'],
        invoice_number=f"INV-LAB-{lab_test_id}",
        status=Invoice.Status.PENDING,
        issue_date=issue_date,
        due_date=issue_date,  # Due same day
        total_amount=Decimal(test_type.get('price', '0')),
        discount=Decimal('0'),
        tax=Decimal('0'),
        final_amount=Decimal(test_type.get('price', '0')),
        notes=f"Invoice for lab test on {issue_date}"
    )

    # Create invoice item
    InvoiceItem.objects.create(
        invoice=invoice,
        item_type=InvoiceItem.ItemType.LAB_TEST,
        description=f"Laboratory Test: {test_type.get('name', 'Unknown')}",
        quantity=1,
        unit_price=Decimal(test_type.get('price', '0')),
        total_price=Decimal(test_type.get('price', '0')),
        reference_id=lab_test_id,
        service_type='laboratory',
        lab_test_id=lab_test_id
    )

    # Apply insurance if available
    apply_insurance_to_invoice(invoice, headers)

    return invoice


def create_invoice_from_prescription(prescription_id, headers=None):
    """
    Create an invoice from a prescription.
    """
    from .models import Invoice, InvoiceItem

    # Get prescription information
    client = PharmacyServiceClient()
    prescription = client.get_prescription(prescription_id, headers)

    if not prescription:
        logger.error(f"Could not retrieve prescription {prescription_id}")
        return None

    # Calculate total amount
    total_amount = Decimal('0')
    items = []

    for item in prescription.get('items', []):
        medication = client.get_medication(item['medication_id'], headers)
        if medication:
            price = Decimal(medication.get('price', '0')) * Decimal(item.get('quantity', '1'))
            total_amount += price
            items.append({
                'medication': medication,
                'quantity': item.get('quantity', 1),
                'price': price
            })

    # Create invoice
    invoice = Invoice.objects.create(
        patient_id=prescription['patient_id'],
        invoice_number=f"INV-PRES-{prescription_id}",
        status=Invoice.Status.PENDING,
        issue_date=prescription['date'].split('T')[0],  # Extract date part
        due_date=prescription['date'].split('T')[0],  # Due same day
        total_amount=total_amount,
        discount=Decimal('0'),
        tax=Decimal('0'),
        final_amount=total_amount,
        notes=f"Invoice for prescription on {prescription['date']}"
    )

    # Create invoice items
    for item in items:
        InvoiceItem.objects.create(
            invoice=invoice,
            item_type=InvoiceItem.ItemType.MEDICATION,
            description=f"Medication: {item['medication'].get('name', 'Unknown')}",
            quantity=item['quantity'],
            unit_price=Decimal(item['medication'].get('price', '0')),
            total_price=item['price'],
            reference_id=prescription_id,
            service_type='pharmacy',
            prescription_id=prescription_id
        )

    # Apply insurance if available
    apply_insurance_to_invoice(invoice, headers)

    return invoice


def create_invoice_from_medical_record(record_id, headers=None):
    """
    Create an invoice from a medical record.
    """
    from .models import Invoice, InvoiceItem

    # Get medical record information
    client = MedicalRecordServiceClient()
    record = client.get_medical_record(record_id, headers)

    if not record:
        logger.error(f"Could not retrieve medical record {record_id}")
        return None

    # Create invoice
    invoice = Invoice.objects.create(
        patient_id=record['patient_id'],
        invoice_number=f"INV-MED-{record_id}",
        status=Invoice.Status.PENDING,
        issue_date=record['date'].split('T')[0],  # Extract date part
        due_date=record['date'].split('T')[0],  # Due same day
        total_amount=Decimal('0'),  # Will be updated after adding items
        discount=Decimal('0'),
        tax=Decimal('0'),
        final_amount=Decimal('0'),  # Will be updated after adding items
        notes=f"Invoice for medical services on {record['date']}"
    )

    # Add items based on procedures in the medical record
    total_amount = Decimal('0')

    # This is a simplified example - in a real system, you would have a more complex
    # mapping of procedures to prices
    procedures = {
        'CONSULTATION': Decimal('100'),
        'CHECKUP': Decimal('50'),
        'SURGERY': Decimal('1000'),
        'XRAY': Decimal('200'),
        'MRI': Decimal('500'),
        'CT_SCAN': Decimal('400'),
        'ULTRASOUND': Decimal('300'),
        'VACCINATION': Decimal('75'),
    }

    # Add a generic procedure item
    procedure_type = record.get('procedure_type', 'CONSULTATION')
    procedure_price = procedures.get(procedure_type, Decimal('100'))

    InvoiceItem.objects.create(
        invoice=invoice,
        item_type=InvoiceItem.ItemType.PROCEDURE,
        description=f"Medical Procedure: {procedure_type}",
        quantity=1,
        unit_price=procedure_price,
        total_price=procedure_price,
        reference_id=record_id,
        service_type='medical-record',
        medical_record_id=record_id
    )

    total_amount += procedure_price

    # Update invoice total
    invoice.total_amount = total_amount
    invoice.final_amount = total_amount
    invoice.save()

    # Apply insurance if available
    apply_insurance_to_invoice(invoice, headers)

    return invoice


def apply_insurance_to_invoice(invoice, headers=None):
    """
    Apply insurance coverage to an invoice if the patient has insurance.
    """
    from .models import InsuranceClaim

    # Get patient's insurance information
    user_client = UserServiceClient()
    insurance_info = user_client.get_patient_insurance(invoice.patient_id, headers)

    if not insurance_info or 'results' not in insurance_info or not insurance_info['results']:
        logger.info(f"No insurance information found for patient {invoice.patient_id}")
        return None

    # Get the first active insurance policy
    active_insurance = None
    for insurance in insurance_info['results']:
        if insurance.get('is_active', False):
            active_insurance = insurance
            break

    if not active_insurance:
        logger.info(f"No active insurance found for patient {invoice.patient_id}")
        return None

    # Get insurance provider details
    provider_id = active_insurance.get('provider')
    provider = user_client.get_insurance_provider(provider_id, headers) if provider_id else None

    if not provider:
        logger.error(f"Could not retrieve insurance provider {provider_id}")
        return None

    # Calculate coverage based on insurance policy
    # Try to get coverage_percentage directly, or calculate from coinsurance_rate
    coverage_percentage = Decimal('0')
    if 'coverage_percentage' in active_insurance and active_insurance['coverage_percentage']:
        coverage_percentage = Decimal(str(active_insurance['coverage_percentage']))
    elif 'coinsurance_rate' in active_insurance and active_insurance['coinsurance_rate']:
        # coinsurance_rate is the percentage the patient pays, so coverage is (100 - coinsurance_rate)
        coinsurance_rate = Decimal(str(active_insurance['coinsurance_rate']))
        coverage_percentage = Decimal('100') - (coinsurance_rate * Decimal('100'))

    if coverage_percentage <= 0:
        logger.info(f"Insurance coverage percentage is 0 for patient {invoice.patient_id}")
        return None

    # Calculate covered amount
    covered_amount = (invoice.total_amount * coverage_percentage) / Decimal('100')
    patient_responsibility = invoice.total_amount - covered_amount

    # Update invoice with insurance discount
    invoice.discount = covered_amount
    invoice.final_amount = patient_responsibility
    invoice.notes += f"\nInsurance coverage: {coverage_percentage}% by {provider.get('name', 'Unknown Provider')}"
    invoice.save()

    # Generate a unique claim number
    import uuid
    from django.utils import timezone

    # Format: CLM-{provider_id}-{invoice_id}-{timestamp}-{random_uuid}
    claim_number = f"CLM-{provider_id}-{invoice.id}-{int(timezone.now().timestamp())}-{str(uuid.uuid4())[:8]}"

    # Create insurance claim
    claim = InsuranceClaim.objects.create(
        invoice=invoice,
        insurance_provider_id=provider_id,
        policy_number=active_insurance.get('policy_number', ''),
        member_id=active_insurance.get('member_id', ''),
        claim_number=claim_number,  # Add unique claim number
        claim_amount=covered_amount,
        status=InsuranceClaim.Status.SUBMITTED,
        submission_date=invoice.issue_date,
        notes=f"Automatic claim for invoice {invoice.invoice_number}"
    )

    # Send notification about insurance claim
    try:
        notification_data = {
            "service": "BILLING",
            "event_type": "INSURANCE_CLAIM_SUBMITTED",
            "patient_id": invoice.patient_id,
            "invoice_id": invoice.id,
            "claim_id": claim.id,
            "provider_name": provider.get('name', 'Unknown Provider'),
            "claim_amount": str(covered_amount),
            "patient_responsibility": str(patient_responsibility)
        }

        # Send to notification service
        requests.post(
            f"{settings.API_GATEWAY_URL}/api/events",
            json=notification_data,
            headers=headers,
            timeout=5
        )
    except Exception as e:
        logger.error(f"Error sending insurance claim notification: {str(e)}")

    return claim
