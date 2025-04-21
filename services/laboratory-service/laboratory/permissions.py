"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from common_auth.permissions import LaboratoryPermissions, IsAdmin, IsDoctor, IsPatient, IsLabTechnician, IsNurse

# Re-export for backward compatibility
CanViewLabTests = LaboratoryPermissions.CanViewLabTests
CanOrderLabTest = LaboratoryPermissions.CanOrderLabTest
CanUpdateLabTest = LaboratoryPermissions.CanUpdateLabTest
CanCancelLabTest = LaboratoryPermissions.CanCancelLabTest
CanEnterLabResults = LaboratoryPermissions.CanEnterLabResults