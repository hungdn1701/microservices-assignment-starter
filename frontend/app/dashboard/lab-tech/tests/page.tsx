"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Search, FlaskRoundIcon as Flask, FileText, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { useToast } from "@/components/ui/use-toast"

// Giả lập dữ liệu xét nghiệm
const labTests = [
  {
    id: 1,
    patient: {
      id: 101,
      name: "Nguyễn Văn A",
      gender: "Nam",
      age: 45,
    },
    doctor: {
      id: 201,
      name: "BS. Trần Thị B",
      department: "Nội khoa",
    },
    testName: "Công thức máu toàn phần",
    orderedAt: "2025-05-15T09:30:00",
    status: "PENDING",
    priority: "HIGH",
    sampleCollected: false,
  },
  {
    id: 2,
    patient: {
      id: 102,
      name: "Trần Thị C",
      gender: "Nữ",
      age: 32,
    },
    doctor: {
      id: 202,
      name: "BS. Lê Văn D",
      department: "Tim mạch",
    },
    testName: "Sinh hóa máu",
    orderedAt: "2025-05-15T14:00:00",
    status: "PROCESSING",
    priority: "NORMAL",
    sampleCollected: true,
  },
  {
    id: 3,
    patient: {
      id: 103,
      name: "Lê Thị E",
      gender: "Nữ",
      age: 60,
    },
    doctor: {
      id: 203,
      name: "BS. Phạm Văn F",
      department: "Tiêu hóa",
    },
    testName: "Tổng phân tích nước tiểu",
    orderedAt: "2025-05-16T11:15:00",
    status: "COMPLETED",
    priority: "NORMAL",
    sampleCollected: true,
  },
  {
    id: 4,
    patient: {
      id: 104,
      name: "Hoàng Văn G",
      gender: "Nam",
      age: 58,
    },
    doctor: {
      id: 204,
      name: "BS. Vũ Thị H",
      department: "Thần kinh",
    },
    testName: "Điện giải đồ",
    orderedAt: "2025-05-16T16:45:00",
    status: "PENDING",
    priority: "NORMAL",
    sampleCollected: false,
  },
  {
    id: 5,
    patient: {
      id: 105,
      name: "Phan Thị K",
      gender: "Nữ",
      age: 25,
    },
    doctor: {
      id: 205,
      name: "BS. Đỗ Văn L",
      department: "Hô hấp",
    },
    testName: "Khí máu động mạch",
    orderedAt: "2025-05-17T08:00:00",
    status: "PROCESSING",
    priority: "HIGH",
    sampleCollected: true,
  },
  {
    id: 6,
    patient: {
      id: 106,
      name: "Bùi Văn M",
      gender: "Nam",
      age: 70,
    },
    doctor: {
      id: 206,
      name: "BS. Nguyễn Thị N",
      department: "Nội tiết",
    },
    testName: "Đường huyết",
    orderedAt: "2025-05-17T13:30:00",
    status: "COMPLETED",
    priority: "NORMAL",
    sampleCollected: true,
  },
  {
    id: 7,
    patient: {
      id: 107,
      name: "Đinh Thị O",
      gender: "Nữ",
      age: 40,
    },
    doctor: {
      id: 207,
      name: "BS. Hoàng Văn P",
      department: "Ngoại khoa",
    },
    testName: "CRP định lượng",
    orderedAt: "2025-05-18T10:45:00",
    status: "PENDING",
    priority: "NORMAL",
    sampleCollected: false,
  },
  {
    id: 8,
    patient: {
      id: 108,
      name: "Vũ Văn Q",
      gender: "Nam",
      age: 38,
    },
    doctor: {
      id: 208,
      name: "BS. Trần Thị R",
      department: "Da liễu",
    },
    testName: "HIV test nhanh",
    orderedAt: "2025-05-18T15:00:00",
    status: "PROCESSING",
    priority: "NORMAL",
    sampleCollected: true,
  },
  {
    id: 9,
    patient: {
      id: 109,
      name: "Phùng Thị S",
      gender: "Nữ",
      age: 52,
    },
    doctor: {
      id: 209,
      name: "BS. Lê Văn T",
      department: "Ung bướu",
    },
    testName: "CEA",
    orderedAt: "2025-05-19T09:00:00",
    status: "COMPLETED",
    priority: "NORMAL",
    sampleCollected: true,
  },
  {
    id: 10,
    patient: {
      id: 110,
      name: "Cao Văn U",
      gender: "Nam",
      age: 65,
    },
    doctor: {
      id: 210,
      name: "BS. Phạm Thị V",
      department: "Mắt",
    },
    testName: "PSA",
    orderedAt: "2025-05-19T14:30:00",
    status: "PENDING",
    priority: "NORMAL",
    sampleCollected: false,
  },
]

// Định nghĩa kiểu dữ liệu cho xét nghiệm
type LabTest = {
  id: number
  patient: {
    id: number
    name: string
    gender: string
    age: number
  }
  doctor: {
    id: number
    name: string
    department: string
  }
  testName: string
  orderedAt: string
  status: "PENDING" | "PROCESSING" | "COMPLETED"
  priority: "HIGH" | "NORMAL"
  sampleCollected: boolean
}

export default function LabTestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<LabTest[]>([])
  const [filteredTests, setFilteredTests] = useState<LabTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchLabTests()
  }, [])

  useEffect(() => {
    filterTests()
  }, [searchTerm, statusFilter, tests, activeTab])

  const fetchLabTests = async () => {
    try {
      setLoading(true)
      // Giả lập API call để lấy danh sách xét nghiệm
      // Trong thực tế, sẽ gọi API từ LaboratoryService.getAllLabTests()
      setTimeout(() => {
        // const mockTests = [
        //   {
        //     id: 1,
        //     patient: {
        //       id: 101,
        //       first_name: "Nguyễn",
        //       last_name: "Văn A",
        //       email: "patient1@example.com",
        //     },
        //     test_type: {
        //       id: 1,
        //       name: "Công thức máu toàn phần",
        //       code: "CBC",
        //       sample_type: "BLOOD",
        //     },
        //     ordered_by: {
        //       id: 201,
        //       first_name: "Trần",
        //       last_name: "Thị B",
        //       email: "doctor1@example.com",
        //     },
        //     ordered_at: "2025-05-01T10:00:00Z",
        //     priority: "NORMAL",
        //     status: "ORDERED",
        //     notes: "Kiểm tra tổng quát",
        //     sample_collection: null,
        //   },
        //   {
        //     id: 2,
        //     patient: {
        //       id: 102,
        //       first_name: "Trần",
        //       last_name: "Văn C",
        //       email: "patient2@example.com",
        //     },
        //     test_type: {
        //       id: 2,
        //       name: "Sinh hóa máu",
        //       code: "CHEM",
        //       sample_type: "BLOOD",
        //     },
        //     ordered_by: {
        //       id: 202,
        //       first_name: "Lê",
        //       last_name: "Văn D",
        //       email: "doctor2@example.com",
        //     },
        //     ordered_at: "2025-05-02T11:30:00Z",
        //     priority: "URGENT",
        //     status: "SAMPLE_COLLECTED",
        //     notes: "Kiểm tra chức năng gan, thận",
        //     sample_collection: {
        //       id: 1,
        //       collected_at: "2025-05-02T14:00:00Z",
        //       sample_type: "BLOOD",
        //       status: "COLLECTED",
        //     },
        //   },
        //   {
        //     id: 3,
        //     patient: {
        //       id: 103,
        //       first_name: "Lê",
        //       last_name: "Thị E",
        //       email: "patient3@example.com",
        //     },
        //     test_type: {
        //       id: 3,
        //       name: "Xét nghiệm nước tiểu",
        //       code: "UA",
        //       sample_type: "URINE",
        //     },
        //     ordered_by: {
        //       id: 203,
        //       first_name: "Phạm",
        //       last_name: "Văn F",
        //       email: "doctor3@example.com",
        //     },
        //     ordered_at: "2025-05-03T09:15:00Z",
        //     priority: "HIGH",
        //     status: "IN_PROGRESS",
        //     notes: "Kiểm tra chức năng thận",
        //     sample_collection: {
        //       id: 2,
        //       collected_at: "2025-05-03T10:30:00Z",
        //       sample_type: "URINE",
        //       status: "PROCESSING",
        //     },
        //   },
        //   {
        //     id: 4,
        //     patient: {
        //       id: 104,
        //       first_name: "Phạm",
        //       last_name: "Thị G",
        //       email: "patient4@example.com",
        //     },
        //     test_type: {
        //       id: 4,
        //       name: "Đường huyết",
        //       code: "GLUC",
        //       sample_type: "BLOOD",
        //     },
        //     ordered_by: {
        //       id: 204,
        //       first_name: "Hoàng",
        //       last_name: "Văn H",
        //       email: "doctor4@example.com",
        //     },
        //     ordered_at: "2025-05-04T14:45:00Z",
        //     priority: "NORMAL",
        //     status: "COMPLETED",
        //     notes: "Theo dõi đường huyết",
        //     sample_collection: {
        //       id: 3,
        //       collected_at: "2025-05-04T15:30:00Z",
        //       sample_type: "BLOOD",
        //       status: "PROCESSED",
        //     },
        //   },
        //   {
        //     id: 5,
        //     patient: {
        //       id: 105,
        //       first_name: "Hoàng",
        //       last_name: "Văn I",
        //       email: "patient5@example.com",
        //     },
        //     test_type: {
        //       id: 5,
        //       name: "Xét nghiệm chức năng gan",
        //       code: "LFT",
        //       sample_type: "BLOOD",
        //     },
        //     ordered_by: {
        //       id: 205,
        //       first_name: "Vũ",
        //       last_name: "Thị K",
        //       email: "doctor5@example.com",
        //     },
        //     ordered_at: "2025-05-05T08:30:00Z",
        //     priority: "URGENT",
        //     status: "CANCELLED",
        //     notes: "Đánh giá chức năng gan",
        //     sample_collection: null,
        //   },
        // ]
        setTests(labTests)
        setFilteredTests(labTests)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching lab tests:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xét nghiệm. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const filterTests = () => {
    let filtered = [...tests]

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter((test) => test.status === "PENDING")
    } else if (activeTab === "processing") {
      filtered = filtered.filter((test) => test.status === "PROCESSING")
    } else if (activeTab === "completed") {
      filtered = filtered.filter((test) => test.status === "COMPLETED")
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.testName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((test) => test.status === statusFilter)
    }

    setFilteredTests(filtered)
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Mã XN",
      cell: ({ row }: any) => <span className="font-medium">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "patient",
      header: "Bệnh nhân",
      cell: ({ row }: any) => {
        const patient = row.original.patient
        return (
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="text-xs text-muted-foreground">
              Tuổi: {patient.age}, Giới tính: {patient.gender}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "testName",
      header: "Loại xét nghiệm",
      cell: ({ row }: any) => {
        const testName = row.getValue("testName")
        return (
          <div>
            <p>{testName}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "orderedAt",
      header: "Ngày yêu cầu",
      cell: ({ row }: any) => format(new Date(row.getValue("orderedAt")), "dd/MM/yyyy, HH:mm", { locale: vi }),
    },
    {
      accessorKey: "priority",
      header: "Độ ưu tiên",
      cell: ({ row }: any) => {
        const priority = row.getValue("priority")
        return <StatusBadge status={priority} variant={priority === "HIGH" ? "warning" : "default"} />
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => {
        const status = row.getValue("status")
        let statusText = ""
        if (status === "PENDING") {
          statusText = "Chờ xử lý"
        } else if (status === "PROCESSING") {
          statusText = "Đang xử lý"
        } else if (status === "COMPLETED") {
          statusText = "Đã hoàn thành"
        }
        return <StatusBadge status={statusText} />
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const test = row.original
        return (
          <div className="flex justify-end gap-2">
            {test.status === "PENDING" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/lab-tech/samples/new?testId=${test.id}`)}
              >
                <Clock className="mr-2 h-3.5 w-3.5" />
                Thu thập mẫu
              </Button>
            )}
            {test.status === "PROCESSING" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/lab-tech/tests/${test.id}/results`)}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Nhập kết quả
              </Button>
            )}
            {test.status === "COMPLETED" && (
              <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/lab-tech/tests/${test.id}`)}>
                <FileText className="mr-2 h-3.5 w-3.5" />
                Chi tiết
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const totalTests = labTests.length
  const pendingTests = labTests.filter((test) => test.status === "PENDING").length
  const processingTests = labTests.filter((test) => test.status === "PROCESSING").length
  const completedTests = labTests.filter((test) => test.status === "COMPLETED").length

  return (
    <PageContainer>
      <PageHeader title="Quản lý xét nghiệm" description="Quản lý và xử lý các yêu cầu xét nghiệm" />

      <motion.div
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <StatCard title="Tổng số xét nghiệm" value={totalTests} icon={<Flask className="h-4 w-4 text-gray-500" />} />
        <StatCard title="Chờ xử lý" value={pendingTests} icon={<Clock className="h-4 w-4 text-gray-500" />} />
        <StatCard title="Đang xử lý" value={processingTests} icon={<Clock className="h-4 w-4 text-gray-500" />} />
        <StatCard
          title="Đã hoàn thành"
          value={completedTests}
          icon={<CheckCircle2 className="h-4 w-4 text-gray-500" />}
        />
      </motion.div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả xét nghiệm</TabsTrigger>
          <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
          <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
          <TabsTrigger value="completed">Đã hoàn thành</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Danh sách xét nghiệm</CardTitle>
                  <CardDescription>Quản lý tất cả các yêu cầu xét nghiệm</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm xét nghiệm..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                      <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                      <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredTests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Xét nghiệm chờ xử lý</CardTitle>
              <CardDescription>Danh sách các xét nghiệm cần thu thập mẫu hoặc xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">Không có xét nghiệm nào đang chờ xử lý</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tất cả các xét nghiệm đã được xử lý</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredTests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Xét nghiệm đang xử lý</CardTitle>
              <CardDescription>Danh sách các xét nghiệm đang được xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Không có xét nghiệm nào đang xử lý</h3>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredTests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Xét nghiệm đã hoàn thành</CardTitle>
              <CardDescription>Danh sách các xét nghiệm đã hoàn thành</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Không có xét nghiệm nào đã hoàn thành</h3>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredTests} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
