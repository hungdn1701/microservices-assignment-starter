import apiClient from "./api-client"

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  date_joined: string
  last_login: string
}

export interface PatientProfile {
  id: number
  user: number
  date_of_birth: string
  gender: string
  blood_type: string
  height: number
  weight: number
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  allergies: string
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: number
  user: number
  specialty: string
  license_number: string
  education: string
  experience_years: number
  bio: string
  consultation_fee: number
  available_for_appointments: boolean
  created_at: string
  updated_at: string
}

export interface NurseProfile {
  id: number
  user: number
  department: string
  license_number: string
  education: string
  experience_years: number
  created_at: string
  updated_at: string
}

export interface Address {
  id: number
  user: number
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: number
  user: number
  phone_number: string
  alternative_email: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  user: number
  document_type: string
  file: string
  description: string
  is_verified: boolean
  verification_notes: string
  uploaded_at: string
  verified_at: string
}

const UserService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get("/api/users/me/")
    return response.data
  },

  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get("/api/users/")
    return response.data
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/api/users/${id}/`)
    return response.data
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/api/users/${id}/`, data)
    return response.data
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/api/users/${id}/`)
  },

  // Lấy danh sách bác sĩ
  async getDoctors(filters?: { specialty?: string, name?: string }): Promise<User[]> {
    try {
      // Xây dựng query string từ các filter
      let queryParams = "";

      // Thêm các tham số lọc nếu có
      if (filters?.specialty && filters.specialty !== 'all') {
        queryParams += `specialty=${encodeURIComponent(filters.specialty)}`;
      }

      if (filters?.name) {
        if (queryParams) queryParams += '&';
        queryParams += `search=${encodeURIComponent(filters.name)}`;
      }

      console.log("Fetching doctors with query:", queryParams);
      console.log("Token exists:", !!localStorage.getItem("token"));

      // Gọi API mới lấy danh sách bác sĩ
      const url = queryParams ? `/api/doctors/?${queryParams}` : '/api/doctors/';
      const response = await apiClient.get(url);
      console.log("Doctors API response:", response);
      console.log("Doctors data:", response.data);

      // Xử lý dữ liệu trả về để đảm bảo định dạng đúng
      const doctors = Array.isArray(response.data) ? response.data :
                   (response.data.results ? response.data.results : []);

      // Thêm xử lý để đảm bảo các trường cần thiết
      return doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.first_name && doctor.last_name
              ? `${doctor.first_name} ${doctor.last_name}`
              : (doctor.name || "Chưa cập nhật tên"),
        specialty: doctor.doctor_profile?.specialization || "Chưa cập nhật chuyên khoa",
        avatar: doctor.profile_image || "/placeholder-doctor.png",
        experience: doctor.doctor_profile?.years_of_experience || "Chưa cập nhật",
        workingDays: doctor.doctor_profile?.working_days || [],
        department: doctor.doctor_profile?.department || "Chưa cập nhật",
        education: doctor.doctor_profile?.education || "Chưa cập nhật",
        biography: doctor.doctor_profile?.biography || ""
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error)
      return []
    }
  },

  // Lấy danh sách bác sĩ có lịch trống trong khoảng thời gian
  async getDoctorsWithAvailability(startDate: string, endDate: string, specialty?: string): Promise<User[]> {
    try {
      // Sử dụng API thông thường vì API /api/doctors/available/ không tồn tại
      let queryParams = "";

      if (specialty && specialty !== 'all') {
        queryParams += `specialty=${encodeURIComponent(specialty)}`;
      }

      console.log("Fetching doctors with query:", queryParams);

      // Gọi API thông thường để lấy danh sách bác sĩ
      const url = queryParams ? `/api/doctors/?${queryParams}` : '/api/doctors/';
      const response = await apiClient.get(url);
      console.log("Doctors API response:", response);

      // Xử lý dữ liệu trả về
      const doctors = Array.isArray(response.data) ? response.data :
                   (response.data.results ? response.data.results : []);

      // Thêm xử lý để đảm bảo các trường cần thiết
      return doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.first_name && doctor.last_name
              ? `${doctor.first_name} ${doctor.last_name}`
              : (doctor.name || "Chưa cập nhật tên"),
        specialty: doctor.doctor_profile?.specialization || "Chưa cập nhật chuyên khoa",
        avatar: doctor.profile_image || "/placeholder-doctor.png",
        experience: doctor.doctor_profile?.years_of_experience || "Chưa cập nhật",
        workingDays: doctor.doctor_profile?.working_days || [],
        department: doctor.doctor_profile?.department || "Chưa cập nhật",
        availableDates: doctor.available_dates || [],
        availableSlots: doctor.available_slots || 0
      }));
    } catch (error) {
      console.error("Error fetching doctors with availability:", error)
      return [];
    }
  },

  // Lấy danh sách chuyên khoa
  async getSpecialties(department?: string): Promise<any[]> {
    try {
      console.log("Fetching specialties", department ? `for department ${department}` : "");

      // Thêm tham số department nếu có
      const url = department
        ? `/api/specialties/?department=${encodeURIComponent(department)}`
        : "/api/specialties/";

      const response = await apiClient.get(url);
      console.log("Specialties response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching specialties:", error.response?.status, error.response?.data);
      // Sử dụng dữ liệu mặc định nếu không lấy được từ API
      return [
        { id: "NOI_TIM_MACH", name: "Chuyên khoa Tim mạch", description: "Chuyên khoa về chẩn đoán và điều trị các bệnh lý tim mạch", department: "KHOA_NOI" },
        { id: "NOI_TIEU_HOA", name: "Chuyên khoa Tiêu hóa", description: "Chuyên khoa về chẩn đoán và điều trị các bệnh lý đường tiêu hóa", department: "KHOA_NOI" },
        { id: "NOI_THAN_KINH", name: "Chuyên khoa Thần kinh", description: "Chuyên khoa về chẩn đoán và điều trị các bệnh lý thần kinh", department: "KHOA_NOI" },
        { id: "NHI_TONG_QUAT", name: "Chuyên khoa Nhi Tổng quát", description: "Chuyên khoa về chăm sóc sức khỏe trẻ em tổng quát", department: "KHOA_NHI" },
        { id: "SAN_KHOA", name: "Chuyên khoa Sản", description: "Chuyên khoa về chăm sóc thai sản và đứa trẻ sơ sinh", department: "KHOA_SAN" },
        { id: "PHU_KHOA", name: "Chuyên khoa Phụ khoa", description: "Chuyên khoa về chẩn đoán và điều trị các bệnh lý phụ khoa", department: "KHOA_SAN" },
      ];
    }
  },

  // Lấy danh sách khoa
  async getDepartments(): Promise<any[]> {
    try {
      console.log("Fetching departments");
      const response = await apiClient.get("/api/departments/");
      console.log("Departments response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching departments:", error.response?.status, error.response?.data);
      // Sử dụng dữ liệu mặc định nếu không lấy được từ API
      return [
        { id: "KHOA_NOI", name: "Khoa Nội", description: "Khoa chịu trách nhiệm chẩn đoán và điều trị các bệnh nội khoa" },
        { id: "KHOA_NGOAI", name: "Khoa Ngoại", description: "Khoa chịu trách nhiệm phẫu thuật và điều trị các bệnh ngoại khoa" },
        { id: "KHOA_SAN", name: "Khoa Sản - Phụ khoa", description: "Khoa chăm sóc sức khỏe phụ nữ và thai sản" },
        { id: "KHOA_NHI", name: "Khoa Nhi", description: "Khoa chăm sóc sức khỏe trẻ em từ sơ sinh đến 16 tuổi" },
        { id: "KHOA_CAP_CUU", name: "Khoa Cấp cứu", description: "Khoa tiếp nhận và xử lý các trường hợp cấp cứu" },
      ];
    }
  },

  // Patient profile
  async getPatientProfile(): Promise<PatientProfile> {
    const response = await apiClient.get("/api/patient-profile/")
    return response.data
  },

  async updatePatientProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
    const response = await apiClient.put("/api/patient-profile/", data)
    return response.data
  },

  // Doctor profile
  async getDoctorProfile(): Promise<DoctorProfile> {
    const response = await apiClient.get("/api/doctor-profile/")
    return response.data
  },

  async updateDoctorProfile(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await apiClient.put("/api/doctor-profile/", data)
    return response.data
  },

  // Nurse profile
  async getNurseProfile(): Promise<NurseProfile> {
    const response = await apiClient.get("/api/nurse-profile/")
    return response.data
  },

  async updateNurseProfile(data: Partial<NurseProfile>): Promise<NurseProfile> {
    const response = await apiClient.put("/api/nurse-profile/", data)
    return response.data
  },

  // Addresses
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get("/api/addresses/")
    return response.data
  },

  async createAddress(data: Partial<Address>): Promise<Address> {
    const response = await apiClient.post("/api/addresses/", data)
    return response.data
  },

  async updateAddress(id: number, data: Partial<Address>): Promise<Address> {
    const response = await apiClient.put(`/api/addresses/${id}/`, data)
    return response.data
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/api/addresses/${id}/`)
  },

  // Contact info
  async getContactInfo(): Promise<ContactInfo> {
    const response = await apiClient.get("/api/contact-info/")
    return response.data
  },

  async updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
    const response = await apiClient.put("/api/contact-info/", data)
    return response.data
  },

  // Documents
  async getDocuments(): Promise<Document[]> {
    const response = await apiClient.get("/api/documents/")
    return response.data
  },

  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await apiClient.post("/api/documents/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  async verifyDocument(id: number, data: { is_verified: boolean; verification_notes: string }): Promise<Document> {
    const response = await apiClient.post(`/api/documents/${id}/verify/`, data)
    return response.data
  },

  // Admin endpoints
  async getAllPatientProfiles(): Promise<PatientProfile[]> {
    const response = await apiClient.get("/api/admin/patient-profiles/")
    return response.data
  },

  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    const response = await apiClient.get("/api/admin/doctor-profiles/")
    return response.data
  },
}

export default UserService
