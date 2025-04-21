"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Search, Plus, Trash2 } from "lucide-react"
import PharmacyService from "@/lib/api/pharmacy-service"
import UserService from "@/lib/api/user-service"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { FadeIn, SlideIn, StaggeredContainer, StaggeredItem } from "@/components/ui/animations"

const prescriptionSchema = z.object({
  patientId: z.string().min(1, { message: "Vui lòng chọn bệnh nhân" }),
  diagnosis: z.string().min(1, { message: "Vui lòng nhập chẩn đoán" }),
  notes: z.string().optional(),
  medications: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Vui lòng nhập tên thuốc" }),
        dosage: z.string().min(1, { message: "Vui lòng nhập liều lượng" }),
        frequency: z.string().min(1, { message: "Vui lòng nhập tần suất" }),
        duration: z.string().min(1, { message: "Vui lòng nhập thời gian dùng" }),
        instructions: z.string().optional(),
      }),
    )
    .min(1, { message: "Vui lòng thêm ít nhất một loại thuốc" }),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

const defaultMedication = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
}

// Mock data for patients
const patients = [
  { id: "1", name: "Nguyễn Văn A", age: 45, gender: "Nam" },
  { id: "2", name: "Trần Thị B", age: 32, gender: "Nữ" },
  { id: "3", name: "Lê Văn C", age: 28, gender: "Nam" },
]

// Mock data for medications
const medicationSuggestions = [
  { id: "1", name: "Paracetamol", dosage: "500mg", frequency: "Mỗi 6 giờ", duration: "5 ngày" },
  { id: "2", name: "Amoxicillin", dosage: "250mg", frequency: "Mỗi 8 giờ", duration: "7 ngày" },
  { id: "3", name: "Omeprazole", dosage: "20mg", frequency: "Mỗi ngày", duration: "14 ngày" },
]

export default function NewPrescriptionPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [medicationSearch, setMedicationSearch] = useState("")
  const [showMedicationSuggestions, setShowMedicationSuggestions] = useState(false)
  const [currentMedicationIndex, setCurrentMedicationIndex] = useState<number | null>(null)

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      diagnosis: "",
      notes: "",
      medications: [defaultMedication],
    },
  })

  const { fields, append, remove } = form.useFieldArray({
    name: "medications",
  })

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredMedications = medicationSuggestions.filter((med) =>
    med.name.toLowerCase().includes(medicationSearch.toLowerCase()),
  )

  const selectPatient = (patient: (typeof patients)[0]) => {
    setSelectedPatient(patient)
    form.setValue("patientId", patient.id)
    setShowPatientSearch(false)
  }

  const selectMedication = (medication: (typeof medicationSuggestions)[0], index: number) => {
    form.setValue(`medications.${index}.name`, medication.name)
    form.setValue(`medications.${index}.dosage`, medication.dosage)
    form.setValue(`medications.${index}.frequency`, medication.frequency)
    form.setValue(`medications.${index}.duration`, medication.duration)
    setShowMedicationSuggestions(false)
    setMedicationSearch("")
  }

  const onSubmit = (data: PrescriptionFormValues) => {
    console.log("Prescription data:", data)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Đơn thuốc đã được tạo",
        description: "Đơn thuốc đã được gửi đến dược sĩ để xử lý",
      })
      router.push("/dashboard/doctor/prescriptions")
    }, 1500)
  }

  return (
    <PageContainer>
      <FadeIn>
        <PageHeader heading="Tạo đơn thuốc mới" subheading="Kê đơn thuốc cho bệnh nhân sau khi khám bệnh" />
      </FadeIn>

      <SlideIn delay={0.1}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin bệnh nhân</CardTitle>
                <CardDescription>Chọn bệnh nhân cần kê đơn thuốc</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="patient-search">Tìm kiếm bệnh nhân</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="patient-search"
                            placeholder="Nhập tên bệnh nhân..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setShowPatientSearch(true)
                            }}
                            onFocus={() => setShowPatientSearch(true)}
                          />
                        </div>
                      </div>
                      {selectedPatient && (
                        <div className="flex-1">
                          <Label>Bệnh nhân đã chọn</Label>
                          <div className="rounded-md border border-input p-2 flex justify-between items-center">
                            <div>
                              <span className="font-medium">{selectedPatient.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {selectedPatient.age} tuổi, {selectedPatient.gender}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(null)
                                form.setValue("patientId", "")
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {showPatientSearch && filteredPatients.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full max-w-md rounded-md border border-input bg-background shadow-lg">
                        <ul className="py-1">
                          {filteredPatients.map((patient) => (
                            <li
                              key={patient.id}
                              className="px-4 py-2 hover:bg-muted cursor-pointer"
                              onClick={() => selectPatient(patient)}
                            >
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.age} tuổi, {patient.gender}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="diagnosis">Chẩn đoán</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Nhập chẩn đoán của bệnh nhân..."
                      {...form.register("diagnosis")}
                    />
                    {form.formState.errors.diagnosis && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.diagnosis.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea id="notes" placeholder="Nhập ghi chú bổ sung (nếu có)..." {...form.register("notes")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Danh sách thuốc</CardTitle>
                  <CardDescription>Thêm các loại thuốc vào đơn</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append(defaultMedication)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm thuốc
                </Button>
              </CardHeader>
              <CardContent>
                <StaggeredContainer className="space-y-6">
                  {fields.map((field, index) => (
                    <StaggeredItem key={field.id} className="p-4 border rounded-lg relative">
                      <div className="absolute top-2 right-2">
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                          <Label htmlFor={`medication-${index}`}>Tên thuốc</Label>
                          <Input
                            id={`medication-${index}`}
                            placeholder="Nhập tên thuốc..."
                            {...form.register(`medications.${index}.name`)}
                            onChange={(e) => {
                              form.setValue(`medications.${index}.name`, e.target.value)
                              setMedicationSearch(e.target.value)
                              setCurrentMedicationIndex(index)
                              setShowMedicationSuggestions(true)
                            }}
                            onFocus={() => {
                              setMedicationSearch(form.getValues(`medications.${index}.name`))
                              setCurrentMedicationIndex(index)
                              setShowMedicationSuggestions(true)
                            }}
                          />
                          {form.formState.errors.medications?.[index]?.name && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.medications[index]?.name?.message}
                            </p>
                          )}

                          {showMedicationSuggestions &&
                            currentMedicationIndex === index &&
                            medicationSearch &&
                            filteredMedications.length > 0 && (
                              <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
                                <ul className="py-1">
                                  {filteredMedications.map((med) => (
                                    <li
                                      key={med.id}
                                      className="px-4 py-2 hover:bg-muted cursor-pointer"
                                      onClick={() => selectMedication(med, index)}
                                    >
                                      <div className="font-medium">{med.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {med.dosage}, {med.frequency}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>

                        <div>
                          <Label htmlFor={`dosage-${index}`}>Liều lượng</Label>
                          <Input
                            id={`dosage-${index}`}
                            placeholder="Ví dụ: 500mg"
                            {...form.register(`medications.${index}.dosage`)}
                          />
                          {form.formState.errors.medications?.[index]?.dosage && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.medications[index]?.dosage?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`frequency-${index}`}>Tần suất</Label>
                          <Input
                            id={`frequency-${index}`}
                            placeholder="Ví dụ: Mỗi 8 giờ"
                            {...form.register(`medications.${index}.frequency`)}
                          />
                          {form.formState.errors.medications?.[index]?.frequency && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.medications[index]?.frequency?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`duration-${index}`}>Thời gian dùng</Label>
                          <Input
                            id={`duration-${index}`}
                            placeholder="Ví dụ: 7 ngày"
                            {...form.register(`medications.${index}.duration`)}
                          />
                          {form.formState.errors.medications?.[index]?.duration && (
                            <p className="text-sm text-destructive mt-1">
                              {form.formState.errors.medications[index]?.duration?.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`instructions-${index}`}>Hướng dẫn sử dụng</Label>
                          <Textarea
                            id={`instructions-${index}`}
                            placeholder="Nhập hướng dẫn sử dụng thuốc..."
                            {...form.register(`medications.${index}.instructions`)}
                          />
                        </div>
                      </div>
                    </StaggeredItem>
                  ))}
                </StaggeredContainer>

                {form.formState.errors.medications && !Array.isArray(form.formState.errors.medications) && (
                  <p className="text-sm text-destructive mt-4">{form.formState.errors.medications.message}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Hủy
                </Button>
                <Button type="submit">Tạo đơn thuốc</Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </SlideIn>
    </PageContainer>
  )
}
