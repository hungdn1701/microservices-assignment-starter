import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, ExternalLink, Pill, RefreshCw, User } from "lucide-react"

export default function PatientPrescriptions() {
  const medications = [
    {
      id: 1,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      instructions: "Take in the morning with food",
      prescribed: "Apr 1, 2025",
      doctor: "Dr. Sarah Johnson",
      refills: 2,
      status: "Active",
      expirationDate: "Oct 1, 2025",
    },
    {
      id: 2,
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      instructions: "Take in the evening",
      prescribed: "Apr 1, 2025",
      doctor: "Dr. Sarah Johnson",
      refills: 5,
      status: "Active",
      expirationDate: "Oct 1, 2025",
    },
    {
      id: 3,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      instructions: "Take with meals",
      prescribed: "Mar 15, 2025",
      doctor: "Dr. Michael Chen",
      refills: 1,
      status: "Active",
      expirationDate: "Sep 15, 2025",
    },
    {
      id: 4,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      instructions: "Take until completed",
      prescribed: "Feb 10, 2025",
      doctor: "Dr. Michael Chen",
      refills: 0,
      status: "Completed",
      expirationDate: "Mar 10, 2025",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {medications.map((medication) => (
        <Card key={medication.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{medication.name}</h4>
                  <Badge
                    variant="outline"
                    className={
                      medication.status === "Active"
                        ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                    }
                  >
                    {medication.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{medication.dosage}</p>
              </div>
              <Pill className="h-5 w-5 text-teal-600" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{medication.frequency}</span>
              </div>
              <p className="text-sm">{medication.instructions}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{medication.doctor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{medication.prescribed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expires: {medication.expirationDate}</span>
                <span className="font-medium">Refills: {medication.refills}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {medication.status === "Active" && medication.refills > 0 && (
                <Button className="w-full gap-1" variant="outline" size="sm">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Request Refill
                </Button>
              )}
              <Button className="w-full gap-1" variant="default" size="sm">
                <ExternalLink className="h-3.5 w-3.5" />
                Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
