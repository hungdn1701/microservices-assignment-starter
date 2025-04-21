"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"

// Giả lập dữ liệu bệnh nhân
const patientData = {
  id: "P12345",
  name: "Nguyễn Văn A",
  age: 45,
  gender: "Nam",
  dob: "15/05/1978",
  phone: "0912345678",
  email: "nguyenvana@example.com",
  address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  bloodType: "O+",
  allergies: ["Penicillin", "Hải sản"],
  chronicConditions: ["Tăng huyết áp", "Đái tháo đường type 2"],
  insuranceProvider: "Bảo hiểm Y tế Quốc gia",
  insuranceNumber: "BH123456789",
  emergencyContact: "Nguyễn Thị B (Vợ) - 0987654321",
}

// Giả lập dữ liệu lịch sử khám bệnh
const medicalRecords = [
  {
    id: "MR001",
    date: "12/03/2023",
    doctor: "BS. Trần Văn C",
    diagnosis: "Viêm phổi",
    treatment: "Kháng sinh, nghỉ ngơi",
    notes: "Bệnh nhân cần tái khám sau 1 tuần",
  },
  {
    id: "MR002",
    date: "05/06/2023",
    doctor: "BS. Lê Thị D",
    diagnosis: "Tăng huyết áp",
    treatment: "Amlodipine 5mg",
    notes: "Cần theo dõi huyết áp hàng ngày",
  },
  {
    id: "MR003",
    date: "18/09/2023",
    doctor: "BS. Phạm Văn E",
    diagnosis: "Đau lưng",
    treatment: "Thuốc giảm đau, vật lý trị liệu",
    notes: "Hạn chế vận động mạnh",
  },
]

// Giả lập dữ liệu đơn thuốc
const prescriptions = [
  {
    id: "RX001",
    date: "12/03/2023",
    doctor: "BS. Trần Văn C",
    medications: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "3 lần/ngày", duration: "7 ngày" },
      { name: "Paracetamol", dosage: "500mg", frequency: "Khi sốt > 38.5°C", duration: "PRN" },
    ],
    status: "completed",
  },
  {
    id: "RX002",
    date: "05/06/2023",
    doctor: "BS. Lê Thị D",
    medications: [{ name: "Amlodipine", dosage: "5mg", frequency: "1 lần/ngày", duration: "30 ngày" }],
    status: "active",
  },
]

// Giả lập dữ liệu xét nghiệm
const labResults = [
  {
    id: "LR001",
    date: "11/03/2023",
    type: "Công thức máu",
    results: [
      { name: "WBC", value: "12.5", unit: "10^3/uL", reference: "4.5-11.0" },
      { name: "RBC", value: "4.8", unit: "10^6/uL", reference: "4.5-5.5" },
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", reference: "13.5-17.5" },
    ],
    status: "completed",
  },
  {
    id: "LR002",
    date: "05/06/2023",
    type: "Sinh hóa máu",
    results: [
      { name: "Glucose", value: "126", unit: "mg/dL", reference: "70-99" },
      { name: "HbA1c", value: "6.8", unit: "%", reference: "<5.7" },
      { name: "Cholesterol", value: "210", unit: "mg/dL", reference: "<200" },
    ],
    status: "completed",
  },
  {
    id: "LR003",
    date: "18/09/2023",
    type: "X-quang",
    results: [{ name: "X-quang cột sống thắt lưng", value: "Thoái hóa đốt sống L4-L5", unit: "", reference: "" }],
    status: "completed",
  },
]

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleExamination = () => {
    router.push(`/dashboard/doctor/examination/${params.id}`)
  }

  const handleLabRequest = () => {
    router.push("/dashboard/doctor/lab-requests/new")
  }

  const handlePrescription = () => {
    router.push("/dashboard/doctor/prescriptions/new")
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Bệnh nhân: ${patientData.name}`}
        description={`ID: ${patientData.id} | ${patientData.age} tuổi | ${patientData.gender}`}
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExamination}>Khám bệnh</Button>
          <Button onClick={handleLabRequest} variant="outline">
            Yêu cầu xét nghiệm
          </Button>
          <Button onClick={handlePrescription} variant="outline">
            Kê đơn thuốc
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="records">Lịch sử khám</TabsTrigger>
          <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
          <TabsTrigger value="lab-results">Kết quả xét nghiệm</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-20 w-20">
                    <div className="flex h-full w-full items-center justify-center bg-muted text-xl font-medium">
                      {patientData.name.split(" ").pop()?.charAt(0)}
                    </div>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{patientData.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patientData.gender}, {patientData.age} tuổi
                    </p>
                    <p className="text-sm text-muted-foreground">Ngày sinh: {patientData.dob}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Số điện thoại:</span>
                    <span className="text-sm">{patientData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{patientData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Địa chỉ:</span>
                    <span className="text-sm">{patientData.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Nhóm máu:</span>
                    <span className="text-sm">{patientData.bloodType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Liên hệ khẩn cấp:</span>
                    <span className="text-sm">{patientData.emergencyContact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin y tế</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Dị ứng</h4>
                  <div className="flex flex-wrap gap-2">
                    {patientData.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Bệnh mãn tính</h4>
                  <div className="flex flex-wrap gap-2">
                    {patientData.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Bảo hiểm</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Nhà cung cấp:</span>
                      <span className="text-sm">{patientData.insuranceProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Số bảo hiểm:</span>
                      <span className="text-sm">{patientData.insuranceNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử khám bệnh</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: "Ngày khám", accessorKey: "date" },
                  { header: "Bác sĩ", accessorKey: "doctor" },
                  { header: "Chẩn đoán", accessorKey: "diagnosis" },
                  { header: "Điều trị", accessorKey: "treatment" },
                  { header: "Ghi chú", accessorKey: "notes" },
                ]}
                data={medicalRecords}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Đơn thuốc</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptions.map((prescription, index) => (
                <div key={prescription.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium">Đơn thuốc #{prescription.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ngày: {prescription.date} | Bác sĩ: {prescription.doctor}
                      </p>
                    </div>
                    <StatusBadge status={prescription.status === "active" ? "active" : "completed"}>
                      {prescription.status === "active" ? "Đang sử dụng" : "Đã hoàn thành"}
                    </StatusBadge>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Thuốc</th>
                          <th className="text-left pb-2">Liều lượng</th>
                          <th className="text-left pb-2">Tần suất</th>
                          <th className="text-left pb-2">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescription.medications.map((med, medIndex) => (
                          <tr key={medIndex} className="border-b last:border-0">
                            <td className="py-2">{med.name}</td>
                            <td className="py-2">{med.dosage}</td>
                            <td className="py-2">{med.frequency}</td>
                            <td className="py-2">{med.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {index < prescriptions.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kết quả xét nghiệm</CardTitle>
            </CardHeader>
            <CardContent>
              {labResults.map((result, index) => (
                <div key={result.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-medium">
                        {result.type} (#{result.id})
                      </h3>
                      <p className="text-sm text-muted-foreground">Ngày: {result.date}</p>
                    </div>
                    <StatusBadge status="completed">Đã hoàn thành</StatusBadge>
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Xét nghiệm</th>
                          <th className="text-left pb-2">Kết quả</th>
                          <th className="text-left pb-2">Đơn vị</th>
                          <th className="text-left pb-2">Tham chiếu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.results.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-b last:border-0">
                            <td className="py-2">{item.name}</td>
                            <td className="py-2 font-medium">
                              {item.reference &&
                              item.unit &&
                              Number.parseFloat(item.value) >
                                Number.parseFloat(item.reference.split("-")[1] || item.reference.replace("<", "")) ? (
                                <span className="text-red-500">{item.value}</span>
                              ) : (
                                item.value
                              )}
                            </td>
                            <td className="py-2">{item.unit}</td>
                            <td className="py-2">{item.reference}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {index < labResults.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
