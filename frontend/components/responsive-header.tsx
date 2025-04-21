"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HeartPulse, Bell, User, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/providers/auth-provider"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ResponsiveHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Lấy danh sách menu dựa trên vai trò
  const userRole = user?.role?.toLowerCase() || "patient"
  const menuItems = getMenuItems(userRole)

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center border-b bg-background px-4 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-6 w-6 text-teal-600" />
                    <h2 className="text-lg font-semibold">Hệ thống Y tế</h2>
                  </div>
                </div>
                <nav className="flex-1 overflow-auto p-4">
                  <ul className="grid gap-1">
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
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <HeartPulse className="h-6 w-6 text-teal-600" />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            Hệ thống Y tế
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                3
              </span>
              <span className="sr-only">Thông báo</span>
            </Button>
          </Link>
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
                  <span>{`${user?.first_name || ""} ${user?.last_name || ""}`}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Hồ sơ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Cài đặt</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function getMenuItems(role: string) {
  const baseItems = [
    {
      href: "/profile",
      icon: <User className="h-4 w-4" />,
      label: "Hồ sơ",
    },
    {
      href: "/notifications",
      icon: <Bell className="h-4 w-4" />,
      label: "Thông báo",
    },
    {
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Cài đặt",
    },
  ]

  const roleSpecificItems: Record<string, Array<{ href: string; icon: React.ReactNode; label: string }>> = {
    patient: [
      {
        href: "/dashboard/patient",
        icon: <Home className="h-4 w-4" />,
        label: "Tổng quan",
      },
      {
        href: "/dashboard/patient/appointments",
        icon: <Calendar className="h-4 w-4" />,
        label: "Lịch hẹn",
      },
      {
        href: "/dashboard/patient/records",
        icon: <FileText className="h-4 w-4" />,
        label: "Hồ sơ y tế",
      },
      {
        href: "/dashboard/patient/prescriptions",
        icon: <Pill className="h-4 w-4" />,
        label: "Đơn thuốc",
      },
    ],
    doctor: [
      {
        href: "/dashboard/doctor",
        icon: <Home className="h-4 w-4" />,
        label: "Tổng quan",
      },
      {
        href: "/dashboard/doctor/appointments",
        icon: <Calendar className="h-4 w-4" />,
        label: "Lịch hẹn",
      },
      {
        href: "/dashboard/doctor/patients",
        icon: <Users className="h-4 w-4" />,
        label: "Bệnh nhân",
      },
      {
        href: "/dashboard/doctor/examination",
        icon: <ClipboardList className="h-4 w-4" />,
        label: "Khám bệnh",
      },
      {
        href: "/dashboard/doctor/prescriptions/new",
        icon: <Pill className="h-4 w-4" />,
        label: "Kê đơn",
      },
    ],
    // Các vai trò khác tương tự như trong dashboard layout
  }

  return [...(roleSpecificItems[role] || []), ...baseItems]
}

import { Home, Settings, Calendar, FileText, Pill, Users, ClipboardList } from "lucide-react"
