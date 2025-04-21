"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, FileText, Home, Pill, Settings, User, Bell, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function PatientSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard/patient",
      icon: Home,
      title: "Trang chủ",
    },
    {
      href: "/dashboard/patient/appointments",
      icon: Calendar,
      title: "Lịch hẹn",
    },
    {
      href: "/dashboard/patient/records",
      icon: FileText,
      title: "Hồ sơ y tế",
    },
    {
      href: "/dashboard/patient/prescriptions",
      icon: Pill,
      title: "Đơn thuốc",
    },
    {
      href: "/profile",
      icon: User,
      title: "Hồ sơ",
    },
    {
      href: "/notifications",
      icon: Bell,
      title: "Thông báo",
    },
    {
      href: "/documents",
      icon: FileCheck,
      title: "Tài liệu",
    },
    {
      href: "/settings",
      icon: Settings,
      title: "Cài đặt",
    },
  ]

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex h-14 items-center border-b px-4 font-semibold">Bảng điều khiển</div>
        <div className="flex-1 py-2">
          <nav className="grid gap-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "flex h-10 items-center justify-start gap-2 px-4 text-sm font-medium",
                  pathname === route.href ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="h-4 w-4" />
                  {route.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
