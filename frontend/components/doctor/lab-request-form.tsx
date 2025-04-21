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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface LabTest {
  id: string
  name: string
  description: string
}

const commonLabTests: LabTest[] = [
  { id: "cbc", name: "Công thức máu toàn phần (CBC)", description: "Kiểm tra số lượng và chất lượng tế bào máu" },
  { id: "glucose", name: "Đường huyết", description: "Đo lượng đường trong máu" },
  { id: "lipid", name: "Bảng lipid", description: "Đo cholesterol và triglyceride" },
  { id: "liver", name: "Chức năng gan", description: "Kiểm tra enzym gan và protein" },
  { id: "kidney", name: "Chức năng thận", description: "Đo creatinine và BUN" },
  { id: "thyroid", name: "Chức năng tuyến giáp", description: "Đo hormone tuyến giáp" },
  { id: "urine", name: "Phân tích nước tiểu", description: "Kiểm tra thành phần nước tiểu" },
  { id: "xray", name: "X-quang", description: "Chụp X-quang" },
  { id: "ultrasound", name: "Siêu âm", description: "Kiểm tra cơ quan nội tạng bằng sóng âm" },
  { id: "ecg", name: "Điện tâm đồ (ECG)", description: "Đo hoạt động điện của tim" },
]

export default function LabRequestForm({ patientId }: { patientId: string }) {
  const router = useRouter()
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [priority, setPriority] = useState("normal")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTestToggle = (testId: string) => {
    setSelectedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedTests.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một xét nghiệm",
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
        description: "Đã gửi yêu cầu xét nghiệm",
      })

      router.push("/dashboard/doctor/patients")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu xét nghiệm",
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
          <CardTitle>Yêu cầu xét nghiệm mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="patient-id">Mã bệnh nhân</Label>
            <Input id="patient-id" value={patientId} disabled />
          </div>

          <div>
            <Label htmlFor="priority">Mức độ ưu tiên</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Chọn mức độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="normal">Bình thường</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Chọn xét nghiệm</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonLabTests.map((test) => (
                <div key={test.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={test.id}
                    checked={selectedTests.includes(test.id)}
                    onCheckedChange={() => handleTestToggle(test.id)}
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor={test.id} className="font-medium">
                      {test.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Ghi chú cho phòng xét nghiệm</Label>
            <Textarea
              id="notes"
              placeholder="Nhập thông tin bổ sung cho phòng xét nghiệm..."
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
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu xét nghiệm"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
