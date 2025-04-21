import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  MessageSquare,
  Pencil,
  User,
  X,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function AppointmentDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch appointment data based on the ID
  const appointment = {
    id: params.id,
    patient: {
      id: "P-1001",
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "(555) 123-4567",
      avatar: "/placeholder.svg?height=64&width=64",
    },
    doctor: {
      id: "D-2001",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      avatar: "/placeholder.svg?height=64&width=64",
    },
    type: "Check-up",
    date: "April 10, 2025",
    time: "11:30 AM",
    duration: "30 min",
    location: "Main Hospital, Room 305",
    status: "Scheduled",
    reason: "Follow-up for hypertension medication adjustment",
    notes: "Patient reported occasional headaches. Blood pressure was slightly elevated at last visit.",
    vitals: {
      bloodPressure: "138/85",
      heartRate: "78 bpm",
      temperature: "98.6°F",
      respiratoryRate: "16/min",
      oxygenSaturation: "98%",
      lastChecked: "March 15, 2025",
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-600" />
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
          <div className="mb-6">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link href="/appointments">
                <ArrowLeft className="h-4 w-4" />
                Back to Appointments
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Appointment Details</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <CardDescription>Appointment ID: {appointment.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">Date & Time</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date}, {appointment.time} ({appointment.duration})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{appointment.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Activity className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">Appointment Type</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">Doctor</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor.name} ({appointment.doctor.specialty})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="text-sm font-medium">Reason for Visit</p>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="mb-2 text-sm font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Clock className="h-4 w-4" />
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Last Recorded Vital Signs</CardTitle>
                  <CardDescription>Recorded on {appointment.vitals.lastChecked}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Blood Pressure</p>
                      <p className="text-lg font-medium">{appointment.vitals.bloodPressure}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Heart Rate</p>
                      <p className="text-lg font-medium">{appointment.vitals.heartRate}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Temperature</p>
                      <p className="text-lg font-medium">{appointment.vitals.temperature}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Respiratory Rate</p>
                      <p className="text-lg font-medium">{appointment.vitals.respiratoryRate}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Oxygen Saturation</p>
                      <p className="text-lg font-medium">{appointment.vitals.oxygenSaturation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={appointment.patient.avatar} alt={appointment.patient.name} />
                      <AvatarFallback>
                        {appointment.patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{appointment.patient.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {appointment.patient.id}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> {appointment.patient.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span> {appointment.patient.phone}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="default" size="sm" className="w-full" asChild>
                      <Link href={`/patients/${appointment.patient.id}`}>View Patient Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Doctor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={appointment.doctor.avatar} alt={appointment.doctor.name} />
                      <AvatarFallback>
                        {appointment.doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{appointment.doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Contact Doctor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
