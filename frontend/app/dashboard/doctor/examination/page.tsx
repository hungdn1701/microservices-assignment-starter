"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Pill, FlaskRoundIcon as Flask, Save, Stethoscope } from "lucide-react"
import MedicalRecordService from "@/lib/api/medical-record-service"
import AppointmentService from "@/lib/api/appointment-service"
import UserService from "@/lib/api/user-service"

export default function ExaminationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [appointment, setAppointment] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [vitalSigns, setVitalSigns] = useState({
    temperature: "",
    heart_rate: "",
    respiratory_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    oxygen_saturation: "",
    notes: "",
  })
  const [medicalRecord, setMedicalRecord] = useState({
    patient_id: "",
    doctor_id: "",
    record_date: new Date().toISOString().split("T")[0],
    record_type: "GENERAL",
    chief_complaint: "",
    present_illness: "",
    notes: "",
  })
  const [diagnosis, setDiagnosis] = useState({
    diagnosis_code: "",
    diagnosis_name: "",
    diagnosis_type: "PRIMARY",
    notes: "",
  })

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails()
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true)
      const appointmentData = await AppointmentService.getAppointmentById(Number(appointmentId))
      setAppointment(appointmentData)

      // Fetch patient details
      const patientData = await UserService.getUserById(appointmentData.patient.id)
      setPatient(patientData)

      // Update medical record with patient and doctor IDs
      setMedicalRecord((prev) => ({
        ...prev,
        patient_id: appointmentData.patient.id,
        doctor_id: appointmentData.doctor.id,
      }))

      setLoading(false)
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cuộc hẹn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleVitalSignsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVitalSigns((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMedicalRecordChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setMedicalRecord((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setDiagnosis((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveMedicalRecord = async () => {
    try {
      setSaving(true)

      // Create medical record
      const newMedicalRecord = await MedicalRecordService.createMedicalRecord(medicalRecord)

      // Create vital signs
      if (vitalSigns.temperature || vitalSigns.heart_rate) {
        await MedicalRecordService.createVitalSign({
          medical_record: newMedicalRecord.id,
          temperature: Number.parseFloat(vitalSigns.temperature) || 0,
          heart_rate: Number.parseInt(vitalSigns.heart_rate) || 0,
          respiratory_rate: Number.parseInt(vitalSigns.respiratory_rate) || 0,
          blood_pressure_systolic: Number.parseInt(vitalSigns.blood_pressure_systolic) || 0,
          blood_pressure_diastolic: Number.parseInt(vitalSigns.blood_pressure_diastolic) || 0,
          oxygen_saturation: Number.parseInt(vitalSigns.oxygen_saturation) || 0,
          measured_at: new Date().toISOString(),
          notes: vitalSigns.notes,
        })
      }

      // Create diagnosis if provided
      if (diagnosis.diagnosis_name) {
        await MedicalRecordService.createDiagnosis({
          medical_record: newMedicalRecord.id,
          diagnosis_code: diagnosis.diagnosis_code,
          diagnosis_name: diagnosis.diagnosis_name,
          diagnosis_date: new Date().toISOString().split("T")[0],
          diagnosis_type: diagnosis.diagnosis_type,
          notes: diagnosis.notes,
        })
      }

      // Update appointment status
      if (appointmentId) {
        await AppointmentService.updateAppointment(Number(appointmentId), {
          status: "COMPLETED",
          notes: `Khám hoàn thành. Hồ sơ y tế: ${newMedicalRecord.id}`,
        })
      }

      toast({
        title: "Thành công",
        description: "Đã lưu hồ sơ khám bệnh thành công",
      })

      // Redirect to medical record detail
      router.push(`/dashboard/doctor/medical-records/${newMedicalRecord.id}`)
    } catch (error) {
      console.error("Error saving medical record:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu hồ sơ khám bệnh. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Stethoscope className="h-10 w-10 text-muted-foreground animate-pulse mx-auto mb-4" />
            <h3 className="text-lg font-medium">Đang tải thông tin khám bệnh...</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Khám bệnh</h1>
          <p className="text-muted-foreground">
            Khám bệnh cho bệnh nhân {patient?.first_name} {patient?.last_name}
          </p>
        </div>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>

      {appointment && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Thông tin cuộc hẹn</CardTitle>
              <CardDescription>Chi tiết cuộc hẹn khám bệnh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src="/placeholder.svg?height=64&width=64"
                      alt={`${patient?.first_name} ${patient?.last_name}`}
                    />
                    <AvatarFallback>
                      {patient?.first_name?.[0]}
                      {patient?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {patient?.first_name} {patient?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{patient?.email}</p>
                    <Badge className="mt-1">{appointment.status}</Badge>
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-sm font-medium">Ngày hẹn</p>
                    <p className="text-sm">{new Date(appointment.appointment_date).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thời gian</p>
                    <p className="text-sm">
                      {appointment.start_time} - {appointment.end_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bác sĩ</p>
                    <p className="text-sm">
                      {appointment.doctor.first_name} {appointment.doctor.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lý do khám</p>
                    <p className="text-sm">{appointment.reason}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="examination">
        <TabsList className="mb-4">
          <TabsTrigger value="examination">Khám bệnh</TabsTrigger>
          <TabsTrigger value="vitals">Dấu hiệu sinh tồn</TabsTrigger>
          <TabsTrigger value="diagnosis">Chẩn đoán</TabsTrigger>
        </TabsList>

        <TabsContent value="examination">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khám bệnh</CardTitle>
              <CardDescription>Nhập thông tin khám bệnh cho bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="record_type">Loại khám</Label>
                  <Select
                    value={medicalRecord.record_type}
                    onValueChange={(value) => setMedicalRecord({ ...medicalRecord, record_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại khám" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">Khám tổng quát</SelectItem>
                      <SelectItem value="FOLLOWUP">Tái khám</SelectItem>
                      <SelectItem value="EMERGENCY">Cấp cứu</SelectItem>
                      <SelectItem value="SPECIALIST">Chuyên khoa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="record_date">Ngày khám</Label>
                  <Input
                    type="date"
                    id="record_date"
                    name="record_date"
                    value={medicalRecord.record_date}
                    onChange={handleMedicalRecordChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chief_complaint">Triệu chứng chính</Label>
                <Input
                  id="chief_complaint"
                  name="chief_complaint"
                  value={medicalRecord.chief_complaint}
                  onChange={handleMedicalRecordChange}
                  placeholder="Nhập triệu chứng chính của bệnh nhân"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="present_illness">Bệnh hiện tại</Label>
                <Textarea
                  id="present_illness"
                  name="present_illness"
                  value={medicalRecord.present_illness}
                  onChange={handleMedicalRecordChange}
                  placeholder="Mô tả chi tiết về tình trạng bệnh hiện tại"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={medicalRecord.notes}
                  onChange={handleMedicalRecordChange}
                  placeholder="Ghi chú thêm về tình trạng bệnh nhân"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Dấu hiệu sinh tồn</CardTitle>
              <CardDescription>Ghi nhận các dấu hiệu sinh tồn của bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Nhiệt độ (°C)</Label>
                  <Input
                    type="number"
                    id="temperature"
                    name="temperature"
                    value={vitalSigns.temperature}
                    onChange={handleVitalSignsChange}
                    placeholder="36.5"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Nhịp tim (bpm)</Label>
                  <Input
                    type="number"
                    id="heart_rate"
                    name="heart_rate"
                    value={vitalSigns.heart_rate}
                    onChange={handleVitalSignsChange}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratory_rate">Nhịp thở (bpm)</Label>
                  <Input
                    type="number"
                    id="respiratory_rate"
                    name="respiratory_rate"
                    value={vitalSigns.respiratory_rate}
                    onChange={handleVitalSignsChange}
                    placeholder="16"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure_systolic">Huyết áp tâm thu (mmHg)</Label>
                  <Input
                    type="number"
                    id="blood_pressure_systolic"
                    name="blood_pressure_systolic"
                    value={vitalSigns.blood_pressure_systolic}
                    onChange={handleVitalSignsChange}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure_diastolic">Huyết áp tâm trương (mmHg)</Label>
                  <Input
                    type="number"
                    id="blood_pressure_diastolic"
                    name="blood_pressure_diastolic"
                    value={vitalSigns.blood_pressure_diastolic}
                    onChange={handleVitalSignsChange}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygen_saturation">SpO2 (%)</Label>
                  <Input
                    type="number"
                    id="oxygen_saturation"
                    name="oxygen_saturation"
                    value={vitalSigns.oxygen_saturation}
                    onChange={handleVitalSignsChange}
                    placeholder="98"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="vitals_notes">Ghi chú</Label>
                <Textarea
                  id="vitals_notes"
                  name="notes"
                  value={vitalSigns.notes}
                  onChange={handleVitalSignsChange}
                  placeholder="Ghi chú về dấu hiệu sinh tồn"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>Chẩn đoán</CardTitle>
              <CardDescription>Nhập thông tin chẩn đoán cho bệnh nhân</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis_code">Mã chẩn đoán (ICD-10)</Label>
                  <Input
                    id="diagnosis_code"
                    name="diagnosis_code"
                    value={diagnosis.diagnosis_code}
                    onChange={handleDiagnosisChange}
                    placeholder="Ví dụ: J00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis_type">Loại chẩn đoán</Label>
                  <Select
                    value={diagnosis.diagnosis_type}
                    onValueChange={(value) => setDiagnosis({ ...diagnosis, diagnosis_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại chẩn đoán" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIMARY">Chính</SelectItem>
                      <SelectItem value="SECONDARY">Phụ</SelectItem>
                      <SelectItem value="COMPLICATION">Biến chứng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis_name">Tên chẩn đoán</Label>
                <Input
                  id="diagnosis_name"
                  name="diagnosis_name"
                  value={diagnosis.diagnosis_name}
                  onChange={handleDiagnosisChange}
                  placeholder="Nhập tên chẩn đoán"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis_notes">Ghi chú</Label>
                <Textarea
                  id="diagnosis_notes"
                  name="notes"
                  value={diagnosis.notes}
                  onChange={handleDiagnosisChange}
                  placeholder="Ghi chú về chẩn đoán"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/doctor/prescriptions/new?patientId=${patient?.id}`)}
          >
            <Pill className="mr-2 h-4 w-4" />
            Kê đơn thuốc
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/doctor/lab-tests/new?patientId=${patient?.id}`)}
          >
            <Flask className="mr-2 h-4 w-4" />
            Yêu cầu xét nghiệm
          </Button>
        </div>
        <Button onClick={handleSaveMedicalRecord} disabled={saving}>
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu hồ sơ
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
