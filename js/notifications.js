// ========== GENZ SMART NOTIFICATIONS SYSTEM ==========
// Real-time notifications with smart delivery and management

class NotificationsSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.permission = 'default';
        this.init();
    }

    async init() {
        await this.loadNotifications();
        this.initEventListeners();
        this.initServiceWorker();
        this.startRealtimeChecks();
        this.updateBadge();
    }

    async loadNotifications() {
        try {
            const savedNotifications = JSON.parse(localStorage.getItem('genz_notifications') || '[]');
            this.notifications = savedNotifications;
            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.renderNotifications();
            
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    initEventListeners() {
        // Notification bell
        const notificationBell = document.getElementById('notificationBell');
        if (notificationBell) {
            notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificationsDropdown();
            });
        }

        // Mark all as read
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => this.markAllAsRead());
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationDropdown');
            const bell = document.getElementById('notificationBell');
            
            if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Notification settings
        this.initNotificationSettings();
    }

    toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            } else {
                dropdown.style.display = 'block';
                this.loadNotifications(); // Refresh when opening
            }
        }
    }

    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        const notificationBadge = document.getElementById('notificationBadge');
        
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                    <small>We'll notify you when something happens</small>
                </div>
            `;
            return;
        }

        // Show only latest 5 notifications in dropdown
        const recentNotifications = this.notifications.slice(0, 5);
        
        notificationList.innerHTML = recentNotifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-notification-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-text">${notification.message}</p>
                    <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                </div>
                ${!notification.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');

        // Add click handlers
        notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notificationId = item.dataset.notificationId;
                this.handleNotificationClick(notificationId);
            });
        });

        // Update badge
        this.updateBadge();
    }

    getNotificationIcon(type) {
        const icons = {
            'new_post': 'fa-newspaper',
            'comment': 'fa-comment',
            'like': 'fa-heart',
            'share': 'fa-share',
            'system': 'fa-cog',
            'warning': 'fa-exclamation-triangle',
            'success': 'fa-check-circle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-bell';
    }

    async handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Mark as read
        await this.markAsRead(notificationId);

        // Handle notification action
        switch (notification.type) {
            case 'new_post':
                window.location.href = 'blog.html';
                break;
            case 'comment':
                window.location.href = 'comments.html';
                break;
            case 'like':
                // Navigate to liked content
                break;
            default:
                // No specific action
                break;
        }

        // Close dropdown
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    async markAsRead(notificationId) {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
            this.notifications[notificationIndex].read = true;
            await this.saveNotifications();
            this.unreadCount = this.notifications.filter(n => !n.read).length;
            this.updateBadge();
            this.renderNotifications();
        }
    }

    async markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        this.unreadCount = 0;
        await this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();
        
        this.showToast('All notifications marked as read', 'success');
    }

    async createNotification(message, type = 'info', data = {}) {
        const notification = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            read: false,
            data: data
        };

        this.notifications.unshift(notification);
        this.unreadCount++;
        
        await this.saveNotifications();
        this.updateBadge();
        this.renderNotifications();

        // Show browser notification if permitted
        this.showBrowserNotification(notification);

        return notification;
    }

    async showBrowserNotification(notification) {
        if (!('Notification' in window)) return;
        
        if (this.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/icon-192.png',
                tag: notification.id,
                requireInteraction: false,
                actions: [
                    {
                        action: 'open',
                        title: 'View'
                    },
                    {
                        action: 'dismiss',
                        title: 'Dismiss'
                    }
                ]
            };

            const browserNotification = new Notification('GenZ Smart', options);

            browserNotification.onclick = () => {
                window.focus();
                this.handleNotificationClick(notification.id);
                browserNotification.close();
            };

            // Auto-close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            this.showToast('This browser does not support notifications', 'warning');
            return 'denied';
        }

        try {
            this.permission = await Notification.requestPermission();
            
            if (this.permission === 'granted') {
                this.showToast('Notifications enabled successfully!', 'success');
            } else {
                this.showToast('Notifications blocked', 'info');
            }
            
            return this.permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    async saveNotifications() {
        // Keep only last 50 notifications to prevent storage bloat
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        localStorage.setItem('genz_notifications', JSON.stringify(this.notifications));
    }

    formatTime(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return notificationTime.toLocaleDateString();
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // Service worker would be registered here for push notifications
            console.log('Push notifications supported');
        }
    }

    initNotificationSettings() {
        // Load notification preferences
        const settings = JSON.parse(localStorage.getItem('genz_settings') || '{}');
        
        // Set initial permission state based on settings
        if (settings.pushNotifications) {
            this.requestPermission();
        }
    }

    startRealtimeChecks() {
        // Check for new notifications periodically
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000); // Check every 30 seconds
    }

    async checkForNewNotifications() {
        // In a real app, this would check the server for new notifications
        // For now, we'll simulate occasional notifications
        
        if (Math.random() < 0.1) { // 10% chance every check
            const sampleNotifications = [
                {
                    message: 'New post published: "The Power of Small Ideas"',
                    type: 'new_post'
                },
                {
                    message: 'Your comment received 3 likes',
                    type: 'like'
                },
                {
                    message: 'Community update: We just reached 50K readers!',
                    type: 'system'
                }
            ];
            
            const randomNotif = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
            await this.createNotification(randomNotif.message, randomNotif.type);
        }
    }

    // Public API for other parts of the app
    async notifyNewPost(postTitle) {
        return await this.createNotification(
            `New post: "${postTitle}"`,
            'new_post',
            { postTitle: postTitle }
        );
    }

    async notifyNewComment(postTitle, commentAuthor) {
        return await this.createNotification(
            `${commentAuthor} commented on "${postTitle}"`,
            'comment',
            { postTitle: postTitle, commentAuthor: commentAuthor }
        );
    }

    async notifyPostLiked(postTitle, likerName) {
        return await this.createNotification(
            `${likerName} liked your post "${postTitle}"`,
            'like',
            { postTitle: postTitle, likerName: likerName }
        );
    }

    showToast(message, type = 'info') {
        if (window.toast) {
            window.toast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize notifications system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationsSystem = new NotificationsSystem();
    
    // Make notification methods available globally
    window.createNotification = (message, type, data) => 
        window.notificationsSystem.createNotification(message, type, data);
    window.notifyNewPost = (postTitle) => 
        window.notificationsSystem.notifyNewPost(postTitle);
    window.notifyNewComment = (postTitle, commentAuthor) => 
        window.notificationsSystem.notifyNewComment(postTitle, commentAuthor);
    window.notifyPostLiked = (postTitle, likerName) => 
        window.notificationsSystem.notifyPostLiked(postTitle, likerName);
});
