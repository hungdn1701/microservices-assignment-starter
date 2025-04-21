"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

interface ClaimItem {
  id: string
  description: string
  amount: number
  category: string
}

interface ClaimReviewFormProps {
  claimId: string
  patientName: string
  policyNumber: string
  totalAmount: number
  items: ClaimItem[]
}

export default function ClaimReviewForm({
  claimId,
  patientName,
  policyNumber,
  totalAmount,
  items,
}: ClaimReviewFormProps) {
  const router = useRouter()
  const [decision, setDecision] = useState("")
  const [approvedAmount, setApprovedAmount] = useState(totalAmount.toString())
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!decision) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn quyết định xử lý",
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
        description: "Đã xử lý yêu cầu bảo hiểm",
      })

      router.push("/dashboard/insurance/claims")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý yêu cầu bảo hiểm",
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
          <CardTitle>Xử lý yêu cầu bảo hiểm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="claim-id">Mã yêu cầu</Label>
              <Input id="claim-id" value={claimId} disabled />
            </div>
            <div>
              <Label htmlFor="patient-name">Tên bệnh nhân</Label>
              <Input id="patient-name" value={patientName} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="policy-number">Số hợp đồng bảo hiểm</Label>
              <Input id="policy-number" value={policyNumber} disabled />
            </div>
            <div>
              <Label htmlFor="total-amount">Tổng số tiền yêu cầu</Label>
              <Input id="total-amount" value={`${totalAmount.toLocaleString()} VND`} disabled />
            </div>
          </div>

          <div>
            <Label>Chi tiết yêu cầu</Label>
            <div className="border rounded-md overflow-hidden mt-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.amount.toLocaleString()} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <Label>Quyết định</Label>
            <RadioGroup value={decision} onValueChange={setDecision} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve">Chấp thuận toàn bộ</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial">Chấp thuận một phần</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject">Từ chối</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="more-info" id="more-info" />
                <Label htmlFor="more-info">Yêu cầu thêm thông tin</Label>
              </div>
            </RadioGroup>
          </div>

          {decision === "partial" && (
            <div>
              <Label htmlFor="approved-amount">Số tiền được chấp thuận</Label>
              <Input
                id="approved-amount"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                type="number"
                min="0"
                max={totalAmount}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú hoặc lý do từ chối..."
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
            {isSubmitting ? "Đang xử lý..." : "Xác nhận quyết định"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
