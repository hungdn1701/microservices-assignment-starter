"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, MoreHorizontal, Video, AlertCircle, CreditCard, FileCheck, Clipboard } from "lucide-react"
import AppointmentService from "@/lib/api/appointment-service"
import { format, isTomorrow, isToday, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Helper function để định dạng ngày
const formatAppointmentDate = (dateString: string) => {
  const date = new Date(dateString)
  if (isToday(date)) return "Hôm nay"
  if (isTomorrow(date)) return "Ngày mai"
  return format(date, 'dd/MM/yyyy', { locale: vi })
}

// Interface cho hiển thị
interface FormattedAppointment {
  id: number
  doctor: string
  specialty: string
  date: string
  time: string
  duration: string
  location: string
  type: "Trực tiếp" | "Video"
  status: string
  statusCode: string
  avatar?: string
  billing_status?: string
  billing_id?: number
  is_paid?: boolean
  has_visit?: boolean
  visit_status?: string
  reason_text?: string
  appointment_type?: string
  department?: string
}

export default function PatientAppointmentsList() {
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // Nếu không có token, thử lấy lại sau 1 giây
        // Đây là giải pháp tạm thời để đảm bảo token được lấy sau khi đăng nhập
        if (!token || !userStr) {
          console.log('Không tìm thấy token hoặc thông tin người dùng, thử lại sau 1 giây');
          setTimeout(() => {
            const retryToken = localStorage.getItem('token');
            const retryUserStr = localStorage.getItem('user');

            if (retryToken && retryUserStr) {
              // Nếu lấy được token sau khi thử lại, gọi lại hàm fetchAppointments
              console.log('Lấy được token sau khi thử lại, gọi lại API');
              fetchAppointments();
            } else {
              console.error('Không có token hoặc thông tin người dùng');
              setError("Không có token hoặc thông tin người dùng. Vui lòng đăng nhập lại.");
              setLoading(false);
            }
          }, 1000);
          return;
        }

        setLoading(true);

        try {
          // Gọi API appointments để lấy danh sách cuộc hẹn
          const data = await AppointmentService.getPatientAppointments();

          // Kiểm tra dữ liệu trả về
          if (!data) {
            console.error('API trả về dữ liệu null hoặc undefined');
            setError("Không thể tải dữ liệu lịch hẹn. Vui lòng thử lại sau.");
            setAppointments([]);
            setLoading(false);
            return;
          }

          // Kiểm tra xem data có phải là mảng hay không
          if (Array.isArray(data)) {
            if (data.length > 0) {
              // Format dữ liệu để hiển thị
              const formattedData = data.map(appointment => {
                // Tính khoảng thời gian của cuộc hẹn
                let diffInMinutes = 30; // Giá trị mặc định nếu không tính được
                try {
                  if (appointment.start_time && appointment.end_time) {
                    const startTime = new Date(`2000-01-01T${appointment.start_time}`)
                    const endTime = new Date(`2000-01-01T${appointment.end_time}`)
                    diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                  }
                } catch (error) {
                  console.error('Lỗi khi tính thời gian:', error);
                }

                // Kiểm tra xem doctor có tồn tại không
                const doctorInfo = appointment.doctor || {};
                const doctorName = doctorInfo.first_name && doctorInfo.last_name
                  ? `BS. ${doctorInfo.first_name} ${doctorInfo.last_name}`
                  : `BS. (ID: ${appointment.doctor_id || 'Không xác định'})`;

                // Xác định trạng thái lịch hẹn
                let statusDisplay = "Chưa xác định";
                let statusCode = appointment.status || "UNKNOWN";
                
                switch (statusCode.toUpperCase()) {
                  case "CONFIRMED":
                    statusDisplay = "Đã xác nhận";
                    break;
                  case "PENDING":
                    statusDisplay = "Chờ xác nhận";
                    break;
                  case "COMPLETED":
                    statusDisplay = "Hoàn thành";
                    break;
                  case "CANCELLED":
                    statusDisplay = "Đã hủy";
                    break;
                  case "NO_SHOW":
                    statusDisplay = "Không đến";
                    break;
                  case "IN_PROGRESS":
                    statusDisplay = "Đang khám";
                    break;
                  default:
                    statusDisplay = statusCode;
                }

                // Kiểm tra thông tin thăm khám
                const hasVisit = !!appointment.visit_data;
                const visitStatus = hasVisit ? appointment.visit_data.status : null;

                return {
                  id: appointment.id,
                  doctor: doctorName,
                  specialty: doctorInfo.specialty || "Chưa xác định",
                  date: formatAppointmentDate(appointment.appointment_date),
                  time: appointment.start_time?.substring(0, 5) || "--:--", // Lấy chỉ giờ:phút
                  duration: `${diffInMinutes} phút`,
                  location: appointment.location || "Chưa xác định",
                  type: appointment.appointment_type === "TELEHEALTH" ? "Video" : "Trực tiếp" as "Video" | "Trực tiếp",
                  status: statusDisplay,
                  statusCode: statusCode.toUpperCase(),
                  avatar: doctorInfo.profile_image || "/placeholder.svg",
                  billing_status: appointment.billing_status,
                  billing_id: appointment.billing_id,
                  is_paid: appointment.billing_status === "PAID",
                  has_visit: hasVisit,
                  visit_status: visitStatus,
                  reason_text: appointment.reason_text,
                  appointment_type: appointment.appointment_type_name || appointment.appointment_type,
                  department: doctorInfo.department || appointment.department
                }
              });

              setAppointments(formattedData);
              setError(null);
            } else {
              console.log('Empty appointments array');
              setAppointments([]);
            }
          } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
            // Xử lý dữ liệu dạng phân trang
            if (data.results.length > 0) {
              // Format dữ liệu để hiển thị
              const formattedData = data.results.map((appointment: any) => {
                // Tính khoảng thời gian của cuộc hẹn
                let diffInMinutes = 30; // Giá trị mặc định nếu không tính được
                try {
                  if (appointment.start_time && appointment.end_time) {
                    const startTime = new Date(`2000-01-01T${appointment.start_time}`)
                    const endTime = new Date(`2000-01-01T${appointment.end_time}`)
                    diffInMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                  }
                } catch (error) {
                  console.error('Lỗi khi tính thời gian:', error);
                }

                // Kiểm tra xem doctor có tồn tại không
                const doctorInfo = appointment.doctor || {};
                const doctorName = doctorInfo.first_name && doctorInfo.last_name
                  ? `BS. ${doctorInfo.first_name} ${doctorInfo.last_name}`
                  : `BS. (ID: ${appointment.doctor_id || 'Không xác định'})`;

                // Xác định trạng thái lịch hẹn
                let statusDisplay = "Chưa xác định";
                let statusCode = appointment.status || "UNKNOWN";
                
                switch (statusCode.toUpperCase()) {
                  case "CONFIRMED":
                    statusDisplay = "Đã xác nhận";
                    break;
                  case "PENDING":
                    statusDisplay = "Chờ xác nhận";
                    break;
                  case "COMPLETED":
                    statusDisplay = "Hoàn thành";
                    break;
                  case "CANCELLED":
                    statusDisplay = "Đã hủy";
                    break;
                  case "NO_SHOW":
                    statusDisplay = "Không đến";
                    break;
                  case "IN_PROGRESS":
                    statusDisplay = "Đang khám";
                    break;
                  default:
                    statusDisplay = statusCode;
                }

                // Kiểm tra thông tin thăm khám
                const hasVisit = !!appointment.visit_data;
                const visitStatus = hasVisit ? appointment.visit_data.status : null;

                return {
                  id: appointment.id,
                  doctor: doctorName,
                  specialty: doctorInfo.specialty || "Chưa xác định",
                  date: formatAppointmentDate(appointment.appointment_date),
                  time: appointment.start_time?.substring(0, 5) || "--:--", // Lấy chỉ giờ:phút
                  duration: `${diffInMinutes} phút`,
                  location: appointment.location || "Chưa xác định",
                  type: appointment.appointment_type === "TELEHEALTH" ? "Video" : "Trực tiếp" as "Video" | "Trực tiếp",
                  status: statusDisplay,
                  statusCode: statusCode.toUpperCase(),
                  avatar: doctorInfo.profile_image || "/placeholder.svg",
                  billing_status: appointment.billing_status,
                  billing_id: appointment.billing_id,
                  is_paid: appointment.billing_status === "PAID",
                  has_visit: hasVisit,
                  visit_status: visitStatus,
                  reason_text: appointment.reason_text,
                  appointment_type: appointment.appointment_type_name || appointment.appointment_type,
                  department: doctorInfo.department || appointment.department
                }
              });

              setAppointments(formattedData);
              setError(null);
            } else {
              console.log('Empty results array in paginated data');
              setAppointments([]);
            }
          } else {
            console.log('No appointments data or invalid format', data);
            setAppointments([]);
          }
        } catch (apiError: any) {
          console.error("Lỗi khi tải danh sách cuộc hẹn:", apiError);
          console.error("Error details:", {
            status: apiError.response?.status,
            data: apiError.response?.data,
            message: apiError.message
          });

          if (apiError.response?.status === 403) {
            setError(`Lỗi quyền truy cập: Bạn không có quyền xem danh sách cuộc hẹn.`);
          } else if (apiError.response?.status === 404) {
            setError(`Không tìm thấy API: Đường dẫn API không tồn tại hoặc chưa được cấu hình.`);
          } else if (apiError.response?.status === 401) {
            setError(`Lỗi xác thực: Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.`);
          } else {
            setError(`Lỗi khi tải danh sách cuộc hẹn: ${apiError.message}`);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [])

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) return;
    
    try {
      await AppointmentService.cancelAppointment(appointmentId, 'Hủy bởi bệnh nhân');
      
      // Cập nhật trạng thái của lịch hẹn trong danh sách
      setAppointments(prev => prev.map(app =>
        app.id === appointmentId ? {...app, status: 'Đã hủy', statusCode: 'CANCELLED'} : app
      ));
      
      // Hiển thị thông báo thành công
      alert('Hủy lịch hẹn thành công!');
    } catch (error: any) {
      console.error('Lỗi khi hủy lịch hẹn:', error);
      if (error.response?.data?.error === 'Cannot cancel appointment within 24 hours') {
        alert('Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn.');
      } else {
        alert('Không thể hủy lịch hẹn. ' + (error.message || 'Vui lòng thử lại sau.'));
      }
    }
  }

  // Kiểm tra xem lịch hẹn có thể hủy được không (không trong vòng 24h trước giờ hẹn)
  const canCancel = (appointment: FormattedAppointment) => {
    if (appointment.statusCode !== "CONFIRMED" && appointment.statusCode !== "PENDING") return false;
    
    // Nếu là hôm nay, kiểm tra thời gian
    if (appointment.date === "Hôm nay") {
      const now = new Date();
      const [hours, minutes] = appointment.time.split(':').map(Number);
      const appointmentTime = new Date();
      appointmentTime.setHours(hours, minutes, 0);
      
      // Nếu còn ít hơn 24 giờ, không cho phép hủy
      const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours <= 24) return false;
    }
    
    return true;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-3 w-[80px]" />
                  <Skeleton className="h-3 w-[120px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Skeleton className="h-6 w-[100px]" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="mt-2 text-lg font-medium">Không thể tải dữ liệu</h3>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Calendar className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">Không có lịch hẹn nào</h3>
        <p className="mt-1 text-sm text-muted-foreground">Bạn chưa có lịch hẹn khám bệnh nào.</p>
        <Button className="mt-4" asChild>
          <a href="/dashboard/patient/appointments/new">Đặt lịch hẹn ngay</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-start md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar className="hidden md:block">
              <AvatarImage src={appointment.avatar || "/placeholder.svg"} alt={appointment.doctor} />
              <AvatarFallback>
                {appointment.doctor
                  .split(" ")
                  .filter(part => part[0])
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{appointment.doctor}</h4>
              <p className="text-sm text-muted-foreground">
                {appointment.specialty}
                {appointment.department && ` • ${appointment.department}`}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {appointment.time} ({appointment.duration})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {appointment.type === "Video" ? (
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span>{appointment.location}</span>
                </div>
              </div>
              
              {appointment.reason_text && (
                <div className="mt-2 text-sm">
                  <p className="font-medium text-muted-foreground">Lý do khám:</p>
                  <p className="text-sm line-clamp-1">{appointment.reason_text}</p>
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {appointment.appointment_type || "Khám thường"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Loại khám</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {appointment.has_visit && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 px-2 py-1 text-xs font-medium">
                          <Clipboard className="h-3 w-3" />
                          <span>{appointment.visit_status || "Đã check-in"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trạng thái thăm khám</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {appointment.billing_id && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                            appointment.is_paid 
                              ? "bg-green-50 text-green-700" 
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {appointment.is_paid ? (
                            <>
                              <FileCheck className="h-3 w-3" />
                              <span>Đã thanh toán</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3 w-3" />
                              <span>Chờ thanh toán</span>
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Trạng thái thanh toán</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-end gap-2 md:mt-0">
            <StatusBadge status={appointment.statusCode} />
            
            <div className="flex items-center gap-2 mt-2">
              {appointment.statusCode === "CONFIRMED" && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/patient/appointments/${appointment.id}/reschedule`}>Đổi lịch</a>
                </Button>
              )}
              
              {canCancel(appointment) && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Hủy
                </Button>
              )}
              
              <Button variant="ghost" size="icon" asChild>
                <a href={`/dashboard/patient/appointments/${appointment.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
