'use client';

import { getToken } from './authService';

class NotificationService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.listeners = {
      notification: [],
      unreadCount: [],
      connectionStatus: []
    };
    this.unreadCount = 0;
  }

  /**
   * Connect to the WebSocket server
   * @param {number} userId - The user ID
   * @returns {Promise} - Resolves when connected, rejects on error
   */
  connect(userId) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        console.log('WebSocket already connected');
        resolve();
        return;
      }

      // Get the JWT token
      const token = getToken();
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_API_URL || 'localhost:4000';
      const wsUrl = `${protocol}//${host}/ws/notifications/${userId}/?token=${token}`;

      console.log(`Connecting to WebSocket at ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);

      // Connection opened
      this.socket.addEventListener('open', (event) => {
        console.log('WebSocket connection established');
        this.connected = true;
        this.reconnectAttempts = 0;
        this._notifyListeners('connectionStatus', { connected: true });
        resolve();
      });

      // Listen for messages
      this.socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          // Handle different message types
          switch (data.type) {
            case 'new_notification':
              this._notifyListeners('notification', data.notification);
              break;
            case 'unread_count':
              this.unreadCount = data.count;
              this._notifyListeners('unreadCount', data.count);
              break;
            case 'mark_as_read_response':
              // Handle mark as read response
              break;
            case 'notifications_list':
              // Handle notifications list
              break;
            case 'pong':
              // Handle pong response
              break;
            default:
              console.log(`Unknown message type: ${data.type}`);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Connection closed
      this.socket.addEventListener('close', (event) => {
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        this.connected = false;
        this._notifyListeners('connectionStatus', { connected: false });

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.connect(userId).catch(error => {
              console.error('Reconnection failed:', error);
            });
          }, this.reconnectInterval);
        }
      });

      // Connection error
      this.socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        reject(new Error('WebSocket connection error'));
      });
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
      this._notifyListeners('connectionStatus', { connected: false });
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param {Object} message - The message to send
   * @returns {boolean} - True if sent, false otherwise
   */
  sendMessage(message) {
    if (!this.socket || !this.connected) {
      console.error('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Mark a notification as read
   * @param {number} notificationId - The notification ID
   * @returns {boolean} - True if request sent, false otherwise
   */
  markAsRead(notificationId) {
    return this.sendMessage({
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }

  /**
   * Get notifications
   * @param {number} page - The page number
   * @param {string} status - The status filter (UNREAD, READ, ARCHIVED, ALL)
   * @returns {boolean} - True if request sent, false otherwise
   */
  getNotifications(page = 1, status = 'UNREAD') {
    return this.sendMessage({
      type: 'get_notifications',
      page,
      status
    });
  }

  /**
   * Send a ping to keep the connection alive
   * @returns {boolean} - True if ping sent, false otherwise
   */
  ping() {
    return this.sendMessage({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get the current unread count
   * @returns {number} - The unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Add a listener for a specific event
   * @param {string} event - The event to listen for (notification, unreadCount, connectionStatus)
   * @param {Function} callback - The callback function
   */
  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove a listener for a specific event
   * @param {string} event - The event to remove the listener from
   * @param {Function} callback - The callback function to remove
   */
  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - The event that occurred
   * @param {*} data - The data to pass to the listeners
   * @private
   */
  _notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Create a singleton instance
const notificationService = new NotificationService();

export default notificationService;
