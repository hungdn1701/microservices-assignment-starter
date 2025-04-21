import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardCheck, FileText, ShieldCheck } from "lucide-react"
import { DashboardStat, DashboardStatsGrid } from "@/components/dashboard/dashboard-stats"
import { DashboardBarChart, DashboardPieChart } from "@/components/dashboard/dashboard-chart"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { PageHeader } from "@/components/layout/page-header"

// Dữ liệu mẫu cho biểu đồ
const claimsData = [
  { month: "T1", submitted: 120, approved: 100, rejected: 20 },
  { month: "T2", submitted: 130, approved: 110, rejected: 20 },
  { month: "T3", submitted: 140, approved: 120, rejected: 20 },
  { month: "T4", submitted: 150, approved: 130, rejected: 20 },
  { month: "T5", submitted: 160, approved: 140, rejected: 20 },
  { month: "T6", submitted: 170, approved: 150, rejected: 20 },
]

const claimTypeData = [
  { name: "Khám bệnh", value: 40, color: "#0088FE" },
  { name: "Nhập viện", value: 25, color: "#00C49F" },
  { name: "Phẫu thuật", value: 15, color: "#FFBB28" },
  { name: "Thuốc", value: 10, color: "#FF8042" },
  { name: "Khác", value: 10, color: "#8884D8" },
]

// Dữ liệu mẫu cho yêu cầu bảo hiểm
const claims = [
  {
    id: 1,
    patientName: "Nguyễn Văn A",
    policyNumber: "POL123456",
    claimDate: "12/04/2025",
    amount: 1500000,
    type: "Khám bệnh",
    status: "Đang xử lý",
  },
  {
    id: 2,
    patientName: "Trần Thị B",
    policyNumber: "POL234567",
    claimDate: "11/04/2025",
    amount: 3500000,
    type: "Nhập viện",
    status: "Đang xử lý",
  },
  {
    id: 3,
    patientName: "Lê Văn C",
    policyNumber: "POL345678",
    claimDate: "10/04/2025",
    amount: 2000000,
    type: "Khám bệnh",
    status: "Đang xử lý",
  },
  {
    id: 4,
    patientName: "Phạm Thị D",
    policyNumber: "POL456789",
    claimDate: "09/04/2025",
    amount: 5000000,
    type: "Phẫu thuật",
    status: "Đang xác minh",
  },
]

// Dữ liệu mẫu cho hợp đồng bảo hiểm
const policies = [
  {
    id: 1,
    holderName: "Nguyễn Văn A",
    policyNumber: "POL123456",
    startDate: "01/01/2025",
    endDate: "31/12/2025",
    type: "Cơ bản",
    status: "Đang hiệu lực",
  },
  {
    id: 2,
    holderName: "Trần Thị B",
    policyNumber: "POL234567",
    startDate: "01/02/2025",
    endDate: "31/01/2026",
    type: "Nâng cao",
    status: "Đang hiệu lực",
  },
  {
    id: 3,
    holderName: "Lê Văn C",
    policyNumber: "POL345678",
    startDate: "01/03/2025",
    endDate: "28/02/2026",
    type: "Cao cấp",
    status: "Đang hiệu lực",
  },
  {
    id: 4,
    holderName: "Phạm Thị D",
    policyNumber: "POL456789",
    startDate: "01/04/2025",
    endDate: "31/03/2026",
    type: "Gia đình",
    status: "Đang hiệu lực",
  },
]

export default function InsuranceDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bảng điều khiển Bảo hiểm" description="Quản lý yêu cầu bảo hiểm, hợp đồng và thanh toán">
        <Link href="/dashboard/insurance/claims">
          <Button variant="outline" size="sm" className="h-9">
            <FileText className="mr-2 h-4 w-4" />
            Yêu cầu bảo hiểm
          </Button>
        </Link>
        <Link href="/dashboard/insurance/policies">
          <Button variant="outline" size="sm" className="h-9">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Hợp đồng
          </Button>
        </Link>
        <Link href="/dashboard/insurance/payments">
          <Button variant="outline" size="sm" className="h-9">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="mr-2 h-4 w-4"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Thanh toán
          </Button>
        </Link>
      </PageHeader>

      <DashboardStatsGrid>
        <DashboardStat
          title="Yêu cầu chờ xử lý"
          value="24"
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: "+5 so với hôm qua", positive: false }}
        />
        <DashboardStat
          title="Yêu cầu đã phê duyệt"
          value="18"
          icon={<ClipboardCheck className="h-4 w-4" />}
          trend={{ value: "+3 so với hôm qua", positive: true }}
        />
        <DashboardStat
          title="Hợp đồng hiện tại"
          value="842"
          icon={<ShieldCheck className="h-4 w-4" />}
          trend={{ value: "+12 trong tháng này", positive: true }}
        />
        <DashboardStat
          title="Tổng thanh toán tháng này"
          value="₫245.8M"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          trend={{ value: "+₫32.5M so với tháng trước", positive: true }}
        />
      </DashboardStatsGrid>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardBarChart
            title="Thống kê yêu cầu bảo hiểm"
            description="Số lượng yêu cầu bảo hiểm theo tháng"
            data={claimsData}
            categories={{
              submitted: {
                label: "Đã gửi",
                color: "hsl(var(--chart-1))",
              },
              approved: {
                label: "Đã duyệt",
                color: "hsl(var(--chart-2))",
              },
              rejected: {
                label: "Từ chối",
                color: "hsl(var(--chart-6))",
              },
            }}
            xAxisKey="month"
          />
        </Suspense>
        <Suspense fallback={<div>Đang tải...</div>}>
          <DashboardPieChart
            title="Phân loại yêu cầu"
            description="Tỷ lệ các loại yêu cầu bảo hiểm trong tháng"
            data={claimTypeData}
          />
        </Suspense>
      </div>

      <Tabs defaultValue="claims" className="space-y-4">
        <TabsList>
          <TabsTrigger value="claims">Yêu cầu bảo hiểm</TabsTrigger>
          <TabsTrigger value="policies">Hợp đồng bảo hiểm</TabsTrigger>
        </TabsList>
        <TabsContent value="claims" className="space-y-4">
          <DashboardTable
            title="Yêu cầu bảo hiểm"
            description="Quản lý và xử lý các yêu cầu bảo hiểm"
            columns={[
              {
                key: "id",
                header: "Mã yêu cầu",
                cell: (item: any) => <div>#{item.id}</div>,
              },
              {
                key: "patientName",
                header: "Người yêu cầu",
                cell: (item: any) => <div className="font-medium">{item.patientName}</div>,
              },
              {
                key: "policyNumber",
                header: "Số hợp đồng",
                cell: (item: any) => <div>{item.policyNumber}</div>,
              },
              {
                key: "claimDate",
                header: "Ngày yêu cầu",
                cell: (item: any) => <div>{item.claimDate}</div>,
              },
              {
                key: "amount",
                header: "Số tiền",
                cell: (item: any) => <div>{item.amount.toLocaleString("vi-VN")} ₫</div>,
              },
              {
                key: "type",
                header: "Loại yêu cầu",
                cell: (item: any) => <div>{item.type}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Đã duyệt"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Đang xử lý"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "Đang xác minh"
                            ? "bg-amber-100 text-amber-800"
                            : item.status === "Từ chối"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={claims}
            keyField="id"
            actions={
              <Link href="/dashboard/insurance/claims">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            }
          />
        </TabsContent>
        <TabsContent value="policies" className="space-y-4">
          <DashboardTable
            title="Hợp đồng bảo hiểm"
            description="Xem và quản lý các hợp đồng bảo hiểm hiện tại"
            columns={[
              {
                key: "id",
                header: "ID",
                cell: (item: any) => <div>#{item.id}</div>,
              },
              {
                key: "holderName",
                header: "Chủ hợp đồng",
                cell: (item: any) => <div className="font-medium">{item.holderName}</div>,
              },
              {
                key: "policyNumber",
                header: "Số hợp đồng",
                cell: (item: any) => <div>{item.policyNumber}</div>,
              },
              {
                key: "period",
                header: "Thời hạn",
                cell: (item: any) => (
                  <div>
                    {item.startDate} - {item.endDate}
                  </div>
                ),
              },
              {
                key: "type",
                header: "Loại hợp đồng",
                cell: (item: any) => <div>{item.type}</div>,
              },
              {
                key: "status",
                header: "Trạng thái",
                cell: (item: any) => (
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "Đang hiệu lực"
                        ? "bg-green-100 text-green-800"
                        : item.status === "Sắp hết hạn"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "Hết hạn"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                ),
              },
            ]}
            data={policies}
            keyField="id"
            actions={
              <Link href="/dashboard/insurance/policies">
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
