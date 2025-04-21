import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Clock, FileText, MoreHorizontal } from "lucide-react"

export default function DoctorAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "Nguyễn Thị Hoa",
      age: 42,
      reason: "Tái khám: Tăng huyết áp",
      time: "10:30",
      duration: "30 phút",
      status: "Sắp tới",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      patient: "Trần Văn Nam",
      age: 65,
      reason: "Đau ngực",
      time: "11:15",
      duration: "45 phút",
      status: "Sắp tới",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      patient: "Lê Thị Lan",
      age: 38,
      reason: "Khám sức khỏe định kỳ",
      time: "13:00",
      duration: "60 phút",
      status: "Sắp tới",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      patient: "Phạm Văn Minh",
      age: 55,
      reason: "Tái khám sau phẫu thuật",
      time: "14:15",
      duration: "30 phút",
      status: "Sắp tới",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      patient: "Hoàng Thị Mai",
      age: 29,
      reason: "Đánh giá thuốc",
      time: "15:30",
      duration: "30 phút",
      status: "Sắp tới",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={appointment.avatar || "/placeholder.svg"} alt={appointment.patient} />
              <AvatarFallback>
                {appointment.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{appointment.patient}</h4>
                <span className="text-sm text-muted-foreground">{appointment.age} tuổi</span>
              </div>
              <p className="text-sm">{appointment.reason}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {appointment.time} ({appointment.duration})
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              Hồ sơ
            </Button>
            <Button variant="default" size="sm">
              Bắt đầu
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
