import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatTime(timeString: string): string {
  if (!timeString) return ""

  // Handle both full ISO strings and time-only strings
  let hours, minutes
  if (timeString.includes("T")) {
    const date = new Date(timeString)
    hours = date.getHours()
    minutes = date.getMinutes()
  } else {
    const [hoursStr, minutesStr] = timeString.split(":")
    hours = Number.parseInt(hoursStr, 10)
    minutes = Number.parseInt(minutesStr, 10)
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "CONFIRMED":
    case "COMPLETED":
    case "APPROVED":
    case "NORMAL":
      return "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
    case "PENDING":
    case "SCHEDULED":
    case "WAITING":
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
    case "CANCELLED":
    case "REJECTED":
    case "EXPIRED":
    case "INACTIVE":
      return "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
    case "WARNING":
    case "NEEDS_ATTENTION":
    case "EXPIRING_SOON":
      return "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
    default:
      return "bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
  }
}

export function getVietnameseStatus(status: string): string {
  switch (status.toUpperCase()) {
    // Appointment statuses
    case "SCHEDULED":
      return "Đã lên lịch"
    case "CONFIRMED":
      return "Đã xác nhận"
    case "COMPLETED":
      return "Đã hoàn thành"
    case "CANCELLED":
      return "Đã hủy"
    case "NO_SHOW":
      return "Không đến"

    // General statuses
    case "ACTIVE":
      return "Đang hoạt động"
    case "INACTIVE":
      return "Không hoạt động"
    case "PENDING":
      return "Đang chờ"
    case "APPROVED":
      return "Đã duyệt"
    case "REJECTED":
      return "Đã từ chối"
    case "EXPIRED":
      return "Đã hết hạn"

    // Medical statuses
    case "NORMAL":
      return "Bình thường"
    case "ABNORMAL":
      return "Bất thường"
    case "CRITICAL":
      return "Nguy cấp"
    case "STABLE":
      return "Ổn định"

    // Lab test statuses
    case "ORDERED":
      return "Đã yêu cầu"
    case "IN_PROGRESS":
      return "Đang xử lý"
    case "COMPLETED":
      return "Đã hoàn thành"
    case "VERIFIED":
      return "Đã xác minh"

    // Prescription statuses
    case "ACTIVE":
      return "Đang sử dụng"
    case "FILLED":
      return "Đã cấp phát"
    case "EXPIRED":
      return "Đã hết hạn"
    case "CANCELLED":
      return "Đã hủy"

    // Priority levels
    case "ROUTINE":
      return "Thông thường"
    case "URGENT":
      return "Khẩn cấp"
    case "EMERGENCY":
      return "Cấp cứu"

    default:
      return status
  }
}

export function getVietnameseRole(role: string): string {
  switch (role.toUpperCase()) {
    case "PATIENT":
      return "Bệnh nhân"
    case "DOCTOR":
      return "Bác sĩ"
    case "NURSE":
      return "Y tá"
    case "ADMIN":
      return "Quản trị viên"
    case "PHARMACIST":
      return "Dược sĩ"
    case "LAB_TECH":
      return "Kỹ thuật viên xét nghiệm"
    case "INSURANCE":
      return "Nhân viên bảo hiểm"
    case "BILLING_STAFF":
      return "Nhân viên thanh toán"
    default:
      return role
  }
}
