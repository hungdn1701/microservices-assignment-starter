'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Archive, Bell, AlertTriangle, Clock } from 'lucide-react';
import notificationService from '@/services/notificationService';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unread');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [connected, setConnected] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (user?.id) {
      connectWebSocket();

      // Add event listeners
      notificationService.addListener('connectionStatus', handleConnectionStatus);

      // Clean up on unmount
      return () => {
        notificationService.removeListener('connectionStatus', handleConnectionStatus);
      };
    }
  }, [user?.id]);

  // Load notifications when tab changes or page changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, activeTab, page]);

  // Connect to WebSocket
  const connectWebSocket = async () => {
    try {
      await notificationService.connect(user.id);
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
    }
  };

  // Handle connection status change
  const handleConnectionStatus = (status) => {
    setConnected(status.connected);
  };

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const status = activeTab.toUpperCase();
      const response = await fetch(`/api/notifications/in-app/?recipient_id=${user.id}&status=${status}&ordering=-created_at&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotifications(data.results || []);
      setTotalPages(data.num_pages || 1);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // If WebSocket is connected, mark as read via WebSocket
      if (notificationService.connected) {
        notificationService.markAsRead(notificationId);
      } else {
        // Fallback to REST API if WebSocket is not connected
        await fetch(`/api/notifications/in-app/${notificationId}/mark_as_read/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'READ', read_at: new Date().toISOString() } : n)
      );

      // Reload if we're on the unread tab
      if (activeTab === 'unread') {
        loadNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Archive notification
  const archiveNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/in-app/${notificationId}/archive/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'ARCHIVED' } : n)
      );

      // Reload if we're on the read tab
      if (activeTab === 'read') {
        loadNotifications();
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/in-app/mark_all_as_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient_id: user.id })
      });

      // Reload notifications
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const type = notification.notification_type;

    if (notification.is_urgent) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }

    switch (type) {
      case 'APPOINTMENT':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'BILLING':
        return <Bell className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <div className="flex items-center gap-2">
            {connected ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Kết nối trực tuyến
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                Ngoại tuyến
              </Badge>
            )}
            {activeTab === 'unread' && (
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Chưa đọc
              {totalCount > 0 && activeTab === 'unread' && (
                <Badge variant="destructive">{totalCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Đã đọc</TabsTrigger>
            <TabsTrigger value="archived">Đã lưu trữ</TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="mt-0">
            {renderNotificationsList('unread')}
          </TabsContent>

          <TabsContent value="read" className="mt-0">
            {renderNotificationsList('read')}
          </TabsContent>

          <TabsContent value="archived" className="mt-0">
            {renderNotificationsList('archived')}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>

              <span className="text-sm">
                Trang {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  // Helper function to render notifications list
  function renderNotificationsList(status) {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông báo...</p>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Không có thông báo</h3>
          <p className="mt-2 text-gray-600">
            {status === 'unread'
              ? 'Bạn không có thông báo chưa đọc nào.'
              : status === 'read'
                ? 'Bạn không có thông báo đã đọc nào.'
                : 'Bạn không có thông báo đã lưu trữ nào.'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
              notification.is_urgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationIcon(notification)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {status === 'unread' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Đã đọc
                      </Button>
                    )}

                    {status === 'read' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveNotification(notification.id)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Lưu trữ
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500">
                    {formatDate(notification.created_at)}
                  </div>

                  <div className="flex items-center gap-2">
                    {notification.service && (
                      <Badge variant="outline" className="text-xs">
                        {notification.service}
                      </Badge>
                    )}

                    {notification.is_urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Khẩn
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
