"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Search, Filter, Pill, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"

// Giả lập dữ liệu đơn thuốc
const prescriptions = [
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
    date: "2025-05-15",
    status: "PENDING",
    priority: "HIGH",
    medications: [
      { name: "Paracetamol 500mg", dosage: "1 viên x 3 lần/ngày", quantity: 30 },
      { name: "Vitamin C 1000mg", dosage: "1 viên/ngày", quantity: 10 },
    ],
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
    date: "2025-05-15",
    status: "PENDING",
    priority: "MEDIUM",
    medications: [
      { name: "Atenolol 50mg", dosage: "1 viên/ngày", quantity: 30 },
      { name: "Aspirin 81mg", dosage: "1 viên/ngày", quantity: 30 },
    ],
  },
  {
    id: 3,
    patient: {
      id: 103,
      name: "Lê Văn E",
      gender: "Nam",
      age: 58,
    },
    doctor: {
      id: 203,
      name: "BS. Phạm Thị F",
      department: "Thần kinh",
    },
    date: "2025-05-14",
    status: "PROCESSING",
    priority: "MEDIUM",
    medications: [
      { name: "Amitriptyline 25mg", dosage: "1 viên trước khi ngủ", quantity: 30 },
      { name: "Gabapentin 300mg", dosage: "1 viên x 3 lần/ngày", quantity: 90 },
    ],
  },
  {
    id: 4,
    patient: {
      id: 104,
      name: "Phạm Thị G",
      gender: "Nữ",
      age: 27,
    },
    doctor: {
      id: 204,
      name: "BS. Hoàng Văn H",
      department: "Da liễu",
    },
    date: "2025-05-14",
    status: "DISPENSED",
    priority: "LOW",
    medications: [
      { name: "Cetirizine 10mg", dosage: "1 viên/ngày", quantity: 10 },
      { name: "Mometasone Cream 0.1%", dosage: "Bôi 2 lần/ngày", quantity: 1 },
    ],
  },
  {
    id: 5,
    patient: {
      id: 105,
      name: "Hoàng Văn I",
      gender: "Nam",
      age: 62,
    },
    doctor: {
      id: 205,
      name: "BS. Nguyễn Thị K",
      department: "Nội tiết",
    },
    date: "2025-05-13",
    status: "DISPENSED",
    priority: "HIGH",
    medications: [
      { name: "Metformin 500mg", dosage: "1 viên x 2 lần/ngày", quantity: 60 },
      { name: "Glimepiride 2mg", dosage: "1 viên/ngày", quantity: 30 },
      { name: "Atorvastatin 20mg", dosage: "1 viên/ngày", quantity: 30 },
    ],
  },
]

export default function PharmacistPrescriptionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // Lọc đơn thuốc theo tab
  const getFilteredPrescriptions = () => {
    let filtered = [...prescriptions]

    // Lọc theo tab
    if (activeTab === "pending") {
      filtered = filtered.filter((p) => p.status === "PENDING")
    } else if (activeTab === "processing") {
      filtered = filtered.filter((p) => p.status === "PROCESSING")
    } else if (activeTab === "dispensed") {
      filtered = filtered.filter((p) => p.status === "DISPENSED")
    }

    // Lọc theo tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.patient.name.toLowerCase().includes(query) ||
          p.doctor.name.toLowerCase().includes(query) ||
          p.id.toString().includes(query),
      )
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    // Lọc theo mức độ ưu tiên
    if (priorityFilter !== "all") {
      filtered = filtered.filter((p) => p.priority === priorityFilter)
    }

    return filtered
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <StatusBadge status="warning" text="Chờ xử lý" />
      case "PROCESSING":
        return <StatusBadge status="info" text="Đang chuẩn bị" />
      case "DISPENSED":
        return <StatusBadge status="success" text="Đã phát thuốc" />
      default:
        return <StatusBadge status="default" text={status} />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <StatusBadge status="error" text="Cao" />
      case "MEDIUM":
        return <StatusBadge status="warning" text="Trung bình" />
      case "LOW":
        return <StatusBadge status="info" text="Thấp" />
      default:
        return <StatusBadge status="default" text={priority} />
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>
      <PageHeader title="Quản lý đơn thuốc" description="Xem và xử lý các đơn thuốc từ bác sĩ" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <motion.div variants={item}>
          <StatCard
            title="Đơn thuốc chờ xử lý"
            value={prescriptions.filter((p) => p.status === "PENDING").length.toString()}
            description="Cần xử lý ngay"
            icon={<AlertCircle className="h-5 w-5" />}
            trend="up"
            trendValue="15%"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Đơn thuốc đang chuẩn bị"
            value={prescriptions.filter((p) => p.status === "PROCESSING").length.toString()}
            description="Đang trong quá trình chuẩn bị"
            icon={<Clock className="h-5 w-5" />}
            trend="neutral"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Đơn thuốc đã phát"
            value={prescriptions.filter((p) => p.status === "DISPENSED").length.toString()}
            description="Hoàn thành hôm nay"
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend="up"
            trendValue="8%"
          />
        </motion.div>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Danh sách đơn thuốc</CardTitle>
              <CardDescription>Quản lý và xử lý các đơn thuốc</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đơn thuốc..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
              <TabsTrigger value="processing">Đang chuẩn bị</TabsTrigger>
              <TabsTrigger value="dispensed">Đã phát thuốc</TabsTrigger>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
            </TabsList>

            <DataTable
              columns={[
                {
                  key: "id",
                  header: "Mã đơn",
                  cell: (row) => <div className="font-medium">#{row.id}</div>,
                  sortable: true,
                },
                {
                  key: "patient",
                  header: "Bệnh nhân",
                  cell: (row) => (
                    <div>
                      <div className="font-medium">{row.patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {row.patient.gender}, {row.patient.age} tuổi
                      </div>
                    </div>
                  ),
                },
                {
                  key: "doctor",
                  header: "Bác sĩ",
                  cell: (row) => (
                    <div>
                      <div>{row.doctor.name}</div>
                      <div className="text-sm text-muted-foreground">{row.doctor.department}</div>
                    </div>
                  ),
                },
                {
                  key: "date",
                  header: "Ngày kê đơn",
                  cell: (row) => <div>{format(new Date(row.date), "dd/MM/yyyy")}</div>,
                  sortable: true,
                },
                {
                  key: "medications",
                  header: "Số loại thuốc",
                  cell: (row) => <div>{row.medications.length}</div>,
                },
                {
                  key: "priority",
                  header: "Ưu tiên",
                  cell: (row) => getPriorityBadge(row.priority),
                },
                {
                  key: "status",
                  header: "Trạng thái",
                  cell: (row) => getStatusBadge(row.status),
                },
                {
                  key: "actions",
                  header: "",
                  cell: (row) => (
                    <Button
                      variant="outline"
                      size="sm"
                      className="group"
                      onClick={() => router.push(`/dashboard/pharmacist/prescriptions/${row.id}/dispense`)}
                    >
                      <span>Chi tiết</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  ),
                },
              ]}
              data={getFilteredPrescriptions()}
              keyField="id"
              isLoading={loading}
              searchable={false}
              pagination={true}
              pageSize={5}
              emptyState={
                <div className="flex flex-col items-center justify-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Không có đơn thuốc</h3>
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy đơn thuốc nào phù hợp với bộ lọc hiện tại.
                  </p>
                </div>
              }
            />
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
