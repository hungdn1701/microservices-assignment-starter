import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, Users } from "lucide-react"

export default function AdminStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Tổng người dùng</span>
            <Users className="h-5 w-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline">
            <h3 className="text-2xl font-bold">1.248</h3>
            <span className="ml-2 text-xs font-medium text-green-600">+24 tuần này</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Đang hoạt động:</span> 1.156 (92,6%)
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Trạng thái hệ thống</span>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="mt-2 flex items-baseline">
            <h3 className="text-2xl font-bold">99,9%</h3>
            <span className="ml-2 text-xs font-medium text-green-600">Thời gian hoạt động</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Sự cố gần nhất:</span> 15 ngày trước
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Chờ phê duyệt</span>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline">
            <h3 className="text-2xl font-bold">18</h3>
            <span className="ml-2 text-xs font-medium text-amber-600">Cần xử lý</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Lâu nhất:</span> 2 ngày trước
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Cảnh báo hệ thống</span>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline">
            <h3 className="text-2xl font-bold">3</h3>
            <span className="ml-2 text-xs font-medium text-red-600">Cảnh báo đang hoạt động</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Nghiêm trọng:</span> 1 cảnh báo
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
