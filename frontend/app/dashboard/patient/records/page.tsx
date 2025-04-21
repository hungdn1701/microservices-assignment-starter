"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PatientMedicalRecords from "@/components/patient/patient-medical-records"
import PatientLabResults from "@/components/patient/patient-lab-results"
import { PageHeader } from "@/components/layout/page-header"

export default function PatientRecordsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hồ sơ y tế" description="Xem hồ sơ y tế và kết quả xét nghiệm của bạn" />

      <Tabs defaultValue="medical-records">
        <TabsList>
          <TabsTrigger value="medical-records">Hồ sơ y tế</TabsTrigger>
          <TabsTrigger value="lab-results">Kết quả xét nghiệm</TabsTrigger>
        </TabsList>
        <TabsContent value="medical-records" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <PatientMedicalRecords />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lab-results" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <PatientLabResults />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
