import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export default function UpcomingAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "Emma Wilson",
      type: "Check-up",
      time: "11:30 AM",
      duration: "30 min",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      patient: "Robert Davis",
      type: "Consultation",
      time: "1:00 PM",
      duration: "45 min",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      patient: "Olivia Martinez",
      type: "Follow-up",
      time: "2:15 PM",
      duration: "30 min",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      patient: "William Taylor",
      type: "Procedure",
      time: "3:30 PM",
      duration: "60 min",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={appointment.avatar} alt={appointment.patient} />
              <AvatarFallback>
                {appointment.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{appointment.patient}</p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {appointment.time} ({appointment.duration})
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant={
              appointment.type === "Check-up"
                ? "default"
                : appointment.type === "Consultation"
                  ? "secondary"
                  : appointment.type === "Follow-up"
                    ? "outline"
                    : "destructive"
            }
          >
            {appointment.type}
          </Badge>
        </div>
      ))}
    </div>
  )
}
