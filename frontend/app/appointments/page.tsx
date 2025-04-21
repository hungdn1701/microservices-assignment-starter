import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AppointmentsPage() {
  const appointments = [
    {
      id: "A-2001",
      patient: "Emma Wilson",
      patientId: "P-1001",
      type: "Check-up",
      date: "04/10/2025",
      time: "11:30 AM",
      duration: "30 min",
      doctor: "Dr. Sarah Johnson",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2002",
      patient: "Robert Davis",
      patientId: "P-1008",
      type: "Consultation",
      date: "04/10/2025",
      time: "1:00 PM",
      duration: "45 min",
      doctor: "Dr. James Wilson",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2003",
      patient: "Olivia Martinez",
      patientId: "P-1005",
      type: "Follow-up",
      date: "04/10/2025",
      time: "2:15 PM",
      duration: "30 min",
      doctor: "Dr. Sarah Johnson",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2004",
      patient: "William Taylor",
      patientId: "P-1006",
      type: "Procedure",
      date: "04/10/2025",
      time: "3:30 PM",
      duration: "60 min",
      doctor: "Dr. Michael Brown",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2005",
      patient: "Sophia Garcia",
      patientId: "P-1003",
      type: "Check-up",
      date: "04/11/2025",
      time: "9:00 AM",
      duration: "30 min",
      doctor: "Dr. James Wilson",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2006",
      patient: "James Johnson",
      patientId: "P-1004",
      type: "Consultation",
      date: "04/11/2025",
      time: "10:30 AM",
      duration: "45 min",
      doctor: "Dr. Michael Brown",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "A-2007",
      patient: "Ava Anderson",
      patientId: "P-1007",
      type: "Follow-up",
      date: "04/11/2025",
      time: "1:15 PM",
      duration: "30 min",
      doctor: "Dr. Sarah Johnson",
      status: "Scheduled",
      avatar: "/placeholder.svg?height=40&width=40",
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
            <Link href="/appointments" className="text-sm font-medium text-primary">
              Appointments
            </Link>
            <Link href="/records" className="text-sm font-medium text-muted-foreground hover:text-primary">
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
            <h2 className="text-3xl font-bold">Appointments</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search appointments..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="today">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Appointment ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
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
                          <span className="font-medium">{appointment.patient}</span>
                          <p className="text-xs text-muted-foreground">{appointment.patientId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="text-sm">{appointment.date}</span>
                        <span className="text-xs text-muted-foreground">
                          {appointment.time} ({appointment.duration})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.doctor}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                      >
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/appointments/${appointment.id}`}>View</Link>
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
