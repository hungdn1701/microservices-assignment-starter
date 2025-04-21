"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  User,
  Calendar,
  Clock,
  FileText,
  Pill,
  FlaskRoundIcon as Flask,
  Heart,
  Thermometer,
  Activity,
  Stethoscope,
  ChevronLeft,
  Save,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"
import { StatusBadge } from "@/components/ui/status-badge"

// Giả lập dữ liệu bệnh nhân
const patientData = {
  id: 123,
  name: "Nguyễn Văn A",
  gender: "Nam",
  dob: "1985-05-15",
  phone: "0912345678",
  email: "nguyenvana@example.com",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  bloodType: "O+",
  allergies: ["Penicillin", "Hải sản"],
  chronicConditions: ["Tăng huyết áp", "Tiểu đường type 2"],
}

// Giả lập dữ liệu cuộc hẹn
const appointmentData = {
  id: 456,
  date: "2025-05-15",
  time: "09:00 - 09:30",
  reason: "Đau đầu, chóng mặt, mất ngủ kéo dài 2 tuần",
  status: "IN_PROGRESS",
  type: "Khám thông thường",
}

export default function ExaminationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("examination")
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [vitalSigns, setVitalSigns] = useState({
    temperature: "36.8",
    heartRate: "75",
    bloodPressure: "120/80",
    respiratoryRate: "16",
    oxygenSaturation: "98",
    weight: "70",
    height: "175",
  })

  const [diagnosis, setDiagnosis] = useState({
    primaryDiagnosis: "",
    secondaryDiagnosis: "",
    icdCode: "",
    notes: "",
  })

  const [examination, setExamination] = useState({
    symptoms: "",
    physicalExamination: "",
    medicalHistory: "",
    familyHistory: "",
    socialHistory: "",
    assessment: "",
    plan: "",
  })

  const handleSaveMedicalRecord = async () => {
    setIsSaving(true)

    // Giả lập API call
    setTimeout(() => {
      setIsSaving(false)
      // Hiển thị thông báo thành công
    }, 1500)
  }

  const handleSubmitAndPrescribe = async () => {
    setIsSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push(`/dashboard/doctor/prescriptions/new?patient=${patientData.id}&encounter=${params.id}`)
    }, 1500)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>
      <PageHeader
        title="Chi tiết khám bệnh"
        description={`Mã cuộc hẹn: #${params.id}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
            <Button onClick={handleSaveMedicalRecord} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
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
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thông tin bệnh nhân */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Thông tin bệnh nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{patientData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patientData.gender}, {new Date().getFullYear() - new Date(patientData.dob).getFullYear()} tuổi
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ngày sinh:</span>
                  <span>{format(new Date(patientData.dob), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span>{patientData.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{patientData.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nhóm máu:</span>
                  <span>{patientData.bloodType}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Dị ứng</h4>
                <div className="flex flex-wrap gap-2">
                  {patientData.allergies.map((allergy, index) => (
                    <StatusBadge key={index} status="error" text={allergy} />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Bệnh mãn tính</h4>
                <div className="flex flex-wrap gap-2">
                  {patientData.chronicConditions.map((condition, index) => (
                    <StatusBadge key={index} status="warning" text={condition} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Thông tin cuộc hẹn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <span>{format(new Date(appointmentData.date), "PPP", { locale: vi })}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span>{appointmentData.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Lý do khám</h4>
                <p className="text-sm">{appointmentData.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <StatusBadge status="info" text="Đang khám" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loại khám:</span>
                <span className="text-sm">{appointmentData.type}</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Button className="w-full" onClick={handleSubmitAndPrescribe} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Hoàn thành và kê đơn
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Tabs khám bệnh */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="examination">Khám bệnh</TabsTrigger>
              <TabsTrigger value="vitals">Dấu hiệu sinh tồn</TabsTrigger>
              <TabsTrigger value="diagnosis">Chẩn đoán</TabsTrigger>
            </TabsList>

            {/* Không sử dụng AnimatePresence ở đây vì có nhiều phần tử con */}
              <TabsContent value="examination" className="mt-4">
                <motion.div
                  key="examination"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin khám bệnh</CardTitle>
                      <CardDescription>Nhập thông tin khám bệnh của bệnh nhân</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="symptoms">Triệu chứng</Label>
                        <Textarea
                          id="symptoms"
                          placeholder="Mô tả triệu chứng của bệnh nhân"
                          value={examination.symptoms}
                          onChange={(e) => setExamination({ ...examination, symptoms: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="physicalExamination">Khám thực thể</Label>
                        <Textarea
                          id="physicalExamination"
                          placeholder="Kết quả khám thực thể"
                          value={examination.physicalExamination}
                          onChange={(e) => setExamination({ ...examination, physicalExamination: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medicalHistory">Tiền sử bệnh</Label>
                        <Textarea
                          id="medicalHistory"
                          placeholder="Tiền sử bệnh của bệnh nhân"
                          value={examination.medicalHistory}
                          onChange={(e) => setExamination({ ...examination, medicalHistory: e.target.value })}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="familyHistory">Tiền sử gia đình</Label>
                          <Textarea
                            id="familyHistory"
                            placeholder="Tiền sử bệnh của gia đình"
                            value={examination.familyHistory}
                            onChange={(e) => setExamination({ ...examination, familyHistory: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="socialHistory">Tiền sử xã hội</Label>
                          <Textarea
                            id="socialHistory"
                            placeholder="Thông tin về lối sống, nghề nghiệp, ..."
                            value={examination.socialHistory}
                            onChange={(e) => setExamination({ ...examination, socialHistory: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assessment">Đánh giá</Label>
                        <Textarea
                          id="assessment"
                          placeholder="Đánh giá tổng quát về tình trạng bệnh nhân"
                          value={examination.assessment}
                          onChange={(e) => setExamination({ ...examination, assessment: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="plan">Kế hoạch điều trị</Label>
                        <Textarea
                          id="plan"
                          placeholder="Kế hoạch điều trị cho bệnh nhân"
                          value={examination.plan}
                          onChange={(e) => setExamination({ ...examination, plan: e.target.value })}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("vitals")}>
                        Dấu hiệu sinh tồn
                      </Button>
                      <Button onClick={() => setActiveTab("diagnosis")}>Chẩn đoán</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="vitals" className="mt-4">
                <motion.div
                  key="vitals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Dấu hiệu sinh tồn</CardTitle>
                      <CardDescription>Nhập các chỉ số sinh tồn của bệnh nhân</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                        <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="temperature" className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-primary" />
                              Nhiệt độ (°C)
                            </Label>
                            <Input
                              id="temperature"
                              type="text"
                              value={vitalSigns.temperature}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="heartRate" className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-primary" />
                              Nhịp tim (bpm)
                            </Label>
                            <Input
                              id="heartRate"
                              type="text"
                              value={vitalSigns.heartRate}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="bloodPressure" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              Huyết áp (mmHg)
                            </Label>
                            <Input
                              id="bloodPressure"
                              type="text"
                              value={vitalSigns.bloodPressure}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              Nhịp thở (lần/phút)
                            </Label>
                            <Input
                              id="respiratoryRate"
                              type="text"
                              value={vitalSigns.respiratoryRate}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="oxygenSaturation" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              SpO2 (%)
                            </Label>
                            <Input
                              id="oxygenSaturation"
                              type="text"
                              value={vitalSigns.oxygenSaturation}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="weight" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              Cân nặng (kg)
                            </Label>
                            <Input
                              id="weight"
                              type="text"
                              value={vitalSigns.weight}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                            />
                          </div>
                        </motion.div>

                        <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="height" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              Chiều cao (cm)
                            </Label>
                            <Input
                              id="height"
                              type="text"
                              value={vitalSigns.height}
                              onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bmi" className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              BMI
                            </Label>
                            <Input
                              id="bmi"
                              type="text"
                              value={(
                                Number.parseFloat(vitalSigns.weight) /
                                Math.pow(Number.parseFloat(vitalSigns.height) / 100, 2)
                              ).toFixed(2)}
                              readOnly
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("examination")}>
                        Khám bệnh
                      </Button>
                      <Button onClick={() => setActiveTab("diagnosis")}>Chẩn đoán</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="diagnosis" className="mt-4">
                <motion.div
                  key="diagnosis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Chẩn đoán</CardTitle>
                      <CardDescription>Nhập thông tin chẩn đoán cho bệnh nhân</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryDiagnosis" className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          Chẩn đoán chính
                        </Label>
                        <Textarea
                          id="primaryDiagnosis"
                          placeholder="Nhập chẩn đoán chính"
                          value={diagnosis.primaryDiagnosis}
                          onChange={(e) => setDiagnosis({ ...diagnosis, primaryDiagnosis: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondaryDiagnosis" className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          Chẩn đoán phụ
                        </Label>
                        <Textarea
                          id="secondaryDiagnosis"
                          placeholder="Nhập chẩn đoán phụ (nếu có)"
                          value={diagnosis.secondaryDiagnosis}
                          onChange={(e) => setDiagnosis({ ...diagnosis, secondaryDiagnosis: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="icdCode" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Mã ICD
                        </Label>
                        <Input
                          id="icdCode"
                          placeholder="Nhập mã ICD"
                          value={diagnosis.icdCode}
                          onChange={(e) => setDiagnosis({ ...diagnosis, icdCode: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Ghi chú
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder="Ghi chú thêm về chẩn đoán"
                          value={diagnosis.notes}
                          onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="requireLabTests" className="flex items-center gap-2">
                            <Flask className="h-4 w-4 text-primary" />
                            Yêu cầu xét nghiệm
                          </Label>
                          <Switch id="requireLabTests" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="requirePrescription" className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            Kê đơn thuốc
                          </Label>
                          <Switch id="requirePrescription" defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("vitals")}>
                        Dấu hiệu sinh tồn
                      </Button>
                      <Button onClick={handleSubmitAndPrescribe} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Hoàn thành và kê đơn
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </TabsContent>
            {/* Kết thúc các TabsContent */}
          </Tabs>
        </motion.div>
      </div>
    </PageContainer>
  )
}
