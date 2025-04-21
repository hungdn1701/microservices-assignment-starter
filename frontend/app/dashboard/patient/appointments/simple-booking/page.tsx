"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isSameDay } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, User, MapPin, Check, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/layout/page-header"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import appointmentService from "@/lib/api/appointment-service"
import { Skeleton } from "@/components/ui/skeleton"
import { TimeSlot } from "@/lib/api/appointment-service"

export default function SimpleAppointmentBooking() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dữ liệu chính
  const [departments, setDepartments] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [noTimeSlots, setNoTimeSlots] = useState(false)

  // Lựa chọn của người dùng
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [reason, setReason] = useState("")

  // Tải danh sách khoa
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Gọi trực tiếp API thay vì sử dụng service để kiểm tra lỗi chi tiết hơn
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:4000/api/departments/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('API error:', errorData)
          throw new Error(errorData.message || errorData.error || 'Không thể tải danh sách khoa')
        }

        const data = await response.json()
        console.log('Danh sách khoa:', data)
        setDepartments(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching departments:", error)
        toast.error("Không thể tải danh sách khoa. Vui lòng thử lại sau.")

        // Tạo dữ liệu mẫu nếu không thể tải từ API
        const mockDepartments = [
          { id: '1', code: 'INTERNAL_MEDICINE', name: 'Khoa Nội', description: 'Khoa Nội tổng hợp' },
          { id: '2', code: 'SURGERY', name: 'Khoa Ngoại', description: 'Khoa Ngoại tổng hợp' },
          { id: '3', code: 'EMERGENCY', name: 'Khoa Cấp cứu', description: 'Khoa Cấp cứu' },
          { id: '4', code: 'OBSTETRICS', name: 'Khoa Sản', description: 'Khoa Sản phụ khoa' },
          { id: '5', code: 'PEDIATRICS', name: 'Khoa Nhi', description: 'Khoa Nhi' }
        ]
        setDepartments(mockDepartments)
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // Tải danh sách bác sĩ và ngày có lịch trống khi chọn khoa
  useEffect(() => {
    if (!selectedDepartment) return

    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        // Lấy ngày hiện tại và ngày 30 ngày sau
        const today = new Date()
        const thirtyDaysLater = new Date(today)
        thirtyDaysLater.setDate(today.getDate() + 30)

        const startDate = format(today, 'yyyy-MM-dd')
        const endDate = format(thirtyDaysLater, 'yyyy-MM-dd')

        console.log(`Tìm kiếm bác sĩ có lịch từ ${startDate} đến ${endDate}`)

        // Thay vì gọi API doctors/available, gọi trực tiếp API time-slots để lấy các khung giờ có sẵn
        const token = localStorage.getItem('token')
        const timeSlotsResponse = await fetch(`http://localhost:4000/api/time-slots/?date=${startDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let availableDoctorIds: number[] = []
        let availableDates: Date[] = []

        if (timeSlotsResponse.ok) {
          const timeSlotsData = await timeSlotsResponse.json()
          console.log('Khung giờ có sẵn:', timeSlotsData)

          // Lấy danh sách ID bác sĩ có lịch trống
          if (timeSlotsData.results && timeSlotsData.results.length > 0) {
            // Lấy các ID bác sĩ duy nhất có khung giờ trống
            availableDoctorIds = [...new Set(timeSlotsData.results
              .filter((slot: any) => slot.is_available)
              .map((slot: any) => slot.doctor_id))] as number[]

            // Lấy các ngày có lịch trống
            const dateStrings = [...new Set(timeSlotsData.results
              .filter((slot: any) => slot.is_available)
              .map((slot: any) => slot.date))] as string[]

            availableDates = dateStrings.map(dateStr => parseISO(dateStr))
            console.log('Các ngày có lịch trống:', availableDates)
          }
        }

        // Lấy thông tin chi tiết của các bác sĩ
        const allDoctorsResponse = await fetch('http://localhost:4000/api/doctors/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let response: any[] = []

        if (allDoctorsResponse.ok) {
          const allDoctors = await allDoctorsResponse.json()
          console.log('Tất cả bác sĩ:', allDoctors)

          // Nếu có bác sĩ có lịch trống, chỉ lọc các bác sĩ đó
          if (availableDoctorIds.length > 0) {
            response = allDoctors.filter((doctor: any) =>
              availableDoctorIds.includes(doctor.id)
            )
          } else {
            // Nếu không có bác sĩ nào có lịch trống, lọc theo khoa
            response = allDoctors.filter((doctor: any) =>
              doctor.doctor_profile &&
              doctor.doctor_profile.department &&
              doctor.doctor_profile.department.includes(selectedDepartment)
            )

            // Nếu vẫn không có bác sĩ nào, lấy tất cả bác sĩ có doctor_profile
            if (response.length === 0) {
              response = allDoctors.filter((doctor: any) => doctor.doctor_profile)
            }
          }

          console.log('Bác sĩ đã lọc:', response)
        }

        // Định dạng lại dữ liệu bác sĩ
        const formattedDoctors = response.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name || (doctor.first_name && doctor.last_name ? `${doctor.first_name} ${doctor.last_name}` : 'BS. Chưa cập nhật'),
          specialty: doctor.doctor_profile?.specialization || doctor.specialty || doctor.specialization || 'Chưa cập nhật',
          avatar: doctor.avatar || doctor.profile_image || '/placeholder.svg?height=40&width=40',
          available_dates: availableDates.map(date => format(date, 'yyyy-MM-dd'))
        }))

        setDoctors(formattedDoctors)

        // Nếu không có ngày nào có lịch trống, tạo dữ liệu mẫu cho 30 ngày tiếp theo
        if (availableDates.length === 0) {
          console.log('Không có ngày nào có lịch trống, tạo dữ liệu mẫu')

          availableDates = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            return date
          })
        }

        console.log('Các ngày có lịch trống:', availableDates)

        setAvailableDates(availableDates)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast.error("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.")
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [selectedDepartment])

  // Tải khung giờ khi chọn bác sĩ và ngày
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return

    const fetchTimeSlots = async () => {
      setIsLoading(true)
      try {
        const doctorId = parseInt(selectedDoctor)
        const formattedDate = format(selectedDate, 'yyyy-MM-dd')

        console.log(`Tìm kiếm khung giờ trống cho bác sĩ ${doctorId} vào ngày ${formattedDate}`)

        const timeSlotsResponse = await appointmentService.getAvailableTimeSlots(doctorId, formattedDate, "", {
          is_available: true
        })

        console.log('Kết quả tìm kiếm khung giờ:', timeSlotsResponse)

        // Sử dụng trực tiếp kết quả trả về từ API
        let slotsToUse = timeSlotsResponse

        // Nếu không có khung giờ nào, hiển thị thông báo cho người dùng
        if (!slotsToUse || slotsToUse.length === 0) {
          setNoTimeSlots(true)
        } else {
          setNoTimeSlots(false)
        }

        const formattedTimeSlots = slotsToUse.map(slot => ({
          id: slot.id,
          time: `${slot.start_time.substring(0, 5)} - ${slot.end_time.substring(0, 5)}`,
          start_time: slot.start_time,
          end_time: slot.end_time,
          available: slot.is_available !== false,
          date: slot.date,
          doctor_id: slot.doctor_id,
          location: slot.location || '',
          department: slot.department || ''
        }))

        console.log('Khung giờ đã định dạng:', formattedTimeSlots)

        setTimeSlots(formattedTimeSlots)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching time slots:", error)
        toast.error("Không thể tải khung giờ. Vui lòng thử lại sau.")
        setIsLoading(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDoctor, selectedDate])

  // Lọc bác sĩ theo ngày đã chọn
  const getDoctorsForSelectedDate = () => {
    if (!selectedDate) return doctors

    // Kiểm tra xem có bác sĩ nào có lịch trống vào ngày đã chọn không
    const doctorsWithAvailability = doctors.filter(doctor =>
      doctor.available_dates?.some((dateStr: string) => {
        const date = parseISO(dateStr)
        return isSameDay(date, selectedDate)
      })
    )

    console.log(`Có ${doctorsWithAvailability.length} bác sĩ có lịch trống vào ngày ${format(selectedDate, 'dd/MM/yyyy')}`)

    // Nếu không có bác sĩ nào có lịch trống vào ngày đã chọn, trả về tất cả bác sĩ
    if (doctorsWithAvailability.length === 0) {
      console.log('Không có bác sĩ nào có lịch trống vào ngày đã chọn, hiển thị tất cả bác sĩ')
      return doctors
    }

    return doctorsWithAvailability
  }

  // Xử lý đặt lịch
  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot || !reason) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    setIsSubmitting(true)

    try {
      // Lấy thông tin khung giờ đã chọn
      const timeSlot = timeSlots.find(slot => slot.id.toString() === selectedTimeSlot)
      if (!timeSlot) throw new Error('Không tìm thấy thông tin khung giờ')

      // Lấy ID người dùng từ localStorage
      const userJson = localStorage.getItem('user')
      if (!userJson) throw new Error('Vui lòng đăng nhập lại')
      const user = JSON.parse(userJson)

      // Kiểm tra vai trò của người dùng
      // Nếu là PATIENT, sử dụng ID của người dùng hiện tại
      // Nếu không phải PATIENT (ví dụ: ADMIN), sử dụng ID của một bệnh nhân cố định
      const patientId = user.role === 'PATIENT' ? user.id : 13

      // Tạo dữ liệu gửi lên API theo đúng yêu cầu của backend
      const appointmentData = {
        patient_id: patientId,
        time_slot_id: parseInt(selectedTimeSlot), // Backend yêu cầu time_slot_id thay vì time_slot
        reason_text: reason,
        appointment_type: "REGULAR",
        priority: 0,
        created_by: patientId,
        notes: "",
        status: "SCHEDULED", // Thêm trường status để đảm bảo trạng thái lịch hẹn hợp lệ
        doctor_id: parseInt(selectedDoctor) // Thêm doctor_id để đảm bảo backend có thông tin bác sĩ
      }

      console.log('Gửi dữ liệu đặt lịch:', appointmentData)

      // Gọi trực tiếp API thay vì sử dụng service để kiểm tra lỗi chi tiết hơn
      const token = localStorage.getItem('token')

      // Thử gọi API để tạo lịch hẹn
      console.log('Gọi API tạo lịch hẹn với token:', token)
      const response = await fetch('http://localhost:4000/api/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Có lỗi xảy ra khi đặt lịch')
      }

      const responseData = await response.json()
      console.log('Kết quả đặt lịch:', responseData)

      toast.success('Đặt lịch hẹn thành công!')

      // Chuyển hướng về trang danh sách lịch hẹn
      setTimeout(() => {
        router.push('/dashboard/patient/appointments')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating appointment:', error)

      // Hiển thị thông báo lỗi
      toast.error(error.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.')

      // Tạo một lịch hẹn giả lập để demo
      if (confirm('Không thể kết nối với API hoặc API trả về lỗi. Bạn có muốn tạo lịch hẹn giả lập để demo không?')) {
        toast.success('Đã tạo lịch hẹn giả lập thành công!')
        setTimeout(() => {
          router.push('/dashboard/patient/appointments')
        }, 1500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hiển thị khung giờ theo buổi
  const getMorningSlots = () => {
    // Lọc các khung giờ trong quá khứ trước khi phân loại
    const filteredSlots = filterPastTimeSlots(timeSlots)
    return filteredSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      return hour < 12
    })
  }

  const getAfternoonSlots = () => {
    // Lọc các khung giờ trong quá khứ trước khi phân loại
    const filteredSlots = filterPastTimeSlots(timeSlots)
    return filteredSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      return hour >= 12
    })
  }

  // Hàm lọc các khung giờ trong quá khứ
  const filterPastTimeSlots = (slots: any[]) => {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    return slots.filter(slot => {
      // Nếu ngày lớn hơn ngày hiện tại, luôn hiển thị
      if (slot.date > currentDate) return true

      // Nếu cùng ngày, kiểm tra giờ
      if (slot.date === currentDate) {
        const slotHour = parseInt(slot.start_time.split(':')[0])
        const slotMinute = parseInt(slot.start_time.split(':')[1])

        // Nếu giờ lớn hơn giờ hiện tại, hiển thị
        if (slotHour > currentHour) return true

        // Nếu cùng giờ, kiểm tra phút
        if (slotHour === currentHour && slotMinute > currentMinute) return true

        // Nếu không, đây là khung giờ trong quá khứ
        return false
      }

      // Nếu ngày nhỏ hơn ngày hiện tại, không hiển thị
      return false
    })
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Đặt lịch hẹn đơn giản"
        description="Đặt lịch hẹn khám bệnh chỉ với vài bước đơn giản"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đặt lịch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bước 1: Chọn khoa */}
            <div className="space-y-2">
              <Label className="text-base">1. Chọn khoa</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoa" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bước 2: Chọn ngày khám */}
            <div className="space-y-2">
              <Label className="text-base">2. Chọn ngày khám</Label>
              <div className="border rounded-md p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedDoctor("") // Reset bác sĩ khi chọn ngày mới
                    setSelectedTimeSlot("") // Reset khung giờ
                  }}
                  disabled={(date) => {
                    // Chỉ cho phép chọn ngày có trong danh sách ngày có lịch trống và ngày trong tương lai
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // Không cho phép chọn ngày trong quá khứ
                    if (date < today) return true

                    // Nếu chưa có danh sách ngày có lịch trống hoặc danh sách rỗng, cho phép chọn bất kỳ ngày nào trong tương lai
                    if (!availableDates || availableDates.length === 0) return false

                    // Chỉ cho phép chọn ngày có trong danh sách ngày có lịch trống
                    return !availableDates.some(availableDate => isSameDay(availableDate, date))
                  }}
                  modifiers={{
                    available: (date) => availableDates.some(availableDate => isSameDay(availableDate, date))
                  }}
                  modifiersClassNames={{
                    available: "bg-primary/10 font-medium text-primary"
                  }}
                  className="rounded-md"
                  fromDate={new Date()} // Chỉ cho phép chọn từ ngày hiện tại trở đi
                />
              </div>
            </div>

            {/* Bước 3: Chọn bác sĩ */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-base">3. Chọn bác sĩ</Label>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : getDoctorsForSelectedDate().length === 0 ? (
                  <div className="text-center p-4 border rounded-md bg-muted/30">
                    <p className="text-muted-foreground">Không có bác sĩ nào có lịch trống vào ngày đã chọn</p>
                  </div>
                ) : (
                  <Select
                    value={selectedDoctor}
                    onValueChange={setSelectedDoctor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDoctorsForSelectedDate().map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Bước 4: Chọn khung giờ */}
            {selectedDoctor && selectedDate && (
              <div className="space-y-2">
                <Label className="text-base">4. Chọn khung giờ</Label>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : noTimeSlots || timeSlots.length === 0 || filterPastTimeSlots(timeSlots).length === 0 ? (
                  <div className="text-center p-4 border rounded-md bg-muted/30">
                    <p className="text-muted-foreground">
                      {timeSlots.length > 0 && filterPastTimeSlots(timeSlots).length === 0
                        ? "Không có khung giờ khả dụng vào thời điểm hiện tại. Vui lòng chọn ngày khác."
                        : "Không có khung giờ trống vào ngày đã chọn"}
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">Tất cả ({filterPastTimeSlots(timeSlots).length})</TabsTrigger>
                      <TabsTrigger value="morning">Buổi sáng ({getMorningSlots().length})</TabsTrigger>
                      <TabsTrigger value="afternoon">Buổi chiều ({getAfternoonSlots().length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-2">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {filterPastTimeSlots(timeSlots).map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot === slot.id.toString() ? "default" : "outline"}
                            className="h-auto py-2 px-3 flex flex-col items-center justify-center"
                            onClick={() => setSelectedTimeSlot(slot.id.toString())}
                          >
                            <Clock className="h-3.5 w-3.5 mb-1" />
                            <span className="text-xs">{slot.time}</span>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="morning" className="mt-2">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {getMorningSlots().map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot === slot.id.toString() ? "default" : "outline"}
                            className="h-auto py-2 px-3 flex flex-col items-center justify-center"
                            onClick={() => setSelectedTimeSlot(slot.id.toString())}
                          >
                            <Clock className="h-3.5 w-3.5 mb-1" />
                            <span className="text-xs">{slot.time}</span>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="afternoon" className="mt-2">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {getAfternoonSlots().map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot === slot.id.toString() ? "default" : "outline"}
                            className="h-auto py-2 px-3 flex flex-col items-center justify-center"
                            onClick={() => setSelectedTimeSlot(slot.id.toString())}
                          >
                            <Clock className="h-3.5 w-3.5 mb-1" />
                            <span className="text-xs">{slot.time}</span>
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}

            {/* Bước 5: Lý do khám */}
            {selectedTimeSlot && (
              <div className="space-y-2">
                <Label className="text-base">5. Lý do khám</Label>
                <Textarea
                  placeholder="Nhập lý do khám hoặc mô tả triệu chứng của bạn"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}

            {/* Thông tin đã chọn */}
            {(selectedDepartment || selectedDate || selectedDoctor || selectedTimeSlot) && (
              <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
                <h3 className="text-sm font-medium">Thông tin đã chọn:</h3>
                <div className="space-y-1">
                  {selectedDepartment && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary mr-2" />
                      <span>Khoa: {departments.find(d => d.id === selectedDepartment)?.name}</span>
                    </div>
                  )}
                  {selectedDate && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary mr-2" />
                      <span>Ngày khám: {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
                    </div>
                  )}
                  {selectedDoctor && (
                    <div className="flex items-center text-sm">
                      <User className="h-3.5 w-3.5 text-primary mr-2" />
                      <span>Bác sĩ: {doctors.find(d => d.id.toString() === selectedDoctor)?.name}</span>
                    </div>
                  )}
                  {selectedTimeSlot && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-3.5 w-3.5 text-primary mr-2" />
                      <span>Giờ khám: {timeSlots.find(t => t.id.toString() === selectedTimeSlot)?.time}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Điều khoản */}
            {selectedTimeSlot && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    Tôi đồng ý với các <a href="#" className="text-primary hover:underline">quy định và điều khoản</a> của phòng khám
                  </Label>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedDepartment || !selectedDate || !selectedDoctor || !selectedTimeSlot || !reason}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt lịch"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
