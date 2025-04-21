import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Activity, Plus, Search } from "lucide-react"

export default function PatientsPage() {
  const patients = [
    {
      id: "P-1001",
      name: "Emma Wilson",
      email: "emma.w@example.com",
      phone: "(555) 123-4567",
      dob: "04/12/1985",
      status: "Active",
      lastVisit: "10/04/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1002",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "(555) 234-5678",
      dob: "08/23/1979",
      status: "Active",
      lastVisit: "09/04/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1003",
      name: "Sophia Garcia",
      email: "sophia.g@example.com",
      phone: "(555) 345-6789",
      dob: "11/15/1992",
      status: "Inactive",
      lastVisit: "05/02/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1004",
      name: "James Johnson",
      email: "james.j@example.com",
      phone: "(555) 456-7890",
      dob: "02/28/1965",
      status: "Active",
      lastVisit: "09/04/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1005",
      name: "Olivia Martinez",
      email: "olivia.m@example.com",
      phone: "(555) 567-8901",
      dob: "07/19/1988",
      status: "Active",
      lastVisit: "08/30/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1006",
      name: "William Taylor",
      email: "william.t@example.com",
      phone: "(555) 678-9012",
      dob: "12/05/1972",
      status: "Inactive",
      lastVisit: "06/15/2025",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "P-1007",
      name: "Ava Anderson",
      email: "ava.a@example.com",
      phone: "(555) 789-0123",
      dob: "09/30/1995",
      status: "Active",
      lastVisit: "09/02/2025",
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
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Patients</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search patients..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={patient.avatar} alt={patient.name} />
                          <AvatarFallback>
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="text-sm">{patient.email}</span>
                        <span className="text-xs text-muted-foreground">{patient.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.dob}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "Active" ? "default" : "secondary"}>{patient.status}</Badge>
                    </TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
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
