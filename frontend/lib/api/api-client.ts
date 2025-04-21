import axios from "axios"

// Lấy URL API từ biến môi trường hoặc sử dụng URL mặc định
// Lưu ý: Để tránh lặp lại /api/ trong URL, chúng ta sẽ sử dụng URL gốc
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

console.log("API URL:", API_URL) // Ghi log để debug

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Thêm timeout để tránh chờ quá lâu
  timeout: 10000,
})

// Interceptor để thêm token vào header và log request
apiClient.interceptors.request.use(
  (config) => {
    // Log request để debug
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });

    // Thêm token vào header nếu có
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Interceptor để xử lý refresh token khi token hết hạn và log response
apiClient.interceptors.response.use(
  (response) => {
    // Log response để debug
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });
    return response
  },
  async (error) => {
    // Log lỗi response để debug
    console.error(`[API Error] ${error.response?.status || 'Unknown'} ${error.config?.method?.toUpperCase() || 'Unknown'} ${error.config?.url || 'Unknown'}`, {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });

    const originalRequest = error.config

    // Kiểm tra xem lỗi có phải do mạng không
    if (error.message === "Network Error") {
      console.error("Network error - không thể kết nối đến API:", API_URL)
      return Promise.reject({
        ...error,
        response: {
          data: {
            detail: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc thử lại sau.",
          },
        },
      })
    }

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Lấy refresh token từ localStorage
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          // Không có refresh token, chuyển hướng đến trang đăng nhập
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          return Promise.reject(error)
        }

        // Gọi API refresh token
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        // Lưu token mới
        const { access } = response.data
        localStorage.setItem("token", access)

        // Thử lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error("Refresh token error:", refreshError)
        // Refresh token thất bại, đăng xuất người dùng
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Method trợ giúp để kiểm tra thông tin người dùng hiện tại
apiClient.getCurrentUser = async function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found when getting current user');
      return null;
    }

    // Log token đang dùng để debug
    console.log('Using token for getCurrentUser:', `${token.substring(0, 15)}...`);

    // Gọi API để lấy thông tin người dùng hiện tại
    const response = await this.get('/api/users/me/');
    console.log('Current user API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting current user:', error.response?.status, error.response?.data || error.message);

    return null;
  }
};

export default apiClient
