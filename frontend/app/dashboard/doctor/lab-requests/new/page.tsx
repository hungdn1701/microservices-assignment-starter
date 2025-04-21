"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"

const labRequestSchema = z.object({
  patientId: z.string().min(1, { message: "Vui lòng chọn bệnh nhân" }),
  clinicalInfo: z.string().min(1, { message: "Vui lòng nhập thông tin lâm sàng" }),
  urgency: z.enum(["normal", "urgent", "emergency"]),
  notes: z.string().optional(),
  tests: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        selected: z.boolean(),
        specificInstructions: z.string().optional(),
      }),
    )
    .refine((tests) => tests.some((test) => test.selected), {
      message: "Vui lòng chọn ít nhất một xét nghiệm",
    }),
})

type LabRequestFormValues = z.infer<typeof labRequestSchema>

// Mock data for patients
const patients = [
  { id: "1", name: "Nguyễn Văn A", age: 45, gender: "Nam" },
  { id: "2", name: "Trần Thị B", age: 32, gender: "Nữ" },
  { id: "3", name: "Lê Văn C", age: 28, gender: "Nam" },
]

// Mock data for lab tests
const availableTests = [
  { id: "1", name: "Công thức máu toàn phần (CBC)", category: "Huyết học" },
  { id: "2", name: "Glucose máu", category: "Sinh hóa" },
  { id: "3", name: "Lipid máu", category: "Sinh hóa" },
  { id: "4", name: "Chức năng gan (AST, ALT, GGT)", category: "Sinh hóa" },
  { id: "5", name: "Chức năng thận (Urea, Creatinine)", category: "Sinh hóa" },
  { id: "6", name: "HbA1c", category: "Sinh hóa" },
  { id: "7", name: "Điện giải đồ", category: "Sinh hóa" },
  { id: "8", name: "Tổng phân tích nước tiểu", category: "Nước tiểu" },
  { id: "9", name: "X-quang ngực thẳng", category: "Chẩn đoán hình ảnh" },
  { id: "10", name: "Siêu âm ổ bụng", category: "Chẩn đoán hình ảnh" },
  { id: "11", name: "Điện tâm đồ (ECG)", category: "Tim mạch" },
  { id: "12", name: "Xét nghiệm vi sinh đờm", category: "Vi sinh" },
]

export default function NewLabRequestPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [testSearchTerm, setTestSearchTerm] = useState('')

  const form = useForm<LabRequestFormValues>({
    resolver: zodResolver(labRequestSchema),
    defaultValues: {
      patientId: '',
      clinicalInfo: '',
      urgency: 'normal',
      notes: '',
      tests: availableTests.map(test => ({
        id: test.id,
        name: test.name,
        selected: false,
        specificInstructions: '',
      })),
    },
  })

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTests = availableTests.filter(test => 
    test.name.toLowerCase().includes(testSearchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(testSearchTerm.toLowerCase())
  )

  const selectPatient = (patient: typeof patients[0]) => {
    setSelectedPatient(patient)
    form.setValue('patientId', patient.id)
    setShowPatientSearch(false)
  }

  const toggleTest = (testId: string) => {
    const currentTests = form.getValues('tests')
    const updatedTests = currentTests.map(test => 
      test.id === testId ? { ...test, selected: !test.selected } : test
    )
    form.setValue('tests', updatedTests)
  }

  const updateTestInstructions = (testId: string, instructions: string) => {
    const currentTests = form.getValues('tests')
    const updatedTests = currentTests.map(test => 
      test.id === testId ? { ...test, specificInstructions: instructions } : test
    )
    form.setValue('tests', updatedTests)
  }

  const onSubmit = (data: LabRequestFormValues) => {
    console.log('Lab request data:', data)
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Yêu cầu xét nghiệm đã được tạo',
        description: 'Yêu cầu đã được gửi đến phòng xét nghiệm',
      })
      router.push('/dashboard/doctor/lab-requests')
    }, 1500)
  }

  // Group tests by category
  const testsByCategory = filteredTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = []
    }
    acc[test.category].\
