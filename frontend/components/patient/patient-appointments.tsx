import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, MoreHorizontal, Video } from "lucide-react"
import type { AppointmentWithDetails } from "@/lib/api/appointment-service"
import { formatDate, formatTime } from "@/lib/utils"

interface PatientAppointmentsProps {
  appointments: AppointmentWithDetails[]
}

export default function PatientAppointments({ appointments }: PatientAppointmentsProps) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Bạn không có cuộc hẹn nào sắp tới. <Button variant="link">Đặt lịch hẹn</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar className="hidden md:block">
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
                alt={`${appointment.doctor.first_name} ${appointment.doctor.last_name}`}
              />
              <AvatarFallback>
                {appointment.doctor.first_name[0]}
                {appointment.doctor.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{`${appointment.doctor.first_name} ${appointment.doctor.last_name}`}</h4>
              <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{formatDate(appointment.appointment_date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {appointment.location?.includes("Virtual") ? (
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>{appointment.location || "Phòng khám chính"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={appointment.status === "CONFIRMED" ? "default" : "outline"}
              className={appointment.status === "CONFIRMED" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
            >
              {getStatusText(appointment.status)}
            </Badge>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm">
                Đổi lịch
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getStatusText(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "Đã lên lịch"
    case "CONFIRMED":
      return "Đã xác nhận"
    case "COMPLETED":
      return "Đã hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    case "NO_SHOW":
      return "Không đến"
    default:
      return status
  }
}
