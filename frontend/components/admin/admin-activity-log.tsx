import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Eye, Filter, User } from "lucide-react"

export default function AdminActivityLog() {
  const activities = [
    {
      id: "1",
      user: "BS. Nguyễn Thị Hương",
      action: "Tạo hồ sơ y tế",
      resource: "Hồ sơ y tế #MR-2025-0042",
      timestamp: "Hôm nay, 10:45",
      ipAddress: "192.168.1.105",
      severity: "info",
    },
    {
      id: "2",
      user: "Quản trị viên",
      action: "Cập nhật quyền người dùng",
      resource: "Người dùng: Lê Thị Lan (Y tá)",
      timestamp: "Hôm nay, 09:30",
      ipAddress: "192.168.1.100",
      severity: "warning",
    },
    {
      id: "3",
      user: "Hệ thống",
      action: "Sao lưu hoàn tất",
      resource: "Cơ sở dữ liệu",
      timestamp: "Hôm nay, 03:00",
      ipAddress: "Hệ thống",
      severity: "info",
    },
    {
      id: "4",
      user: "Phạm Văn Minh",
      action: "Đăng nhập thất bại",
      resource: "Xác thực",
      timestamp: "Hôm qua, 23:52",
      ipAddress: "203.0.113.42",
      severity: "error",
    },
    {
      id: "5",
      user: "Hoàng Thị Mai",
      action: "Thêm người dùng mới",
      resource: "Người dùng: Nguyễn Văn An (Bác sĩ)",
      timestamp: "Hôm qua, 14:15",
      ipAddress: "192.168.1.100",
      severity: "info",
    },
  ]

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-3.5 w-3.5" />7 ngày qua
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-3.5 w-3.5" />
            Lọc
          </Button>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-3.5 w-3.5" />
          Xuất
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-lg border p-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      activity.severity === "error"
                        ? "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                        : activity.severity === "warning"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    }
                  >
                    {activity.severity === "error" ? "Lỗi" : activity.severity === "warning" ? "Cảnh báo" : "Thông tin"}
                  </Badge>
                  <h4 className="font-medium">{activity.action}</h4>
                </div>
                <p className="mt-1 text-sm">{activity.resource}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{activity.user}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{activity.timestamp}</span>
                </div>
                <span className="text-xs">IP: {activity.ipAddress}</span>
              </div>
            </div>
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" className="gap-1">
                <Eye className="h-3.5 w-3.5" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
