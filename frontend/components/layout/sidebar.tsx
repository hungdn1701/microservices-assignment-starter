"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  Search,
  Bell,
  HeartPulse,
  User,
  ShieldCheck,
  FlaskRoundIcon as Flask,
  Receipt,
  Package,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface SidebarItem {
  href: string
  icon: React.ReactNode
  label: string
  children?: SidebarItem[]
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([])

  useEffect(() => {
    if (!user) return

    const role = user.role?.toLowerCase() || "patient"
    const items = getSidebarItemsByRole(role)
    setSidebarItems(items)
  }, [user])

  const getSidebarItemsByRole = (role: string): SidebarItem[] => {
    const commonItems = [
      {
        href: "/profile",
        icon: <User className="h-4 w-4" />,
        label: "Hồ sơ cá nhân",
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

    const roleSpecificItems: Record<string, SidebarItem[]> = {
      patient: [
        {
          href: "/dashboard/patient",
          icon: <LayoutDashboard className="h-4 w-4" />,
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
          icon: <LayoutDashboard className="h-4 w-4" />,
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
      nurse: [
        {
          href: "/dashboard/nurse",
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Tổng quan",
        },
        {
          href: "/dashboard/nurse/patients",
          icon: <Users className="h-4 w-4" />,
          label: "Bệnh nhân",
        },
        {
          href: "/dashboard/nurse/tasks",
          icon: <ClipboardList className="h-4 w-4" />,
          label: "Nhiệm vụ",
        },
        {
          href: "/dashboard/nurse/schedule",
          icon: <Calendar className="h-4 w-4" />,
          label: "Lịch trình",
        },
      ],
      admin: [
        {
          href: "/dashboard/admin",
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Tổng quan",
        },
        {
          href: "/dashboard/admin/users",
          icon: <Users className="h-4 w-4" />,
          label: "Người dùng",
        },
        {
          href: "/dashboard/admin/roles",
          icon: <ShieldCheck className="h-4 w-4" />,
          label: "Phân quyền",
        },
        {
          href: "/dashboard/admin/reports",
          icon: <FileText className="h-4 w-4" />,
          label: "Báo cáo",
        },
      ],
      pharmacist: [
        {
          href: "/dashboard/pharmacist",
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Tổng quan",
        },
        {
          href: "/dashboard/pharmacist/prescriptions",
          icon: <Pill className="h-4 w-4" />,
          label: "Đơn thuốc",
        },
        {
          href: "/dashboard/pharmacist/inventory",
          icon: <Package className="h-4 w-4" />,
          label: "Kho thuốc",
        },
      ],
      lab_tech: [
        {
          href: "/dashboard/lab-tech",
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Tổng quan",
        },
        {
          href: "/dashboard/lab-tech/tests",
          icon: <ClipboardList className="h-4 w-4" />,
          label: "Xét nghiệm",
        },
        {
          href: "/dashboard/lab-tech/samples",
          icon: <Flask className="h-4 w-4" />,
          label: "Mẫu",
        },
      ],
      insurance: [
        {
          href: "/dashboard/insurance",
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Tổng quan",
        },
        {
          href: "/dashboard/insurance/claims",
          icon: <FileText className="h-4 w-4" />,
          label: "Yêu cầu bảo hiểm",
        },
        {
          href: "/dashboard/insurance/policies",
          icon: <ShieldCheck className="h-4 w-4" />,
          label: "Hợp đồng",
        },
        {
          href: "/dashboard/insurance/payments",
          icon: <Receipt className="h-4 w-4" />,
          label: "Thanh toán",
        },
      ],
    }

    return [...(roleSpecificItems[role] || []), ...commonItems]
  }

  const renderSidebarItems = (items: SidebarItem[]) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
          <Link href={item.href}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Hệ thống Y tế</span>
        </div>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm kiếm..." className="pl-8" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderSidebarItems(
                sidebarItems.filter(
                  (item) =>
                    !item.href.includes("/profile") &&
                    !item.href.includes("/notifications") &&
                    !item.href.includes("/settings"),
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Cài đặt</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderSidebarItems(
                sidebarItems.filter(
                  (item) =>
                    item.href.includes("/profile") ||
                    item.href.includes("/notifications") ||
                    item.href.includes("/settings"),
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-md border p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.first_name} />
              <AvatarFallback>
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </SidebarProvider>
  )
}
