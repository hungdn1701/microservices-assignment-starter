import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Pill, ShoppingCart } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart, DashboardPieChart } from "@/components/dashboard/dashboard-chart"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const dispensingData = [
  { month: "T1", prescriptions: 120, otc: 80 },
  { month: "T2", prescriptions: 140, otc: 90 },
  { month: "T3", prescriptions: 130, otc: 85 },
  { month: "T4", prescriptions: 150, otc: 95 },
  { month: "T5", prescriptions: 160, otc: 100 },
  { month: "T6", prescriptions: 170, otc: 110 },
]

const inventoryData = [
  { name: "Đầy đủ", value: 65, color: "#0088FE" },
  { name: "Sắp hết", value: 20, color: "#FFBB28" },
  { name: "Hết hàng", value: 10, color: "#FF8042" },
  { name: "Sắp hết hạn", value: 5, color: "#FF6B6B" },
]

// Dữ liệu mẫu cho đơn thuốc
const prescriptions = [
  {
    id: 1,
    patientName: "Nguyễn Văn A",
    doctorName: "BS. Trần Văn X",
    date: "12/04/2025",
    status: "Chờ xử lý",
    priority: "Cao",
  },
  {
    id: 2,
    patientName: "Trần Thị B",
    doctorName: "BS. Lê Thị Y",
    date: "12/04/2025",
    status: "Chờ xử lý",
    priority: "Trung bình",
  },
  {
    id: 3,
    patientName: "Lê Văn C",
    doctorName: "BS. Trần Văn X",
    date: "12/04/2025",
    status: "Chờ xử lý",
    priority: "Thấp",
  },
  {
    id: 4,
    patientName: "Phạm Thị D",
    doctorName: "BS. Nguyễn Thị Z",
    date: "11/04/2025",
    status: "Đang chuẩn bị",
    priority: "Cao",
  },
]

// Dữ liệu mẫu cho kho thuốc
const inventory = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Giảm đau",
    stock: 250,
    minStock: 50,
    expiryDate: "12/2026",
    status: "Đầy đủ",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    category: "Kháng sinh",
    stock: 120,
    minStock: 30,
    expiryDate: "06/2026",
    status: "Đầy đủ",
  },
  {
    id: 3,
    name: "Omeprazole 20mg",
    category: "Dạ dày",
    stock: 35,
    minStock: 30,
    expiryDate: "09/2025",
    status: "Sắp hết",
  },
  {
    id: 4,
    name: "Loratadine 10mg",
    category: "Kháng dị ứng",
    stock: 15,
    minStock: 25,
    expiryDate: "03/2026",
    status: "Sắp hết",
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    category: "Giảm đau",
    stock: 0,
    minStock: 40,
    expiryDate: "N/A",
    status: "Hết hàng",
  },
]

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bảng điều khiển Dược sĩ" description="Quản lý đơn thuốc, kho thuốc và cấp phát thuốc">
        <Link href="/dashboard/pharmacist/prescriptions">
          <Button variant="outline" size="sm" className="h-9">
            <Pill className="mr-2 h-4 w-4" />
            Đơn thuốc
          </Button>
        </Link>
        <Link href="/dashboard/pharmacist/inventory">
          <Button variant="outline" size="sm" className="h-9">
            <Package className="mr-2 h-4 w-4" />
            Kho thuốc
          </Button>
        </Link>
        <Link href="/dashboard/pharmacist/orders">
          <Button variant="outline" size="sm" className="h-9">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Đặt hàng
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Đơn thuốc chờ xử lý"
          value="15"
          icon={<Pill className="h-4 w-4" />}
          trend={{ value: "+3 so với hôm qua", positive: false }}
        />
        <DashboardStat
          title="Thuốc sắp hết hàng"
          value="8"
          icon={<Package className="h-4 w-4" />}
          description="Cần đặt hàng"
        />
        <DashboardStat
          title="Đơn thuốc đã cấp hôm nay"
          value="27"
          icon={<Pill className="h-4 w-4" />}
          trend={{ value: "+5 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Đơn đặt hàng đang chờ"
          value="3"
          icon={<ShoppingCart className="h-4 w-4" />}
          description="1 ưu tiên cao"
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Thống kê cấp phát thuốc"
            description="Số lượng thuốc đã cấp theo tháng"
            data={dispensingData}
            categories={{
              prescriptions: {
                label: "Theo đơn",
                color: "hsl(var(--chart-1))",
              },
              otc: {
                label: "Không theo đơn",
                color: "hsl(var(--chart-2))",
              },
            }}
            xAxisKey="month"
          />
        </Suspense>
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardPieChart
            title="Tình trạng kho thuốc"
            description="Phân loại thuốc theo tình trạng tồn kho"
            data={inventoryData}
          />
        </Suspense>
      </div>

      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
          <TabsTrigger value="inventory">Kho thuốc</TabsTrigger>
        </TabsList>
        <TabsContent value="prescriptions" className="space-y-4">
          <DashboardTable
            title="Đơn thuốc chờ xử lý"
            description="Danh sách đơn thuốc cần được chuẩn bị và cấp phát"
            columns={[
              {
                key: "id",
                header: "Mã đơn",
                cell: (item: any) => <div>#{item.id}</div>,
              },
              {
                key: "patientName",
                header: "Bệnh nhân",
                cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
              },
              {
                key: "doctorName",
                header: "Bác sĩ",
                cell: (item: any) => <div>{item.doctorName}</div>,
              },
              {
                key: "date",
                header: "Ngày kê đơn",
                cell: (item: any) => <div>{item.date}</div>,
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
                      item.status === "Đã cấp"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Đang chuẩn bị"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "Chờ xử lý"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={prescriptions}
            keyField="id"
            actions={
              <Link href="/dashboard/pharmacist/prescriptions">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          />
        </TabsContent>
        <TabsContent value="inventory" className="space-y-4">
          <DashboardTable
            title="Kho thuốc"
            description="Quản lý kho thuốc và tình trạng tồn kho"
            columns={[
              {
                key: "name",
                header: "Tên thuốc",
                cell: (item: any) => <div className="font-medium">{item.name}</div>,
              },
              {
                key: "category",
                header: "Phân loại",
                cell: (item: any) => <div>{item.category}</div>,
              },
              {
                key: "stock",
                header: "Tồn kho",
                cell: (item: any) => <div>{item.stock}</div>,
              },
              {
                key: "minStock",
                header: "Tồn kho tối thiểu",
                cell: (item: any) => <div>{item.minStock}</div>,
              },
              {
                key: "expiryDate",
                header: "Hạn sử dụng",
                cell: (item: any) => <div>{item.expiryDate}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Đầy đủ"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Sắp hết"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "Hết hàng"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={inventory}
            keyField="id"
            actions={
              <Link href="/dashboard/pharmacist/inventory">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
