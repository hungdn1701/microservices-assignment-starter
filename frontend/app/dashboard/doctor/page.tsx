"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, ClipboardList, UserRound, Pill, FileText } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart, DashboardPieChart } from "@/components/dashboard/dashboard-chart"
import { DashboardActivity } from "@/components/dashboard/dashboard-activity"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const appointmentData = [
  { month: "T1", scheduled: 45, completed: 40, cancelled: 5 },
  { month: "T2", scheduled: 50, completed: 45, cancelled: 5 },
  { month: "T3", scheduled: 60, completed: 55, cancelled: 5 },
  { month: "T4", scheduled: 70, completed: 65, cancelled: 5 },
  { month: "T5", scheduled: 65, completed: 60, cancelled: 5 },
  { month: "T6", scheduled: 75, completed: 70, cancelled: 5 },
]

const diagnosisData = [
  { name: "Cảm cúm", value: 35, color: "#0088FE" },
  { name: "Viêm họng", value: 25, color: "#00C49F" },
  { name: "Đau lưng", value: 15, color: "#FFBB28" },
  { name: "Dị ứng", value: 10, color: "#FF8042" },
  { name: "Khác", value: 15, color: "#8884D8" },
]

import { useEffect, useState } from 'react'
import appointmentService from '@/lib/api/appointment-service'

// Kiểu dữ liệu cho lịch hẹn
interface DoctorAppointment {
  id: number
  patientName: string
  date: Date
  time: string
  reason: string
  status: string
}

// Dữ liệu mẫu cho bệnh nhân
const patients = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    age: 45,
    gender: "Nam",
    lastVisit: "05/04/2025",
    condition: "Ổn định",
  },
  {
    id: 2,
    name: "Trần Thị B",
    age: 32,
    gender: "Nữ",
    lastVisit: "03/04/2025",
    condition: "Đang điều trị",
  },
  {
    id: 3,
    name: "Lê Văn C",
    age: 58,
    gender: "Nam",
    lastVisit: "01/04/2025",
    condition: "Theo dõi",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    age: 27,
    gender: "Nữ",
    lastVisit: "28/03/2025",
    condition: "Ổn định",
  },
]

// Dữ liệu mẫu cho hoạt động gần đây
const recentActivities = [
  {
    id: 1,
    title: "Kết quả xét nghiệm mới",
    description: "Kết quả xét nghiệm của bệnh nhân Nguyễn Văn A đã có",
    timestamp: "Hôm nay, 10:30",
    icon: <FileText className="h-5 w-5" />,
    status: "info",
  },
  {
    id: 2,
    title: "Lịch hẹn mới",
    description: "Bệnh nhân Trần Thị B đã đặt lịch hẹn",
    timestamp: "Hôm qua, 15:45",
    icon: <CalendarDays className="h-5 w-5" />,
    status: "success",
  },
  {
    id: 3,
    title: "Đơn thuốc đã cấp",
    description: "Đơn thuốc cho bệnh nhân Lê Văn C đã được cấp",
    timestamp: "2 ngày trước, 09:15",
    icon: <Pill className="h-5 w-5" />,
    status: "success",
  },
]

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctorAppointments()
  }, [])

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true)
      // Lấy ID bác sĩ từ localStorage
      const userJson = localStorage.getItem('user')
      if (!userJson) {
        console.error('User not found in localStorage')
        setLoading(false)
        return
      }

      const user = JSON.parse(userJson)
      const doctorId = user.id

      // Lấy danh sách lịch hẹn của bác sĩ
      const response = await appointmentService.getDoctorAppointments(doctorId)
      console.log('Doctor appointments:', response)

      // Chuyển đổi dữ liệu sang định dạng hiển thị
      const formattedAppointments = response.map(appointment => ({
        id: appointment.id,
        patientName: `${appointment.patient_info?.first_name || ''} ${appointment.patient_info?.last_name || ''}`.trim() || 'Bệnh nhân',
        date: new Date(appointment.time_slot?.date || new Date()),
        time: `${appointment.time_slot?.start_time?.substring(0, 5) || ''} - ${appointment.time_slot?.end_time?.substring(0, 5) || ''}`,
        reason: appointment.reason_text || '',
        status: appointment.status?.toLowerCase() || 'scheduled'
      }))

      setAppointments(formattedAppointments)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching doctor appointments:', error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bảng điều khiển Bác sĩ" description="Quản lý lịch khám, bệnh nhân và hồ sơ y tế">
        <Link href="/dashboard/doctor/examination">
          <Button variant="outline" size="sm" className="h-9">
            <ClipboardList className="mr-2 h-4 w-4" />
            Khám bệnh
          </Button>
        </Link>
        <Link href="/dashboard/doctor/appointments">
          <Button variant="outline" size="sm" className="h-9">
            <CalendarDays className="mr-2 h-4 w-4" />
            Lịch hẹn
          </Button>
        </Link>
        <Link href="/dashboard/doctor/patients">
          <Button variant="outline" size="sm" className="h-9">
            <UserRound className="mr-2 h-4 w-4" />
            Bệnh nhân
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Lịch hẹn hôm nay"
          value="12"
          icon={<CalendarDays className="h-4 w-4" />}
          trend={{ value: "+2 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Bệnh nhân đang điều trị"
          value="28"
          icon={<UserRound className="h-4 w-4" />}
          trend={{ value: "+4 trong tuần này", positive: true }}
        />
        <DashboardStat
          title="Đơn thuốc đã kê"
          value="45"
          icon={<Pill className="h-4 w-4" />}
          trend={{ value: "+8 trong tuần này", positive: true }}
        />
        <DashboardStat
          title="Xét nghiệm chờ kết quả"
          value="7"
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: "-2 so với hôm qua", positive: false }}
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Thống kê cuộc hẹn"
            description="Số lượng cuộc hẹn theo tháng"
            data={appointmentData}
            categories={{
              scheduled: {
                label: "Đã lên lịch",
                color: "hsl(var(--chart-1))",
              },
              completed: {
                label: "Đã hoàn thành",
                color: "hsl(var(--chart-2))",
              },
              cancelled: {
                label: "Đã hủy",
                color: "hsl(var(--chart-6))",
              },
            }}
            xAxisKey="month"
            stacked={true}
          />
        </Suspense>
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardPieChart
            title="Phân loại chẩn đoán"
            description="Tỷ lệ các loại chẩn đoán trong tháng"
            data={diagnosisData}
          />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardTable
          title="Lịch hẹn hôm nay"
          description="Danh sách các cuộc hẹn trong ngày"
          columns={[
            {
              key: "time",
              header: "Thời gian",
              cell: (item: any) => <div>{item.time}</div>,
            },
            {
              key: "patientName",
              header: "Bệnh nhân",
              cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
            },
            {
              key: "reason",
              header: "Lý do khám",
              cell: (item: any) => <div>{item.reason}</div>,
            },
            {
              key: "status",
              header: "Trạng thái",
              cell: (item: any) => (
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : item.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status === "confirmed"
                    ? "Đã xác nhận"
                    : item.status === "scheduled"
                      ? "Đã lên lịch"
                      : "Chưa xác định"}
                </div>
              ),
            },
          ]}
          data={appointments.filter(
            (a) =>
              a.date.getDate() === new Date().getDate() &&
              a.date.getMonth() === new Date().getMonth() &&
              a.date.getFullYear() === new Date().getFullYear(),
          )}
          keyField="id"
          actions={
            <Link href="/dashboard/doctor/appointments">
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          }
        />
        <DashboardActivity
          title="Hoạt động gần đây"
          description="Các hoạt động và thông báo gần đây"
          items={recentActivities}
        />
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Lịch hẹn sắp tới</TabsTrigger>
          <TabsTrigger value="patients">Bệnh nhân gần đây</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments" className="space-y-4">
          <DashboardTable
            title="Lịch hẹn sắp tới"
            description="Danh sách các cuộc hẹn sắp tới của bạn với bệnh nhân"
            columns={[
              {
                key: "date",
                header: "Ngày",
                cell: (item: any) => <div>{item.date.toLocaleDateString("vi-VN")}</div>,
              },
              {
                key: "time",
                header: "Thời gian",
                cell: (item: any) => <div>{item.time}</div>,
              },
              {
                key: "patientName",
                header: "Bệnh nhân",
                cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
              },
              {
                key: "reason",
                header: "Lý do khám",
                cell: (item: any) => <div>{item.reason}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : item.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status === "confirmed"
                      ? "Đã xác nhận"
                      : item.status === "scheduled"
                        ? "Đã lên lịch"
                        : "Chưa xác định"}
                  </div>
                ),
              },
            ]}
            data={appointments}
            keyField="id"
          />
        </TabsContent>
        <TabsContent value="patients" className="space-y-4">
          <DashboardTable
            title="Bệnh nhân gần đây"
            description="Danh sách bệnh nhân bạn đã khám gần đây"
            columns={[
              {
                key: "name",
                header: "Họ tên",
                cell: (item: any) => <div className="font-medium">{item.name}</div>,
              },
              {
                key: "age",
                header: "Tuổi",
                cell: (item: any) => <div>{item.age}</div>,
              },
              {
                key: "gender",
                header: "Giới tính",
                cell: (item: any) => <div>{item.gender}</div>,
              },
              {
                key: "lastVisit",
                header: "Lần khám gần nhất",
                cell: (item: any) => <div>{item.lastVisit}</div>,
              },
              {
                key: "condition",
                header: "Tình trạng",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.condition === "Ổn định"
                        ? "bg-green-100 text-green-800"
                        : item.condition === "Đang điều trị"
                          ? "bg-blue-100 text-blue-800"
                          : item.condition === "Theo dõi"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.condition}
                  </div>
                ),
              },
            ]}
            data={patients}
            keyField="id"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
