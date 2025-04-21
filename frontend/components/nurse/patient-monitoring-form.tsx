"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface PatientMonitoringFormProps {
  patientId: string
  patientName: string
}

export default function PatientMonitoringForm({ patientId, patientName }: PatientMonitoringFormProps) {
  const router = useRouter()
  const [temperature, setTemperature] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [oxygen

\
## 25. Trang Thanh Toán cho Bệnh Nhân
