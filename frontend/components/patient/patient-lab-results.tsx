import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Download, ExternalLink, FileText, User } from "lucide-react"

export default function PatientLabResults() {
  const labResults = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      date: "Apr 5, 2025",
      doctor: "Dr. Sarah Johnson",
      lab: "Main Hospital Laboratory",
      status: "Completed",
      summary: "All values within normal range.",
      isNew: true,
    },
    {
      id: 2,
      name: "Lipid Panel",
      date: "Mar 20, 2025",
      doctor: "Dr. Michael Chen",
      lab: "Main Hospital Laboratory",
      status: "Completed",
      summary: "Cholesterol slightly elevated. Follow-up recommended.",
      isNew: false,
    },
    {
      id: 3,
      name: "Chest X-Ray",
      date: "Feb 15, 2025",
      doctor: "Dr. Sarah Johnson",
      lab: "Radiology Department",
      status: "Completed",
      summary: "No abnormalities detected.",
      isNew: false,
    },
    {
      id: 4,
      name: "Urinalysis",
      date: "Jan 30, 2025",
      doctor: "Dr. Michael Chen",
      lab: "Main Hospital Laboratory",
      status: "Completed",
      summary: "Normal results.",
      isNew: false,
    },
  ]

  return (
    <div className="space-y-4">
      {labResults.map((result) => (
        <div key={result.id} className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{result.name}</h4>
                {result.isNew && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">New</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{result.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Ordered by: {result.doctor}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">Lab: {result.lab}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
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
