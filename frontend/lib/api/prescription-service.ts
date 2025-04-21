import apiClient from "./api-client"

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  date: string
  medications: Medication[]
  status: "active" | "completed" | "cancelled"
  notes?: string
  refills: number
  refillsRemaining: number
  createdAt: string
  updatedAt: string
}

export interface PrescriptionWithDetails extends Prescription {
  patient: {
    id: string
    firstName: string
    lastName: string
  }
  doctor: {
    id: string
    firstName: string
    lastName: string
    specialty: string
  }
}

export interface PrescriptionListParams {
  page?: number
  limit?: number
  patientId?: string
  doctorId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface PrescriptionListResponse {
  data: PrescriptionWithDetails[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const PrescriptionService = {
  getPrescriptions: async (params: PrescriptionListParams = {}): Promise<PrescriptionListResponse> => {
    const response = await apiClient.get("/prescriptions", { params })
    return response.data
  },

  getPrescriptionById: async (id: string): Promise<PrescriptionWithDetails> => {
    const response = await apiClient.get(`/prescriptions/${id}`)
    return response.data
  },

  createPrescription: async (data: Omit<Prescription, "id" | "createdAt" | "updatedAt">): Promise<Prescription> => {
    const response = await apiClient.post("/prescriptions", data)
    return response.data
  },

  updatePrescription: async (id: string, data: Partial<Prescription>): Promise<Prescription> => {
    const response = await apiClient.put(`/prescriptions/${id}`, data)
    return response.data
  },

  cancelPrescription: async (id: string, reason?: string): Promise<Prescription> => {
    const response = await apiClient.post(`/prescriptions/${id}/cancel`, { reason })
    return response.data
  },

  requestRefill: async (id: string): Promise<Prescription> => {
    const response = await apiClient.post(`/prescriptions/${id}/refill`)
    return response.data
  },

  approveRefill: async (id: string, pharmacistId: string): Promise<Prescription> => {
    const response = await apiClient.post(`/prescriptions/${id}/approve-refill`, { pharmacistId })
    return response.data
  },
}

export default PrescriptionService
