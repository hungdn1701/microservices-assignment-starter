"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import PatientAppointmentsList from "@/components/patient/patient-appointments-list"
import PatientAppointmentCalendar from "@/components/patient/patient-appointment-calendar"
import { PageHeader } from "@/components/layout/page-header"

export default function PatientAppointmentsPage() {
  const [view, setView] = useState<"list" | "calendar">("list")

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch hẹn" description="Quản lý các cuộc hẹn khám bệnh của bạn">
        <Link href="/dashboard/patient/appointments/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Đặt lịch hẹn
          </Button>
        </Link>
      </PageHeader>

      <div className="flex items-center justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")}>
          <TabsList>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="calendar">Lịch</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-6">
          {view === "list" ? <PatientAppointmentsList /> : <PatientAppointmentCalendar />}
        </CardContent>
      </Card>
    </div>
  )
}
