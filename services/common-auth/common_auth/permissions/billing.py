"""
Billing-specific permissions for the healthcare system.
These classes control access to billing resources based on user roles.
"""
from .base import BasePermission
from .roles import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_INSURANCE_PROVIDER
)


class BillingPermissions:
    """
    Container for all billing-related permissions.
    Usage:
        @permission_classes([BillingPermissions.CanViewInvoices])
        def list_invoices(request):
            ...
    """
    
    class CanViewInvoices(BasePermission):
        """
        Permission to view invoices.
        - Admins can view all invoices
        - Patients can view only their own invoices
        - Insurance providers can view invoices for their customers
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Admin can view all invoices
            if user.role == ROLE_ADMIN:
                return True
                
            # Patients, insurance providers can access but with object-level filtering
            if user.role in [ROLE_PATIENT, ROLE_INSURANCE_PROVIDER]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user.role} not allowed to view invoices")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any invoice
            if user_role == ROLE_ADMIN:
                return True
                
            # Patient can view their own invoices
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Insurance provider can view invoices for their customers
            if user_role == ROLE_INSURANCE_PROVIDER:
                insurance_provider_id = getattr(obj, 'insurance_provider_id', None)
                if insurance_provider_id and str(insurance_provider_id) == str(user_id):
                    return True
                self.log_access_denied(request, f"Insurance provider does not have access to this invoice")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to view invoice {self.get_object_identifier(obj)}")
            return False
    
    class CanCreateInvoice(BasePermission):
        """
        Permission to create invoices.
        - Admins can create invoices
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            
            # Only admin can create invoices
            if user_role == ROLE_ADMIN:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to create invoices")
            return False
    
    class CanUpdateInvoice(BasePermission):
        """
        Permission to update invoices.
        - Admins can update any invoice
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role
            user_role = getattr(user, 'role', None)
            
            # Only admin can update invoices
            if user_role == ROLE_ADMIN:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Only admins can update invoices")
            return False
    
    class CanProcessPayment(BasePermission):
        """
        Permission to process payments.
        - Admins can process any payment
        - Patients can process payments for their own invoices
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can process any payment
            if user_role == ROLE_ADMIN:
                return True
                
            # Patient can process their own payments
            if user_role == ROLE_PATIENT:
                invoice_id = request.data.get('invoice_id')
                if not invoice_id:
                    self.log_access_denied(request, f"Missing invoice_id in payment request")
                    return False
                
                # Would need to check if invoice belongs to patient
                # This would typically involve a database query
                # For now, we'll defer to has_object_permission
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to process payments")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can process any payment
            if user_role == ROLE_ADMIN:
                return True
                
            # Patient can process payments for their own invoices
            if user_role == ROLE_PATIENT:
                # Check if the invoice belongs to the patient
                invoice = getattr(obj, 'invoice', None)
                if invoice and str(getattr(invoice, 'patient_id', None)) == str(user_id):
                    return True
                
                self.log_access_denied(request, f"Patient can only process payments for their own invoices")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to process this payment")
            return False
    
    class CanSubmitInsuranceClaim(BasePermission):
        """
        Permission to submit insurance claims.
        - Admins can submit insurance claims
        - Patients can submit insurance claims for their own invoices
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can submit any insurance claim
            if user_role == ROLE_ADMIN:
                return True
                
            # Patient can submit their own insurance claims
            if user_role == ROLE_PATIENT:
                invoice_id = request.data.get('invoice_id')
                if not invoice_id:
                    self.log_access_denied(request, f"Missing invoice_id in insurance claim")
                    return False
                
                # Would need to check if invoice belongs to patient
                # This would typically involve a database query
                # For now, we'll defer to has_object_permission
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to submit insurance claims")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can submit any insurance claim
            if user_role == ROLE_ADMIN:
                return True
                
            # Patient can submit insurance claims for their own invoices
            if user_role == ROLE_PATIENT:
                # Check if the invoice belongs to the patient
                invoice_id = getattr(obj, 'invoice_id', None)
                patient_id = getattr(obj, 'patient_id', None)
                
                if patient_id and str(patient_id) == str(user_id):
                    return True
                
                self.log_access_denied(request, f"Patient can only submit insurance claims for their own invoices")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to submit this insurance claim")
            return False
    
    class CanProcessInsuranceClaim(BasePermission):
        """
        Permission to process insurance claims.
        - Admins can process any insurance claim
        - Insurance providers can process claims submitted to them
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can process any insurance claim
            if user_role == ROLE_ADMIN:
                return True
                
            # Insurance provider can process claims submitted to them
            if user_role == ROLE_INSURANCE_PROVIDER:
                insurance_provider_id = getattr(obj, 'insurance_provider_id', None)
                if insurance_provider_id and str(insurance_provider_id) == str(user_id):
                    return True
                
                self.log_access_denied(request, f"Insurance provider can only process claims submitted to them")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to process this insurance claim")
            return False