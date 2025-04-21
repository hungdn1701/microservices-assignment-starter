"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

interface Medication {
  id: string
  name: string
  dosage: string
  quantity: number
  instructions: string
  inStock: boolean
}

interface MedicationDispenseFormProps {
  prescriptionId: string
  patientName: string
  doctorName: string
  medications: Medication[]
}

export default function MedicationDispenseForm({
  prescriptionId,
  patientName,
  doctorName,
  medications,
}: MedicationDispenseFormProps) {
  const router = useRouter()
  const [dispensedMeds, setDispensedMeds] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMedToggle = (medId: string) => {
    setDispensedMeds((prev) => (prev.includes(medId) ? prev.filter((id) => id !== medId) : [...prev, medId]))
  }

  const allMedsSelected = medications.every((med) => !med.inStock || dispensedMeds.includes(med.id))

  const handleSelectAll = () => {
    if (allMedsSelected) {
      setDispensedMeds([])
    } else {
      setDispensedMeds(medications.filter((med) => med.inStock).map((med) => med.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (dispensedMeds.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một thuốc để phát",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Thành công",
        description: "Đã phát thuốc thành công",
      })

      router.push("/dashboard/pharmacist/prescriptions")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phát thuốc",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Phát thuốc theo đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prescription-id">Mã đơn thuốc</Label>
              <Input id="prescription-id" value={prescriptionId} disabled />
            </div>
            <div>
              <Label htmlFor="patient-name">Tên bệnh nhân</Label>
              <Input id="patient-name" value={patientName} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="doctor-name">Bác sĩ kê đơn</Label>
            <Input id="doctor-name" value={doctorName} disabled />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Danh sách thuốc</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                {allMedsSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
            </div>

            <div className="border rounded-md divide-y">
              {medications.map((med) => (
                <div key={med.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={med.id}
                      checked={dispensedMeds.includes(med.id)}
                      onCheckedChange={() => handleMedToggle(med.id)}
                      disabled={!med.inStock}
                    />
                    <div className="grid gap-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={med.id} className="font-medium">
                          {med.name}
                        </Label>
                        {!med.inStock && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hết hàng</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Liều lượng:</span> {med.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Số lượng:</span> {med.quantity}
                        </div>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Hướng dẫn:</span> {med.instructions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú cho bệnh nhân</Label>
            <Textarea
              id="notes"
              placeholder="Nhập hướng dẫn bổ sung cho bệnh nhân..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Xác nhận phát thuốc"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
