"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, ExternalLink, Pill, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PharmacyService from "@/lib/api/pharmacy-service"
import type { PrescriptionWithDetails } from "@/lib/api/pharmacy-service"
import { formatDate } from "@/lib/utils"

export default function PatientMedications() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithDetails[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true)
      try {
        const data = await PharmacyService.getAllPrescriptions()
        setPrescriptions(data)
      } catch (error) {
        console.error("Lỗi khi tải đơn thuốc:", error)
        setError("Không thể tải dữ liệu đơn thuốc. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu đơn thuốc",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()
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

  if (prescriptions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Bạn không có đơn thuốc nào. Vui lòng liên hệ bác sĩ nếu cần kê đơn.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Đơn thuốc #{prescription.id}</h4>
                  <Badge
                    variant="outline"
                    className={
                      prescription.status === "ACTIVE"
                        ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                        : prescription.status === "EXPIRED"
                          ? "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    }
                  >
                    {prescription.status === "ACTIVE"
                      ? "Đang sử dụng"
                      : prescription.status === "EXPIRED"
                        ? "Hết hạn"
                        : prescription.status === "FILLED"
                          ? "Đã cấp phát"
                          : prescription.status === "CANCELLED"
                            ? "Đã hủy"
                            : prescription.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bác sĩ: {prescription.doctor.first_name} {prescription.doctor.last_name}
                </p>
              </div>
              <Pill className="h-5 w-5 text-teal-600" />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Ngày kê: {formatDate(prescription.prescription_date)}</span>
              </div>

              {prescription.items && prescription.items.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {prescription.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="rounded-md bg-muted p-2 text-sm">
                      <div className="font-medium">{item.medication_details?.name || `Thuốc #${item.medication}`}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{item.frequency}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.instructions}</div>
                    </div>
                  ))}

                  {prescription.items.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{prescription.items.length - 2} thuốc khác</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Không có thông tin chi tiết về thuốc</div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {prescription.status === "ACTIVE" && (
                <Button className="w-full gap-1" variant="outline" size="sm">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Yêu cầu tái kê
                </Button>
              )}
              <Button className="w-full gap-1" variant="default" size="sm">
                <ExternalLink className="h-3.5 w-3.5" />
                Chi tiết
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
