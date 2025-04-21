import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, FlaskConical, Microscope } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart, DashboardPieChart } from "@/components/dashboard/dashboard-chart"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const testData = [
  { month: "T1", ordered: 85, completed: 80, pending: 5 },
  { month: "T2", ordered: 90, completed: 85, pending: 5 },
  { month: "T3", ordered: 100, completed: 95, pending: 5 },
  { month: "T4", ordered: 110, completed: 100, pending: 10 },
  { month: "T5", ordered: 120, completed: 110, pending: 10 },
  { month: "T6", ordered: 130, completed: 120, pending: 10 },
]

const testTypeData = [
  { name: "Huyết học", value: 35, color: "#0088FE" },
  { name: "Sinh hóa", value: 25, color: "#00C49F" },
  { name: "Vi sinh", value: 15, color: "#FFBB28" },
  { name: "Nước tiểu", value: 10, color: "#FF8042" },
  { name: "Khác", value: 15, color: "#8884D8" },
]

// Dữ liệu mẫu cho xét nghiệm đang chờ
const pendingTests = [
  {
    id: 1,
    patientName: "Nguyễn Văn A",
    testName: "Công thức máu",
    doctorName: "BS. Trần Văn X",
    orderedAt: "12/04/2025 09:30",
    priority: "Cao",
    status: "Đang chờ",
  },
  {
    id: 2,
    patientName: "Trần Thị B",
    testName: "Sinh hóa máu",
    doctorName: "BS. Lê Thị Y",
    orderedAt: "12/04/2025 10:15",
    priority: "Trung bình",
    status: "Đang chờ",
  },
  {
    id: 3,
    patientName: "Lê Văn C",
    testName: "Xét nghiệm nước tiểu",
    doctorName: "BS. Trần Văn X",
    orderedAt: "12/04/2025 11:00",
    priority: "Thấp",
    status: "Đang chờ",
  },
  {
    id: 4,
    patientName: "Phạm Thị D",
    testName: "Xét nghiệm vi khuẩn",
    doctorName: "BS. Nguyễn Thị Z",
    orderedAt: "12/04/2025 11:30",
    priority: "Cao",
    status: "Đang xử lý",
  },
]

// Dữ liệu mẫu cho xét nghiệm đã hoàn thành
const completedTests = [
  {
    id: 101,
    patientName: "Hoàng Văn E",
    testName: "Công thức máu",
    doctorName: "BS. Trần Văn X",
    completedAt: "11/04/2025 15:30",
    result: "Bình thường",
    status: "Đã hoàn thành",
  },
  {
    id: 102,
    patientName: "Ngô Thị F",
    testName: "Sinh hóa máu",
    doctorName: "BS. Lê Thị Y",
    completedAt: "11/04/2025 16:15",
    result: "Bất thường",
    status: "Đã hoàn thành",
  },
  {
    id: 103,
    patientName: "Đặng Văn G",
    testName: "Xét nghiệm nước tiểu",
    doctorName: "BS. Trần Văn X",
    completedAt: "11/04/2025 16:45",
    result: "Bình thường",
    status: "Đã hoàn thành",
  },
  {
    id: 104,
    patientName: "Vũ Thị H",
    testName: "Xét nghiệm vi khuẩn",
    doctorName: "BS. Nguyễn Thị Z",
    completedAt: "11/04/2025 17:00",
    result: "Bất thường",
    status: "Đã hoàn thành",
  },
]

export default function LabTechDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng điều khiển Kỹ thuật viên"
        description="Quản lý xét nghiệm, mẫu và kết quả phòng thí nghiệm"
      >
        <Link href="/dashboard/lab-tech/tests">
          <Button variant="outline" size="sm" className="h-9">
            <ClipboardList className="mr-2 h-4 w-4" />
            Xét nghiệm
          </Button>
        </Link>
        <Link href="/dashboard/lab-tech/samples">
          <Button variant="outline" size="sm" className="h-9">
            <FlaskConical className="mr-2 h-4 w-4" />
            Mẫu
          </Button>
        </Link>
        <Link href="/dashboard/lab-tech/equipment">
          <Button variant="outline" size="sm" className="h-9">
            <Microscope className="mr-2 h-4 w-4" />
            Thiết bị
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Xét nghiệm chờ xử lý"
          value="12"
          icon={<ClipboardList className="h-4 w-4" />}
          trend={{ value: "+3 so với hôm qua", positive: false }}
        />
        <DashboardStat
          title="Mẫu đã nhận hôm nay"
          value="8"
          icon={<FlaskConical className="h-4 w-4" />}
          trend={{ value: "-2 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Xét nghiệm hoàn thành hôm nay"
          value="5"
          icon={<ClipboardList className="h-4 w-4" />}
          trend={{ value: "+1 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Thiết bị đang sử dụng"
          value="7/10"
          icon={<Microscope className="h-4 w-4" />}
          description="3 thiết bị sẵn sàng"
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Thống kê xét nghiệm"
            description="Số lượng xét nghiệm theo tháng"
            data={testData}
            categories={{
              ordered: {
                label: "Đã yêu cầu",
                color: "hsl(var(--chart-1))",
              },
              completed: {
                label: "Đã hoàn thành",
                color: "hsl(var(--chart-2))",
              },
              pending: {
                label: "Đang chờ",
                color: "hsl(var(--chart-5))",
              },
            }}
            xAxisKey="month"
          />
        </Suspense>
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardPieChart
            title="Phân loại xét nghiệm"
            description="Tỷ lệ các loại xét nghiệm trong tháng"
            data={testTypeData}
          />
        </Suspense>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Xét nghiệm chờ xử lý</TabsTrigger>
          <TabsTrigger value="completed">Xét nghiệm đã hoàn thành</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <DashboardTable
            title="Xét nghiệm chờ xử lý"
            description="Danh sách các xét nghiệm cần được thực hiện"
            columns={[
              {
                key: "id",
                header: "Mã XN",
                cell: (item: any) => <div>#{item.id}</div>,
              },
              {
                key: "patientName",
                header: "Bệnh nhân",
                cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
              },
              {
                key: "testName",
                header: "Loại xét nghiệm",
                cell: (item: any) => <div>{item.testName}</div>,
              },
              {
                key: "doctorName",
                header: "Bác sĩ yêu cầu",
                cell: (item: any) => <div>{item.doctorName}</div>,
              },
              {
                key: "orderedAt",
                header: "Thời gian yêu cầu",
                cell: (item: any) => <div>{item.orderedAt}</div>,
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
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Đã hoàn thành"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Đang xử lý"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "Đang chờ"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={pendingTests}
            keyField="id"
            actions={
              <Link href="/dashboard/lab-tech/tests">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <DashboardTable
            title="Xét nghiệm đã hoàn thành"
            description="Danh sách các xét nghiệm đã hoàn thành gần đây"
            columns={[
              {
                key: "id",
                header: "Mã XN",
                cell: (item: any) => <div>#{item.id}</div>,
              },
              {
                key: "patientName",
                header: "Bệnh nhân",
                cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
              },
              {
                key: "testName",
                header: "Loại xét nghiệm",
                cell: (item: any) => <div>{item.testName}</div>,
              },
              {
                key: "doctorName",
                header: "Bác sĩ yêu cầu",
                cell: (item: any) => <div>{item.doctorName}</div>,
              },
              {
                key: "completedAt",
                header: "Thời gian hoàn thành",
                cell: (item: any) => <div>{item.completedAt}</div>,
              },
              {
                key: "result",
                header: "Kết quả",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.result === "Bình thường"
                        ? "bg-green-100 text-green-800"
                        : item.result === "Bất thường"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.result}
                  </div>
                ),
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={completedTests}
            keyField="id"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
