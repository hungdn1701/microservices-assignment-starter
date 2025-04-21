import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, MoreHorizontal, ShieldCheck, User } from "lucide-react"

export default function InsurancePolicies() {
  const policies = [
    {
      id: "POL-1001",
      patient: "Robert Davis",
      patientId: "P-1008",
      policyType: "Family Health Plan",
      policyNumber: "FHP-2025-0042",
      expirationDate: "May 15, 2025",
      status: "Active",
      premium: "$450/month",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "POL-1002",
      patient: "Jennifer Lee",
      patientId: "P-1012",
      policyType: "Individual Premium",
      policyNumber: "IPP-2025-0108",
      expirationDate: "May 22, 2025",
      status: "Active",
      premium: "$320/month",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "POL-1003",
      patient: "Michael Brown",
      patientId: "P-1002",
      policyType: "Senior Care Plus",
      policyNumber: "SCP-2025-0073",
      expirationDate: "June 05, 2025",
      status: "Active",
      premium: "$380/month",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "POL-1004",
      patient: "Olivia Martinez",
      patientId: "P-1005",
      policyType: "Individual Basic",
      policyNumber: "IBP-2025-0156",
      expirationDate: "June 12, 2025",
      status: "Payment Due",
      premium: "$220/month",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {policies.map((policy) => (
        <div
          key={policy.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={policy.avatar} alt={policy.patient} />
              <AvatarFallback>
                {policy.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{policy.patient}</h4>
                <span className="text-xs text-muted-foreground">{policy.patientId}</span>
              </div>
              <p className="text-sm font-medium">{policy.policyType}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{policy.policyNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Expires: {policy.expirationDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{policy.premium}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={policy.status === "Active" ? "default" : "outline"}
              className={
                policy.status === "Active"
                  ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
              }
            >
              {policy.status}
            </Badge>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Details
              </Button>
              <Button variant="default" size="sm">
                Renew
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
