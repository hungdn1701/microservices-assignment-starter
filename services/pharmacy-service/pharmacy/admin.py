from django.contrib import admin
from .models import (
    Medication, Prescription, PrescriptionItem,
    Inventory, Dispensing, DispensingItem
)

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'strength', 'dosage_form', 'category', 'requires_prescription')
    list_filter = ('category', 'dosage_form', 'requires_prescription')
    search_fields = ('name', 'description')


class PrescriptionItemInline(admin.TabularInline):
    model = PrescriptionItem
    extra = 1


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_id', 'doctor_id', 'date_prescribed', 'status')
    list_filter = ('status', 'date_prescribed')
    search_fields = ('patient_id', 'doctor_id')
    inlines = [PrescriptionItemInline]


@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'prescription', 'medication', 'quantity', 'dosage')
    list_filter = ('medication',)
    search_fields = ('prescription__id', 'medication__name')


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'medication', 'batch_number', 'expiry_date', 'quantity', 'unit_price')
    list_filter = ('medication', 'expiry_date')
    search_fields = ('medication__name', 'batch_number')


class DispensingItemInline(admin.TabularInline):
    model = DispensingItem
    extra = 1


@admin.register(Dispensing)
class DispensingAdmin(admin.ModelAdmin):
    list_display = ('id', 'prescription', 'pharmacist_id', 'date_dispensed', 'status')
    list_filter = ('status', 'date_dispensed')
    search_fields = ('prescription__id', 'pharmacist_id')
    inlines = [DispensingItemInline]


@admin.register(DispensingItem)
class DispensingItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'dispensing', 'prescription_item', 'inventory', 'quantity_dispensed')
    list_filter = ('dispensing',)
    search_fields = ('dispensing__id', 'prescription_item__id')
