/* ========== 
   GenZ Smart - notifications.js
   Logic for the In-App Notification Center and management.
========== */

const { db, currentUser, toast } = window.GenZApp || {};

const notifIcon = document.getElementById('notificationIcon');
const notifPanel = document.getElementById('notificationPanel');
const notifCountSpan = document.getElementById('notificationCount');
const notifList = document.getElementById('notificationList');
const markAllReadBtn = document.getElementById('markAllReadBtn');

/**
 * Renders the list of notifications in the side panel.
 */
function renderNotifications() {
    if (!notifList) return;
    
    // Get notifications for the current user (or admin if applicable)
    let notifications = db.notifications.filter(n => n.userId === currentUser.id || (currentUser.isAdmin && n.userId === 'admin'));
    
    // Sort by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update count icon
    if (notifCountSpan) {
        notifCountSpan.textContent = unreadCount > 9 ? '9+' : unreadCount;
        notifCountSpan.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    notifList.innerHTML = '';

    if (notifications.length === 0) {
        notifList.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-bell-slash"></i>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('a');
        item.href = notif.link || '#';
        item.className = `notification-item ${notif.read ? 'read' : 'unread'}`;
        item.setAttribute('data-id', notif.id);

        const iconClass = notif.icon || (notif.type === 'like' ? 'fas fa-heart' : 'fas fa-comment');

        item.innerHTML = `
            <div class="notif-icon-wrapper">
                <i class="${iconClass}"></i>
            </div>
            <div class="notif-content">
                <div class="notif-message">${notif.message}</div>
                <div class="notif-time">${timeSince(notif.timestamp)} ago</div>
            </div>
        `;

        item.addEventListener('click', (e) => {
            // Mark as read on click
            markNotificationAsRead(notif.id);
            // Close panel
            notifPanel.classList.remove('open');
            // Allow navigation to link
        });

        notifList.appendChild(item);
    });
}

/**
 * Marks a specific notification as read in the DB.
 * @param {string} notifId - The ID of the notification to mark.
 */
function markNotificationAsRead(notifId) {
    const notif = db.notifications.find(n => n.id === notifId);
    if (notif && !notif.read) {
        notif.read = true;
        localStorage.setItem('GenZDb', JSON.stringify(db));
        renderNotifications(); // Re-render to update UI
    }
}

/**
 * Marks all current notifications as read.
 */
function markAllAsRead() {
    let changed = false;
    db.notifications.forEach(n => {
        if ((n.userId === currentUser.id || (currentUser.isAdmin && n.userId === 'admin')) && !n.read) {
            n.read = true;
            changed = true;
        }
    });
    
    if (changed) {
        localStorage.setItem('GenZDb', JSON.stringify(db));
        renderNotifications();
        toast('All notifications marked as read.', 'info');
    }
}

/**
 * Utility function to calculate time since an event (copied from comments.js for self-contained use).
 */
function timeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) { return interval + "y"; }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) { return interval + "mo"; }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) { return interval + "d"; }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) { return interval + "h"; }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) { return interval + "m"; }
    return "now";
}


/**
 * Initializes the notification system.
 */
function initNotifications() {
    if (!notifIcon || !notifPanel) return;

    // 1. Initial Render
    renderNotifications();

    // 2. Event Listener for opening the panel
    notifIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from closing immediately
        notifPanel.classList.toggle('open');
    });

    // 3. Event Listener for closing the panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && !notifIcon.contains(e.target)) {
            notifPanel.classList.remove('open');
        }
    });
    
    // 4. Mark all as read button
    markAllReadBtn?.addEventListener('click', markAllAsRead);

    // 5. Re-render on page focus (e.g., in case of an external update, although our app is single-page)
    window.addEventListener('focus', renderNotifications);
    
    // 6. Hook into the global addNotification (Defined in app.js, calls renderNotifications here)
    window.GenZApp.renderNotifications = renderNotifications;
}

// Attach to global init (called in app.js)
document.addEventListener('DOMContentLoaded', initNotifications);
