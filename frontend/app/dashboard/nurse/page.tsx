import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, ClipboardCheck, UserRound, Pill } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart } from "@/components/dashboard/dashboard-chart"
import { DashboardActivity } from "@/components/dashboard/dashboard-activity"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const taskData = [
  { day: "T2", completed: 12, pending: 3 },
  { day: "T3", completed: 15, pending: 2 },
  { day: "T4", completed: 10, pending: 5 },
  { day: "T5", completed: 14, pending: 3 },
  { day: "T6", completed: 16, pending: 2 },
  { day: "T7", completed: 8, pending: 1 },
  { day: "CN", completed: 5, pending: 0 },
]

// Dữ liệu mẫu cho bệnh nhân
const patients = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    room: "101",
    age: 45,
    condition: "Ổn định",
    doctor: "BS. Trần Văn X",
    nextCheck: "14:00",
  },
  {
    id: 2,
    name: "Trần Thị B",
    room: "102",
    age: 32,
    condition: "Cần theo dõi",
    doctor: "BS. Lê Thị Y",
    nextCheck: "15:30",
  },
  {
    id: 3,
    name: "Lê Văn C",
    room: "103",
    age: 58,
    condition: "Đang hồi phục",
    doctor: "BS. Trần Văn X",
    nextCheck: "16:00",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    room: "104",
    age: 27,
    condition: "Ổn định",
    doctor: "BS. Nguyễn Thị Z",
    nextCheck: "17:00",
  },
]

// Dữ liệu mẫu cho nhiệm vụ
const tasks = [
  {
    id: 1,
    description: "Đo huyết áp cho bệnh nhân phòng 101",
    priority: "Cao",
    assignedBy: "BS. Trần Văn X",
    dueTime: "14:00",
    status: "Đang chờ",
  },
  {
    id: 2,
    description: "Thay băng cho bệnh nhân phòng 103",
    priority: "Cao",
    assignedBy: "BS. Trần Văn X",
    dueTime: "14:30",
    status: "Đang chờ",
  },
  {
    id: 3,
    description: "Cấp thuốc cho bệnh nhân phòng 102",
    priority: "Trung bình",
    assignedBy: "BS. Lê Thị Y",
    dueTime: "15:00",
    status: "Đang chờ",
  },
  {
    id: 4,
    description: "Lấy mẫu máu bệnh nhân phòng 104",
    priority: "Trung bình",
    assignedBy: "BS. Nguyễn Thị Z",
    dueTime: "15:30",
    status: "Đang chờ",
  },
]

// Dữ liệu mẫu cho hoạt động gần đây
const recentActivities = [
  {
    id: 1,
    title: "Nhiệm vụ mới",
    description: "BS. Trần Văn X đã giao nhiệm vụ mới",
    timestamp: "Hôm nay, 10:30",
    icon: <ClipboardCheck className="h-5 w-5" />,
    status: "info",
  },
  {
    id: 2,
    title: "Bệnh nhân mới",
    description: "Bệnh nhân Trần Thị B đã nhập viện",
    timestamp: "Hôm qua, 15:45",
    icon: <UserRound className="h-5 w-5" />,
    status: "success",
  },
  {
    id: 3,
    title: "Thuốc đã cấp",
    description: "Đã cấp thuốc cho bệnh nhân Lê Văn C",
    timestamp: "2 ngày trước, 09:15",
    icon: <Pill className="h-5 w-5" />,
    status: "success",
  },
]

export default function NurseDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bảng điều khiển Y tá" description="Quản lý bệnh nhân, nhiệm vụ và lịch trình chăm sóc">
        <Link href="/dashboard/nurse/patients">
          <Button variant="outline" size="sm" className="h-9">
            <UserRound className="mr-2 h-4 w-4" />
            Bệnh nhân
          </Button>
        </Link>
        <Link href="/dashboard/nurse/tasks">
          <Button variant="outline" size="sm" className="h-9">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Nhiệm vụ
          </Button>
        </Link>
        <Link href="/dashboard/nurse/schedule">
          <Button variant="outline" size="sm" className="h-9">
            <CalendarDays className="mr-2 h-4 w-4" />
            Lịch trình
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Bệnh nhân đang chăm sóc"
          value="18"
          icon={<UserRound className="h-4 w-4" />}
          trend={{ value: "+2 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Nhiệm vụ hôm nay"
          value="24"
          icon={<ClipboardCheck className="h-4 w-4" />}
          description="12 đã hoàn thành"
        />
        <DashboardStat
          title="Thuốc cần cấp phát"
          value="32"
          icon={<Pill className="h-4 w-4" />}
          description="8 ưu tiên cao"
        />
        <DashboardStat
          title="Giờ làm việc tuần này"
          value="28/40"
          icon={<CalendarDays className="h-4 w-4" />}
          description="Còn 12 giờ"
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Nhiệm vụ trong tuần"
            description="Số lượng nhiệm vụ đã hoàn thành và đang chờ xử lý"
            data={taskData}
            categories={{
              completed: {
                label: "Đã hoàn thành",
                color: "hsl(var(--chart-2))",
              },
              pending: {
                label: "Đang chờ",
                color: "hsl(var(--chart-5))",
              },
            }}
            xAxisKey="day"
          />
        </Suspense>
        <DashboardActivity
          title="Hoạt động gần đây"
          description="Các hoạt động và thông báo gần đây"
          items={recentActivities}
        />
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Bệnh nhân</TabsTrigger>
          <TabsTrigger value="tasks">Nhiệm vụ</TabsTrigger>
        </TabsList>
        <TabsContent value="patients" className="space-y-4">
          <DashboardTable
            title="Danh sách bệnh nhân"
            description="Bệnh nhân đang được chăm sóc và theo dõi"
            columns={[
              {
                key: "name",
                header: "Họ tên",
                cell: (item: any) => <div className="font-medium">{item.name}</div>,
              },
              {
                key: "room",
                header: "Phòng",
                cell: (item: any) => <div>{item.room}</div>,
              },
              {
                key: "age",
                header: "Tuổi",
                cell: (item: any) => <div>{item.age}</div>,
              },
              {
                key: "condition",
                header: "Tình trạng",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.condition === "Ổn định"
                        ? "bg-green-100 text-green-800"
                        : item.condition === "Cần theo dõi"
                          ? "bg-amber-100 text-amber-800"
                          : item.condition === "Đang hồi phục"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.condition}
                  </div>
                ),
              },
              {
                key: "doctor",
                header: "Bác sĩ phụ trách",
                cell: (item: any) => <div>{item.doctor}</div>,
              },
              {
                key: "nextCheck",
                header: "Kiểm tra tiếp theo",
                cell: (item: any) => <div>{item.nextCheck}</div>,
              },
            ]}
            data={patients}
            keyField="id"
          />
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <DashboardTable
            title="Nhiệm vụ"
            description="Danh sách nhiệm vụ cần hoàn thành hôm nay"
            columns={[
              {
                key: "description",
                header: "Mô tả",
                cell: (item: any) => <div className="font-medium">{item.description}</div>,
              },
              {
                key: "priority",
                header: "Ưu tiên",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.priority === "Cao"
                        ? "bg-red-100 text-red-800"
                        : item.priority === "Trung bình"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.priority}
                  </div>
                ),
              },
              {
                key: "assignedBy",
                header: "Người giao",
                cell: (item: any) => <div>{item.assignedBy}</div>,
              },
              {
                key: "dueTime",
                header: "Thời hạn",
                cell: (item: any) => <div>{item.dueTime}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Đã hoàn thành"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Đang chờ"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={tasks}
            keyField="id"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
