"use client"

import { Card, CardContent } from "@/components/ui/card"
import PatientPrescriptions from "@/components/patient/patient-prescriptions"
import { PageHeader } from "@/components/layout/page-header"

export default function PatientPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Đơn thuốc" description="Xem đơn thuốc hiện tại và lịch sử đơn thuốc của bạn" />

      <Card>
        <CardContent className="p-6">
          <PatientPrescriptions />
        </CardContent>
      </Card>
    </div>
  )
}
