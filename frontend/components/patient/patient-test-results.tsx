"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Download, ExternalLink, FileText, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import LaboratoryService from "@/lib/api/laboratory-service"
import type { LabTestWithDetails } from "@/lib/api/laboratory-service"
import { formatDate } from "@/lib/utils"

export default function PatientTestResults() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [labTests, setLabTests] = useState<LabTestWithDetails[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLabTests = async () => {
      setIsLoading(true)
      try {
        const data = await LaboratoryService.getAllLabTests()
        // Lọc các xét nghiệm đã hoàn thành
        const completedTests = data.filter((test) => test.status === "COMPLETED" || test.status === "VERIFIED")
        setLabTests(completedTests)
      } catch (error) {
        console.error("Lỗi khi tải kết quả xét nghiệm:", error)
        setError("Không thể tải dữ liệu xét nghiệm. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu xét nghiệm",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabTests()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>
  }

  if (labTests.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">Bạn không có kết quả xét nghiệm nào.</div>
  }

  return (
    <div className="space-y-4">
      {labTests.map((test) => (
        <div key={test.id} className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{test.test_type_details?.name || `Xét nghiệm #${test.id}`}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {test.ordered_by_details?.first_name} {test.ordered_by_details?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatDate(test.ordered_at)}</span>
                </div>
                <Badge variant="outline">
                  {test.status === "COMPLETED"
                    ? "Đã hoàn thành"
                    : test.status === "VERIFIED"
                      ? "Đã xác minh"
                      : test.status}
                </Badge>
              </div>

              {test.results && test.results.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {test.results.slice(0, 2).map((result) => (
                    <div key={result.id} className="text-sm">
                      <span className="font-medium">{result.parameter}:</span>{" "}
                      <span className={result.is_abnormal ? "text-red-600 font-medium" : ""}>
                        {result.value} {result.unit}
                      </span>
                      {result.reference_range && (
                        <span className="text-xs text-muted-foreground"> (Tham chiếu: {result.reference_range})</span>
                      )}
                    </div>
                  ))}

                  {test.results.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{test.results.length - 2} kết quả khác</div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Không có thông tin chi tiết về kết quả</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tải xuống</span>
            </Button>
            <Button variant="default" size="sm" className="gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Xem</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
