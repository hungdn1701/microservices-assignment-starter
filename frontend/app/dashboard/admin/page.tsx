"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Shield, Users, Activity, Settings } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart, DashboardPieChart } from "@/components/dashboard/dashboard-chart"
import { DashboardActivity } from "@/components/dashboard/dashboard-activity"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const userActivityData = [
  { month: "T1", patients: 120, doctors: 20, nurses: 30, others: 15 },
  { month: "T2", patients: 130, doctors: 20, nurses: 30, others: 15 },
  { month: "T3", patients: 140, doctors: 22, nurses: 32, others: 16 },
  { month: "T4", patients: 150, doctors: 22, nurses: 32, others: 16 },
  { month: "T5", patients: 160, doctors: 24, nurses: 34, others: 17 },
  { month: "T6", patients: 170, doctors: 24, nurses: 34, others: 17 },
]

const userRoleData = [
  { name: "Bệnh nhân", value: 1200, color: "#0088FE" },
  { name: "Bác sĩ", value: 50, color: "#00C49F" },
  { name: "Y tá", value: 80, color: "#FFBB28" },
  { name: "Dược sĩ", value: 30, color: "#FF8042" },
  { name: "Kỹ thuật viên", value: 25, color: "#8884D8" },
  { name: "Bảo hiểm", value: 15, color: "#82ca9d" },
]

// Dữ liệu mẫu cho người dùng
const users = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    role: "Bệnh nhân",
    status: "Đang hoạt động",
    lastLogin: "12/04/2025 10:30",
  },
  {
    id: 2,
    name: "Trần Văn B",
    email: "tranvanb@example.com",
    role: "Bác sĩ",
    status: "Đang hoạt động",
    lastLogin: "12/04/2025 09:15",
  },
  {
    id: 3,
    name: "Lê Thị C",
    email: "lethic@example.com",
    role: "Y tá",
    status: "Đang hoạt động",
    lastLogin: "11/04/2025 15:45",
  },
  {
    id: 4,
    name: "Phạm Văn D",
    email: "phamvand@example.com",
    role: "Dược sĩ",
    status: "Đang hoạt động",
    lastLogin: "10/04/2025 14:20",
  },
]

// Dữ liệu mẫu cho hoạt động hệ thống
const systemActivities = [
  {
    id: 1,
    title: "Người dùng mới đăng ký",
    description: "Nguyễn Thị E đã đăng ký tài khoản mới",
    timestamp: "Hôm nay, 10:30",
    icon: <Users className="h-5 w-5" />,
    status: "success",
  },
  {
    id: 2,
    title: "Cập nhật hệ thống",
    description: "Phiên bản 2.5.1 đã được cài đặt thành công",
    timestamp: "Hôm qua, 15:45",
    icon: <Settings className="h-5 w-5" />,
    status: "info",
  },
  {
    id: 3,
    title: "Cảnh báo bảo mật",
    description: "Phát hiện nhiều lần đăng nhập thất bại từ IP 192.168.1.1",
    timestamp: "2 ngày trước, 09:15",
    icon: <Shield className="h-5 w-5" />,
    status: "warning",
  },
  {
    id: 4,
    title: "Sao lưu dữ liệu",
    description: "Sao lưu dữ liệu tự động đã hoàn tất",
    timestamp: "3 ngày trước, 02:00",
    icon: <FileText className="h-5 w-5" />,
    status: "success",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển Quản trị"
        description="Quản lý người dùng, vai trò và hoạt động hệ thống"
      >
        <Link href="/dashboard/admin/users">
          <Button variant="outline" size="sm" className="h-9">
            <Users className="mr-2 h-4 w-4" />
            Quản lý người dùng
          </Button>
        </Link>
        <Link href="/dashboard/admin/roles">
          <Button variant="outline" size="sm" className="h-9">
            <Shield className="mr-2 h-4 w-4" />
            Vai trò & Quyền hạn
          </Button>
        </Link>
        <Link href="/dashboard/admin/reports">
          <Button variant="outline" size="sm" className="h-9">
            <FileText className="mr-2 h-4 w-4" />
            Báo cáo
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Tổng người dùng"
          value="1,400"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "+24 trong tháng này", positive: true }}
        />
        <DashboardStat
          title="Người dùng đang hoạt động"
          value="856"
          icon={<Activity className="h-4 w-4" />}
          description="61% tổng số người dùng"
        />
        <DashboardStat
          title="Bác sĩ & Y tá"
          value="130"
          icon={<Users className="h-4 w-4" />}
          trend={{ value: "+5 trong tháng này", positive: true }}
        />
        <DashboardStat
          title="Vấn đề hệ thống"
          value="2"
          icon={<Shield className="h-4 w-4" />}
          description="Cần xử lý"
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Thống kê người dùng"
            description="Số lượng người dùng theo vai trò và tháng"
            data={userActivityData}
            categories={{
              patients: {
                label: "Bệnh nhân",
                color: "hsl(var(--chart-1))"
              },
              doctors: {
                label: "Bác sĩ",
                color: "hsl(var(--chart-2))"
              },
              nurses: {
                label: "Y tá",
                color: "hsl(var(--chart-3))"
              },
              others: {
                label: "Khác",
                color: "hsl(var(--chart-4))"
              }
            }}
            xAxisKey="month"
            stacked={true}
          />
        </Suspense>
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardPieChart
            title="Phân bố vai trò"
            description="Tỷ lệ người dùng theo vai trò trong hệ thống"
            data={userRoleData}
          />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardTable
          title="Người dùng gần đây"
          description="Danh sách người dùng đăng nhập gần đây"
          columns={[
            {
              key: "name",
              header: "Họ tên",
              cell: (item: any) => <div className="font-medium">{item.name}</div>,
            },
            {
              key: "email",
              header: "Email",
              cell: (item: any) => <div>{item.email}</div>,
            },
            {
              key: "role",
              header: "Vai trò",
              cell: (item: any) => <div>{item.role}</div>,
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (item: any) => (
                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "Đang hoạt động" ? "bg-green-100 text-green-800" :
                  item.status === "Không hoạt động" ? "bg-gray-100 text-gray-800" :
                  item.status === "Bị khóa" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {item.status}
                </div>
              ),
            },
            {
              key: "lastLogin",
              header: "Đăng nhập gần nhất",
              cell: (item: any) => <div>{item.lastLogin}</div>,
            },
          ]}
          data={users}
          keyField="id"
          actions={
            <Link href="/dashboard/admin/users">
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          }
        />
        <DashboardActivity
          title="Hoạt động hệ thống"
          description="Các hoạt động và sự kiện gần đây trong hệ thống"
          items={systemActivities}
        />
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
          <TabsTrigger value="activity">Nhật ký hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <DashboardTable
            title="Quản lý người dùng"
            description="Quản lý người dùng và vai trò trong hệ thống"
            columns={[
              {
                key: "name",
                header: "Họ tên",
                cell: (item: any) => <div className="font-medium">{item.name}</div>,
              },
              {
                key: "email",
                header: "Email",
                cell: (item: any) => <div>{item.email}</div>,
              },
              {
                key: "role",
                header: "Vai trò",
                cell: (item: any) => <div>{item.role}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === "Đang hoạt động" ? "bg-green-100 text-green-800" :
                    item.status === "Không hoạt động" ? "bg-gray-100 text-gray-800" :
                    item.status === "Bị khóa" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={users}
            keyField="id"
          />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <DashboardActivity
            title="Nhật ký hoạt động"
            description="Nhật ký hoạt động chi tiết của hệ thống"
            items={systemActivities}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}