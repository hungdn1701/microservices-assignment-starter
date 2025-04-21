"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format, addMonths, isSameDay, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon, User, FileText, ChevronLeft, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader } from "@/components/layout/page-header"
import appointmentService from "@/lib/api/appointment-service"
import { Badge } from "@/components/ui/badge"
import { AppointmentStepper } from "@/components/patient/appointment-stepper"
import { EnhancedServiceSelection } from "@/components/patient/enhanced-service-selection"
import { DoctorSearch } from "@/components/patient/doctor-search"
import { EnhancedTimeSlotSelector } from "@/components/patient/enhanced-time-slot-selector"

// Định nghĩa interface cho bác sĩ
interface Doctor {
  id: number
  name: string
  specialty: string
  avatar?: string
}

// Định nghĩa interface cho khung giờ hiển thị
interface DisplayTimeSlot {
  id: number
  time: string
  available: boolean
  date: string
  start_time: string
  end_time: string
  doctor_id: number
  location?: string
  department?: string
  room?: string
  duration?: number
  doctor_info?: {
    id: number
    first_name?: string
    last_name?: string
    specialty?: string
    profile_image?: string
    department?: string
    name?: string
  }
  // Thông tin bổ sung từ lịch làm việc của bác sĩ
  availability_id?: number
  weekday?: number
  weekday_name?: string
  schedule_type?: string
}



export default function NewAppointmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<Date>()
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [appointmentType, setAppointmentType] = useState<string>("REGULAR")
  const [priority, setPriority] = useState<string>("0")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useInsurance, setUseInsurance] = useState(false)
  const [insuranceVerified, setInsuranceVerified] = useState(false)

  // State cho dữ liệu từ API
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [timeSlots, setTimeSlots] = useState<DisplayTimeSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])

  // State cho danh sách chuyên khoa và khoa
  const [specialties, setSpecialties] = useState<any[]>([
    { id: 'all', name: 'Tất cả chuyên khoa' }
  ])
  const [departments, setDepartments] = useState<any[]>([
    { id: 'all', name: 'Tất cả khoa' }
  ])
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')

  // State mới cho quy trình cải tiến
  const [selectedService, setSelectedService] = useState<string>("") // Loại dịch vụ (khám mới, tái khám, tư vấn)
  const [symptomDescription, setSymptomDescription] = useState<string>("") // Mô tả triệu chứng
  const [selectedDepartment, setSelectedDepartment] = useState<string>("") // Khoa

  // Dữ liệu mặc định cho các API không tồn tại
  const services = [
    { id: "NEW_VISIT", name: "Khám mới", description: "Khám lần đầu hoặc với vấn đề mới", icon: "Stethoscope" },
    { id: "FOLLOW_UP", name: "Tái khám", description: "Tiếp tục điều trị với vấn đề đã khám trước đó", icon: "Repeat" },
    { id: "CONSULTATION", name: "Tư vấn", description: "Tư vấn về vấn đề sức khỏe không cần khám trực tiếp", icon: "MessageSquare" },
    { id: "PROCEDURE", name: "Thủ thuật", description: "Các thủ thuật y tế nhỏ", icon: "Scissors" },
    { id: "VACCINATION", name: "Tiêm chủng", description: "Tiêm vắc-xin phòng bệnh", icon: "Syringe" }
  ]

  // Dữ liệu mẫu cho các khoa và chuyên khoa (sẽ được thay thế bằng dữ liệu từ API)
  const departmentSamples = [
    { id: "CARDIOLOGY", name: "Tim mạch", description: "Chuyên khoa về tim và mạch máu" },
    { id: "NEUROLOGY", name: "Thần kinh", description: "Chuyên khoa về hệ thần kinh" },
    { id: "ORTHOPEDICS", name: "Chỉnh hình", description: "Chuyên khoa về xương khớp" },
    { id: "GASTROENTEROLOGY", name: "Tiêu hóa", description: "Chuyên khoa về hệ tiêu hóa" },
    { id: "DERMATOLOGY", name: "Da liễu", description: "Chuyên khoa về da" },
    { id: "OPHTHALMOLOGY", name: "Mắt", description: "Chuyên khoa về mắt" },
    { id: "PEDIATRICS", name: "Nhi", description: "Chuyên khoa dành cho trẻ em" },
    { id: "GYNECOLOGY", name: "Phụ khoa", description: "Chuyên khoa về sức khỏe phụ nữ" },
    { id: "UROLOGY", name: "Tiết niệu", description: "Chuyên khoa về hệ tiết niệu" },
    { id: "ENT", name: "Tai Mũi Họng", description: "Chuyên khoa về tai, mũi, họng" },
    { id: "PSYCHIATRY", name: "Tâm thần", description: "Chuyên khoa về sức khỏe tâm thần" },
    { id: "DENTISTRY", name: "Nha khoa", description: "Chuyên khoa về răng và miệng" }
  ]

  const specialtySamples = [
    { id: "CARDIOLOGY", name: "Tim mạch" },
    { id: "NEUROLOGY", name: "Thần kinh" },
    { id: "ORTHOPEDICS", name: "Chỉnh hình" },
    { id: "GASTROENTEROLOGY", name: "Tiêu hóa" },
    { id: "DERMATOLOGY", name: "Da liễu" },
    { id: "OPHTHALMOLOGY", name: "Mắt" },
    { id: "PEDIATRICS", name: "Nhi" },
    { id: "GYNECOLOGY", name: "Phụ khoa" },
    { id: "UROLOGY", name: "Tiết niệu" },
    { id: "ENT", name: "Tai Mũi Họng" },
    { id: "PSYCHIATRY", name: "Tâm thần" },
    { id: "DENTISTRY", name: "Nha khoa" }
  ]

  const locations = [
    { id: 1, name: "Phòng khám chính", address: "Tầng 1, Tòa nhà A, 123 Đường ABC, Quận 1" },
    { id: 2, name: "Phòng khám chi nhánh 1", address: "Tầng 2, Tòa nhà B, 456 Đường XYZ, Quận 2" },
    { id: 3, name: "Phòng khám chi nhánh 2", address: "Tầng 3, Tòa nhà C, 789 Đường DEF, Quận 3" }
  ]

  const appointmentTypes = [
    { id: "REGULAR", name: "Khám thông thường", code: "REGULAR", price: 350000 },
    { id: "FOLLOW_UP", name: "Tái khám", code: "FOLLOW_UP", price: 200000 },
    { id: "EMERGENCY", name: "Cấp cứu", code: "EMERGENCY", price: 450000 },
    { id: "CONSULTATION", name: "Tư vấn", code: "CONSULTATION", price: 150000 }
  ]

  const priorities = [
    { id: "0", name: "Thông thường", code: "0", description: "Khám thông thường, không cần ưu tiên đặc biệt" },
    { id: "1", name: "Ưu tiên", code: "1", description: "Ưu tiên khám trước cho các trường hợp đặc biệt" },
    { id: "2", name: "Khẩn cấp", code: "2", description: "Khẩn cấp, cần khám ngay lập tức" }
  ]
  const [isLoading, setIsLoading] = useState({
    doctors: false,
    timeSlots: false
  })

  // Lấy danh sách bác sĩ có lịch trống
  const fetchDoctors = async (filters?: { specialty?: string; name?: string; department?: string }) => {
    setIsLoading(prev => ({ ...prev, doctors: true }))
    try {
      // Tạo khoảng thời gian để lấy bác sĩ có lịch trống
      const today = new Date()
      const startDate = format(today, 'yyyy-MM-dd')
      const endDate = format(addMonths(today, 1), 'yyyy-MM-dd') // Lấy trong 1 tháng tới

      // Chuẩn bị các filter
      const apiFilters: any = {}
      if (filters?.specialty && filters.specialty !== 'all') {
        apiFilters.specialty = filters.specialty
      }
      if (filters?.department && filters.department !== 'all') {
        apiFilters.department = filters.department
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        apiFilters.department = selectedDepartment
      }
      if (selectedSpecialty && selectedSpecialty !== 'all') {
        apiFilters.specialty = selectedSpecialty
      }

      // Sử dụng API mới để lấy danh sách bác sĩ có lịch trống
      console.log(`Fetching available doctors from ${startDate} to ${endDate} with filters:`, apiFilters)
      const response = await appointmentService.getAvailableDoctors(startDate, endDate, apiFilters)
      console.log('Available doctors response:', response)

      // Lấy danh sách chuyên khoa để hiển thị thông tin chi tiết hơn
      const specialtiesData = await appointmentService.getSpecialties()
      console.log('Specialties response:', specialtiesData)

      // Tạo map các chuyên khoa để dễ tham chiếu
      const specialtyMap: Record<string, string> = {}
      specialtiesData.forEach((specialty: any) => {
        if (specialty && specialty.id) {
          specialtyMap[specialty.id] = specialty.name
        }
      })

      // Kiểm tra xem có dữ liệu trả về không
      if (!response || response.length === 0) {
        console.log('No doctors found with the current filters')
        setDoctors([])
        setAvailableDates([])
        return
      }

      // Chuyển đổi dữ liệu từ API mới sang định dạng hiển thị
      const formattedDoctors = response.map((doctor: any) => ({
        id: doctor.id,
        name: doctor.name || (doctor.first_name && doctor.last_name ? `${doctor.first_name} ${doctor.last_name}` : 'BS. Chưa cập nhật'),
        specialty: specialtyMap[doctor.specialty] || doctor.specialty || doctor.specialization || 'Chưa cập nhật',
        avatar: doctor.avatar || doctor.profile_image || '/placeholder.svg?height=40&width=40',
        experience: doctor.experience || doctor.years_of_experience || 'Chưa cập nhật',
        departments: doctor.departments || [],
        available_dates: doctor.available_dates || [],
        available_slots_count: doctor.available_slots_count || 0
      }))

      setDoctors(formattedDoctors)

      // Nếu có các ngày có lịch trống, cập nhật state
      const availableDatesFromDoctors = formattedDoctors
        .flatMap(doctor => doctor.available_dates || [])
        .filter((date, index, self) => self.indexOf(date) === index) // Lọc trùng lặp
        .map(dateStr => parseISO(dateStr))

      if (availableDatesFromDoctors.length > 0) {
        setAvailableDates(availableDatesFromDoctors)
      }
    } catch (error) {
      console.error('Error fetching available doctors:', error)
      toast.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.')
      setDoctors([])
    } finally {
      setIsLoading(prev => ({ ...prev, doctors: false }))
    }
  }

  // Lấy thông tin các khung giờ trống của bác sĩ
  const fetchTimeSlots = async () => {
    if (!selectedDoctor || !date) return

    setIsLoading(prev => ({ ...prev, timeSlots: true }))
    try {
      const doctorId = parseInt(selectedDoctor)
      const formattedDate = format(date, 'yyyy-MM-dd')

      // Gọi API lấy các khung giờ trống với các filter
      const filters = {
        is_available: true, // Chỉ lấy các khung giờ còn trống
        location: selectedLocation || undefined,
        department: selectedDepartment || undefined,
        specialty: selectedSpecialty || undefined
      }

      console.log(`Fetching available time slots for doctor ${doctorId} on ${formattedDate} with filters:`, filters)
      const timeSlotsResponse = await appointmentService.getAvailableTimeSlots(doctorId, formattedDate, "", filters)

      console.log('Time slots response:', timeSlotsResponse)

      // Chuyển đổi dữ liệu API thành dạng hiển thị
      const formattedTimeSlots: DisplayTimeSlot[] = timeSlotsResponse.map(slot => {
        // Tính toán ngày trong tuần
        const slotDate = parseISO(slot.date)
        const weekday = slotDate.getDay() === 0 ? 6 : slotDate.getDay() - 1 // Chuyển từ 0-6 (CN-T7) sang 0-6 (T2-CN)

        // Đảm bảo các trường cần thiết có giá trị
        const startTime = typeof slot.start_time === 'string' ? slot.start_time : '00:00:00'
        const endTime = typeof slot.end_time === 'string' ? slot.end_time : '00:30:00'

        return {
          id: slot.id,
          time: `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`,
          available: slot.is_available !== false, // Mặc định là true nếu không có trường is_available
          date: slot.date,
          start_time: startTime,
          end_time: endTime,
          doctor_id: slot.doctor_id,
          location: slot.location || '',
          department: slot.department || '',
          room: slot.room || '',
          duration: slot.duration || calculateDuration(startTime, endTime),
          doctor_info: slot.doctor_info,
          // Thông tin bổ sung
          availability_id: slot.availability_id,
          weekday: weekday,
          weekday_name: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][weekday],
          status: slot.status || 'AVAILABLE'
        }
      })

      setTimeSlots(formattedTimeSlots)

      // Lấy danh sách các ngày có khung giờ
      if (formattedTimeSlots.length > 0) {
        const datesFromTimeSlots = [...new Set(formattedTimeSlots.map(slot => slot.date))]
          .map(dateStr => parseISO(dateStr))
        setAvailableDates(datesFromTimeSlots)
      }

    } catch (error) {
      console.error('Error fetching time slots:', error)
      toast.error('Không thể tải khung giờ. Vui lòng thử lại sau.')
      setTimeSlots([])
    } finally {
      setIsLoading(prev => ({ ...prev, timeSlots: false }))
    }
  }

  // Hàm tính thời lượng giữa hai thời điểm
  const calculateDuration = (startTime: string, endTime: string): number => {
    try {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)

      const startMinutesTotal = startHours * 60 + startMinutes
      const endMinutesTotal = endHours * 60 + endMinutes

      // Xử lý trường hợp end time là ngày hôm sau
      let duration = endMinutesTotal - startMinutesTotal
      if (duration < 0) {
        duration += 24 * 60 // Thêm 24 giờ nếu end time là ngày hôm sau
      }

      return duration
    } catch (error) {
      console.error('Error calculating duration:', error)
      return 30 // Giá trị mặc định
    }
  }





  // Cập nhật giá ước tính dựa trên loại khám và bảo hiểm
  const updateEstimatedPrice = (type: string, coveragePercent = 0) => {
    // Tìm loại khám trong danh sách mặc định
    const selectedType = appointmentTypes.find(t => t.id === type)
    const price = selectedType?.price || 0

    if (useInsurance && insuranceVerified && coveragePercent > 0) {
      const discount = (price * coveragePercent) / 100
      setEstimatedPrice(price - discount)
    } else {
      setEstimatedPrice(price)
    }
  }











  // Gọi API khi component mount để lấy dữ liệu ban đầu
  useEffect(() => {
    // Lấy danh sách chuyên khoa và khoa
    const fetchInitialData = async () => {
      try {
        // Lấy danh sách chuyên khoa
        const specialtiesData = await appointmentService.getSpecialties()
        console.log('Specialties data:', specialtiesData)
        // Cập nhật state specialties
        if (specialtiesData && specialtiesData.length > 0) {
          setSpecialties([
            { id: 'all', name: 'Tất cả chuyên khoa' },
            ...specialtiesData
          ])
        }

        // Lấy danh sách khoa
        try {
          const departmentsData = await appointmentService.getDepartments()
          console.log('Departments data:', departmentsData)
          // Cập nhật state departments
          if (departmentsData && departmentsData.length > 0) {
            setDepartments([
              { id: 'all', name: 'Tất cả khoa' },
              ...departmentsData
            ])
          }
        } catch (deptError) {
          console.error('Error fetching departments:', deptError)
          // Sử dụng dữ liệu mặc định nếu API không hoạt động
          setDepartments([
            { id: 'all', name: 'Tất cả khoa' },
            { id: 'GENERAL', name: 'Khoa đa khoa' },
            { id: 'CARDIOLOGY', name: 'Khoa tim mạch' },
            { id: 'NEUROLOGY', name: 'Khoa thần kinh' },
            { id: 'PEDIATRICS', name: 'Khoa nhi' },
            { id: 'OBSTETRICS', name: 'Khoa sản' },
            { id: 'ORTHOPEDICS', name: 'Khoa chỉnh hình' },
            { id: 'ONCOLOGY', name: 'Khoa ung thư' },
          ])
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        // Sử dụng dữ liệu mặc định nếu API không hoạt động
        setSpecialties([
          { id: 'all', name: 'Tất cả chuyên khoa' },
          { id: 'CARDIOLOGY', name: 'Chuyên khoa tim mạch' },
          { id: 'DERMATOLOGY', name: 'Chuyên khoa da liễu' },
          { id: 'NEUROLOGY', name: 'Chuyên khoa thần kinh' },
          { id: 'OBSTETRICS', name: 'Chuyên khoa sản' },
          { id: 'PEDIATRICS', name: 'Chuyên khoa nhi' },
          { id: 'GENERAL_PRACTICE', name: 'Đa khoa' },
        ])
      }
    }

    fetchInitialData()
    fetchDoctors()
  }, [])

  // Gọi API khi người dùng chọn bác sĩ và ngày
  useEffect(() => {
    if (selectedDoctor && date) {
      fetchTimeSlots()
    }
  }, [selectedDoctor, date])

  // Cập nhật giá ước tính khi thay đổi loại khám hoặc trạng thái bảo hiểm
  useEffect(() => {
    updateEstimatedPrice(appointmentType, insuranceVerified ? 80 : 0)
  }, [appointmentType, useInsurance, insuranceVerified])

  // Cập nhật các state khi người dùng chọn dịch vụ hoặc chuyên khoa
  useEffect(() => {
    // Nếu người dùng đã chọn dịch vụ và chuyên khoa/khoa, cập nhật loại khám
    if (selectedService) {
      // Cập nhật loại khám dựa trên dịch vụ đã chọn
      switch (selectedService) {
        case 'NEW_VISIT':
          setAppointmentType('REGULAR')
          break
        case 'FOLLOW_UP':
          setAppointmentType('FOLLOW_UP')
          break
        case 'CONSULTATION':
          setAppointmentType('CONSULTATION')
          break
        case 'PROCEDURE':
          setAppointmentType('PROCEDURE')
          break
        case 'VACCINATION':
          setAppointmentType('VACCINATION')
          break
        default:
          setAppointmentType('REGULAR')
      }

      // Cập nhật lý do khám nếu có mô tả triệu chứng
      if (symptomDescription && !reason) {
        setReason(symptomDescription)
      }
    }
  }, [selectedService, selectedDepartment, selectedSpecialty, symptomDescription])

  // Cập nhật danh sách chuyên khoa khi người dùng chọn khoa
  useEffect(() => {
    if (selectedDepartment && selectedDepartment !== 'all') {
      // Lấy danh sách chuyên khoa thuộc khoa đã chọn
      const fetchSpecialtiesByDepartment = async () => {
        try {
          const specialtiesData = await appointmentService.getSpecialties(selectedDepartment)
          console.log(`Specialties for department ${selectedDepartment}:`, specialtiesData)

          if (specialtiesData && specialtiesData.length > 0) {
            setSpecialties([
              { id: 'all', name: 'Tất cả chuyên khoa' },
              ...specialtiesData
            ])
          } else {
            // Nếu không có chuyên khoa nào thuộc khoa này
            setSpecialties([{ id: 'all', name: 'Tất cả chuyên khoa' }])
          }
        } catch (error) {
          console.error(`Error fetching specialties for department ${selectedDepartment}:`, error)
        }
      }

      fetchSpecialtiesByDepartment()
    } else if (selectedDepartment === 'all') {
      // Nếu chọn "Tất cả khoa", lấy lại toàn bộ danh sách chuyên khoa
      const fetchAllSpecialties = async () => {
        try {
          const specialtiesData = await appointmentService.getSpecialties()
          if (specialtiesData && specialtiesData.length > 0) {
            setSpecialties([
              { id: 'all', name: 'Tất cả chuyên khoa' },
              ...specialtiesData
            ])
          }
        } catch (error) {
          console.error('Error fetching all specialties:', error)
        }
      }

      fetchAllSpecialties()
    }
  }, [selectedDepartment])

  // Lọc các khung giờ theo ngày được chọn
  const getTimeSlotsForSelectedDate = () => {
    if (!date) return []
    return timeSlots.filter(slot => {
      const slotDate = parseISO(slot.date)
      return isSameDay(slotDate, date)
    })
  }

  const handleSubmit = async () => {
    if (!isStepComplete()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)

    try {
      // Lấy thông tin khung giờ đã chọn
      const timeSlot = timeSlots.find(slot => slot.id.toString() === selectedTimeSlot)
      if (!timeSlot) throw new Error('Không tìm thấy thông tin khung giờ')

      // Kiểm tra xem khung giờ có còn khả dụng không
      if (!timeSlot.available) {
        throw new Error('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.')
      }

      // Lấy ID người dùng từ localStorage
      const userJson = localStorage.getItem('user')
      if (!userJson) throw new Error('Vui lòng đăng nhập lại')
      const user = JSON.parse(userJson)
      const patientId = user.id

      // Tạo dữ liệu gửi lên API theo cấu trúc mới
      const appointmentData: any = {
        patient_id: patientId,
        time_slot: parseInt(selectedTimeSlot), // Sử dụng time_slot thay vì time_slot_id theo API
        reason_text: reason,
        appointment_type: appointmentType,
        priority: parseInt(priority),
        created_by: patientId
      }

      // Nếu có thông tin bảo hiểm, thêm vào
      if (useInsurance && insuranceVerified) {
        appointmentData.insurance_id = 1 // Giả sử ID bảo hiểm là 1, trong thực tế cần lấy ID thật
      }

      console.log('Appointment data:', appointmentData)

      // Gọi API để tạo lịch hẹn mới
      const response = await appointmentService.createAppointment(appointmentData)
      console.log('Create appointment response:', response)

      toast.success('Đặt lịch hẹn thành công!')

      // Chuyển hướng về trang danh sách lịch hẹn
      setTimeout(() => {
        router.push('/dashboard/patient/appointments')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating appointment:', error)

      // Hiển thị thông báo lỗi từ API nếu có
      if (error.response && error.response.data) {
        // Kiểm tra các trường hợp lỗi khác nhau
        if (error.response.data.detail) {
          toast.error(error.response.data.detail)
        } else if (error.response.data.error) {
          toast.error(error.response.data.error)
        } else if (error.response.data.alternatives) {
          // Nếu có các khung giờ thay thế, hiển thị thông báo và gợi ý
          toast.error('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.')
          // Có thể hiển thị các khung giờ thay thế ở đây
        } else {
          toast.error('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.')
        }
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Xử lý khi chuyển bước với kiểm tra hợp lệ và tự động tải dữ liệu
  const handleNext = () => {
    // Kiểm tra tính hợp lệ của dữ liệu trước khi chuyển bước
    if (step === 1) {
      // Kiểm tra đã chọn dịch vụ và chuyên khoa/khoa
      if (!selectedService) {
        toast.error("Vui lòng chọn loại dịch vụ khám")
        return
      }
      if (!selectedDepartment && !selectedSpecialty) {
        toast.error("Vui lòng chọn ít nhất một khoa hoặc chuyên khoa")
        return
      }

      // Tự động tìm kiếm bác sĩ dựa trên lựa chọn ở bước 1
      fetchDoctors({
        specialty: selectedSpecialty,
        department: selectedDepartment
      })
    } else if (step === 2) {
      // Kiểm tra đã chọn bác sĩ và ngày khám
      if (!selectedDoctor) {
        toast.error("Vui lòng chọn bác sĩ")
        return
      }
      if (!date) {
        toast.error("Vui lòng chọn ngày khám")
        return
      }

      // Tự động tải khung giờ cho ngày đã chọn
      fetchTimeSlots()
    }

    // Chuyển sang bước tiếp theo
    setStep(step + 1)

    // Cuộn lên đầu trang khi chuyển bước
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setStep(step - 1)
    // Cuộn lên đầu trang khi quay lại
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isStepComplete = () => {
    switch (step) {
      case 1:
        // Bước 1: Chọn dịch vụ và chuyên khoa
        return !!selectedService && (!!selectedDepartment || !!selectedSpecialty)
      case 2:
        // Bước 2: Chọn bác sĩ và ngày khám
        return !!date && !!selectedDoctor
      case 3:
        // Bước 3: Chọn khung giờ và xác nhận
        return !!selectedTimeSlot && !!selectedLocation && !!reason && !!appointmentType && !(useInsurance && !insuranceVerified)
      default:
        return false
    }
  }

  const containerVariants = {
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

  // Các bước đặt lịch - quy trình mới với mô tả rõ ràng hơn
  const steps = [
    { title: "Chọn dịch vụ", description: "Chọn loại dịch vụ và chuyên khoa" },
    { title: "Chọn bác sĩ", description: "Tìm bác sĩ phù hợp và chọn ngày khám" },
    { title: "Hoàn tất đặt lịch", description: "Chọn giờ khám và xác nhận thông tin" }
  ]

  // Xử lý tìm kiếm và lọc bác sĩ
  const handleFilterDoctors = (filters: { specialty?: string; name?: string }) => {
    // Gọi API để lọc bác sĩ
    console.log('Filtering doctors with:', filters)
    fetchDoctors(filters)
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Đặt lịch hẹn mới"
        description="Đặt lịch hẹn khám bệnh với bác sĩ"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl">
        {/* Stepper */}
        <div className="mb-8">
          <AppointmentStepper currentStep={step - 1} steps={steps} />
        </div>

        {/* Bước 1: Chọn dịch vụ và chuyên khoa */}
        {step === 1 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle>Chọn dịch vụ và chuyên khoa</CardTitle>
                <CardDescription>Chọn loại dịch vụ và chuyên khoa phù hợp với nhu cầu của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedServiceSelection
                  services={services}
                  departments={departments}
                  specialties={specialties}
                  selectedService={selectedService}
                  selectedDepartment={selectedDepartment}
                  selectedSpecialty={selectedSpecialty}
                  symptomDescription={symptomDescription}
                  isLoading={{
                    services: false,
                    departments: false,
                    specialties: false
                  }}
                  onSelectService={setSelectedService}
                  onSelectDepartment={setSelectedDepartment}
                  onSelectSpecialty={setSelectedSpecialty}
                  onUpdateSymptomDescription={setSymptomDescription}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNext} disabled={!isStepComplete()}>
                  Tiếp theo
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Bước 2: Chọn bác sĩ và ngày khám */}
        {step === 2 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle>Chọn bác sĩ và ngày khám</CardTitle>
                <CardDescription>Chọn bác sĩ và ngày khám phù hợp với nhu cầu của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorSearch
                  doctors={doctors}
                  availableDates={availableDates}
                  selectedDoctor={selectedDoctor}
                  selectedDate={date}
                  selectedDepartment={selectedDepartment}
                  selectedSpecialty={selectedSpecialty}
                  isLoading={{
                    doctors: isLoading.doctors
                  }}
                  onSelectDoctor={setSelectedDoctor}
                  onSelectDate={setDate}
                  onFilter={handleFilterDoctors}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Quay lại
                </Button>
                <Button onClick={handleNext} disabled={!isStepComplete()}>
                  Tiếp theo
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Bước 3: Chọn khung giờ và xác nhận */}
        {step === 3 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle>Chọn khung giờ và xác nhận</CardTitle>
                <CardDescription>Chọn khung giờ và hoàn tất thông tin đặt lịch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thông tin bác sĩ đã chọn */}
                <motion.div variants={item} className="rounded-lg border p-4 mb-6">
                  <h3 className="text-base font-medium flex items-center mb-3">
                    <User className="h-4 w-4 text-primary mr-2" />
                    Bác sĩ đã chọn
                  </h3>
                  {(() => {
                    const doctor = doctors.find(d => d.id.toString() === selectedDoctor)
                    if (!doctor) return <div className="text-sm">Không tìm thấy thông tin bác sĩ</div>

                    return (
                      <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-md">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={doctor.avatar || "/placeholder.svg?height=64&width=64"}
                            alt={doctor.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg?height=64&width=64'
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-lg">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chưa chọn ngày"}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </motion.div>

                {/* Chọn khung giờ và địa điểm */}
                <motion.div variants={item}>
                  <EnhancedTimeSlotSelector
                    timeSlots={getTimeSlotsForSelectedDate()}
                    selectedTimeSlot={selectedTimeSlot}
                    selectedLocation={selectedLocation}
                    locations={locations}
                    estimatedPrice={estimatedPrice}
                    isLoading={isLoading.timeSlots}
                    onSelectTimeSlot={setSelectedTimeSlot}
                    onSelectLocation={setSelectedLocation}
                  />
                </motion.div>

                {/* Thông tin khám */}
                <motion.div variants={item} className="rounded-lg border overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="text-base font-medium flex items-center">
                      <FileText className="h-4 w-4 text-primary mr-2" />
                      Thông tin khám
                    </h3>

                    <div className="mt-3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Loại khám</div>
                          <Select value={appointmentType} onValueChange={setAppointmentType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại khám" />
                            </SelectTrigger>
                            <SelectContent>
                              {appointmentTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Mức độ ưu tiên</div>
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn mức độ ưu tiên" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-muted-foreground">Lý do khám</div>
                        <Textarea
                          placeholder="Nhập lý do khám hoặc triệu chứng của bạn"
                          className="mt-1"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>


                    </div>
                  </div>

                  {/* Chi phí */}
                  <div className="p-4 bg-primary/5">
                    <h3 className="text-base font-medium flex items-center">
                      <CreditCard className="h-4 w-4 text-primary mr-2" />
                      Thông tin thanh toán
                    </h3>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Phương thức:</span>
                        <span className="font-medium">Thanh toán tại quầy</span>
                      </div>

                      {useInsurance && insuranceVerified && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Bảo hiểm y tế:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Đã xác minh
                          </Badge>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 mt-2 border-t">
                        <span className="font-medium">Chi phí ước tính:</span>
                        <span className="text-lg font-semibold text-primary">
                          {estimatedPrice.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        Tôi đồng ý với các <a href="#" className="text-primary hover:underline">quy định và điều khoản</a> của phòng khám
                      </Label>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Quay lại
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
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
          </motion.div>
        )}
      </div>
    </div>
  )
}
