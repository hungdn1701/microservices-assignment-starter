from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment, InsuranceClaim


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['invoice']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['invoice']


class InsuranceClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceClaim
        fields = '__all__'
        read_only_fields = ['invoice']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    insurance_claims = InsuranceClaimSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'


class InvoiceDetailSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    insurance_claims = InsuranceClaimSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(child=serializers.DictField(), required=True, write_only=True)

    class Meta:
        model = Invoice
        fields = ['patient_id', 'issue_date', 'due_date', 'notes', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        issue_date = validated_data.pop('issue_date')
        due_date = validated_data.pop('due_date')
        notes = validated_data.pop('notes', '')
        patient_id = validated_data.pop('patient_id')

        # Generate invoice number
        import uuid
        invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"

        # Calculate total amount
        total_amount = 0
        for item in items_data:
            quantity = item.get('quantity', 1)
            unit_price = float(item.get('unit_price', 0))
            tax_rate = float(item.get('tax_rate', 0))
            item_total = quantity * unit_price
            item_tax = item_total * tax_rate
            total_amount += item_total + item_tax

        # Create invoice
        invoice = Invoice.objects.create(
            patient_id=patient_id,
            invoice_number=invoice_number,
            status=Invoice.Status.PENDING,
            issue_date=issue_date,
            due_date=due_date,
            total_amount=total_amount,
            discount=0,
            tax=0,
            final_amount=total_amount,
            notes=notes
        )

        # Create invoice items
        for item_data in items_data:
            quantity = item_data.get('quantity', 1)
            unit_price = float(item_data.get('unit_price', 0))
            tax_rate = float(item_data.get('tax_rate', 0))
            item_total = quantity * unit_price
            item_tax = item_total * tax_rate
            total_price = item_total + item_tax

            InvoiceItem.objects.create(
                invoice=invoice,
                item_type=InvoiceItem.ItemType.OTHER,
                description=item_data.get('description', 'Item'),
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )

        return invoice


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['payment_method', 'amount', 'transaction_id', 'payment_date', 'status', 'payment_gateway', 'payment_reference', 'notes']


class InsuranceClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceClaim
        fields = ['insurance_provider_id', 'policy_number', 'member_id', 'claim_number', 'claim_amount', 'submission_date', 'status', 'approved_amount', 'rejection_reason', 'notes']
