import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, FileText, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RecordsPage() {
  const records = [
    {
      id: "R-3001",
      patient: "Emma Wilson",
      patientId: "P-1001",
      type: "Lab Results",
      date: "04/05/2025",
      doctor: "Dr. Sarah Johnson",
      status: "Completed",
    },
    {
      id: "R-3002",
      patient: "Michael Brown",
      patientId: "P-1002",
      type: "Prescription",
      date: "04/04/2025",
      doctor: "Dr. James Wilson",
      status: "Active",
    },
    {
      id: "R-3003",
      patient: "Sophia Garcia",
      patientId: "P-1003",
      type: "Imaging",
      date: "04/02/2025",
      doctor: "Dr. Michael Brown",
      status: "Completed",
    },
    {
      id: "R-3004",
      patient: "James Johnson",
      patientId: "P-1004",
      type: "Consultation Notes",
      date: "04/04/2025",
      doctor: "Dr. Sarah Johnson",
      status: "Completed",
    },
    {
      id: "R-3005",
      patient: "Olivia Martinez",
      patientId: "P-1005",
      type: "Lab Results",
      date: "04/03/2025",
      doctor: "Dr. James Wilson",
      status: "Pending",
    },
    {
      id: "R-3006",
      patient: "William Taylor",
      patientId: "P-1006",
      type: "Procedure Notes",
      date: "03/15/2025",
      doctor: "Dr. Michael Brown",
      status: "Completed",
    },
    {
      id: "R-3007",
      patient: "Ava Anderson",
      patientId: "P-1007",
      type: "Prescription",
      date: "04/02/2025",
      doctor: "Dr. Sarah Johnson",
      status: "Active",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600" />
            <h1 className="text-xl font-bold">HealthCare System</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
            <Link href="/patients" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Patients
            </Link>
            <Link href="/appointments" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Appointments
            </Link>
            <Link href="/records" className="text-sm font-medium text-primary">
              Records
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Medical Records</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search records..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Record type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lab">Lab Results</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="notes">Consultation Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{record.patient}</span>
                        <p className="text-xs text-muted-foreground">{record.patientId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "Completed"
                            ? "default"
                            : record.status === "Active"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/records/${record.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">© 2025 HealthCare System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
