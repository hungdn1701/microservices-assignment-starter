import apiClient from "./api-client"

export interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  bloodType?: string
  allergies?: string[]
  medicalConditions?: string[]
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  insuranceInfo?: {
    provider: string
    policyNumber: string
    groupNumber?: string
    expirationDate?: string
  }
  createdAt: string
  updatedAt: string
}

export interface PatientListParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PatientListResponse {
  data: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const PatientService = {
  getPatients: async (params: PatientListParams = {}): Promise<PatientListResponse> => {
    const response = await apiClient.get("/patients", { params })
    return response.data
  },

  getPatientById: async (id: string): Promise<Patient> => {
    const response = await apiClient.get(`/patients/${id}`)
    return response.data
  },

  createPatient: async (data: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> => {
    const response = await apiClient.post("/patients", data)
    return response.data
  },

  updatePatient: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.put(`/patients/${id}`, data)
    return response.data
  },

  deletePatient: async (id: string): Promise<void> => {
    await apiClient.delete(`/patients/${id}`)
  },

  getPatientMedicalRecords: async (patientId: string): Promise<any[]> => {
    const response = await apiClient.get(`/patients/${patientId}/medical-records`)
    return response.data
  },

  getPatientAppointments: async (patientId: string): Promise<any[]> => {
    const response = await apiClient.get(`/patients/${patientId}/appointments`)
    return response.data
  },

  getPatientPrescriptions: async (patientId: string): Promise<any[]> => {
    const response = await apiClient.get(`/patients/${patientId}/prescriptions`)
    return response.data
  },

  getPatientLabResults: async (patientId: string): Promise<any[]> => {
    const response = await apiClient.get(`/patients/${patientId}/lab-results`)
    return response.data
  },
}

export default PatientService
