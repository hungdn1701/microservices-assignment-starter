"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Shield, Trash, UserPlus } from "lucide-react"

export default function AdminUsersList() {
  const [searchQuery, setSearchQuery] = useState("")

  const users = [
    {
      id: "1",
      name: "BS. Nguyễn Thị Hương",
      email: "huong.nguyen@example.com",
      role: "BÁC SĨ",
      specialty: "Tim mạch",
      status: "active",
      lastActive: "2 giờ trước",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Trần Văn Nam",
      email: "nam.tran@example.com",
      role: "BỆNH NHÂN",
      status: "active",
      lastActive: "1 ngày trước",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Lê Thị Lan",
      email: "lan.le@example.com",
      role: "Y TÁ",
      department: "Tim mạch",
      status: "active",
      lastActive: "5 giờ trước",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "4",
      name: "Phạm Văn Minh",
      email: "minh.pham@example.com",
      role: "DƯỢC SĨ",
      status: "inactive",
      lastActive: "2 tuần trước",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "5",
      name: "Hoàng Thị Mai",
      email: "mai.hoang@example.com",
      role: "QUẢN TRỊ VIÊN",
      status: "active",
      lastActive: "Vừa xong",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-1">
          <UserPlus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
          <div className="col-span-4">Người dùng</div>
          <div className="col-span-3">Vai trò</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-2">Hoạt động gần đây</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy người dùng</div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="grid grid-cols-12 items-center border-b p-4 text-sm last:border-0">
              <div className="col-span-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="col-span-3">
                <Badge
                  variant="outline"
                  className={
                    user.role === "QUẢN TRỊ VIÊN"
                      ? "bg-purple-50 text-purple-700 hover:bg-purple-50 hover:text-purple-700"
                      : user.role === "BÁC SĨ"
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                        : user.role === "Y TÁ"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : user.role === "DƯỢC SĨ"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                  }
                >
                  {user.role}
                </Badge>
                {user.specialty && <div className="mt-1 text-xs text-muted-foreground">{user.specialty}</div>}
                {user.department && <div className="mt-1 text-xs text-muted-foreground">{user.department}</div>}
              </div>
              <div className="col-span-2">
                <Badge
                  variant="outline"
                  className={
                    user.status === "active"
                      ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                      : "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                  }
                >
                  {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </div>
              <div className="col-span-2 text-muted-foreground">{user.lastActive}</div>
              <div className="col-span-1 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Thao tác</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Quyền hạn
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
