"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addDays, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarDays, Clock, Plus, Search, Filter, RefreshCw, FileText } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar"
import { DataTable } from "@/components/ui/data-table"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DoctorSchedule } from "@/components/doctor/doctor-schedule"

import appointmentService from "@/lib/api/appointment-service"
import { DoctorAvailability, TimeSlot, AppointmentWithDetails } from "@/lib/api/appointment-service"

// Schema cho form tạo lịch làm việc
const availabilityFormSchema = z.object({
  weekday: z.string().min(1, { message: "Vui lòng chọn ngày trong tuần" }),
  start_time: z.string().min(1, { message: "Vui lòng nhập giờ bắt đầu" }),
  end_time: z.string().min(1, { message: "Vui lòng nhập giờ kết thúc" }),
  is_available: z.boolean().default(true),
})

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>

// Schema cho form tạo khung giờ từ lịch làm việc
const timeSlotFormSchema = z.object({
  start_date: z.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
  end_date: z.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
  slot_duration: z.string().min(1, { message: "Vui lòng chọn thời lượng khung giờ" }),
})



export default function DoctorAppointmentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("schedule")
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([])
  const safeAvailabilities = Array.isArray(availabilities) ? availabilities : []
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Form cho lịch làm việc
  const availabilityForm = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      weekday: "",
      start_time: "",
      end_time: "",
      is_available: true,
    },
  })

  // Form cho tạo khung giờ từ lịch làm việc
  const timeSlotForm = useForm<z.infer<typeof timeSlotFormSchema>>({
    resolver: zodResolver(timeSlotFormSchema),
    defaultValues: {
      start_date: new Date(),
      end_date: addDays(new Date(), 7),
      slot_duration: "30",
    },
  })



  // Lấy ID của bác sĩ đang đăng nhập
  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        setUserId(user.id)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Lấy danh sách lịch làm việc của bác sĩ
  const fetchAvailabilities = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const data = await appointmentService.getDoctorAvailabilities(userId)
      setAvailabilities(data)
    } catch (error) {
      console.error("Error fetching availabilities:", error)
      toast.error("Không thể tải lịch làm việc. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy danh sách khung giờ của bác sĩ
  const fetchTimeSlots = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      // Lấy khung giờ trong 30 ngày tới
      const today = format(new Date(), "yyyy-MM-dd")
      const nextMonth = format(addDays(new Date(), 30), "yyyy-MM-dd")

      console.log("Fetching time slots for doctor ID:", userId);
      console.log("Date range:", today, "to", nextMonth);

      const data = await appointmentService.getAvailableTimeSlots(userId, today, nextMonth)
      console.log("Fetched time slots:", data);

      if (Array.isArray(data)) {
        setTimeSlots(data)
      } else {
        console.error("Unexpected response format:", data);
        setTimeSlots([])
        toast.error("Dữ liệu khung giờ không đúng định dạng. Vui lòng thử lại sau.")
      }
    } catch (error: any) {
      console.error("Error fetching time slots:", error)
      toast.error(`Không thể tải khung giờ: ${error.message || 'Lỗi không xác định'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy danh sách lịch hẹn của bác sĩ
  const fetchAppointments = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const data = await appointmentService.getDoctorAppointments(userId)
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Không thể tải lịch hẹn. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật trạng thái lịch hẹn
  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    setIsLoading(true)
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus)
      toast.success("Cập nhật trạng thái lịch hẹn thành công!")
      fetchAppointments() // Tải lại danh sách lịch hẹn
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Tải dữ liệu khi component được mount hoặc khi userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchAvailabilities()
      fetchTimeSlots()
      fetchAppointments()
    }
  }, [userId])

  // Tải lại dữ liệu khi chuyển tab
  useEffect(() => {
    if (userId) {
      if (activeTab === "schedule") {
        fetchAvailabilities()
        fetchTimeSlots()
      } else if (activeTab === "appointments") {
        fetchAppointments()
      }
    }
  }, [activeTab, userId])

  // State để lưu trữ ID của ca làm việc đang được chỉnh sửa
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<number | null>(null);

  // Xử lý tạo lịch làm việc mới
  const handleCreateAvailability = async (values: AvailabilityFormValues) => {
    if (!userId) {
      toast.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.")
      return
    }

    // Kiểm tra thời gian bắt đầu và kết thúc
    const startTime = values.start_time;
    const endTime = values.end_time;

    if (startTime >= endTime) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.")
      return
    }

    // Kiểm tra chồng chéo với các ca làm việc hiện có
    const weekday = parseInt(values.weekday);
    const overlappingSchedules = safeAvailabilities.filter(schedule => {
      // Nếu đang chỉnh sửa, bỏ qua ca hiện tại khi kiểm tra chồng chéo
      if (editingAvailabilityId && schedule.id === editingAvailabilityId) {
        return false;
      }

      // Chỉ kiểm tra các ca cùng ngày
      if (schedule.weekday !== weekday) return false;

      // Kiểm tra chồng chéo thời gian
      // Ca mới bắt đầu trong khoảng thời gian của ca hiện có
      const startsWithinExisting = startTime >= schedule.start_time && startTime < schedule.end_time;
      // Ca mới kết thúc trong khoảng thời gian của ca hiện có
      const endsWithinExisting = endTime > schedule.start_time && endTime <= schedule.end_time;
      // Ca mới bao trùm ca hiện có
      const containsExisting = startTime <= schedule.start_time && endTime >= schedule.end_time;

      return startsWithinExisting || endsWithinExisting || containsExisting;
    });

    if (overlappingSchedules.length > 0) {
      toast.error("Ca làm việc mới chồng chéo với ca làm việc đã tồn tại. Vui lòng chọn thời gian khác.")
      return
    }

    setIsLoading(true)
    try {
      const data = {
        doctor_id: userId,
        weekday: weekday,
        start_time: startTime,
        end_time: endTime,
        is_available: values.is_available,
      }

      if (editingAvailabilityId) {
        // Cập nhật ca làm việc hiện có
        await appointmentService.updateDoctorAvailability(editingAvailabilityId, data)
        toast.success("Cập nhật ca làm việc thành công!")
        setEditingAvailabilityId(null); // Reset ID đang chỉnh sửa
      } else {
        // Tạo ca làm việc mới
        await appointmentService.createDoctorAvailability(data)
        toast.success("Tạo lịch làm việc thành công!")
      }

      const dialog = document.getElementById("add-schedule-dialog");
      if (dialog) dialog.classList.add("hidden");
      availabilityForm.reset()
      fetchAvailabilities()
    } catch (error: any) {
      console.error("Error creating/updating availability:", error)
      const errorMessage = error.response?.data?.detail || "Không thể tạo/cập nhật lịch làm việc. Vui lòng thử lại sau."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý chỉnh sửa ca làm việc
  const handleEditAvailability = (schedule: DoctorAvailability) => {
    // Cập nhật form với dữ liệu của ca làm việc cần chỉnh sửa
    availabilityForm.reset({
      weekday: schedule.weekday.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      is_available: schedule.is_available,
    });

    // Lưu ID của ca làm việc đang chỉnh sửa
    setEditingAvailabilityId(schedule.id);

    // Cập nhật tiêu đề dialog
    const dialogTitle = document.querySelector("#add-schedule-dialog h3");
    if (dialogTitle) {
      dialogTitle.textContent = "Chỉnh sửa ca làm việc";
    }

    // Hiển thị dialog
    const dialog = document.getElementById("add-schedule-dialog");
    if (dialog) dialog.classList.remove("hidden");
  }

  // Xử lý xóa ca làm việc
  const handleDeleteAvailability = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ca làm việc này không?")) {
      return;
    }

    setIsLoading(true);
    try {
      await appointmentService.deleteDoctorAvailability(id);
      toast.success("Xóa ca làm việc thành công!");

      // Làm mới danh sách lịch làm việc
      fetchAvailabilities();
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Không thể xóa ca làm việc. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  // Xử lý tạo khung giờ từ lịch làm việc
  const handleGenerateTimeSlots = async (values: z.infer<typeof timeSlotFormSchema>) => {
    if (!userId) {
      toast.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.")
      return
    }

    if (availabilities.length === 0) {
      toast.error("Bạn cần tạo lịch làm việc trước khi tạo khung giờ.")
      return
    }

    setIsLoading(true)
    try {
      const data = {
        doctor_id: userId,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        slot_duration: parseInt(values.slot_duration),
      }

      console.log("Generating time slots with data:", data);

      // Gọi API để tạo khung giờ
      await appointmentService.generateTimeSlots(data)
      toast.success("Tạo khung giờ thành công!")

      // Làm mới danh sách khung giờ
      fetchTimeSlots()

      // Reset form
      timeSlotForm.reset({
        start_date: new Date(),
        end_date: addDays(new Date(), 7),
        slot_duration: "30",
      })
    } catch (error) {
      console.error("Error generating time slots:", error)
      toast.error("Không thể tạo khung giờ. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }





  // Lọc khung giờ theo ngày đã chọn
  const filteredTimeSlots = selectedDate
    ? timeSlots.filter(slot => {
        const slotDate = new Date(slot.date)
        return (
          slotDate.getDate() === selectedDate.getDate() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getFullYear() === selectedDate.getFullYear()
        )
      })
    : timeSlots

  // Tạo dữ liệu sự kiện cho lịch
  const calendarEvents = timeSlots.map(slot => ({
    id: slot.id,
    title: `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`,
    date: new Date(slot.date),
    status: slot.is_available ? "scheduled" : "confirmed" as "scheduled" | "confirmed" | "completed" | "cancelled" | undefined,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý lịch hẹn"
        description="Quản lý lịch làm việc và lịch hẹn với bệnh nhân"
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab(activeTab === "schedule" ? "appointments" : "schedule")}
          >
            {activeTab === "schedule" ? (
              <>
                <CalendarDays className="mr-2 h-4 w-4" />
                Xem lịch hẹn
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Quản lý lịch làm việc
              </>
            )}
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Lịch làm việc</TabsTrigger>
          <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <DoctorSchedule />
        </TabsContent>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lịch hẹn của bạn</CardTitle>
                <CardDescription>Danh sách các cuộc hẹn với bệnh nhân</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchAppointments}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <Alert>
                  <AlertTitle>Chưa có lịch hẹn</AlertTitle>
                  <AlertDescription>
                    Bạn chưa có lịch hẹn nào. Lịch hẹn sẽ được tạo khi bệnh nhân đặt lịch khám với bạn.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {/* Bộ lọc và tìm kiếm */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Tìm kiếm theo tên bệnh nhân..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select
                      defaultValue="all"
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                        <SelectItem value="CONFIRMED">Xác nhận</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                        <SelectItem value="CANCELLED">Hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Danh sách lịch hẹn */}
                  <div className="space-y-4">
                    {appointments
                      .filter(appointment => {
                        // Lọc theo trạng thái
                        if (statusFilter !== "all" && appointment.status !== statusFilter) {
                          return false;
                        }

                        // Lọc theo tìm kiếm
                        if (searchQuery && !`${appointment.patient.first_name} ${appointment.patient.last_name}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                        ) {
                          return false;
                        }

                        return true;
                      })
                      .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <CalendarDays className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{appointment.patient.first_name} {appointment.patient.last_name}</h4>
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                {appointment.status === 'PENDING' && 'Chờ xác nhận'}
                                {appointment.status === 'CONFIRMED' && 'Xác nhận'}
                                {appointment.status === 'COMPLETED' && 'Hoàn thành'}
                                {appointment.status === 'CANCELLED' && 'Hủy'}
                              </span>
                            </div>
                            <p className="text-sm">{appointment.reason}</p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(appointment.appointment_date), "dd/MM/yyyy")} ({appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 md:mt-0">
                          {appointment.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CONFIRMED')}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CANCELLED')}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}
                          {appointment.status === 'CONFIRMED' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateAppointmentStatus(appointment.id, 'COMPLETED')}
                            >
                              Hoàn thành
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => router.push(`/dashboard/doctor/examination?appointment=${appointment.id}`)}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Khám bệnh
                          </Button>
                        </div>
                      </div>
                    ))}
                    {appointments.length > 0 &&
                      appointments.filter(appointment => {
                        if (statusFilter !== "all" && appointment.status !== statusFilter) {
                          return false;
                        }
                        if (searchQuery && !`${appointment.patient.first_name} ${appointment.patient.last_name}`
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                        ) {
                          return false;
                        }
                        return true;
                      }).length === 0 && (
                        <Alert>
                          <AlertTitle>Không tìm thấy lịch hẹn</AlertTitle>
                          <AlertDescription>
                            Không có lịch hẹn nào phù hợp với bộ lọc hiện tại.
                          </AlertDescription>
                        </Alert>
                      )
                    }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}