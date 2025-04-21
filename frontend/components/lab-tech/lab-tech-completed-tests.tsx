import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Download, FileText, MoreHorizontal, User } from "lucide-react"

export default function LabTechCompletedTests() {
  const completedTests = [
    {
      id: 1,
      patient: "Nguyễn Văn An",
      patientId: "BN-1008",
      testType: "Công thức máu (CBC)",
      doctor: "BS. Nguyễn Thị Hương",
      completedDate: "Hôm nay",
      completedTime: "11:30",
      status: "Hoàn thành",
      result: "Bình thường",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      patient: "Trần Thị Bình",
      patientId: "BN-1012",
      testType: "Xét nghiệm chức năng tuyến giáp",
      doctor: "BS. Phạm Văn Đức",
      completedDate: "Hôm nay",
      completedTime: "09:45",
      status: "Hoàn thành",
      result: "Bất thường",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      patient: "Phạm Văn Minh",
      patientId: "BN-1002",
      testType: "Xét nghiệm mỡ máu",
      doctor: "BS. Nguyễn Thị Hương",
      completedDate: "Hôm qua",
      completedTime: "15:15",
      status: "Hoàn thành",
      result: "Bình thường",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      patient: "Hoàng Thị Mai",
      patientId: "BN-1005",
      testType: "Xét nghiệm nước tiểu",
      doctor: "BS. Phạm Văn Đức",
      completedDate: "Hôm qua",
      completedTime: "13:30",
      status: "Hoàn thành",
      result: "Bình thường",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-4">
      {completedTests.map((test) => (
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
                  <span>
                    {test.completedDate}, {test.completedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between md:mt-0 md:flex-col md:items-end">
            <Badge
              variant={test.result === "Bình thường" ? "outline" : "secondary"}
              className={
                test.result === "Bình thường"
                  ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
              }
            >
              {test.result}
            </Badge>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                Xuất
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
