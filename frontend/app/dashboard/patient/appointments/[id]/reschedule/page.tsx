"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { format, addDays, isSameDay, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, Clock, MapPin, User, FileText, ChevronLeft, Check, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"
import appointmentService from "@/lib/api/appointment-service"
import userService from "@/lib/api/user-service"
import { TimeSlot, AppointmentWithDetails } from "@/lib/api/appointment-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Định nghĩa interface cho khung giờ hiển thị
interface DisplayTimeSlot {
  id: number
  time: string
  available: boolean
  date: string
  start_time: string
  end_time: string
  doctor_id: number
  location?: string
  duration?: number
}

export default function RescheduleAppointmentPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string

  const [date, setDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(null)
  const [timeSlots, setTimeSlots] = useState<DisplayTimeSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  // Lấy thông tin cuộc hẹn
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointmentById(parseInt(appointmentId))
        setAppointment(data)
        
        // Nếu có thông tin bác sĩ, lấy các khung giờ trống
        if (data.doctor?.id) {
          // Đặt ngày mặc định là ngày hiện tại
          setDate(new Date())
        }
      } catch (error: any) {
        console.error("Error fetching appointment:", error)
        setError(error.message || "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointment()
  }, [appointmentId])

  // Lấy các khung giờ trống khi ngày được chọn
  useEffect(() => {
    if (appointment?.doctor?.id && date) {
      fetchTimeSlots()
    }
  }, [date, appointment])

  // Lấy các khung giờ trống của bác sĩ
  const fetchTimeSlots = async () => {
    if (!appointment?.doctor?.id || !date) return

    setIsLoading(true)
    try {
      const doctorId = appointment.doctor.id
      const formattedDate = format(date, 'yyyy-MM-dd')
      // Lấy khung giờ trong 7 ngày từ ngày được chọn
      const endDate = format(addDays(date, 7), 'yyyy-MM-dd')

      // Gọi API lấy các khung giờ trống
      const response = await appointmentService.getAvailableTimeSlots(doctorId, formattedDate, endDate)

      // Chuyển đổi dữ liệu API thành dạng hiển thị
      const formattedTimeSlots: DisplayTimeSlot[] = response.map(slot => ({
        id: slot.id,
        time: `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`,
        available: slot.is_available,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        doctor_id: slot.doctor_id,
        location: slot.location || ''
      }))

      setTimeSlots(formattedTimeSlots)

      // Tạo danh sách các ngày có khung giờ trống
      const dates = [...new Set(formattedTimeSlots.map(slot => slot.date))]
        .map(dateStr => parseISO(dateStr))
      setAvailableDates(dates)
    } catch (error: any) {
      console.error('Error fetching time slots:', error)
      toast.error('Không thể tải khung giờ. Vui lòng thử lại sau.')
      setTimeSlots([])
      setAvailableDates([])
    } finally {
      setIsLoading(false)
    }
  }

  // Lọc các khung giờ theo ngày được chọn
  const getTimeSlotsForSelectedDate = () => {
    if (!date) return []
    return timeSlots.filter(slot => {
      const slotDate = parseISO(slot.date)
      return isSameDay(slotDate, date)
    })
  }

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !notes) {
      toast.error('Vui lòng chọn khung giờ mới và nhập lý do đổi lịch')
      return
    }

    setIsSubmitting(true)

    try {
      await appointmentService.rescheduleAppointment(
        parseInt(appointmentId),
        parseInt(selectedTimeSlot),
        notes
      )
      
      toast.success('Đổi lịch hẹn thành công!')
      router.push('/dashboard/patient/appointments')
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error)
      toast.error(error.message || 'Không thể đổi lịch hẹn. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải...</span>
        </div>
      </PageContainer>
    )
  }

  if (error || !appointment) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            {error || "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại sau."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Đổi lịch hẹn"
        description={`Đổi lịch hẹn với ${appointment.doctor.first_name} ${appointment.doctor.last_name}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin cuộc hẹn hiện tại</CardTitle>
            <CardDescription>Chi tiết cuộc hẹn bạn muốn đổi lịch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Bác sĩ</Label>
                <div className="font-medium">{appointment.doctor.first_name} {appointment.doctor.last_name}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Chuyên khoa</Label>
                <div className="font-medium">{appointment.doctor.specialty || "Chưa cập nhật"}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Ngày khám</Label>
                <div className="font-medium">{format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: vi })}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Giờ khám</Label>
                <div className="font-medium">{appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}</div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-sm text-muted-foreground">Địa điểm</Label>
                <div className="font-medium">{appointment.location || "Chưa cập nhật"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chọn thời gian mới</CardTitle>
            <CardDescription>Chọn ngày và giờ mới cho cuộc hẹn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Ngày khám mới</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: vi }) : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
                      // Không cho phép chọn ngày trong quá khứ hoặc quá 3 tháng từ hiện tại
                      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0))
                      const isTooFarInFuture = date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                      return isPastDate || isTooFarInFuture
                    }}
                    modifiers={{
                      available: availableDates
                    }}
                    modifiersClassNames={{
                      available: "bg-green-50 text-green-600 font-medium"
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Khung giờ mới</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Đang tải khung giờ...</span>
                </div>
              ) : getTimeSlotsForSelectedDate().length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <div className="text-sm text-muted-foreground">
                    {date
                      ? "Không có khung giờ trống cho ngày này. Vui lòng chọn ngày khác."
                      : "Vui lòng chọn ngày khám trước"}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {getTimeSlotsForSelectedDate().map((slot) => (
                    <motion.div key={slot.id} whileHover={{ scale: slot.available ? 1.05 : 1 }}>
                      <Button
                        variant={selectedTimeSlot === slot.id.toString() ? "default" : "outline"}
                        className={cn(
                          "w-full justify-center",
                          !slot.available && "cursor-not-allowed opacity-50",
                        )}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.id.toString())}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {slot.time}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Lý do đổi lịch</Label>
              <Textarea
                id="notes"
                placeholder="Vui lòng nhập lý do bạn muốn đổi lịch hẹn này"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-32"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !selectedTimeSlot || !notes}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đổi lịch"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  )
}
