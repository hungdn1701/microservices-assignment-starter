import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowLeft, Calendar, FileText, HeartPulse, Mail, MapPin, Phone, Pill, User } from "lucide-react"
import PatientAppointments from "@/components/patient/patient-appointments"
import PatientMedications from "@/components/patient/patient-medications"
import PatientTestResults from "@/components/patient/patient-test-results"

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch patient data based on the ID
  const patient = {
    id: params.id,
    name: "Emma Wilson",
    email: "emma.w@example.com",
    phone: "(555) 123-4567",
    dob: "04/12/1985",
    gender: "Female",
    bloodType: "O+",
    address: "123 Main Street, Anytown, CA 12345",
    status: "Active",
    lastVisit: "10/04/2025",
    primaryDoctor: "Dr. Sarah Johnson",
    allergies: ["Penicillin", "Peanuts"],
    medicalConditions: ["Hypertension", "Type 2 Diabetes"],
    avatar: "/placeholder.svg?height=128&width=128",
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
            <Link href="/patients" className="text-sm font-medium text-primary">
              Patients
            </Link>
            <Link href="/appointments" className="text-sm font-medium text-muted-foreground hover:text-primary">
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
              <Link href="/patients">
                <ArrowLeft className="h-4 w-4" />
                Back to Patients
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{patient.name}</CardTitle>
                  <CardDescription>Patient ID: {patient.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={patient.status === "Active" ? "default" : "secondary"}
                      className={
                        patient.status === "Active"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : ""
                      }
                    >
                      {patient.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {patient.gender}, {patient.dob} (38 years)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Blood Type: {patient.bloodType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Primary Doctor: {patient.primaryDoctor}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">Allergies</h3>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy) => (
                        <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">Medical Conditions</h3>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalConditions.map((condition) => (
                        <Badge key={condition} variant="outline" className="bg-blue-50 text-blue-700">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="h-4 w-4" />
                      Full Profile
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2">
              <Tabs defaultValue="appointments">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="results">Test Results</TabsTrigger>
                </TabsList>
                <TabsContent value="appointments" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointments</CardTitle>
                      <CardDescription>Upcoming and past appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PatientAppointments />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="medications" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Medications</CardTitle>
                      <CardDescription>Active prescriptions and medication schedule</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PatientMedications />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="results" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Results</CardTitle>
                      <CardDescription>Recent laboratory and diagnostic test results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PatientTestResults />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-teal-600" />
                      Next Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">Tomorrow, 10:00 AM</p>
                      <p className="text-sm">Dr. Sarah Johnson - Cardiology</p>
                      <p className="text-sm text-muted-foreground">Main Hospital, Room 305</p>
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button size="sm">Confirm</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-teal-600" />
                      Medication Reminder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="rounded-md bg-amber-50 p-3">
                        <p className="font-medium text-amber-800">Lisinopril 10mg</p>
                        <p className="text-sm text-amber-700">Take 1 tablet daily with food</p>
                        <p className="text-xs text-amber-600">Next dose: Today, 8:00 PM</p>
                      </div>
                      <div className="rounded-md bg-blue-50 p-3">
                        <p className="font-medium text-blue-800">Atorvastatin 20mg</p>
                        <p className="text-sm text-blue-700">Take 1 tablet daily in the evening</p>
                        <p className="text-xs text-blue-600">Next dose: Today, 9:00 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
