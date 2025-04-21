"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/layout/page-header"

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Dữ liệu mẫu
  const patients = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      gender: "Nam",
      age: 45,
      phone: "0901234567",
      lastVisit: "15/04/2025",
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Trần Thị B",
      gender: "Nữ",
      age: 32,
      phone: "0907654321",
      lastVisit: "10/04/2025",
      status: "SCHEDULED",
    },
    {
      id: 3,
      name: "Lê Văn C",
      gender: "Nam",
      age: 58,
      phone: "0909876543",
      lastVisit: "05/04/2025",
      status: "COMPLETED",
    },
  ]

  const columns = [
    {
      key: "name",
      header: "Họ tên",
      cell: (patient: any) => (
        <Link href={`/dashboard/doctor/patients/${patient.id}`} className="font-medium hover:underline">
          {patient.name}
        </Link>
      ),
    },
    {
      key: "gender",
      header: "Giới tính",
      cell: (patient: any) => patient.gender,
    },
    {
      key: "age",
      header: "Tuổi",
      cell: (patient: any) => patient.age,
    },
    {
      key: "phone",
      header: "Số điện thoại",
      cell: (patient: any) => patient.phone,
    },
    {
      key: "lastVisit",
      header: "Lần khám gần nhất",
      cell: (patient: any) => patient.lastVisit,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (patient: any) => <StatusBadge status={patient.status} />,
    },
    {
      key: "actions",
      header: "",
      cell: (patient: any) => (
        <div className="flex justify-end">
          <Link href={`/dashboard/doctor/examination?patient=${patient.id}`}>
            <Button size="sm" variant="outline">
              Khám bệnh
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
      <PageHeader title="Bệnh nhân" description="Quản lý danh sách bệnh nhân của bạn">
        <Link href="/dashboard/doctor/patients/new">
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm bệnh nhân
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm bệnh nhân..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredPatients}
            keyField="id"
            emptyState={
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">Không tìm thấy bệnh nhân nào</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
