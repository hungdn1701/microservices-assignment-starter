import apiClient from "./api-client"

export interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  record_date: string
  record_type: string
  chief_complaint: string
  present_illness: string
  notes: string
  created_at: string
  updated_at: string
}

export interface MedicalRecordWithDetails extends MedicalRecord {
  patient: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  doctor: {
    id: number
    first_name: string
    last_name: string
    email: string
    specialty: string
  }
  diagnoses: Diagnosis[]
  treatments: Treatment[]
  vital_signs: VitalSign[]
  allergies: Allergy[]
}

export interface Diagnosis {
  id: number
  medical_record: number
  diagnosis_code: string
  diagnosis_name: string
  diagnosis_date: string
  diagnosis_type: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: number
  diagnosis: number
  treatment_type: string
  treatment_name: string
  start_date: string
  end_date: string
  dosage: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Allergy {
  id: number
  medical_record: number
  allergen: string
  reaction: string
  severity: string
  onset_date: string
  notes: string
  created_at: string
  updated_at: string
}

export interface VitalSign {
  id: number
  medical_record: number
  temperature: number
  heart_rate: number
  respiratory_rate: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  oxygen_saturation: number
  measured_at: string
  notes: string
  created_at: string
  updated_at: string
}

export interface LabTest {
  id: number
  medical_record: number
  test_name: string
  test_code: string
  ordered_by: number
  ordered_at: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: number
  lab_test: number
  result_value: string
  reference_range: string
  is_abnormal: boolean
  performed_by: number
  performed_at: string
  verified_by: number
  verified_at: string
  notes: string
  created_at: string
  updated_at: string
}

const MedicalRecordService = {
  async getAllMedicalRecords(): Promise<MedicalRecordWithDetails[]> {
    const response = await apiClient.get("/api/medical-records/")
    return response.data
  },

  async createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const response = await apiClient.post("/api/medical-records/", data)
    return response.data
  },

  async getMedicalRecordById(id: number): Promise<MedicalRecordWithDetails> {
    const response = await apiClient.get(`/api/medical-records/${id}/`)
    return response.data
  },

  async updateMedicalRecord(id: number, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const response = await apiClient.put(`/api/medical-records/${id}/`, data)
    return response.data
  },

  async getMedicalRecordSummary(id: number): Promise<any> {
    const response = await apiClient.get(`/api/medical-records/${id}/summary/`)
    return response.data
  },

  // Diagnoses
  async getAllDiagnoses(): Promise<Diagnosis[]> {
    const response = await apiClient.get("/api/diagnoses/")
    return response.data
  },

  async createDiagnosis(data: Partial<Diagnosis>): Promise<Diagnosis> {
    const response = await apiClient.post("/api/diagnoses/", data)
    return response.data
  },

  // Treatments
  async getAllTreatments(): Promise<Treatment[]> {
    const response = await apiClient.get("/api/treatments/")
    return response.data
  },

  async createTreatment(data: Partial<Treatment>): Promise<Treatment> {
    const response = await apiClient.post("/api/treatments/", data)
    return response.data
  },

  // Allergies
  async getAllAllergies(): Promise<Allergy[]> {
    const response = await apiClient.get("/api/allergies/")
    return response.data
  },

  async createAllergy(data: Partial<Allergy>): Promise<Allergy> {
    const response = await apiClient.post("/api/allergies/", data)
    return response.data
  },

  // Vital signs
  async getAllVitalSigns(): Promise<VitalSign[]> {
    const response = await apiClient.get("/api/vital-signs/")
    return response.data
  },

  async createVitalSign(data: Partial<VitalSign>): Promise<VitalSign> {
    const response = await apiClient.post("/api/vital-signs/", data)
    return response.data
  },

  // Lab tests
  async getAllLabTests(): Promise<LabTest[]> {
    const response = await apiClient.get("/api/lab-tests/")
    return response.data
  },

  async createLabTest(data: Partial<LabTest>): Promise<LabTest> {
    const response = await apiClient.post("/api/lab-tests/", data)
    return response.data
  },

  // Lab results
  async getAllLabResults(): Promise<LabResult[]> {
    const response = await apiClient.get("/api/lab-results/")
    return response.data
  },

  async createLabResult(data: Partial<LabResult>): Promise<LabResult> {
    const response = await apiClient.post("/api/lab-results/", data)
    return response.data
  },
}

export default MedicalRecordService
