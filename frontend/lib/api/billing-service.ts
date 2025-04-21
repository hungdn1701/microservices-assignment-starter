import apiClient from "./api-client"

export interface Invoice {
  id: number
  patient_id: number
  invoice_date: string
  due_date: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

export interface InvoiceWithDetails extends Invoice {
  patient: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  items: InvoiceItem[]
  payments: Payment[]
  insurance_claims: InsuranceClaim[]
  total_amount: number
  paid_amount: number
  balance: number
}

export interface InvoiceItem {
  id: number
  invoice: number
  item_type: string
  description: string
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  total: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  invoice: number
  payment_date: string
  payment_method: string
  amount: number
  reference_number: string
  notes: string
  created_at: string
  updated_at: string
}

export interface InsuranceClaim {
  id: number
  invoice: number
  insurance_provider_id: number
  insurance_provider_details?: {
    id: number
    name: string
    contact_person: string
    email: string
    phone: string
  }
  policy_number: string
  claim_amount: number
  approved_amount: number
  diagnosis_codes: string
  status: string
  notes: string
  created_at: string
  updated_at: string
}

const BillingService = {
  // Invoices
  async getAllInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get("/api/invoices/")
    return response.data
  },

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const response = await apiClient.post("/api/invoices/", data)
    return response.data
  },

  async getInvoiceById(id: number): Promise<InvoiceWithDetails> {
    const response = await apiClient.get(`/api/invoices/${id}/`)
    return response.data
  },

  async addItemToInvoice(invoiceId: number, data: Partial<InvoiceItem>): Promise<InvoiceItem> {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/add_item/`, data)
    return response.data
  },

  async addPaymentToInvoice(invoiceId: number, data: Partial<Payment>): Promise<Payment> {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/add_payment/`, data)
    return response.data
  },

  async submitInsuranceClaim(invoiceId: number, data: Partial<InsuranceClaim>): Promise<InsuranceClaim> {
    const response = await apiClient.post(`/api/invoices/${invoiceId}/submit_insurance_claim/`, data)
    return response.data
  },

  // Invoice items
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const response = await apiClient.get(`/api/invoice-items/?invoice=${invoiceId}`)
    return response.data
  },

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    const response = await apiClient.get("/api/payments/")
    return response.data
  },

  // Insurance claims
  async getAllInsuranceClaims(): Promise<InsuranceClaim[]> {
    const response = await apiClient.get("/api/insurance-claims/")
    return response.data
  },

  async updateInsuranceClaimStatus(
    id: number,
    data: { status: string; approved_amount: number; notes: string },
  ): Promise<InsuranceClaim> {
    const response = await apiClient.post(`/api/insurance-claims/${id}/update_status/`, data)
    return response.data
  },
}

export default BillingService
