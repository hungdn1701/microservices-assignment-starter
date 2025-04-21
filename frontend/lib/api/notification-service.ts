import apiClient from "./api-client"

export interface Notification {
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

export interface NotificationEvent {
  event_type: string
  recipient_id: number
  sender_id: number | null
  data: any
}

const NotificationService = {
  async getAllNotifications(): Promise<Notification[]> {
    const response = await apiClient.get("/api/notifications/")
    return response.data
  },

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const response = await apiClient.post("/api/notifications/", data)
    return response.data
  },

  async getNotificationById(id: number): Promise<Notification> {
    const response = await apiClient.get(`/api/notifications/${id}/`)
    return response.data
  },

  async markNotificationAsRead(id: number): Promise<Notification> {
    const response = await apiClient.post(`/api/notifications/${id}/mark_as_read/`)
    return response.data
  },

  async sendNotificationEvent(data: NotificationEvent): Promise<any> {
    const response = await apiClient.post("/api/notifications/events/", data)
    return response.data
  },
}

export default NotificationService
