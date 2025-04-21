"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AuthService from "@/lib/api/auth-service"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  token: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Các đường dẫn không yêu cầu xác thực
const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/", "/about", "/contact"]

// Dữ liệu mẫu cho môi trường phát triển
const mockUsers = {
  patient: {
    id: 1,
    email: "patient@example.com",
    first_name: "Nguyễn",
    last_name: "Bệnh Nhân",
    role: "PATIENT",
  },
  doctor: {
    id: 2,
    email: "doctor@example.com",
    first_name: "Trần",
    last_name: "Bác Sĩ",
    role: "DOCTOR",
  },
  admin: {
    id: 3,
    email: "admin@example.com",
    first_name: "Lê",
    last_name: "Quản Trị",
    role: "ADMIN",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Hàm để xử lý đăng nhập mẫu trong môi trường phát triển
  const handleMockLogin = (email: string, password: string) => {
    if (email === "patient@example.com" && password === "password123") {
      return mockUsers.patient
    } else if (email === "doctor@example.com" && password === "password123") {
      return mockUsers.doctor
    } else if (email === "admin@example.com" && password === "password123") {
      return mockUsers.admin
    }
    throw new Error("Email hoặc mật khẩu không đúng")
  }

  // Khi component mount, kiểm tra và lấy token từ localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);
    if (storedRefreshToken) setRefreshToken(storedRefreshToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi khi parse thông tin người dùng:", e);
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        if (token) {
          try {
            const { valid, user } = await AuthService.validateToken()

            if (valid && user) {
              setUser(user)
              // Lưu thông tin người dùng vào localStorage để sử dụng trong môi trường phát triển
              localStorage.setItem("user", JSON.stringify(user))
            } else {
              // Kiểm tra xem có phải đang ở trang đăng nhập không
              const isLoginPage = pathname === "/login";

              // Nếu đang ở trang đăng nhập, không xóa token vì có thể đang trong quá trình đăng nhập
              if (!isLoginPage) {
                // Token không hợp lệ, đăng xuất
                setToken(null);
                setRefreshToken(null);
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("userRole");

                // Chỉ chuyển hướng nếu đang ở trang yêu cầu xác thực
                if (!publicPaths.some((path) => pathname?.startsWith(path))) {
                  router.push("/login")
                }
              }
            }
          } catch (error) {
            console.error("Lỗi xác thực token:", error)

            // Thử lấy thông tin người dùng từ localStorage trong trường hợp không kết nối được API
            const savedUser = localStorage.getItem("user")
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser))
              } catch (e) {
                console.error("Lỗi khi parse thông tin người dùng:", e);
              }
            } else {
              console.log("[AuthProvider] Không có thông tin người dùng trong localStorage");

              // Kiểm tra xem có phải đang ở trang đăng nhập không
              const isLoginPage = pathname === "/login";

              // Nếu đang ở trang đăng nhập, không xóa token vì có thể đang trong quá trình đăng nhập
              if (!isLoginPage) {
                // Không có thông tin người dùng, đăng xuất
                AuthService.clearTokens()

                // Chỉ chuyển hướng nếu đang ở trang yêu cầu xác thực
                if (!publicPaths.some((path) => pathname?.startsWith(path))) {
                  router.push("/login")
                }
              }
            }
          }
        } else {
          // Chỉ chuyển hướng nếu đang ở trang yêu cầu xác thực
          if (!publicPaths.some((path) => pathname?.startsWith(path))) {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error)

        // Kiểm tra xem có phải đang ở trang đăng nhập không
        const isLoginPage = pathname === "/login";

        // Nếu đang ở trang đăng nhập, không xóa token vì có thể đang trong quá trình đăng nhập
        if (!isLoginPage) {
          AuthService.clearTokens()
          localStorage.removeItem("user")

          // Chỉ chuyển hướng nếu đang ở trang yêu cầu xác thực
          if (!publicPaths.some((path) => pathname?.startsWith(path))) {
            router.push("/login")
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      let userData: User
      let accessToken: string
      let refreshTokenValue: string

      try {
        // Thử đăng nhập với API thực tế
        const response = await AuthService.login({ email, password })
        userData = response.user
        accessToken = response.access
        refreshTokenValue = response.refresh
      } catch (apiError: any) {
        console.error("Lỗi API đăng nhập:", apiError)

        // Nếu đang ở môi trường phát triển và lỗi kết nối, sử dụng dữ liệu mẫu
        if (
          process.env.NODE_ENV === "development" &&
          (apiError.message === "Network Error" ||
            apiError.message?.includes("Failed to fetch") ||
            apiError.message?.includes("NetworkError"))
        ) {
          console.log("Sử dụng dữ liệu mẫu cho môi trường phát triển")
          userData = handleMockLogin(email, password)
          accessToken = "mock_access_token"
          refreshTokenValue = "mock_refresh_token"
        } else {
          throw apiError
        }
      }

      // Lưu token và thông tin người dùng vào state
      setToken(accessToken);
      setRefreshToken(refreshTokenValue);
      setUser(userData);

      // Lưu vào localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshTokenValue);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userRole", userData.role);

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${userData.first_name} quay trở lại!`,
      })

      // Chuyển hướng dựa trên vai trò
      switch (userData.role) {
        case "PATIENT":
          router.push("/dashboard/patient")
          break
        case "DOCTOR":
          router.push("/dashboard/doctor")
          break
        case "NURSE":
          router.push("/dashboard/nurse")
          break
        case "ADMIN":
          router.push("/dashboard/admin")
          break
        case "PHARMACIST":
          router.push("/dashboard/pharmacist")
          break
        case "LAB_TECH":
          router.push("/dashboard/lab-tech")
          break
        case "INSURANCE":
          router.push("/dashboard/insurance")
          break
        default:
          router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error)

      // Hiển thị thông báo lỗi cụ thể hơn
      let errorMessage = "Email hoặc mật khẩu không đúng"

      if (
        error.message === "Network Error" ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError") ||
        error.response?.data?.detail?.includes("không thể kết nối")
      ) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc thử lại sau."
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      let userData: User
      let accessToken: string
      let refreshToken: string

      try {
        // Thử đăng ký với API thực tế
        const response = await AuthService.register(data)
        userData = response.user
        accessToken = response.access
        refreshToken = response.refresh
      } catch (apiError: any) {
        console.error("Lỗi API đăng ký:", apiError)

        // Nếu đang ở môi trường phát triển và lỗi kết nối, sử dụng dữ liệu mẫu
        if (
          process.env.NODE_ENV === "development" &&
          (apiError.message === "Network Error" ||
            apiError.message?.includes("Failed to fetch") ||
            apiError.message?.includes("NetworkError"))
        ) {
          console.log("Sử dụng dữ liệu mẫu cho môi trường phát triển")
          userData = {
            id: 999,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role || "PATIENT",
          }
          accessToken = "mock_access_token"
          refreshToken = "mock_refresh_token"
        } else {
          throw apiError
        }
      }

      // Lưu token và thông tin người dùng
      AuthService.setTokens(accessToken, refreshToken)
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))

      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công!",
      })

      // Chuyển hướng dựa trên vai trò
      switch (userData.role) {
        case "PATIENT":
          router.push("/dashboard/patient")
          break
        default:
          router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error)

      // Hiển thị thông báo lỗi cụ thể hơn
      let errorMessage = "Có lỗi xảy ra khi đăng ký"

      if (
        error.message === "Network Error" ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError") ||
        error.response?.data?.detail?.includes("không thể kết nối")
      ) {
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn hoặc thử lại sau."
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Lấy refresh token hiện tại
      const refreshTokenValue = refreshToken

      // Xóa token và thông tin người dùng trong state trước
      setToken(null);
      setRefreshToken(null);
      setUser(null);

      // Xóa token và thông tin người dùng trong localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      // Gọi API đăng xuất (không chờ kết quả)
      if (refreshTokenValue) {
        // Sử dụng setTimeout để không chờ API trả về
        setTimeout(() => {
          AuthService.logout(refreshTokenValue).catch(error => {
            console.error("Lỗi khi gọi API đăng xuất:", error)
          })
        }, 0)
      }

      // Chuyển hướng về trang chính ngay lập tức
      router.push("/")

      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      })
    } catch (error) {
      console.error("Lỗi đăng xuất:", error)
      toast({
        title: "Đăng xuất thất bại",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Kiểm tra quyền dựa trên vai trò
    switch (user.role) {
      case "ADMIN":
        // Admin có tất cả quyền
        return true
      case "DOCTOR":
        // Quyền của bác sĩ
        return [
          "view_patient",
          "view_medical_record",
          "create_medical_record",
          "update_medical_record",
          "view_appointment",
          "create_appointment",
          "update_appointment",
          "view_prescription",
          "create_prescription",
          "view_lab_test",
          "create_lab_test",
        ].includes(permission)
      case "NURSE":
        // Quyền của y tá
        return [
          "view_patient",
          "view_medical_record",
          "update_medical_record",
          "view_appointment",
          "create_appointment",
          "update_appointment",
          "view_vital_sign",
          "create_vital_sign",
          "update_vital_sign",
        ].includes(permission)
      case "PATIENT":
        // Quyền của bệnh nhân
        return [
          "view_own_medical_record",
          "view_own_appointment",
          "create_own_appointment",
          "view_own_prescription",
          "view_own_lab_test",
        ].includes(permission)
      case "PHARMACIST":
        // Quyền của dược sĩ
        return [
          "view_prescription",
          "update_prescription",
          "view_medication",
          "create_medication",
          "update_medication",
          "view_inventory",
          "create_inventory",
          "update_inventory",
          "view_dispensing",
          "create_dispensing",
        ].includes(permission)
      case "LAB_TECH":
        // Quyền của kỹ thuật viên xét nghiệm
        return [
          "view_lab_test",
          "update_lab_test",
          "view_test_result",
          "create_test_result",
          "update_test_result",
          "view_sample_collection",
          "create_sample_collection",
          "update_sample_collection",
        ].includes(permission)
      case "INSURANCE":
        // Quyền của nhân viên bảo hiểm
        return ["view_insurance_claim", "update_insurance_claim", "view_invoice"].includes(permission)
      default:
        return false
    }
  }

  const value = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
