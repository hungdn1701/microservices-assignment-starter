"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  User,
  Calendar,
  Pill,
  ChevronLeft,
  CheckCircle2,
  Printer,
  MinusCircle,
  PlusCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"

// Giả lập dữ liệu đơn thuốc
const prescriptionData = {
  id: 1,
  patient: {
    id: 101,
    name: "Nguyễn Văn A",
    gender: "Nam",
    age: 45,
    phone: "0912345678",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  },
  doctor: {
    id: 201,
    name: "BS. Trần Thị B",
    department: "Nội khoa",
  },
  date: "2025-05-15",
  status: "PENDING",
  priority: "HIGH",
  diagnosis: "Viêm họng cấp, Sốt nhẹ",
  notes: "Bệnh nhân có tiền sử dị ứng với Penicillin",
  medications: [
    {
      id: 1,
      name: "Paracetamol 500mg",
      dosage: "1 viên x 3 lần/ngày",
      quantity: 30,
      instructions: "Uống sau khi ăn",
      inStock: true,
      stockQuantity: 120,
    },
    {
      id: 2,
      name: "Vitamin C 1000mg",
      dosage: "1 viên/ngày",
      quantity: 10,
      instructions: "Uống vào buổi sáng",
      inStock: true,
      stockQuantity: 85,
    },
    {
      id: 3,
      name: "Amoxicillin 500mg",
      dosage: "1 viên x 2 lần/ngày",
      quantity: 20,
      instructions: "Uống trước khi ăn 30 phút",
      inStock: false,
      stockQuantity: 0,
    },
  ],
}

export default function DispensePrescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medications, setMedications] = useState(
    prescriptionData.medications.map((med) => ({
      ...med,
      dispensed: med.inStock,
      dispensedQuantity: med.inStock ? med.quantity : 0,
      notes: "",
    })),
  )
  const [patientInstructions, setPatientInstructions] = useState("")

  const handleDispensedChange = (id: number, checked: boolean) => {
    setMedications(
      medications.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            dispensed: checked,
            dispensedQuantity: checked ? med.quantity : 0,
          }
        }
        return med
      }),
    )
  }

  const handleQuantityChange = (id: number, quantity: number) => {
    setMedications(
      medications.map((med) => {
        if (med.id === id) {
          return {
            ...med,
            dispensedQuantity: Math.max(0, Math.min(quantity, med.stockQuantity)),
          }
        }
        return med
      }),
    )
  }

  const handleNotesChange = (id: number, notes: string) => {
    setMedications(
      medications.map((med) => {
        if (med.id === id) {
          return { ...med, notes }
        }
        return med
      }),
    )
  }

  const handleDispense = async () => {
    setIsSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/dashboard/pharmacist/prescriptions")
    }, 1500)
  }

  const canDispense = medications.some((med) => med.dispensed && med.dispensedQuantity > 0)

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
      <PageHeader
        title="Phát thuốc"
        description={`Đơn thuốc #${params.id}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              In đơn thuốc
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thông tin bệnh nhân và đơn thuốc */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bệnh nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{prescriptionData.patient.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {prescriptionData.patient.gender}, {prescriptionData.patient.age} tuổi
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span>{prescriptionData.patient.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <span className="text-right">{prescriptionData.patient.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Thông tin đơn thuốc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <span>{format(new Date(prescriptionData.date), "dd/MM/yyyy")}</span>
                </div>
                <StatusBadge status="warning" text="Chờ xử lý" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bác sĩ kê đơn:</span>
                  <span>{prescriptionData.doctor.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Khoa:</span>
                  <span>{prescriptionData.doctor.department}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Chẩn đoán</h4>
                <p className="text-sm">{prescriptionData.diagnosis}</p>
              </div>

              {prescriptionData.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Ghi chú</h4>
                  <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                    <div className="flex">
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                      <p>{prescriptionData.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Danh sách thuốc */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Danh sách thuốc</CardTitle>
              <CardDescription>Chọn thuốc để phát cho bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                {medications.map((medication) => (
                  <motion.div key={medication.id} variants={item} className="rounded-lg border p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-primary" />
                          <h4 className="font-medium">{medication.name}</h4>
                          {!medication.inStock && <StatusBadge status="error" text="Hết hàng" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage} - SL: {medication.quantity}
                        </p>
                        <p className="text-sm">{medication.instructions}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={medication.dispensed}
                          onCheckedChange={(checked) => handleDispensedChange(medication.id, checked)}
                          disabled={!medication.inStock}
                        />
                        <span className="text-sm font-medium">{medication.dispensed ? "Phát thuốc" : "Bỏ qua"}</span>
                      </div>
                    </div>

                    {medication.dispensed && (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor={`quantity-${medication.id}`}>Số lượng phát</Label>
                            <div className="flex items-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() => handleQuantityChange(medication.id, medication.dispensedQuantity - 1)}
                                disabled={medication.dispensedQuantity <= 0}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </Button>
                              <Input
                                id={`quantity-${medication.id}`}
                                type="number"
                                value={medication.dispensedQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(medication.id, Number.parseInt(e.target.value) || 0)
                                }
                                className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() => handleQuantityChange(medication.id, medication.dispensedQuantity + 1)}
                                disabled={medication.dispensedQuantity >= medication.stockQuantity}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Tồn kho: {medication.stockQuantity}</p>
                          </div>

                          <div className="space-y-2 flex-1">
                            <Label htmlFor={`notes-${medication.id}`}>Ghi chú</Label>
                            <Input
                              id={`notes-${medication.id}`}
                              placeholder="Ghi chú về thuốc"
                              value={medication.notes}
                              onChange={(e) => handleNotesChange(medication.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="patientInstructions">Hướng dẫn cho bệnh nhân</Label>
                  <Textarea
                    id="patientInstructions"
                    placeholder="Nhập hướng dẫn sử dụng thuốc cho bệnh nhân"
                    value={patientInstructions}
                    onChange={(e) => setPatientInstructions(e.target.value)}
                    rows={4}
                  />
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
              <Button onClick={handleDispense} disabled={!canDispense || isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Xác nhận phát thuốc</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  )
}
