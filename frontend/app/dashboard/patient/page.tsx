"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { PageContainer } from "@/components/layout/page-container"
import {
  Calendar,
  Clock,
  FileText,
  PlusCircle,
  Pill,
  FlaskRoundIcon as Flask,
  CalendarClock,
  Activity,
  ChevronRight,
} from "lucide-react"
import PatientAppointments from "@/components/patient/patient-appointments"
import { formatDate } from "@/lib/utils"
import appointmentService from "@/lib/api/appointment-service"

export default function PatientDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [labTests, setLabTests] = useState<any[]>([])
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pendingPrescriptions: 0,
    pendingLabTests: 0,
    completedVisits: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Lấy dữ liệu cuộc hẹn từ API
      const appointmentsResponse = await appointmentService.getPatientAppointments()
      console.log('Appointments data from API:', appointmentsResponse)

      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedAppointments = appointmentsResponse.map(appointment => ({
        id: appointment.id,
        doctor: {
          first_name: appointment.doctor_info?.first_name || '',
          last_name: appointment.doctor_info?.last_name || '',
          specialty: appointment.doctor_info?.specialty || '',
          name: appointment.doctor_info?.name || ''
        },
        appointment_date: appointment.time_slot?.date || '',
        start_time: appointment.time_slot?.start_time?.substring(0, 5) || '',
        end_time: appointment.time_slot?.end_time?.substring(0, 5) || '',
        reason: appointment.reason_text || '',
        status: appointment.status || '',
        location: appointment.time_slot?.location || 'Phòng khám chính',
      }))

      console.log('Formatted appointments:', formattedAppointments)
      setAppointments(formattedAppointments)

        // Giả lập dữ liệu đơn thuốc
        const mockPrescriptions = [
          {
            id: 1,
            doctor: {
              first_name: "Lê",
              last_name: "Văn C",
              specialty: "Nội khoa",
            },
            prescription_date: "2025-05-01",
            status: "DISPENSED",
            medications: [
              { name: "Paracetamol 500mg", dosage: "1 viên x 3 lần/ngày" },
              { name: "Vitamin C 1000mg", dosage: "1 viên/ngày" },
            ],
          },
          {
            id: 2,
            doctor: {
              first_name: "Trần",
              last_name: "Thị B",
              specialty: "Thần kinh",
            },
            prescription_date: "2025-05-10",
            status: "PENDING",
            medications: [
              { name: "Amitriptyline 25mg", dosage: "1 viên trước khi ngủ" },
              { name: "Ibuprofen 400mg", dosage: "1 viên x 2 lần/ngày khi đau" },
            ],
          },
        ]
        setPrescriptions(mockPrescriptions)

        // Giả lập dữ liệu xét nghiệm
        const mockLabTests = [
          {
            id: 1,
            test_name: "Công thức máu toàn phần",
            ordered_at: "2025-05-05",
            status: "COMPLETED",
            doctor: {
              first_name: "Nguyễn",
              last_name: "Văn A",
              specialty: "Tim mạch",
            },
          },
          {
            id: 2,
            test_name: "Sinh hóa máu",
            ordered_at: "2025-05-10",
            status: "PENDING",
            doctor: {
              first_name: "Trần",
              last_name: "Thị B",
              specialty: "Thần kinh",
            },
          },
        ]
        setLabTests(mockLabTests)

        // Cập nhật thống kê
        setStats({
          upcomingAppointments: formattedAppointments.filter((a) => a.status === "CONFIRMED" || a.status === "SCHEDULED")
            .length,
          pendingPrescriptions: mockPrescriptions.filter((p) => p.status === "PENDING").length,
          pendingLabTests: mockLabTests.filter((l) => l.status === "PENDING").length,
          completedVisits: 15 // Giả lập số lần khám đã hoàn thành
        })

        setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <StatusBadge status="success" text="Đã hoàn thành" />
      case "PENDING":
        return <StatusBadge status="warning" text="Đang chờ" />
      case "DISPENSED":
        return <StatusBadge status="info" text="Đã phát thuốc" />
      case "CONFIRMED":
        return <StatusBadge status="success" text="Đã xác nhận" />
      case "SCHEDULED":
        return <StatusBadge status="info" text="Đã lên lịch" />
      default:
        return <StatusBadge status="default" text={status} />
    }
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
        title="Trang chủ"
        description="Xin chào, chào mừng bạn đến với hệ thống quản lý y tế"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => router.push("/dashboard/patient/appointments/new")} className="group">
              <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Đặt lịch hẹn</span>
            </Button>
            <Button onClick={() => router.push("/dashboard/patient/appointments/simple-booking")} variant="outline" className="group">
              <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>Đặt lịch đơn giản</span>
            </Button>
          </div>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <motion.div variants={item}>
          <StatCard
            title="Lịch hẹn sắp tới"
            value={stats.upcomingAppointments.toString()}
            description="Cuộc hẹn đã xác nhận"
            icon={<CalendarClock className="h-5 w-5" />}
            trend="up"
            trendValue="5%"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Đơn thuốc chờ xử lý"
            value={stats.pendingPrescriptions.toString()}
            description="Đơn thuốc cần lấy"
            icon={<Pill className="h-5 w-5" />}
            trend="neutral"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Xét nghiệm chờ xử lý"
            value={stats.pendingLabTests.toString()}
            description="Xét nghiệm cần thực hiện"
            icon={<Flask className="h-5 w-5" />}
            trend="neutral"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Lần khám đã hoàn thành"
            value={stats.completedVisits.toString()}
            description="Tổng số lần khám"
            icon={<Activity className="h-5 w-5" />}
            trend="up"
            trendValue="12%"
          />
        </motion.div>
      </motion.div>

      <Tabs defaultValue="appointments">
        <TabsList className="mb-4">
          <TabsTrigger value="appointments">Lịch hẹn sắp tới</TabsTrigger>
          <TabsTrigger value="prescriptions">Đơn thuốc gần đây</TabsTrigger>
          <TabsTrigger value="lab-tests">Xét nghiệm gần đây</TabsTrigger>
        </TabsList>

        {/* Không sử dụng AnimatePresence ở đây vì có nhiều phần tử con */}
          <TabsContent key="appointments" value="appointments">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lịch hẹn sắp tới</CardTitle>
                      <CardDescription>Danh sách các cuộc hẹn sắp tới của bạn</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/patient/appointments")}
                      className="group"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <PatientAppointments appointments={appointments} />
                  )}
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => router.push("/dashboard/patient/appointments/new")} className="group">
                      <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                      <span>Đặt lịch hẹn</span>
                    </Button>
                    <Button onClick={() => router.push("/dashboard/patient/appointments/simple-booking")} variant="outline" className="group">
                      <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                      <span>Đặt lịch đơn giản</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent key="prescriptions" value="prescriptions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Đơn thuốc gần đây</CardTitle>
                      <CardDescription>Danh sách đơn thuốc gần đây của bạn</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/patient/prescriptions")}
                      className="group"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : prescriptions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Pill className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Bạn chưa có đơn thuốc nào</p>
                    </motion.div>
                  ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                      {prescriptions.map((prescription, index) => (
                        <motion.div
                          key={prescription.id}
                          variants={item}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Đơn thuốc #{prescription.id}</h4>
                              {getStatusBadge(prescription.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              BS. {prescription.doctor.first_name} {prescription.doctor.last_name} (
                              {prescription.doctor.specialty})
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(prescription.prescription_date)}</span>
                            </div>
                            <div className="mt-2">
                              {prescription.medications.map((med: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{med.name}</span>: {med.dosage}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 md:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/patient/prescriptions/${prescription.id}`)}
                              className="group"
                            >
                              <FileText className="mr-2 h-3.5 w-3.5" />
                              <span>Chi tiết</span>
                              <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-0 transition-all group-hover:ml-2 group-hover:opacity-100" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent key="lab-tests" value="lab-tests">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Xét nghiệm gần đây</CardTitle>
                      <CardDescription>Danh sách xét nghiệm gần đây của bạn</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/patient/records")}
                      className="group"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : labTests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Flask className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Bạn chưa có xét nghiệm nào</p>
                    </motion.div>
                  ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                      {labTests.map((test, index) => (
                        <motion.div
                          key={test.id}
                          variants={item}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{test.test_name}</h4>
                              {getStatusBadge(test.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              BS. {test.doctor.first_name} {test.doctor.last_name} ({test.doctor.specialty})
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Yêu cầu: {formatDate(test.ordered_at)}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 md:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/patient/records/lab-tests/${test.id}`)}
                              className="group"
                            >
                              <FileText className="mr-2 h-3.5 w-3.5" />
                              <span>Xem kết quả</span>
                              <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-0 transition-all group-hover:ml-2 group-hover:opacity-100" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        {/* Kết thúc các TabsContent */}
      </Tabs>
    </PageContainer>
  )
}
