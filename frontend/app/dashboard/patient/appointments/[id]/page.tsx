"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { 
  CalendarIcon, Clock, MapPin, ArrowLeft, AlertCircle, FileText, MessageCircle, X,
  CreditCard, Receipt, FileCheck, Stethoscope, Heart, Activity 
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { StatusBadge } from "@/components/ui/status-badge"
import AppointmentService from "@/lib/api/appointment-service"

export default function AppointmentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<any>(null)
  const [billing, setBilling] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchAppointmentDetails()
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      
      // Gọi API để lấy chi tiết lịch hẹn từ backend
      const appointmentData = await AppointmentService.getAppointmentById(Number(appointmentId))
      setAppointment(appointmentData)
      
      // Nếu có billing_id, lấy thêm thông tin hóa đơn
      if (appointmentData.billing_id) {
        try {
          const billingData = await AppointmentService.getBillingForAppointment(Number(appointmentId))
          setBilling(billingData)
        } catch (error) {
          console.error("Error fetching billing information:", error)
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      setErrorMessage("Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau.")
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleCancelAppointment = async () => {
    try {
      setLoading(true)
      await AppointmentService.cancelAppointment(Number(appointmentId), cancelReason)
      
      // Tải lại thông tin lịch hẹn sau khi hủy
      await fetchAppointmentDetails()
      
      setShowCancelDialog(false)
      toast({
        title: "Hủy lịch thành công",
        description: "Lịch hẹn của bạn đã được hủy thành công.",
      })
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Lỗi",
        description: error.response?.data?.error || "Không thể hủy lịch hẹn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Kiểm tra nếu lịch hẹn diễn ra trong vòng 24 giờ
  const isWithin24Hours = () => {
    if (!appointment?.appointment_date || !appointment?.start_time) return false
    
    const appointmentDate = new Date(appointment.appointment_date)
    const [hours, minutes] = appointment.start_time.split(':').map(Number)
    
    appointmentDate.setHours(hours, minutes, 0)
    const now = new Date()
    const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return diffHours <= 24
  }

  // Kiểm tra nếu có thể hủy lịch
  const canCancel = () => {
    if (appointment?.status !== "CONFIRMED" && appointment?.status !== "PENDING") return false
    if (isWithin24Hours()) return false
    return true
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    )
  }

  if (errorMessage || !appointment) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy lịch hẹn</h2>
          <p className="text-muted-foreground mb-4">{errorMessage || "Lịch hẹn này không tồn tại hoặc đã bị xóa."}</p>
          <Button onClick={() => router.push("/dashboard/patient/appointments")}>Quay lại danh sách</Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Chi tiết lịch hẹn"
        description="Xem thông tin chi tiết lịch hẹn của bạn"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/patient/appointments")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            {canCancel() && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <X className="mr-2 h-4 w-4" />
                Hủy lịch
              </Button>
            )}
            {appointment.status === "CONFIRMED" && !canCancel() && (
              <Button variant="outline" disabled title="Không thể hủy trong vòng 24h trước giờ hẹn">
                <AlertCircle className="mr-2 h-4 w-4" />
                Không thể hủy
              </Button>
            )}
            {appointment.status === "CONFIRMED" && (
              <Button variant="outline" onClick={() => router.push(`/dashboard/patient/appointments/${appointmentId}/reschedule`)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Đổi lịch
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Thông tin lịch hẹn</CardTitle>
                <StatusBadge status={appointment.status} />
              </div>
              <CardDescription>Mã lịch hẹn: APT-{appointment.id.toString().padStart(4, "0")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bác sĩ</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Avatar>
                      <AvatarImage
                        src={appointment.doctor?.profile_image || "/placeholder.svg"}
                        alt={appointment.doctor?.first_name ? `${appointment.doctor?.first_name} ${appointment.doctor?.last_name}` : `Bác sĩ ${appointment.doctor_id}`}
                      />
                      <AvatarFallback>
                        {appointment.doctor?.first_name?.[0] || "B"}
                        {appointment.doctor?.last_name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        BS. {appointment.doctor?.first_name} {appointment.doctor?.last_name || `(ID: ${appointment.doctor_id})`}
                      </p>
                      <p className="text-sm text-muted-foreground">{appointment.doctor?.specialty || "Chuyên khoa chung"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Thời gian</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(appointment.appointment_date), "EEEE, dd/MM/yyyy", { locale: vi })}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {appointment.start_time} - {appointment.end_time}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Địa điểm</h3>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.location || "Chưa có thông tin địa điểm"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Loại lịch hẹn</h3>
                <p className="mt-2">{appointment.appointment_type_name || appointment.appointment_type || "Khám thông thường"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lý do khám</h3>
                <p className="mt-2">{appointment.reason_text || "Không có thông tin"}</p>
              </div>

              {appointment.reason_category_details && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Danh mục</h3>
                  <p className="mt-2">{appointment.reason_category_details.name}</p>
                  {appointment.reason_category_details.description && (
                    <p className="text-sm text-muted-foreground mt-1">{appointment.reason_category_details.description}</p>
                  )}
                </div>
              )}

              {appointment.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Ghi chú</h3>
                  <p className="mt-2">{appointment.notes}</p>
                </div>
              )}

              {(appointment.status === "CANCELLED" || appointment.status === "NO_SHOW") && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive">
                        {appointment.status === "CANCELLED" ? "Lịch hẹn đã bị hủy" : "Bạn đã không đến lịch hẹn"}
                      </h3>
                      <p className="text-sm text-destructive/80 mt-1">
                        {appointment.notes || "Không có lý do được cung cấp"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="messages">
            <TabsList>
              <TabsTrigger value="messages">Tin nhắn</TabsTrigger>
              <TabsTrigger value="billing">Hóa đơn</TabsTrigger>
              <TabsTrigger value="medical">Thông tin y tế</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tin nhắn</CardTitle>
                  <CardDescription>Trao đổi thông tin với bác sĩ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointment.messages && appointment.messages.length > 0 ? (
                      appointment.messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.sender === "PATIENT" ? "justify-end" : "justify-start"}`}
                        >
                          {message.sender !== "PATIENT" && (
                            <Avatar className="h-8 w-8">
                              {message.sender === "DOCTOR" ? (
                                <AvatarImage
                                  src={appointment.doctor?.profile_image || "/placeholder.svg"}
                                  alt={`${appointment.doctor?.first_name || ""} ${appointment.doctor?.last_name || ""}`}
                                />
                              ) : (
                                <AvatarImage src="/placeholder.svg" alt="System" />
                              )}
                              <AvatarFallback>
                                {message.sender === "DOCTOR"
                                  ? `${appointment.doctor?.first_name?.[0] || "B"}${appointment.doctor?.last_name?.[0] || "S"}`
                                  : "SYS"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`rounded-lg p-3 max-w-[80%] ${
                              message.sender === "PATIENT" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {format(new Date(message.created_at), "HH:mm, dd/MM/yyyy")}
                            </p>
                          </div>
                          {message.sender === "PATIENT" && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src="/placeholder.svg"
                                alt="Người dùng"
                              />
                              <AvatarFallback>
                                BN
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Chưa có tin nhắn nào</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full gap-2">
                    <Textarea
                      placeholder="Nhập tin nhắn..."
                      className="flex-1"
                      disabled={appointment.status === "CANCELLED" || appointment.status === "NO_SHOW" || appointment.status === "COMPLETED"}
                    />
                    <Button disabled={appointment.status === "CANCELLED" || appointment.status === "NO_SHOW" || appointment.status === "COMPLETED"}>Gửi</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin thanh toán</CardTitle>
                  <CardDescription>Chi tiết hóa đơn cho lịch hẹn này</CardDescription>
                </CardHeader>
                <CardContent>
                  {billing ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Mã hóa đơn</h3>
                          <p className="mt-1">BILL-{billing.id.toString().padStart(4, "0")}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Trạng thái</h3>
                          <div className="mt-1">
                            <StatusBadge status={billing.status} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Dịch vụ</h3>
                        <div className="mt-2 border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-4 py-2 text-left">Mô tả</th>
                                <th className="px-4 py-2 text-right">Số lượng</th>
                                <th className="px-4 py-2 text-right">Đơn giá</th>
                                <th className="px-4 py-2 text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billing.service_items ? (
                                billing.service_items.map((item: any, index: number) => (
                                  <tr key={index} className="border-t">
                                    <td className="px-4 py-2">{item.name}</td>
                                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                                    <td className="px-4 py-2 text-right">{item.price.toLocaleString('vi-VN')} ₫</td>
                                    <td className="px-4 py-2 text-right">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">Không có dịch vụ</td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot className="bg-muted/50">
                              <tr className="border-t">
                                <td colSpan={3} className="px-4 py-2 font-medium text-right">Tổng cộng:</td>
                                <td className="px-4 py-2 font-medium text-right">{billing.total_amount.toLocaleString('vi-VN')} ₫</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {billing.insurance_id && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Bảo hiểm y tế</h3>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm">Mã BHYT: {billing.insurance_id}</p>
                            </div>
                            <div>
                              <p className="text-sm">Mức bảo hiểm: {billing.insurance_coverage_percent || 0}%</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {billing.status === "PENDING" && (
                        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-yellow-600">Thanh toán đang chờ xử lý</h3>
                              <p className="text-sm text-yellow-600 mt-1">
                                Vui lòng hoàn tất thanh toán trước hoặc khi đến cuộc hẹn
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {billing.status === "PAID" && (
                        <div className="rounded-md bg-green-50 border border-green-200 p-4">
                          <div className="flex items-start gap-2">
                            <FileCheck className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-green-600">Đã thanh toán</h3>
                              <p className="text-sm text-green-600 mt-1">
                                Thanh toán đã hoàn tất - Cảm ơn bạn!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {billing.status === "REFUNDED" && (
                        <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
                          <div className="flex items-start gap-2">
                            <Receipt className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-blue-600">Đã hoàn tiền</h3>
                              <p className="text-sm text-blue-600 mt-1">
                                Số tiền đã được hoàn trả
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : appointment.billing_id ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Chưa có thông tin hóa đơn</p>
                      {appointment.status === "PENDING" && (
                        <p className="text-sm mt-2">Hóa đơn sẽ được tạo sau khi xác nhận lịch hẹn</p>
                      )}
                    </div>
                  )}
                </CardContent>
                {billing && billing.status === "PENDING" && (
                  <CardFooter>
                    <Button className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Thanh toán ngay
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="medical" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin y tế</CardTitle>
                  <CardDescription>Chi tiết khám chữa bệnh & kết quả</CardDescription>
                </CardHeader>
                <CardContent>
                  {appointment.visit_data ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Trạng thái thăm khám</h3>
                          <p className="mt-1">
                            <StatusBadge status={appointment.visit_data.status_name || appointment.visit_data.status} />
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Thời gian check-in</h3>
                          <p className="mt-1">{appointment.visit_data.checked_in_at ? format(new Date(appointment.visit_data.checked_in_at), "HH:mm, dd/MM/yyyy") : "Chưa check-in"}</p>
                        </div>
                      </div>
                      
                      {appointment.visit_data.doctor_start_time && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Thời gian khám</h3>
                          <p className="mt-1">{format(new Date(appointment.visit_data.doctor_start_time), "HH:mm, dd/MM/yyyy")}</p>
                        </div>
                      )}
                      
                      {appointment.visit_data.waiting_time_display && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Thời gian chờ đợi</h3>
                          <p className="mt-1">{appointment.visit_data.waiting_time_display}</p>
                        </div>
                      )}
                      
                      {appointment.visit_data.notes && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Ghi chú khám bệnh</h3>
                          <p className="mt-1 whitespace-pre-line">{appointment.visit_data.notes}</p>
                        </div>
                      )}
                      
                      {/* Kết luận của bác sĩ sẽ được hiển thị nếu lịch hẹn đã hoàn thành */}
                      {appointment.status === "COMPLETED" && (
                        <div className="rounded-md bg-green-50 border border-green-200 p-4">
                          <div className="flex items-start gap-2">
                            <Stethoscope className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-green-600">Khám bệnh hoàn tất</h3>
                              <p className="text-sm text-green-600 mt-1">
                                Bác sĩ đã hoàn thành việc khám bệnh và cập nhật kết quả
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Chưa có thông tin thăm khám</p>
                      <p className="text-sm mt-2">Thông tin sẽ được cập nhật sau khi bạn đến khám</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tài liệu</CardTitle>
                  <CardDescription>Tài liệu liên quan đến lịch hẹn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Chưa có tài liệu nào</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Trước khi đến khám</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <CalendarIcon className="h-3 w-3 text-primary" />
                      </div>
                      <span>Đến trước giờ hẹn 15 phút để hoàn tất thủ tục đăng ký</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <FileText className="h-3 w-3 text-primary" />
                      </div>
                      <span>Mang theo CMND/CCCD và thẻ BHYT (nếu có)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <AlertCircle className="h-3 w-3 text-primary" />
                      </div>
                      <span>Nếu bạn không thể đến đúng hẹn, vui lòng hủy hoặc đổi lịch trước 24 giờ</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium">Chính sách hủy lịch</h3>
                  <p className="mt-2 text-sm">
                    Bạn có thể hủy lịch hẹn miễn phí trước 24 giờ. Nếu hủy trong vòng 24 giờ trước giờ hẹn, bạn có thể
                    phải chịu phí hủy lịch.
                  </p>
                </div>
                
                {appointment.reminders && appointment.reminders.length > 0 && (
                  <div>
                    <h3 className="font-medium">Nhắc nhở</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {appointment.reminders.map((reminder: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                            <Clock className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <div>
                              <span className="font-medium">Nhắc nhở </span> 
                              <span className="text-muted-foreground">
                                ({format(new Date(reminder.scheduled_time), "HH:mm, dd/MM/yyyy")})
                              </span>
                            </div>
                            <p>{reminder.message}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liên hệ hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Hotline:</span> 1900 1234
                </p>
                <p>
                  <span className="font-medium">Email:</span> support@healthcare.com
                </p>
                <p>
                  <span className="font-medium">Giờ làm việc:</span> 7:00 - 20:00 (Thứ 2 - Chủ nhật)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy lịch hẹn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lịch hẹn này? Vui lòng cung cấp lý do hủy lịch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Lý do hủy lịch</h3>
              <Textarea
                placeholder="Nhập lý do hủy lịch..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận hủy lịch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
