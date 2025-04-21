"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isSameDay, addDays, addWeeks } from "date-fns"
import { vi } from 'date-fns/locale'
import { CalendarDays, Clock, Plus, Edit, Trash2, Check, X, Loader2, Calendar as CalendarIcon, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { DoctorAvailability, TimeSlot } from "@/lib/api/appointment-service"
import appointmentService from "@/lib/api/appointment-service"

// Schema cho form tạo lịch làm việc đơn giản hóa
const scheduleFormSchema = z.object({
  weekdays: z.array(z.string()).min(1, { message: "Vui lòng chọn ít nhất một ngày trong tuần" }),
  start_time: z.string().min(1, { message: "Vui lòng nhập giờ bắt đầu" }),
  end_time: z.string().min(1, { message: "Vui lòng nhập giờ kết thúc" }),
  location: z.string().optional(),
  department: z.string().optional(),
  room: z.string().optional(),
  slot_duration: z.string().min(1, { message: "Vui lòng chọn thời lượng khung giờ" }),
  max_patients_per_slot: z.string().min(1, { message: "Vui lòng nhập số bệnh nhân tối đa" })
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

// Chuyển đổi weekday number sang string
const getWeekdayName = (weekday: number) => {
  const weekdays = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]
  return weekdays[weekday]
}

// Màu sắc cho các ngày trong tuần
const weekdayColors = [
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-green-50 border-green-200 text-green-800",
  "bg-amber-50 border-amber-200 text-amber-800",
  "bg-indigo-50 border-indigo-200 text-indigo-800",
  "bg-rose-50 border-rose-200 text-rose-800",
  "bg-gray-50 border-gray-200 text-gray-800"
]

export function DoctorSchedule() {
  const [userId, setUserId] = useState<number | null>(null)
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showGuide, setShowGuide] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loginStatus, setLoginStatus] = useState<'unauthenticated' | 'authenticating' | 'authenticated'>('unauthenticated');

  // Danh sách ngày trong tuần để checkbox
  const weekdayOptions = [
    { value: "0", label: "Thứ Hai" },
    { value: "1", label: "Thứ Ba" },
    { value: "2", label: "Thứ Tư" },
    { value: "3", label: "Thứ Năm" },
    { value: "4", label: "Thứ Sáu" },
    { value: "5", label: "Thứ Bảy" },
    { value: "6", label: "Chủ Nhật" },
  ]

  // Form cho lịch làm việc
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      weekdays: [],
      start_time: "",
      end_time: "",
      location: "",
      department: "",
      room: "",
      slot_duration: "30",
      max_patients_per_slot: "1",
    },
  })

  // Kiểm tra và đảm bảo đã đăng nhập
  const ensureAuthenticated = async () => {
    // Kiểm tra token hiện tại
    const token = localStorage.getItem('token');
    if (token) {
      setLoginStatus('authenticated');
      return true;
    }

    setLoginStatus('authenticating');
    // Đăng nhập với tài khoản bác sĩ
    try {
      const response = await fetch('http://localhost:4000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'doctor@gmail.com',
          password: '123456',
        }),
      });

      if (!response.ok) {
        throw new Error('Đăng nhập thất bại');
      }

      const data = await response.json();
      // Lưu token vào localStorage
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUserId(data.user.id);
      setLoginStatus('authenticated');

      console.log('Đăng nhập thành công:', data.user.first_name);
      toast.success(`Đã đăng nhập: ${data.user.first_name} ${data.user.last_name}`);

      return true;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast.error('Không thể đăng nhập tự động. Vui lòng đăng nhập thủ công.');
      setLoginStatus('unauthenticated');
      return false;
    }
  };

  // Kiểm tra xác thực khi component mount
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setUserId(user.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Nếu không lấy được thông tin từ localStorage, thử đăng nhập
        ensureAuthenticated();
      }
    } else {
      // Không có thông tin user, thử đăng nhập
      ensureAuthenticated();
    }
  }, []);

  // Lấy danh sách lịch làm việc của bác sĩ
  const fetchAvailabilities = async () => {
    if (!userId) return []

    setIsLoading(true)
    try {
      const data = await appointmentService.getDoctorAvailabilities(userId)
      setAvailabilities(data)
      return data
    } catch (error) {
      console.error("Error fetching availabilities:", error)
      toast.error("Không thể tải lịch làm việc. Vui lòng thử lại sau.")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy danh sách khung giờ cho tuần hiện tại
  const fetchTimeSlotsForWeek = async () => {
    if (!userId) return {}

    setIsLoading(true)
    try {
      // Tạo mảng các ngày trong tuần từ thứ Hai đến Chủ Nhật
      const current = new Date(viewDate);
      const currentDay = current.getDay(); // 0: CN, 1: T2, 2: T3, ..., 6: T7

      // Điều chỉnh về thứ Hai đầu tuần
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(current);
      monday.setDate(current.getDate() + mondayOffset);

      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return date;
      });

      console.log("Lấy dữ liệu cho các ngày:", weekDates.map(d => format(d, "yyyy-MM-dd")));

      // Lấy time slots cho tuần hiện tại
      const results = await Promise.all(
        weekDates.map(async (date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          try {
            const slots = await appointmentService.getTimeSlotsForDate(userId, dateStr);
            console.log(`Lấy được ${slots.length} khung giờ cho ngày ${dateStr}`);
            return slots;
          } catch (error) {
            console.error(`Error fetching time slots for ${dateStr}:`, error);
            return [];
          }
        })
      );

      // Gộp tất cả kết quả
      const allTimeSlots = results.flat();
      console.log(`Tổng số khung giờ lấy được: ${allTimeSlots.length}`);
      setTimeSlots(allTimeSlots);

      // Tạo đối tượng kết quả theo ngày
      const slotsByDate = {};
      weekDates.forEach((date, index) => {
        const dateStr = format(date, "yyyy-MM-dd");
        slotsByDate[dateStr] = results[index];
      });

      // Nếu không có khung giờ nào, thử tạo khung giờ tự động cho lịch làm việc hiện tại
      if (allTimeSlots.length === 0 && availabilities.length > 0) {
        toast.info("Phát hiện lịch làm việc chưa có khung giờ. Hệ thống sẽ tự động tạo khung giờ.");

        // Gọi hàm tạo khung giờ tự động (thực hiện sau 1 giây)
        setTimeout(() => {
          createTimeSlots(availabilities);
        }, 1000);
      }

      return slotsByDate;
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast.error("Không thể tải khung giờ. Vui lòng thử lại sau.");
      return {};
    } finally {
      setIsLoading(false);
    }
  }

  // Tạo khung giờ tự động cho lịch làm việc sử dụng API generate_time_slots
  const createTimeSlots = async (schedules: DoctorAvailability[]) => {
    if (!userId || schedules.length === 0) return;

    toast.info("Đang tạo khung giờ cho lịch làm việc...");
    setIsLoading(true);

    try {
      // Chuẩn bị dữ liệu cho API generate_time_slots
      const data = {
        doctor_id: userId,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(addWeeks(new Date(), 4), "yyyy-MM-dd"),
        slot_duration: schedules[0].slot_duration || 30,
        department: schedules[0].department || "",
        location: schedules[0].location || "",
        room: schedules[0].room || "",
        max_patients: schedules[0].max_patients_per_slot || 1
      };

      console.log("Sending data to generate_time_slots API:", JSON.stringify(data, null, 2));

      // Gọi API generate_time_slots
      const response = await appointmentService.generateTimeSlots(data);

      console.log("Generate time slots response:", response);

      // Thông báo thành công
      toast.success(`Đã tạo ${response.length} khung giờ khám bệnh thành công!`);

      // Tải lại dữ liệu
      fetchTimeSlotsForWeek();
    } catch (error: any) {
      console.error("Error generating time slots:", error);
      let errorMessage = "Không thể tạo khung giờ khám bệnh.";

      // Log chi tiết hơn để debug
      console.log("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      if (error.response?.status === 404) {
        errorMessage = "API tạo khung giờ không tồn tại. Vui lòng liên hệ quản trị viên.";
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Bạn cần đăng nhập lại để tạo khung giờ.";
        await ensureAuthenticated();
      } else if (error.response?.status === 400) {
        // Xử lý lỗi 400 chi tiết hơn
        if (error.response?.data?.error) {
          errorMessage = `Lỗi: ${error.response.data.error}`;
        } else if (error.response?.data?.detail) {
          errorMessage = `Lỗi: ${error.response.data.detail}`;
        } else {
          errorMessage = `Lỗi dữ liệu: ${JSON.stringify(error.response?.data)}`;
        }
      } else if (error.response?.status === 500) {
        // Xử lý lỗi 500 (Internal Server Error)
        if (error.response?.data?.error) {
          errorMessage = `Lỗi máy chủ: ${error.response.data.error}`;
        } else {
          errorMessage = "Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.";
        }
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Tải dữ liệu khi component được mount hoặc khi userId thay đổi
  useEffect(() => {
    if (userId) {
      fetchAvailabilities().then(availabilities => {
        if (availabilities.length > 0) {
          // Nếu đã có lịch làm việc, kiểm tra xem có khung giờ nào không
          fetchTimeSlotsForWeek().then(slots => {
            // Nếu không có khung giờ nào, tạo khung giờ tự động
            const hasSlots = Object.values(slots).some(daySlots => daySlots.length > 0);
            if (!hasSlots) {
              console.log("Không tìm thấy khung giờ nào, tạo khung giờ tự động...");
              toast.info("Tạo khung giờ tự động cho lịch làm việc...");
              createTimeSlots(availabilities);
            }
          });
        }
      });
    }
  }, [userId])

  // Tải lại time slots khi viewDate thay đổi
  useEffect(() => {
    if (userId) {
      fetchTimeSlotsForWeek()
    }
  }, [viewDate])

  // Xử lý tạo lịch làm việc
  const handleSubmit = async (values: ScheduleFormValues) => {
    if (!userId) {
      toast.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.")

      // Thử đăng nhập lại
      const authenticated = await ensureAuthenticated();
      if (!authenticated || !userId) {
        return;
      }
    }

    if (values.start_time >= values.end_time) {
      toast.error("Giờ kết thúc phải sau giờ bắt đầu.")
      return
    }

    setIsLoading(true)
    try {
      // Kiểm tra lịch trùng lặp trước khi tạo
      const overlappingSchedules = [];
      for (const dayValue of values.weekdays) {
        const day = parseInt(dayValue);
        const existingSchedules = availabilities.filter(schedule =>
          schedule.weekday === day &&
          ((values.start_time <= schedule.end_time && values.end_time >= schedule.start_time) ||
           (schedule.start_time <= values.end_time && schedule.end_time >= values.start_time))
        );

        if (existingSchedules.length > 0) {
          overlappingSchedules.push({
            day: getWeekdayName(day),
            schedules: existingSchedules
          });
        }
      }

      // Nếu có lịch trùng, hiển thị cảnh báo
      if (overlappingSchedules.length > 0) {
        const message = overlappingSchedules.map(item =>
          `${item.day}: ${item.schedules.map(s => `${s.start_time.substring(0, 5)}-${s.end_time.substring(0, 5)}`).join(', ')}`
        ).join('\n');

        if (!confirm(`Đã phát hiện lịch làm việc trùng lặp:\n${message}\n\nBạn vẫn muốn tiếp tục tạo lịch làm việc mới?`)) {
          setIsLoading(false);
          return;
        }
      }

      // Chuẩn bị dữ liệu cho API create_schedule
      const data = {
        doctor_id: userId,
        schedule_type: "REGULAR" as "REGULAR" | "TEMPORARY" | "DAY_OFF",
        weekdays: values.weekdays.map(day => parseInt(day)),
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location || "",
        department: values.department || "",
        room: values.room || "",
        slot_duration: parseInt(values.slot_duration),
        max_patients_per_slot: parseInt(values.max_patients_per_slot),
        auto_generate_slots: true, // Tự động tạo khung giờ
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(addWeeks(new Date(), 4), "yyyy-MM-dd"), // Tạo khung giờ cho 4 tuần tới
        notes: ""
      }

      // Log dữ liệu trước khi gửi để debug
      console.log("Sending data to create_schedule API:", JSON.stringify(data, null, 2));

      // Sử dụng API create_schedule để tạo cả lịch làm việc và khung giờ
      const result = await appointmentService.createSchedule(data);

      // Thông báo thành công
      toast.success(`Đã tạo ${result.length} lịch làm việc và khung giờ thành công!`);

      // Reset form và tải lại dữ liệu
      form.reset();
      setShowDialog(false);
      fetchAvailabilities();
      fetchTimeSlotsForWeek();
    } catch (error: any) {
      console.error("Error creating schedule and time slots:", error);
      let errorMessage = "Không thể tạo lịch làm việc và khung giờ.";

      if (error.response?.status === 404) {
        errorMessage = "API tạo lịch làm việc không tồn tại. Vui lòng liên hệ quản trị viên.";
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Bạn cần đăng nhập lại để tạo lịch làm việc.";
        await ensureAuthenticated();
      } else if (error.response?.status === 400) {
        // Xử lý lỗi 400 chi tiết hơn
        if (error.response?.data?.error) {
          errorMessage = `Lỗi: ${error.response.data.error}`;
        } else if (error.response?.data?.detail) {
          errorMessage = `Lỗi: ${error.response.data.detail}`;
        } else {
          errorMessage = `Lỗi dữ liệu: ${JSON.stringify(error.response?.data)}`;
        }
      } else if (error.response?.status === 500) {
        // Xử lý lỗi 500 (Internal Server Error)
        if (error.response?.data?.error) {
          errorMessage = `Lỗi máy chủ: ${error.response.data.error}`;
        } else {
          errorMessage = "Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.";
        }
        console.error("Server error details:", error.response?.data);
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // Hiển thị thông tin lỗi chi tiết trong console để debug
      console.log("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Xử lý xóa lịch làm việc
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch làm việc này không?")) {
      return
    }

    setIsLoading(true)
    try {
      await appointmentService.deleteDoctorAvailability(id)
      toast.success("Xóa lịch làm việc thành công!")
      fetchAvailabilities()
      fetchTimeSlotsForWeek()
    } catch (error) {
      console.error("Error deleting availability:", error)
      toast.error("Không thể xóa lịch làm việc. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý chỉnh sửa lịch làm việc
  const handleEdit = (schedule: DoctorAvailability) => {
    setEditingId(schedule.id)
    form.reset({
      weekdays: [String(schedule.weekday)],
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      location: schedule.location || "",
      department: schedule.department || "",
      room: schedule.room || "",
      slot_duration: String(schedule.slot_duration || 30),
      max_patients_per_slot: String(schedule.max_patients_per_slot || 1),
    })
    setShowDialog(true)
  }

  // Tuần trước/sau
  const goToPreviousWeek = () => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }

  const goToNextWeek = () => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }

  const goToToday = () => {
    setViewDate(new Date())
  }

  // Tạo mảng ngày trong tuần
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const current = new Date(viewDate);
    const currentDay = current.getDay(); // 0: CN, 1: T2, 2: T3, ..., 6: T7

    // Điều chỉnh về thứ Hai đầu tuần
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    // Thêm số ngày tương ứng vào thứ Hai
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  })

  // Lấy time slots cho một ngày cụ thể
  const getTimeSlotsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return timeSlots.filter(slot => slot.date === dateStr)
  }

  // Dựng danh sách lịch làm việc
  const buildScheduleList = () => {
    const schedulesByDay: { [key: string]: DoctorAvailability[] } = {}

    // Nhóm theo ngày trong tuần
    availabilities.forEach(schedule => {
      const day = String(schedule.weekday)
      if (!schedulesByDay[day]) {
        schedulesByDay[day] = []
      }
      schedulesByDay[day].push(schedule)
    })

    return weekdayOptions.map(day => {
      const daySchedules = schedulesByDay[day.value] || []
      return (
        <div key={day.value} className={`rounded-lg border p-4 ${weekdayColors[parseInt(day.value)]}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-lg">{day.label}</div>
            <Badge variant={daySchedules.length > 0 ? "outline" : "secondary"}>
              {daySchedules.length > 0 ? "Có lịch làm việc" : "Chưa có lịch"}
            </Badge>
          </div>

          <div className="space-y-2">
            {daySchedules.length > 0 ? (
              daySchedules
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map(schedule => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-2 bg-white rounded-md border shadow-sm"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(schedule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(schedule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-3 text-sm text-gray-500">
                Chưa có ca làm việc
              </div>
            )}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Hướng dẫn cho người dùng mới */}
      {showGuide && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Hướng dẫn quản lý lịch làm việc</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">Bạn chỉ cần tạo lịch làm việc 1 lần. Hệ thống sẽ tự động tạo các khung giờ khám bệnh.</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Nhấn nút <strong>Tạo lịch mới</strong> để bắt đầu</li>
              <li>Chọn các ngày trong tuần bạn muốn làm việc</li>
              <li>Nhập giờ bắt đầu và kết thúc ca làm việc</li>
              <li>Hệ thống sẽ tự động tạo khung giờ khám bệnh trong 4 tuần tới</li>
            </ol>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 bg-white"
              onClick={() => setShowGuide(false)}
            >
              Đã hiểu
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Lịch làm việc</h2>
          <p className="text-sm text-muted-foreground">Quản lý lịch làm việc và khung giờ khám bệnh</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center rounded-md border bg-muted p-1 text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 shadow-none"
              onClick={() => {
                setEditingId(null)
                form.reset({
                  weekdays: [],
                  start_time: "",
                  end_time: "",
                  location: "",
                  department: "",
                  room: "",
                  slot_duration: "30",
                  max_patients_per_slot: "1",
                })
                setShowDialog(true)
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Lịch làm việc
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="px-3 shadow-none"
              onClick={() => {
                if (!userId) {
                  toast.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.");
                  return;
                }

                // Tạo khung giờ thủ công cho lịch làm việc hiện tại
                if (availabilities.length === 0) {
                  toast.error("Bạn chưa có lịch làm việc nào. Vui lòng tạo lịch làm việc trước.");
                  return;
                }

                toast.info("Đang tạo khung giờ cho lịch làm việc...");
                createTimeSlots(availabilities);
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Khung giờ
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="px-3"
            onClick={() => {
              window.location.href = '/dashboard/doctor/appointments';
            }}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Xem lịch hẹn
          </Button>
        </div>
      </div>

      <Tabs defaultValue="week" className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">Lịch tuần</TabsTrigger>
          <TabsTrigger value="schedule">Mẫu lịch</TabsTrigger>
        </TabsList>

        {/* Tab Lịch tuần */}
        <TabsContent value="week" className="space-y-4">
          {/* Điều hướng tuần */}
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="h-8">
                Hôm nay
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="font-medium bg-muted px-3 py-1 rounded-md text-sm">
              Tuần {format(weekDays[0], "dd/MM")} - {format(weekDays[6], "dd/MM/yyyy")}
            </div>
          </div>

          {/* Hiển thị calendar view */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isWeekend = i === 5 || i === 6; // Thứ 7 hoặc Chủ nhật

              return (
                <div key={i} className={`border rounded-lg overflow-hidden ${isToday ? 'border-primary shadow-sm' : ''}`}>
                  <div className={`p-2 text-center ${
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : isWeekend
                        ? 'bg-orange-50 text-orange-800'
                        : 'bg-muted'
                  }`}>
                    <div className="text-xs">{format(day, 'EEEE', { locale: vi })}</div>
                    <div className="font-bold">{format(day, 'dd')}</div>
                  </div>

                  <div className="p-2 h-[400px] overflow-y-auto">
                    {getTimeSlotsForDay(day).length > 0 ? (
                      <div className="space-y-1">
                        {getTimeSlotsForDay(day)
                          .sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map(slot => (
                            <div
                              key={slot.id}
                              className={`p-2 rounded text-xs flex justify-between items-center ${
                                slot.is_available
                                  ? 'bg-green-50 border-l-4 border-green-500 border-t border-r border-b border-green-200'
                                  : 'bg-blue-50 border-l-4 border-blue-500 border-t border-r border-b border-blue-200'
                              }`}
                            >
                              <div>
                                <div className="font-medium">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</div>
                                {slot.location && <div className="text-xs opacity-70">{slot.location}</div>}
                              </div>
                              <div className="flex flex-col items-end">
                                {slot.is_available ? (
                                  <div className="text-[10px] text-green-600 font-medium">{slot.current_patients}/{slot.max_patients}</div>
                                ) : (
                                  <div className="text-[10px] text-blue-600 font-medium">Đã đặt</div>
                                )}
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Không có khung giờ nào
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab Mẫu lịch */}
        <TabsContent value="schedule">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildScheduleList()}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog tạo/sửa lịch làm việc */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Chỉnh sửa lịch làm việc" : "Tạo lịch làm việc mới"}</DialogTitle>
            <DialogDescription>
              Thiết lập thời gian làm việc của bạn. Hệ thống sẽ tự động tạo các khung giờ khám bệnh.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="weekdays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày trong tuần</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOptions.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={field.value?.includes(day.value)}
                            onCheckedChange={(checked) => {
                              const updatedWeekdays = checked
                                ? [...field.value, day.value]
                                : field.value.filter((value) => value !== day.value)
                              field.onChange(updatedWeekdays)
                            }}
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ kết thúc</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slot_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng mỗi khung giờ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thời lượng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 phút</SelectItem>
                          <SelectItem value="30">30 phút</SelectItem>
                          <SelectItem value="45">45 phút</SelectItem>
                          <SelectItem value="60">60 phút</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Thời lượng mỗi ca khám (30 phút là thông dụng)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_patients_per_slot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số bệnh nhân tối đa/khung giờ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn số lượng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 bệnh nhân</SelectItem>
                          <SelectItem value="2">2 bệnh nhân</SelectItem>
                          <SelectItem value="3">3 bệnh nhân</SelectItem>
                          <SelectItem value="4">4 bệnh nhân</SelectItem>
                          <SelectItem value="5">5 bệnh nhân</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm khám</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa điểm khám" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khoa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên khoa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phòng khám</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số phòng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Cập nhật" : "Tạo lịch làm việc"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}