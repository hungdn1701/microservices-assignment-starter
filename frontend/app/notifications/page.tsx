"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Clock, FileText, MessageSquare, Pill, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import NotificationService from "@/lib/api/notification-service"
import { PageContainer } from "@/components/layout/page-container"

interface Notification {
  id: number
  recipient_id: number
  sender_id: number | null
  notification_type: string
  title: string
  message: string
  related_object_type: string | null
  related_object_id: number | null
  is_read: boolean
  created_at: string
  updated_at: string
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const data = await NotificationService.getAllNotifications()
        setNotifications(data)
      } catch (error) {
        console.error("Lỗi khi tải thông báo:", error)
        setError("Không thể tải thông báo. Vui lòng thử lại sau.")
        toast({
          title: "Lỗi",
          description: "Không thể tải thông báo",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  const markAsRead = async (id: number) => {
    try {
      await NotificationService.markNotificationAsRead(id)
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      )
      toast({
        title: "Thành công",
        description: "Đã đánh dấu thông báo là đã đọc",
      })
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo:", error)
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu thông báo",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "PRESCRIPTION":
        return <Pill className="h-5 w-5 text-green-500" />
      case "LAB_RESULT":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5 text-teal-500" />
      case "REMINDER":
        return <Clock className="h-5 w-5 text-amber-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const unreadNotifications = notifications.filter((notification) => !notification.is_read)
  const readNotifications = notifications.filter((notification) => notification.is_read)

  return (
    <PageContainer>
      <h1 className="mb-6 text-2xl font-bold">Thông báo</h1>

      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread">
            Chưa đọc <Badge className="ml-2">{unreadNotifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : unreadNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có thông báo chưa đọc</div>
          ) : (
            <div className="space-y-4">
              {unreadNotifications.map((notification) => (
                <Card key={notification.id} className="relative overflow-hidden">
                  {!notification.is_read && <div className="absolute left-0 top-0 h-full w-1 bg-primary"></div>}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNotificationIcon(notification.notification_type)}</div>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Đánh dấu đã đọc</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Không có thông báo nào</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`relative overflow-hidden ${notification.is_read ? "opacity-75" : ""}`}
                >
                  {!notification.is_read && <div className="absolute left-0 top-0 h-full w-1 bg-primary"></div>}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNotificationIcon(notification.notification_type)}</div>
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Đánh dấu đã đọc</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
