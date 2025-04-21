import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Download, ExternalLink, FileText, User } from "lucide-react"

export default function PatientMedicalRecords() {
  const records = [
    {
      id: 1,
      title: "Annual Physical Examination",
      doctor: "Dr. Michael Chen",
      specialty: "General Practice",
      date: "Apr 1, 2025",
      type: "Examination",
      summary: "Routine annual physical examination. All vitals within normal range.",
      hasAttachments: true,
    },
    {
      id: 2,
      title: "Cardiology Consultation",
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "Mar 15, 2025",
      type: "Consultation",
      summary: "Follow-up for hypertension. Blood pressure slightly elevated. Medication adjusted.",
      hasAttachments: true,
    },
    {
      id: 3,
      title: "Dermatology Visit",
      doctor: "Dr. Emily Rodriguez",
      specialty: "Dermatology",
      date: "Feb 22, 2025",
      type: "Consultation",
      summary: "Evaluation of skin rash. Diagnosed as contact dermatitis. Topical cream prescribed.",
      hasAttachments: false,
    },
    {
      id: 4,
      title: "Vaccination",
      doctor: "Dr. Michael Chen",
      specialty: "General Practice",
      date: "Jan 10, 2025",
      type: "Procedure",
      summary: "Seasonal flu vaccination administered.",
      hasAttachments: false,
    },
  ]

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id} className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{record.title}</h4>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{record.doctor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{record.date}</span>
                </div>
                <Badge variant="outline">{record.type}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{record.summary}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {record.hasAttachments && (
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            )}
            <Button variant="default" size="sm" className="gap-1">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
