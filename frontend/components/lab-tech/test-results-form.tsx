"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface TestResultFormProps {
  testId: string
  testName: string
  patientId: string
  patientName: string
}

export default function TestResultsForm({ testId, testName, patientId, patientName }: TestResultFormProps) {
  const router = useRouter()
  const [results, setResults] = useState("")
  const [interpretation, setInterpretation] = useState("")
  const [status, setStatus] = useState("normal")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!results) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập kết quả xét nghiệm",
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
        description: "Đã lưu kết quả xét nghiệm",
      })

      router.push("/dashboard/lab-tech/tests")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu kết quả xét nghiệm",
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
          <CardTitle>Nhập kết quả xét nghiệm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-id">Mã xét nghiệm</Label>
              <Input id="test-id" value={testId} disabled />
            </div>
            <div>
              <Label htmlFor="test-name">Tên xét nghiệm</Label>
              <Input id="test-name" value={testName} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient-id">Mã bệnh nhân</Label>
              <Input id="patient-id" value={patientId} disabled />
            </div>
            <div>
              <Label htmlFor="patient-name">Tên bệnh nhân</Label>
              <Input id="patient-name" value={patientName} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="results">Kết quả xét nghiệm</Label>
            <Textarea
              id="results"
              placeholder="Nhập kết quả xét nghiệm chi tiết..."
              value={results}
              onChange={(e) => setResults(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái kết quả</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Bình thường</SelectItem>
                <SelectItem value="abnormal">Bất thường</SelectItem>
                <SelectItem value="critical">Nguy hiểm</SelectItem>
                <SelectItem value="inconclusive">Không xác định</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interpretation">Nhận xét và diễn giải</Label>
            <Textarea
              id="interpretation"
              placeholder="Nhập diễn giải kết quả xét nghiệm..."
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu kết quả"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
