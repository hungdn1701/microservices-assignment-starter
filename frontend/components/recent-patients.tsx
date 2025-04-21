import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function RecentPatients() {
  const patients = [
    {
      id: 1,
      name: "Emma Wilson",
      email: "emma.w@example.com",
      status: "New",
      date: "Today, 10:30 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "michael.b@example.com",
      status: "Follow-up",
      date: "Today, 9:15 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Sophia Garcia",
      email: "sophia.g@example.com",
      status: "New",
      date: "Yesterday, 3:45 PM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "James Johnson",
      email: "james.j@example.com",
      status: "Returning",
      date: "Yesterday, 1:20 PM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback>
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{patient.name}</p>
              <p className="text-xs text-muted-foreground">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={patient.status === "New" ? "default" : patient.status === "Follow-up" ? "outline" : "secondary"}
            >
              {patient.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{patient.date}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
