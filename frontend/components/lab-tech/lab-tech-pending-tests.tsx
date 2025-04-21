import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, MoreHorizontal, User } from "lucide-react"

export default function LabTechPendingTests() {
  const pendingTests = [
    {
      id: 1,
      patient: "Nguyễn Thị Hoa",
      patientId: "BN-1001",
      testType: "Công thức máu (CBC)",
      doctor: "BS. Nguyễn Thị Hương",
      requestDate: "Hôm nay",
      requestTime: "09:15",
      status: "Khẩn cấp",
      dueDate: "Hôm nay, 14:00",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      patient: "Trần Văn Nam",
      patientId: "BN-1008",
      testType: "Xét nghiệm mỡ máu",
      doctor: "BS. Phạm Văn Đức",
      requestDate: "Hôm nay",
      requestTime: "10:30",
      status: "Thường quy",
      dueDate: "Ngày mai, 10:00",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      patient: "Lê Thị Lan",
      patientId: "BN-1003",
      testType: "Xét nghiệm nước tiểu",
      doctor: "BS. Nguyễn Thị Hương",
      requestDate: "Hôm nay",
      requestTime: "11:45",
      status: "Khẩn cấp",
      dueDate: "Hôm nay, 16:00",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      patient: "Phạm Văn Minh",
      patientId: "BN-1006",
      testType: "Xét nghiệm chức năng gan",
      doctor: "BS. Phạm Văn Đức",
      requestDate: "Hôm qua",
      requestTime: "15:30",
      status: "Thường quy",
      dueDate: "Ngày mai, 12:00",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {pendingTests.map((test) => (
        <div
          key={test.id}
          className="flex flex-col rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={test.avatar || "/placeholder.svg"} alt={test.patient} />
              <AvatarFallback>
                {test.patient
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{test.patient}</h4>
                <span className="text-xs text-muted-foreground">{test.patientId}</span>
              </div>
              <p className="text-sm font-medium">{test.testType}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{test.doctor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{test.requestDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{test.requestTime}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={test.status === "Khẩn cấp" ? "destructive" : "outline"}
              className={
                test.status === "Khẩn cấp" ? "" : "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              }
            >
              {test.status}
            </Badge>
            <div className="mt-1 text-xs text-muted-foreground">Hạn: {test.dueDate}</div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="default" size="sm">
                Xử lý
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-3.5 w-3.5" />
                Chi tiết
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
