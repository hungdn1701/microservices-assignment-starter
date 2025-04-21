import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Bed, Clock, FileText, MoreHorizontal } from "lucide-react"

export default function NursePatientsList() {
  const patients = [
    {
      id: 1,
      name: "Robert Davis",
      age: 62,
      room: "305A",
      bed: "2",
      condition: "Stable",
      diagnosis: "Coronary Artery Disease",
      vitalsStatus: "Due in 30 min",
      medicationStatus: "Up to date",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Jennifer Lee",
      age: 45,
      room: "308B",
      bed: "1",
      condition: "Stable",
      diagnosis: "Hypertension, Type 2 Diabetes",
      vitalsStatus: "Overdue",
      medicationStatus: "Due in 15 min",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "William Taylor",
      age: 58,
      room: "310A",
      bed: "3",
      condition: "Needs Attention",
      diagnosis: "Heart Failure (NYHA Class II)",
      vitalsStatus: "Due now",
      medicationStatus: "Up to date",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Sophia Garcia",
      age: 72,
      room: "302C",
      bed: "2",
      condition: "Critical",
      diagnosis: "Pneumonia, COPD",
      vitalsStatus: "Checked 10 min ago",
      medicationStatus: "Due in 45 min",
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
              <AvatarImage src={patient.avatar} alt={patient.name} />
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
                <span className="text-sm text-muted-foreground">{patient.age} yrs</span>
                <Badge
                  variant={
                    patient.condition === "Critical"
                      ? "destructive"
                      : patient.condition === "Needs Attention"
                        ? "outline"
                        : "default"
                  }
                  className={
                    patient.condition === "Needs Attention"
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                      : ""
                  }
                >
                  {patient.condition}
                </Badge>
              </div>
              <p className="text-sm">{patient.diagnosis}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  <span>
                    Room {patient.room}, Bed {patient.bed}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Vitals: {patient.vitalsStatus}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Medication: {patient.medicationStatus}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <Button variant="outline" size="sm" className="gap-1">
              <Activity className="h-3.5 w-3.5" />
              Vitals
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              Notes
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
