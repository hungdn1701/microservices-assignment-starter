import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MoreHorizontal, User } from "lucide-react"

export default function PharmacistPrescriptions() {
  const prescriptions = [
    {
      id: 1,
      patient: "Nguyễn Thị Hoa",
      patientId: "BN-1001",
      medication: "Lisinopril 10mg",
      doctor: "BS. Nguyễn Thị Hương",
      date: "Hôm nay",
      time: "09:45",
      status: "Khẩn cấp",
      refills: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      patient: "Trần Văn Nam",
      patientId: "BN-1008",
      medication: "Metformin 500mg",
      doctor: "BS. Phạm Văn Đức",
      date: "Hôm nay",
      time: "10:30",
      status: "Chờ xử lý",
      refills: 3,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      patient: "Lê Thị Lan",
      patientId: "BN-1003",
      medication: "Atorvastatin 20mg",
      doctor: "BS. Nguyễn Thị Hương",
      date: "Hôm nay",
      time: "11:15",
      status: "Chờ xử lý",
      refills: 5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      patient: "Phạm Văn Minh",
      patientId: "BN-1006",
      medication: "Amoxicillin 500mg",
      doctor: "BS. Phạm Văn Đức",
      date: "Hôm nay",
      time: "13:30",
      status: "Khẩn cấp",
      refills: 0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <div
          key={prescription.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={prescription.avatar || "/placeholder.svg"} alt={prescription.patient} />
              <AvatarFallback>
                {prescription.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{prescription.patient}</h4>
                <span className="text-xs text-muted-foreground">{prescription.patientId}</span>
              </div>
              <p className="text-sm font-medium">{prescription.medication}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{prescription.doctor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{prescription.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{prescription.time}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={prescription.status === "Khẩn cấp" ? "destructive" : "outline"}
              className={
                prescription.status === "Khẩn cấp"
                  ? ""
                  : "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
              }
            >
              {prescription.status}
            </Badge>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="default" size="sm">
                Xử lý
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
