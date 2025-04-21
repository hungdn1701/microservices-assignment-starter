import apiClient from "./api-client"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role?: string // Role là tùy chọn, backend sẽ mặc định là PATIENT
  gender?: string
  phone_number?: string
  birth_date?: string
}

interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    gender?: string
    phone_number?: string
    birth_date?: string
  }
}

const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/login/", credentials);

      // Lưu token và thông tin người dùng
      if (response.data.access && response.data.refresh) {
        // Lưu trực tiếp vào localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", response.data.access);
          localStorage.setItem("refreshToken", response.data.refresh);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          if (response.data.user?.role) {
            localStorage.setItem("userRole", response.data.user.role);
          }
        }

        // Gọi các phương thức helper
        this.setTokens(response.data.access, response.data.refresh);
        this.saveUserInfo(response.data.user);
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/register/", data);

      // Lưu token và thông tin người dùng nếu đăng ký thành công
      if (response.data.access && response.data.refresh) {
        this.setTokens(response.data.access, response.data.refresh);
        this.saveUserInfo(response.data.user);
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async logout(refreshToken: string): Promise<void> {
    // Xóa token trước tiên để đảm bảo người dùng luôn được đăng xuất
    this.clearTokens()

    // Nếu không có refresh token, không cần gọi API
    if (!refreshToken || refreshToken === "mock_refresh_token") {
      return
    }

    try {
      // Gọi API đăng xuất để blacklist token trên server
      // Thử cả hai cách gọi API
      try {
        // Cách 1: Sử dụng refresh_token
        await apiClient.post("/api/auth/logout/", { refresh_token: refreshToken })
        return
      } catch (error1) {
        try {
          // Cách 2: Sử dụng refresh
          await apiClient.post("/api/auth/logout/", { refresh: refreshToken })
        } catch (error2: any) {
          // Không cần xử lý lỗi ở đây vì đã xóa token trên client
        }
      }
    } catch (error: any) {
      // Không cần xử lý lỗi ở đây vì đã xóa token trên client
    }
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await apiClient.post("/api/auth/token/refresh/", { refresh: refreshToken })
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async validateToken(): Promise<{ valid: boolean; user: any }> {
    try {
      // Kiểm tra xem có token trong localStorage không
      const token = this.getToken();
      if (!token) {
        return { valid: false, user: null };
      }

      // Gọi API để xác thực token
      const response = await apiClient.get("/api/auth/validate-token/");

      // API Gateway trả về thông tin người dùng nếu token hợp lệ, hoặc các trường null nếu token không hợp lệ
      if (response.data && response.data.id && response.data.email && response.data.role) {
        // Trả về thông tin người dùng với valid=true
        return {
          valid: true,
          user: {
            id: response.data.id,
            email: response.data.email,
            role: response.data.role,
            first_name: response.data.first_name,
            last_name: response.data.last_name
          }
        };
      } else {
        // Nếu API không trả về thông tin người dùng hợp lệ, thử lấy từ localStorage
        const savedUser = this.getUserInfo();
        if (savedUser) {
          return { valid: true, user: savedUser };
        }
      }

      // Nếu không có thông tin người dùng hợp lệ, trả về token không hợp lệ
      return { valid: false, user: null };
    } catch (error: any) {
      // Nếu gặp lỗi khi gọi API, thử lấy thông tin người dùng từ localStorage
      try {
        const savedUser = this.getUserInfo();
        if (savedUser) {
          return { valid: true, user: savedUser };
        }
      } catch (localStorageError) {
        // Không cần xử lý lỗi ở đây
      }

      return { valid: false, user: null };
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token")
    }
    return null
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken")
    }
    return null
  },

  setTokens(access: string, refresh: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("token", access);
        localStorage.setItem("refreshToken", refresh);
      } catch (error) {
        // Không cần xử lý lỗi ở đây
      }
    }
  },

  clearTokens(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
      } catch (error) {
        // Không cần xử lý lỗi ở đây
      }
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  saveUserInfo(user: any): void {
    if (typeof window !== "undefined") {
      try {
        const userJson = JSON.stringify(user);
        localStorage.setItem("user", userJson);

        if (user.role) {
          localStorage.setItem("userRole", user.role);
        }
      } catch (error) {
        // Không cần xử lý lỗi ở đây
      }
    }
  },

  getUserInfo(): any {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user")
      if (userJson) {
        try {
          return JSON.parse(userJson)
        } catch (error) {
          return null
        }
      }
    }
    return null
  },

  getUserRole(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userRole")
    }
    return null
  }
}

export default AuthService
