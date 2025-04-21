import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, CreditCard, FileText, MoreHorizontal, User } from "lucide-react"

export default function InsuranceClaims() {
  const claims = [
    {
      id: "C-5001",
      patient: "Emma Wilson",
      patientId: "P-1001",
      provider: "General Hospital",
      service: "Outpatient Consultation",
      date: "Today",
      amount: "$350.00",
      status: "Pending",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "C-5002",
      patient: "James Rodriguez",
      patientId: "P-1008",
      provider: "City Medical Center",
      service: "Laboratory Tests",
      date: "Yesterday",
      amount: "$780.50",
      status: "Under Review",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "C-5003",
      patient: "Sophia Chen",
      patientId: "P-1003",
      provider: "General Hospital",
      service: "Emergency Room Visit",
      date: "2 days ago",
      amount: "$1,250.00",
      status: "Pending",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "C-5004",
      patient: "William Taylor",
      patientId: "P-1006",
      provider: "Northside Clinic",
      service: "Prescription Medication",
      date: "3 days ago",
      amount: "$125.75",
      status: "Approved",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div
          key={claim.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={claim.avatar} alt={claim.patient} />
              <AvatarFallback>
                {claim.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{claim.patient}</h4>
                <span className="text-xs text-muted-foreground">{claim.patientId}</span>
              </div>
              <p className="text-sm font-medium">{claim.service}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{claim.provider}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{claim.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>{claim.amount}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={
                claim.status === "Approved" ? "default" : claim.status === "Under Review" ? "outline" : "secondary"
              }
              className={
                claim.status === "Approved"
                  ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                  : claim.status === "Under Review"
                    ? "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                    : ""
              }
            >
              {claim.status}
            </Badge>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Details
              </Button>
              <Button variant="default" size="sm">
                Review
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
