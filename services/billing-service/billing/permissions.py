"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from common_auth.permissions import BillingPermissions, IsAdmin, IsPatient, IsInsuranceProvider

# Re-export for backward compatibility
CanViewInvoices = BillingPermissions.CanViewInvoices
CanCreateInvoice = BillingPermissions.CanCreateInvoice
CanUpdateInvoice = BillingPermissions.CanUpdateInvoice
CanProcessPayment = BillingPermissions.CanProcessPayment
CanSubmitInsuranceClaim = BillingPermissions.CanSubmitInsuranceClaim
CanProcessInsuranceClaim = BillingPermissions.CanProcessInsuranceClaim

# Legacy classes - mapped to new permissions for backward compatibility
class IsAdminOrBillingStaff:
    def __new__(cls):
        return IsAdmin()

class IsPatientOwner:
    def __new__(cls):
        return CanViewInvoices()

class IsAdminOrOwner:
    def __new__(cls):
        return CanViewInvoices()
