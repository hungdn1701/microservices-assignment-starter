"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  User,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  Home,
  Users,
  Pill,
  FlaskRoundIcon as Flask,
  ShieldCheck,
  ClipboardList,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/providers/auth-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const [userName, setUserName] = useState("")

  // Xác định vai trò người dùng từ URL
  const role = pathname.split("/")[2] || "patient"

  // Lấy thông tin người dùng khi component được mount hoặc user thay đổi
  useEffect(() => {
    if (user) {
      // Nếu có thông tin user từ useAuth, sử dụng nó
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim()
      setUserName(fullName || "Người dùng")
    } else {
      // Nếu không có, thử lấy từ localStorage
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const userData = JSON.parse(userStr)
          const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim()
          setUserName(fullName || "Người dùng")
        } else {
          setUserName("Người dùng")
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error)
        setUserName("Người dùng")
      }
    }
  }, [user])

  // Các mục menu dựa trên vai trò
  const getMenuItems = () => {
    switch (role) {
      case "patient":
        return [
          { href: "/dashboard/patient", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/patient/appointments", icon: <Calendar />, label: "Lịch hẹn" },
          { href: "/dashboard/patient/records", icon: <FileText />, label: "Hồ sơ y tế" },
          { href: "/dashboard/patient/prescriptions", icon: <Pill />, label: "Đơn thuốc" },
          { href: "/dashboard/patient/billing", icon: <CreditCard />, label: "Thanh toán" },
        ]
      case "doctor":
        return [
          { href: "/dashboard/doctor", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/doctor/appointments", icon: <Calendar />, label: "Lịch hẹn" },
          { href: "/dashboard/doctor/patients", icon: <Users />, label: "Bệnh nhân" },
          { href: "/dashboard/doctor/examination", icon: <ClipboardList />, label: "Khám bệnh" },
          { href: "/dashboard/doctor/lab-requests", icon: <Flask />, label: "Xét nghiệm" },
        ]
      case "nurse":
        return [
          { href: "/dashboard/nurse", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/nurse/patients", icon: <Users />, label: "Bệnh nhân" },
          { href: "/dashboard/nurse/tasks", icon: <ClipboardList />, label: "Nhiệm vụ" },
        ]
      case "lab-tech":
        return [
          { href: "/dashboard/lab-tech", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/lab-tech/tests", icon: <Flask />, label: "Xét nghiệm" },
          { href: "/dashboard/lab-tech/samples", icon: <ClipboardList />, label: "Mẫu" },
        ]
      case "pharmacist":
        return [
          { href: "/dashboard/pharmacist", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/pharmacist/prescriptions", icon: <Pill />, label: "Đơn thuốc" },
          { href: "/dashboard/pharmacist/inventory", icon: <ClipboardList />, label: "Kho thuốc" },
        ]
      case "insurance":
        return [
          { href: "/dashboard/insurance", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/insurance/claims", icon: <ShieldCheck />, label: "Yêu cầu bảo hiểm" },
          { href: "/dashboard/insurance/policies", icon: <FileText />, label: "Chính sách" },
        ]
      case "admin":
        return [
          { href: "/dashboard/admin", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/admin/users", icon: <Users />, label: "Người dùng" },
          { href: "/dashboard/admin/roles", icon: <ShieldCheck />, label: "Vai trò" },
          { href: "/dashboard/admin/activity-logs", icon: <FileText />, label: "Nhật ký" },
        ]
      default:
        return [
          { href: "/dashboard/patient", icon: <Home />, label: "Trang chủ" },
          { href: "/dashboard/patient/appointments", icon: <Calendar />, label: "Lịch hẹn" },
          { href: "/dashboard/patient/records", icon: <FileText />, label: "Hồ sơ y tế" },
        ]
    }
  }

  // Các mục menu chung cho tất cả vai trò
  const commonMenuItems = [
    { href: "/profile", icon: <User />, label: "Hồ sơ" },
    { href: "/notifications", icon: <Bell />, label: "Thông báo" },
    { href: "/settings", icon: <Settings />, label: "Cài đặt" },
  ]

  // Kết hợp menu theo vai trò và menu chung
  const menuItems = [...getMenuItems(), ...commonMenuItems]

  // Tiêu đề dựa trên vai trò
  const getRoleTitle = () => {
    switch (role) {
      case "patient":
        return "Bệnh nhân"
      case "doctor":
        return "Bác sĩ"
      case "nurse":
        return "Y tá"
      case "lab-tech":
        return "Kỹ thuật viên"
      case "pharmacist":
        return "Dược sĩ"
      case "insurance":
        return "Bảo hiểm"
      case "admin":
        return "Quản trị viên"
      default:
        return "Bệnh nhân"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Mở menu</span>
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
            </motion.div>
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-lg font-semibold"
            >
              Hệ thống Y tế
            </motion.span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <span className="text-sm font-medium">Xin chào, <span className="font-semibold">{userName}</span></span>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Thông báo</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Tài khoản</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email || ""}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Hồ sơ cá nhân</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Cài đặt</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <AppSidebar
          items={menuItems}
          header={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Menu {getRoleTitle()}</span>
            </div>
          }
        />

        {/* Mobile sidebar */}
        {/* Không sử dụng AnimatePresence ở đây vì có nhiều phần tử con */}
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-background"
              >
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-semibold">Hệ thống Y tế</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Đóng menu</span>
                  </Button>
                </div>
                <nav className="p-4">
                  <ul className="grid gap-2">
                    {menuItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            pathname === item.href
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted hover:text-foreground",
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            </>
          )}
        {/* Kết thúc mobile sidebar */}

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
