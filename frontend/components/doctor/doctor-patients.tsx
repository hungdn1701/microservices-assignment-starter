import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, MessageSquare, MoreHorizontal } from "lucide-react"

export default function DoctorPatients() {
  const patients = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      age: 62,
      lastVisit: "Hôm qua",
      diagnosis: "Bệnh động mạch vành",
      nextAppointment: "15/05/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      age: 45,
      lastVisit: "2 ngày trước",
      diagnosis: "Tăng huyết áp, Đái tháo đường type 2",
      nextAppointment: "03/06/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      age: 58,
      lastVisit: "3 ngày trước",
      diagnosis: "Suy tim (NYHA Cấp II)",
      nextAppointment: "20/05/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={patient.avatar || "/placeholder.svg"} alt={patient.name} />
              <AvatarFallback>
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{patient.name}</h4>
                <span className="text-sm text-muted-foreground">{patient.age} tuổi</span>
              </div>
              <p className="text-sm">{patient.diagnosis}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Lần khám gần nhất: {patient.lastVisit}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Lịch hẹn: {patient.nextAppointment}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              Hồ sơ
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              Nhắn tin
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
