import apiClient from "./api-client"

export interface TestType {
  id: number
  name: string
  code: string
  description: string
  category: string
  sample_type: string
  processing_time: number
  instructions: string
  created_at: string
  updated_at: string
}

export interface LabTest {
  id: number
  patient_id: number
  test_type: number
  test_type_details?: TestType
  ordered_by: number
  ordered_by_details?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  ordered_at: string
  priority: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface LabTestWithDetails extends LabTest {
  patient: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  results: TestResult[]
  sample_collection?: SampleCollection
}

export interface TestResult {
  id: number
  lab_test: number
  parameter: string
  value: string
  unit: string
  reference_range: string
  is_abnormal: boolean
  performed_by: number
  performed_by_details?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  performed_at: string
  notes: string
  created_at: string
  updated_at: string
}

export interface SampleCollection {
  id: number
  lab_test: number
  collected_by: number
  collected_by_details?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  collected_at: string
  sample_type: string
  sample_container: string
  sample_volume: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface LabNotification {
  id: number
  lab_test: number
  recipient_id: number
  notification_type: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
}

const LaboratoryService = {
  // Test types
  async getAllTestTypes(): Promise<TestType[]> {
    const response = await apiClient.get("/api/test-types/")
    return response.data
  },

  async createTestType(data: Partial<TestType>): Promise<TestType> {
    const response = await apiClient.post("/api/test-types/", data)
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

  async getLabTestById(id: number): Promise<LabTestWithDetails> {
    const response = await apiClient.get(`/api/lab-tests/${id}/`)
    return response.data
  },

  async updateLabTest(id: number, data: Partial<LabTest>): Promise<LabTest> {
    const response = await apiClient.put(`/api/lab-tests/${id}/`, data)
    return response.data
  },

  // Test results
  async getAllTestResults(): Promise<TestResult[]> {
    const response = await apiClient.get("/api/test-results/")
    return response.data
  },

  async createTestResult(data: Partial<TestResult>): Promise<TestResult> {
    const response = await apiClient.post("/api/test-results/", data)
    return response.data
  },

  // Sample collections
  async getAllSampleCollections(): Promise<SampleCollection[]> {
    const response = await apiClient.get("/api/sample-collections/")
    return response.data
  },

  async createSampleCollection(data: Partial<SampleCollection>): Promise<SampleCollection> {
    const response = await apiClient.post("/api/sample-collections/", data)
    return response.data
  },

  // Lab notifications
  async getLabNotifications(): Promise<LabNotification[]> {
    const response = await apiClient.get("/api/lab-notifications/")
    return response.data
  },

  async createLabNotification(data: Partial<LabNotification>): Promise<LabNotification> {
    const response = await apiClient.post("/api/lab-notifications/", data)
    return response.data
  },
}

export default LaboratoryService
