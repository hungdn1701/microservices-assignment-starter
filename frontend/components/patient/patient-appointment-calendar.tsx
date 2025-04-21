"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Calendar as CalendarIcon, MapPin, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { format, parseISO, isToday, isTomorrow } from "date-fns"
import { vi } from "date-fns/locale"
import AppointmentService from "@/lib/api/appointment-service"
import { StatusBadge } from "@/components/ui/status-badge"
import Link from "next/link"

// Interface cho hiển thị
interface FormattedAppointment {
  id: number
  doctor: string
  specialty: string
  date: Date
  dateStr: string
  time: string
  duration: string
  location: string
  type: "Trực tiếp" | "Video"
  status: string
  statusCode: string
  avatar?: string
  department?: string
  reason_text?: string
}

export default function PatientAppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentDates, setAppointmentDates] = useState<Date[]>([])

  // Lấy danh sách lịch hẹn từ API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const data = await AppointmentService.getPatientAppointments()

        if (Array.isArray(data) && data.length > 0) {
          // Format dữ liệu để hiển thị
          const formattedData = data.map(appointment => {
            // Tính khoảng thời gian của cuộc hẹn
            let diffInMinutes = 30 // Giá trị mặc định
            try {
              if (appointment.start_time && appointment.end_time) {
                const startTime = new Date(`2000-01-01T${appointment.start_time}`)
                const endTime = new Date(`2000-01-01T${appointment.end_time}`)
                diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
              }
            } catch (error) {
              console.error('Lỗi khi tính thời gian:', error)
            }

            // Kiểm tra xem doctor có tồn tại không
            const doctorInfo = appointment.doctor || {}
            const doctorName = doctorInfo.first_name && doctorInfo.last_name
              ? `BS. ${doctorInfo.first_name} ${doctorInfo.last_name}`
              : `BS. (ID: ${appointment.doctor_id || 'Không xác định'})`

            // Xác định trạng thái lịch hẹn
            let statusDisplay = "Chưa xác định"
            let statusCode = appointment.status || "UNKNOWN"

            switch (statusCode.toUpperCase()) {
              case "CONFIRMED":
                statusDisplay = "Đã xác nhận"
                break
              case "PENDING":
                statusDisplay = "Chờ xác nhận"
                break
              case "COMPLETED":
                statusDisplay = "Hoàn thành"
                break
              case "CANCELLED":
                statusDisplay = "Đã hủy"
                break
              case "NO_SHOW":
                statusDisplay = "Không đến"
                break
              case "IN_PROGRESS":
                statusDisplay = "Đang khám"
                break
              default:
                statusDisplay = statusCode
            }

            const appointmentDate = new Date(appointment.appointment_date)

            return {
              id: appointment.id,
              doctor: doctorName,
              specialty: doctorInfo.specialty || "Chưa xác định",
              date: appointmentDate,
              dateStr: formatAppointmentDate(appointment.appointment_date),
              time: appointment.start_time?.substring(0, 5) || "--:--",
              duration: `${diffInMinutes} phút`,
              location: appointment.location || "Chưa xác định",
              type: appointment.appointment_type === "TELEHEALTH" ? "Video" : "Trực tiếp" as "Video" | "Trực tiếp",
              status: statusDisplay,
              statusCode: statusCode.toUpperCase(),
              avatar: doctorInfo.profile_image || "/placeholder.svg",
              department: doctorInfo.department || appointment.department,
              reason_text: appointment.reason_text
            }
          })

          setAppointments(formattedData)

          // Tạo danh sách các ngày có lịch hẹn
          const dates = formattedData.map(appointment => appointment.date)
          setAppointmentDates(dates)

          setError(null)
        } else {
          setAppointments([])
          setAppointmentDates([])
        }
      } catch (error: any) {
        console.error('Error fetching appointments:', error)
        setError(error.message || 'Không thể tải dữ liệu lịch hẹn')
        setAppointments([])
        setAppointmentDates([])
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Helper function để định dạng ngày
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Hôm nay"
    if (isTomorrow(date)) return "Ngày mai"
    return format(date, 'dd/MM/yyyy', { locale: vi })
  }

  // Function to check if a date has appointments
  const hasAppointment = (date: Date) => {
    return appointmentDates.some(
      (appointmentDate) =>
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
    )
  }

  // Function to get appointments for a specific date
  const getAppointmentsForDate = (date: Date | undefined) => {
    if (!date) return []

    return appointments.filter(
      (appointment) =>
        appointment.date.getDate() === date.getDate() &&
        appointment.date.getMonth() === date.getMonth() &&
        appointment.date.getFullYear() === date.getFullYear()
    )
  }

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ""

    return format(date, "EEEE, dd/MM/yyyy", { locale: vi })
  }

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <Skeleton className="h-[350px] w-full rounded-md" />
        </div>
        <div className="lg:w-1/2">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="mt-2 text-lg font-medium">Không thể tải dữ liệu</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2">
        <div className="bg-white rounded-md border p-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md"
            modifiers={{
              appointment: (date) => hasAppointment(date),
              today: (date) => isToday(date)
            }}
            modifiersClassNames={{
              appointment: "bg-primary/10 font-medium text-primary ring-1 ring-primary",
              today: "bg-primary text-primary-foreground font-bold"
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary/10 ring-1 ring-primary"></div>
            <span>Có lịch hẹn</span>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2">
        <h3 className="mb-4 text-lg font-medium flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Lịch hẹn ngày {formatDate(selectedDate)}
        </h3>

        <div className="space-y-3">
          {getAppointmentsForDate(selectedDate).map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden border-l-4 transition-all hover:shadow-md"
              style={{
                borderLeftColor:
                  appointment.statusCode === "CONFIRMED" ? "var(--primary)" :
                  appointment.statusCode === "COMPLETED" ? "var(--success)" :
                  appointment.statusCode === "CANCELLED" ? "var(--destructive)" :
                  appointment.statusCode === "IN_PROGRESS" ? "var(--warning)" :
                  "var(--border)"
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium">{appointment.doctor}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.specialty}
                        {appointment.department && ` • ${appointment.department}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {appointment.time} ({appointment.duration})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>

                    {appointment.reason_text && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Lý do khám:</p>
                        <p className="line-clamp-1">{appointment.reason_text}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={appointment.statusCode} />

                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link href={`/dashboard/patient/appointments/${appointment.id}`}>
                        Chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {getAppointmentsForDate(selectedDate).length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
              <h3 className="mt-2 text-base font-medium">Không có lịch hẹn</h3>
              <p className="mt-1 text-sm text-muted-foreground">Bạn không có lịch hẹn nào vào ngày này</p>
              <Button className="mt-4" variant="outline" size="sm" asChild>
                <Link href="/dashboard/patient/appointments/new">
                  Đặt lịch hẹn mới
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
