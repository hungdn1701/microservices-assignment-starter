"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Users, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Không xóa token cũ khi vào trang đăng nhập nữa
  // Để tránh việc token bị mất sau khi đăng nhập

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Gọi API đăng nhập thực tế
      const authService = await import("@/lib/api/auth-service").then((mod) => mod.default);
      const result = await authService.login({ email, password });

      // Lưu trực tiếp vào localStorage để đảm bảo token được lưu
      if (result.access && result.refresh) {
        localStorage.setItem("token", result.access);
        localStorage.setItem("refreshToken", result.refresh);
        localStorage.setItem("user", JSON.stringify(result.user));
        if (result.user?.role) {
          localStorage.setItem("userRole", result.user.role);
        }
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại hệ thống y tế.",
      })

      // Chuyển hướng đến trang dashboard tương ứng với vai trò người dùng
      // Đảm bảo vai trò được chuyển thành chữ thường
      const userRole = (authService.getUserRole() || "patient").toLowerCase()

      // Thêm thời gian trễ nhỏ để đảm bảo localStorage đã được cập nhật
      setTimeout(() => {
        router.push(`/dashboard/${userRole}`)
      }, 1000);
    } catch (error: any) {
      console.error("Login error details:", error.response?.data || error.message)
      toast({
        title: "Đăng nhập thất bại",
        description: error.response?.data?.detail || "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      {/* Left side - Login form */}
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
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Đăng nhập</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ghi nhớ đăng nhập
                  </Label>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Button type="submit" className="w-full group" disabled={isLoading}>
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
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        Đăng nhập
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">Hoặc đăng nhập với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M9.1 2.9c-1.1.1-2.2.6-3 1.3-.7.7-1.2 1.5-1.4 2.5-.1.3-.1.9-.1 1.2 0 .9.2 1.7.5 2.4.3.7.8 1.3 1.4 1.8.6.5 1.3.9 2.1 1 .3 0 .9 0 1.2-.1.9-.2 1.7-.7 2.4-1.4.6-.6 1-1.3 1.2-2.1.1-.3.1-.9.1-1.2-.1-1.3-.6-2.4-1.6-3.3-.7-.7-1.6-1.1-2.6-1.2-.2 0-.9 0-1.2.1zm-3.9 9.1c-.5.1-.9.3-1.3.6-.4.3-.7.7-.9 1.2-.2.4-.2.9-.2 1.5 0 .4 0 .5.1.8.2.9.8 1.6 1.5 2.1.7.4 1.6.7 2.5.7.9 0 1.7-.3 2.4-.8.7-.5 1.2-1.2 1.5-2 .1-.3.1-.4.1-.8 0-.4 0-.5-.1-.8-.2-.9-.8-1.6-1.5-2.1-.7-.4-1.6-.7-2.5-.7-.4 0-.5 0-.8.1-.3 0-.5.1-.8.2z"
                      fill="#1877F2"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>
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
              <h2 className="text-3xl font-bold mb-4">Chăm sóc sức khỏe thông minh</h2>
              <p className="mb-6">
                Hệ thống y tế thông minh giúp bạn quản lý sức khỏe hiệu quả, kết nối với bác sĩ và dịch vụ y tế mọi lúc,
                mọi nơi.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">10k+</div>
                    <div className="text-xs opacity-70">Người dùng</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">50+</div>
                    <div className="text-xs opacity-70">Bác sĩ</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">24/7</div>
                    <div className="text-xs opacity-70">Hỗ trợ</div>
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
