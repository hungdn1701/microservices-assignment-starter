"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, User, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT", // Luôn là PATIENT vì chỉ bệnh nhân mới có thể tự đăng ký
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Không cần bước nữa, tất cả các trường trên cùng một màn hình

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    // Không cho phép thay đổi vai trò, luôn là PATIENT
    if (name === 'role') return

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    // Kiểm tra các trường bắt buộc
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng điền đầy đủ tất cả các trường.",
        variant: "destructive",
      })
      return false
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Vui lòng nhập đúng định dạng email.",
        variant: "destructive",
      })
      return false
    }

    // Bỏ qua kiểm tra độ dài mật khẩu theo yêu cầu

    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Mật khẩu không khớp",
        description: "Mật khẩu và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Hàm xử lý đăng ký không cần sự kiện form
  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }

    if (!agreeTerms) {
      toast({
        title: "Điều khoản dịch vụ",
        description: "Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Gọi API đăng ký thực tế
      const authService = await import("@/lib/api/auth-service").then((mod) => mod.default)

      // Format dữ liệu theo yêu cầu của API - chỉ gửi các thông tin cần thiết
      // Dựa trên mẫu Postman đã cung cấp
      const registerData = {
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName
        // Không cần gửi role vì backend đã mặc định là PATIENT
      }

      const response = await authService.register(registerData);

      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công.",
      })

      // Chuyển hướng đến dashboard tương ứng với vai trò
      // Đảm bảo vai trò được chuyển thành chữ thường
      const userRole = (authService.getUserRole() || "patient").toLowerCase()
      router.push(`/dashboard/${userRole}`)
    } catch (error: any) {

      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.";

      if (error.response?.data) {
        // Xử lý các trường hợp lỗi cụ thể
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.email) {
          errorMessage = `Email: ${error.response.data.email}`;
        } else if (error.response.data.password) {
          errorMessage = `Mật khẩu: ${error.response.data.password}`;
        } else if (error.response.data.non_field_errors) {
          errorMessage = error.response.data.non_field_errors;
        } else {
          // Nếu có dữ liệu lỗi nhưng không thuộc các trường hợp trên
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm xử lý sự kiện submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Gọi hàm xử lý đăng ký
    handleRegister();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Register form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-12"
      >
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <Heart className="h-6 w-6" />
              <span className="text-xl font-bold">Hệ Thống Y Tế</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Đăng ký tài khoản</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Họ</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Nguyễn"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Tên</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Văn A"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-md border border-dashed">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-sm text-muted-foreground">
                        Bạn có thể cập nhật thông tin cá nhân chi tiết hơn sau khi đăng ký.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeTerms}
                      onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      Tôi đồng ý với{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        điều khoản dịch vụ
                      </Link>{" "}
                      và{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        chính sách bảo mật
                      </Link>
                    </Label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      className="w-full group"
                      disabled={isLoading}
                      onClick={() => {
                        if (!isLoading) {
                          handleRegister();
                        }
                      }}
                    >
                    {isLoading ? (
                      <>
                        <svg
                          className="mr-2 h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        Đăng ký
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  </div>

                  <input type="hidden" name="role" value="PATIENT" />
                </motion.div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block lg:w-1/2 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 z-10"></div>
        <img src="/healthcare-background.svg" alt="Healthcare" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="max-w-md p-6 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi</h2>
              <p className="mb-6">
                Đăng ký tài khoản để trải nghiệm hệ thống y tế thông minh, quản lý sức khỏe hiệu quả và kết nối với các
                dịch vụ y tế chất lượng cao.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Dễ dàng</div>
                    <div className="text-xs opacity-70">Đăng ký nhanh chóng</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">An toàn</div>
                    <div className="text-xs opacity-70">Bảo mật thông tin</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Tiện lợi</div>
                    <div className="text-xs opacity-70">Quản lý sức khỏe</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
