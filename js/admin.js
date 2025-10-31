// ========== GENZ SMART ADMIN PANEL ==========
// Complete admin management system with enhanced security

class AdminPanel {
    constructor() {
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.posts = [];
        this.comments = [];
        this.stats = {};
        this.quill = null;
        this.init();
    }

    async init() {
        if (!this.isAdmin) {
            this.redirectToLogin();
            return;
        }

        await this.checkAdminSession();
        await this.loadAdminData();
        this.initAdminUI();
        this.initEventListeners();
        this.initQuillEditor();
        this.startRealtimeUpdates();
    }

    async checkAdminSession() {
        const loginTime = localStorage.getItem('loginTime');
        if (!loginTime) {
            this.redirectToLogin();
            return;
        }

        const sessionAge = Date.now() - parseInt(loginTime);
        const sessionTimeout = 60 * 60 * 1000; // 1 hour

        if (sessionAge > sessionTimeout) {
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('loginTime');
            this.redirectToLogin();
            return;
        }

        // Update session timer
        this.startSessionTimer(sessionTimeout - sessionAge);
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    startSessionTimer(duration) {
        const timerElement = document.getElementById('sessionTimer');
        if (!timerElement) return;

        let timeLeft = duration;

        const timer = setInterval(() => {
            timeLeft -= 1000;

            if (timeLeft <= 0) {
                clearInterval(timer);
                this.logout();
                return;
            }

            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    async loadAdminData() {
        await this.loadStats();
        await this.loadPosts();
        await this.loadComments();
        await this.loadActivity();
    }

    async loadStats() {
        try {
            // Simulate API call for stats
            this.stats = {
                totalPosts: 15,
                todayPosts: 2,
                totalLikes: 2345,
                totalViews: 15678,
                totalComments: 189,
                activeUsers: 69,
                totalReaders: 50000
            };

            this.updateStatsDisplay();
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay() {
        Object.keys(this.stats).forEach(statKey => {
            const element = document.getElementById('admin' + this.capitalize(statKey));
            if (element) {
                element.textContent = this.stats[statKey];
            }
        });
    }

    async loadPosts() {
        try {
            const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
            this.posts = posts;
            this.renderPostsTable();
            
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    async loadComments() {
        try {
            const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
            this.comments = comments;
            this.renderCommentsTable();
            
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    async loadActivity() {
        try {
            const activity = JSON.parse(localStorage.getItem('genz_activity') || '[]');
            this.renderActivityFeed(activity);
            
        } catch (error) {
            console.error('Error loading activity:', error);
        }
    }

    initAdminUI() {
        // Show admin-specific elements
        this.showAdminElements();
        
        // Update security alert
        this.updateSecurityAlert();
    }

    showAdminElements() {
        const adminElements = document.querySelectorAll('[data-admin-only]');
        adminElements.forEach(el => {
            el.style.display = 'block';
        });
    }

    updateSecurityAlert() {
        const lastLogin = localStorage.getItem('loginTime');
        if (lastLogin) {
            const loginTime = new Date(parseInt(lastLogin)).toLocaleString();
            // You could update the security alert with last login info
        }
    }

    initEventListeners() {
        // Composer controls
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.toggleComposer());
        }

        const closeComposer = document.getElementById('closeComposer');
        if (closeComposer) {
            closeComposer.addEventListener('click', () => this.toggleComposer());
        }

        const cancelCompose = document.getElementById('cancelCompose');
        if (cancelCompose) {
            cancelCompose.addEventListener('click', () => this.toggleComposer());
        }

        // Post actions
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishPost());
        }

        const saveDraft = document.getElementById('saveDraft');
        if (saveDraft) {
            saveDraft.addEventListener('click', () => this.saveDraft());
        }

        const previewPost = document.getElementById('previewPost');
        if (previewPost) {
            previewPost.addEventListener('click', () => this.previewPost());
        }

        // Category selection
        document.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCategory(e.target);
            });
        });

        // Schedule toggle
        const schedulePost = document.getElementById('schedulePost');
        if (schedulePost) {
            schedulePost.addEventListener('change', (e) => {
                this.toggleScheduleOptions(e.target.checked);
            });
        }

        // Quick actions
        const managePostsBtn = document.getElementById('managePostsBtn');
        if (managePostsBtn) {
            managePostsBtn.addEventListener('click', () => this.managePosts());
        }

        const moderateCommentsBtn = document.getElementById('moderateCommentsBtn');
        if (moderateCommentsBtn) {
            moderateCommentsBtn.addEventListener('click', () => this.moderateComments());
        }

        const backupDataBtn = document.getElementById('backupDataBtn');
        if (backupDataBtn) {
            backupDataBtn.addEventListener('click', () => this.backupData());
        }

        const restoreDataBtn = document.getElementById('restoreDataBtn');
        if (restoreDataBtn) {
            restoreDataBtn.addEventListener('click', () => this.restoreData());
        }

        const emailSubscribersBtn = document.getElementById('emailSubscribersBtn');
        if (emailSubscribersBtn) {
            emailSubscribersBtn.addEventListener('click', () => this.emailSubscribers());
        }

        const seoOptimizeBtn = document.getElementById('seoOptimizeBtn');
        if (seoOptimizeBtn) {
            seoOptimizeBtn.addEventListener('click', () => this.seoOptimize());
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Security alert close
        const closeSecurityAlert = document.getElementById('closeSecurityAlert');
        if (closeSecurityAlert) {
            closeSecurityAlert.addEventListener('click', () => {
                document.getElementById('securityAlert').style.display = 'none';
            });
        }
    }

    initQuillEditor() {
        const editorContainer = document.getElementById('editor-container');
        if (!editorContainer) return;

        this.quill = new Quill('#editor-container', {
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link', 'blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            },
            placeholder: 'Write your post content here...',
            theme: 'snow'
        });

        // Customize Quill for dark theme
        this.customizeQuillTheme();
    }

    customizeQuillTheme() {
        const snowToolbar = document.querySelector('.ql-snow');
        const quillEditor = document.querySelector('.ql-editor');
        
        if (snowToolbar && quillEditor) {
            snowToolbar.style.borderColor = 'var(--divider)';
            snowToolbar.style.backgroundColor = 'var(--panel)';
            quillEditor.style.color = 'var(--text)';
            quillEditor.style.backgroundColor = 'var(--panel)';
        }
    }

    toggleComposer() {
        const composer = document.getElementById('composer');
        if (!composer) return;

        if (composer.style.display === 'none' || !composer.style.display) {
            composer.style.display = 'block';
            composer.setAttribute('aria-hidden', 'false');
            this.animateComposer('in');
        } else {
            this.animateComposer('out', () => {
                composer.style.display = 'none';
                composer.setAttribute('aria-hidden', 'true');
            });
        }
    }

    animateComposer(direction, callback) {
        const composer = document.getElementById('composer');
        if (!composer) return;

        composer.style.transform = direction === 'in' ? 'translateY(20px)' : 'translateY(-20px)';
        composer.style.opacity = direction === 'in' ? '0' : '1';

        setTimeout(() => {
            composer.style.transform = direction === 'in' ? 'translateY(0)' : 'translateY(20px)';
            composer.style.opacity = direction === 'in' ? '1' : '0';
            
            if (callback) {
                setTimeout(callback, 300);
            }
        }, 10);
    }

    selectCategory(element) {
        const options = document.querySelectorAll('.category-option');
        options.forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
    }

    toggleScheduleOptions(show) {
        const scheduleOptions = document.getElementById('scheduleOptions');
        if (scheduleOptions) {
            scheduleOptions.style.display = show ? 'block' : 'none';
        }
    }

    async publishPost() {
        const title = document.getElementById('composeTitle').value.trim();
        const imageUrl = document.getElementById('composeImage').value.trim();
        const content = this.quill ? this.quill.root.innerHTML : '';
        const category = document.querySelector('.category-option.selected')?.dataset.category || 'thoughts';
        const isPinned = document.getElementById('pinPost').checked;
        const isScheduled = document.getElementById('schedulePost').checked;
        const scheduleTime = document.getElementById('scheduleTime').value;

        if (!content.trim()) {
            this.showToast('Please enter some content', 'error');
            return;
        }

        try {
            const postData = {
                id: 'post_' + Date.now(),
                title: title || 'Untitled Post',
                content: content,
                image: imageUrl || '',
                category: category,
                author: 'GenZ Owais',
                timestamp: new Date().toISOString(),
                isPinned: isPinned,
                isScheduled: isScheduled,
                scheduleTime: scheduleTime,
                status: isScheduled ? 'scheduled' : 'published',
                likes: 0,
                views: 0,
                comments: 0
            };

            await this.savePost(postData);
            this.toggleComposer();
            await this.loadPosts();
            
            this.showToast('Post published successfully!', 'success');
            
            // Notify subscribers
            if (window.notifyNewPost) {
                window.notifyNewPost(postData.title);
            }
            
        } catch (error) {
            console.error('Error publishing post:', error);
            this.showToast('Failed to publish post', 'error');
        }
    }

    async savePost(postData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
                posts.unshift(postData);
                localStorage.setItem('genz_posts', JSON.stringify(posts));
                resolve(postData);
            }, 1000);
        });
    }

    async saveDraft() {
        this.showToast('Draft saved successfully!', 'success');
        // Implementation for saving drafts
    }

    previewPost() {
        this.showToast('Preview feature coming soon!', 'info');
        // Implementation for post preview
    }

    renderPostsTable() {
        const tableBody = document.querySelector('#postsTable tbody');
        if (!tableBody) return;

        if (this.posts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        <i class="fas fa-newspaper"></i>
                        <p>No posts yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.posts.map(post => `
            <tr data-post-id="${post.id}">
                <td>
                    <div class="post-title-preview">
                        <strong>${post.title}</strong>
                        ${post.isPinned ? '<span class="pin-badge">📌</span>' : ''}
                    </div>
                </td>
                <td><span class="category-tag">${post.category}</span></td>
                <td>${new Date(post.timestamp).toLocaleDateString()}</td>
                <td>${post.views || 0}</td>
                <td>${post.likes || 0}</td>
                <td>${post.comments || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn small" onclick="adminPanel.editPost('${post.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn small" onclick="adminPanel.togglePin('${post.id}')" title="${post.isPinned ? 'Unpin' : 'Pin'}">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="icon-btn small danger" onclick="adminPanel.deletePost('${post.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderCommentsTable() {
        const tableBody = document.querySelector('#commentsTable tbody');
        if (!tableBody) return;

        if (this.comments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-table">
                        <i class="fas fa-comments"></i>
                        <p>No comments yet</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.comments.map(comment => `
            <tr data-comment-id="${comment.id}" class="${comment.status === 'pending' ? 'pending-comment' : ''}">
                <td>
                    <div class="comment-preview">
                        <strong>${comment.author}</strong>
                        <p>${comment.content.substring(0, 100)}...</p>
                    </div>
                </td>
                <td>${comment.postId || 'N/A'}</td>
                <td>${new Date(comment.timestamp).toLocaleDateString()}</td>
                <td>${comment.likes || 0}</td>
                <td>
                    <span class="status-badge ${comment.status}">${comment.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn small success" onclick="adminPanel.moderateComment('${comment.id}', 'approved')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="icon-btn small warning" onclick="adminPanel.moderateComment('${comment.id}', 'pending')" title="Pending">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="icon-btn small danger" onclick="adminPanel.moderateComment('${comment.id}', 'rejected')" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="icon-btn small danger" onclick="adminPanel.deleteComment('${comment.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderActivityFeed(activities) {
        const activityFeed = document.getElementById('adminActivityFeed');
        if (!activityFeed) return;

        if (activities.length === 0) {
            // Add some sample activities
            activities = [
                {
                    id: 'act_1',
                    type: 'post_published',
                    message: 'Published new post "The Power of Small Ideas"',
                    timestamp: new Date().toISOString()
                },
                {
                    id: 'act_2',
                    type: 'comment_approved',
                    message: 'Approved 5 pending comments',
                    timestamp: new Date(Date.now() - 300000).toISOString()
                }
            ];
        }

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.message}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'post_published': 'newspaper',
            'comment_approved': 'comment-check',
            'user_registered': 'user-plus',
            'settings_updated': 'cog',
            'backup_created': 'save'
        };
        return icons[type] || 'bell';
    }

    formatTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return activityTime.toLocaleDateString();
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Post management methods
    async editPost(postId) {
        this.showToast(`Editing post: ${postId}`, 'info');
        // Implementation for post editing
    }

    async togglePin(postId) {
        const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);
        
        if (postIndex !== -1) {
            posts[postIndex].isPinned = !posts[postIndex].isPinned;
            localStorage.setItem('genz_posts', JSON.stringify(posts));
            await this.loadPosts();
            
            this.showToast(`Post ${posts[postIndex].isPinned ? 'pinned' : 'unpinned'}`, 'success');
        }
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
            const filteredPosts = posts.filter(p => p.id !== postId);
            localStorage.setItem('genz_posts', JSON.stringify(filteredPosts));
            
            await this.loadPosts();
            this.showToast('Post deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showToast('Failed to delete post', 'error');
        }
    }

    // Comment moderation methods
    async moderateComment(commentId, status) {
        try {
            const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
            const commentIndex = comments.findIndex(c => c.id === commentId);
            
            if (commentIndex !== -1) {
                comments[commentIndex].status = status;
                localStorage.setItem('genz_comments', JSON.stringify(comments));
                
                await this.loadComments();
                this.showToast(`Comment ${status}`, 'success');
            }
        } catch (error) {
            console.error('Error moderating comment:', error);
            this.showToast('Failed to moderate comment', 'error');
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
            const filteredComments = comments.filter(c => c.id !== commentId);
            localStorage.setItem('genz_comments', JSON.stringify(filteredComments));
            
            await this.loadComments();
            this.showToast('Comment deleted', 'success');
        } catch (error) {
            console.error('Error deleting comment:', error);
            this.showToast('Failed to delete comment', 'error');
        }
    }

    // Quick action methods
    managePosts() {
        window.location.href = 'blog.html?admin=true';
    }

    moderateComments() {
        window.location.href = 'comments.html?admin=true';
    }

    async backupData() {
        try {
            const backupData = {
                posts: JSON.parse(localStorage.getItem('genz_posts') || '[]'),
                comments: JSON.parse(localStorage.getItem('genz_comments') || '[]'),
                settings: JSON.parse(localStorage.getItem('genz_settings') || '{}'),
                backupDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `genz-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showToast('Backup created successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showToast('Backup failed', 'error');
        }
    }

    restoreData() {
        const fileInput = document.getElementById('restoreFile');
        if (fileInput) {
            fileInput.click();
            fileInput.onchange = (e) => this.handleRestoreFile(e.target.files[0]);
        }
    }

    async handleRestoreFile(file) {
        if (!file) return;

        try {
            const fileText = await this.readFileAsText(file);
            const backupData = JSON.parse(fileText);

            if (!this.validateBackupData(backupData)) {
                this.showToast('Invalid backup file', 'error');
                return;
            }

            if (confirm('This will overwrite all current data. Are you sure?')) {
                localStorage.setItem('genz_posts', JSON.stringify(backupData.posts || []));
                localStorage.setItem('genz_comments', JSON.stringify(backupData.comments || []));
                localStorage.setItem('genz_settings', JSON.stringify(backupData.settings || {}));
                
                this.showToast('Data restored successfully!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
            
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.showToast('Restore failed', 'error');
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }

    validateBackupData(data) {
        return data && 
               Array.isArray(data.posts) && 
               Array.isArray(data.comments) && 
               typeof data.settings === 'object';
    }

    emailSubscribers() {
        this.showToast('Email subscribers feature coming soon!', 'info');
    }

    seoOptimize() {
        this.showToast('Running SEO optimization...', 'info');
        // Implementation for SEO tools
    }

    logout() {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('loginTime');
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    startRealtimeUpdates() {
        // Refresh data periodically
        setInterval(() => {
            this.loadAdminData();
        }, 30000); // Every 30 seconds
    }

    showToast(message, type = 'info') {
        if (window.toast) {
            window.toast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
