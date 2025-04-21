'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import notificationService from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (user?.id) {
      connectWebSocket();

      // Add event listeners
      notificationService.addListener('notification', handleNewNotification);
      notificationService.addListener('unreadCount', handleUnreadCount);
      notificationService.addListener('connectionStatus', handleConnectionStatus);

      // Set up ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (notificationService.connected) {
          notificationService.ping();
        }
      }, 30000); // 30 seconds

      // Clean up on unmount
      return () => {
        clearInterval(pingInterval);
        notificationService.removeListener('notification', handleNewNotification);
        notificationService.removeListener('unreadCount', handleUnreadCount);
        notificationService.removeListener('connectionStatus', handleConnectionStatus);
        notificationService.disconnect();
      };
    }
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Connect to WebSocket
  const connectWebSocket = async () => {
    try {
      await notificationService.connect(user.id);
      // Request notifications after connection
      setTimeout(() => {
        notificationService.getNotifications(1, 'UNREAD');
      }, 500);
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
    }
  };

  // Handle new notification
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Error playing notification sound:', e));
  };

  // Handle unread count update
  const handleUnreadCount = (count) => {
    setUnreadCount(count);
  };

  // Handle connection status change
  const handleConnectionStatus = (status) => {
    setConnected(status.connected);
  };

  // Toggle notification dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Load notifications when opening dropdown
      loadNotifications();
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      // If WebSocket is connected, request notifications
      if (notificationService.connected) {
        notificationService.getNotifications(1, 'UNREAD');
      } else {
        // Fallback to REST API if WebSocket is not connected
        const response = await fetch(`/api/notifications/in-app/?recipient_id=${user.id}&status=UNREAD&ordering=-created_at`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setNotifications(data.results || []);
      }
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // View all notifications
  const viewAllNotifications = () => {
    router.push('/dashboard/notifications');
    setShowDropdown(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {connected ? (
          <Bell className="h-6 w-6" />
        ) : (
          <BellOff className="h-6 w-6 text-gray-400" />
        )}

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="py-2 px-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-800 flex justify-between items-center">
            <span>Thông báo</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-4 text-center text-gray-500">Đang tải...</div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notification.status === 'UNREAD' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-sm">{notification.title}</div>
                    {notification.is_urgent && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                        Khẩn
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{notification.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              ))}

              <div className="p-2 text-center border-t border-gray-100">
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={viewAllNotifications}
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Không có thông báo mới
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
