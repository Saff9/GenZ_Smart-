// ========== GENZ SMART COMMENTS SYSTEM ==========
// Enhanced comments with real-time updates, moderation, and interactions

class CommentsSystem {
    constructor() {
        this.currentPostId = null;
        this.comments = [];
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.init();
    }

    async init() {
        await this.checkCurrentPage();
        this.initEventListeners();
        await this.loadComments();
        this.setupRealtimeUpdates();
    }

    async checkCurrentPage() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentPostId = urlParams.get('postId');
        
        if (!this.currentPostId && document.getElementById('commentsFeed')) {
            // On comments.html page, load all comments
            this.currentPostId = 'all';
        }
    }

    initEventListeners() {
        // Comment form submission
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        }

        // Comment search
        const searchInput = document.getElementById('commentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterComments(e.target.value));
        }

        // Comment sorting
        const sortSelect = document.getElementById('commentSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortComments(e.target.value));
        }

        // Moderation actions
        this.initModerationEvents();
    }

    async handleCommentSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const content = form.querySelector('#commentContent').value.trim();
        const author = form.querySelector('#commentAuthor').value.trim() || 'Anonymous';

        if (!content) {
            this.showToast('Please enter a comment', 'error');
            return;
        }

        try {
            const commentData = {
                content: content,
                author: author,
                postId: this.currentPostId,
                timestamp: new Date().toISOString(),
                likes: 0,
                status: 'approved',
                isAdmin: this.isAdmin
            };

            // In a real app, this would be a Firebase call
            await this.saveComment(commentData);
            
            form.reset();
            this.showToast('Comment posted successfully!', 'success');
            
            // Reload comments
            await this.loadComments();
            
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showToast('Failed to post comment', 'error');
        }
    }

    async saveComment(commentData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
                const newComment = {
                    id: 'comment_' + Date.now(),
                    ...commentData
                };
                comments.unshift(newComment);
                localStorage.setItem('genz_comments', JSON.stringify(comments));
                resolve(newComment);
            }, 500);
        });
    }

    async loadComments() {
        try {
            // Show loading state
            this.showLoadingState();

            // Simulate API call
            const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
            
            let filteredComments = comments;
            if (this.currentPostId && this.currentPostId !== 'all') {
                filteredComments = comments.filter(comment => comment.postId === this.currentPostId);
            }

            // Filter by status (for admin)
            if (!this.isAdmin) {
                filteredComments = filteredComments.filter(comment => comment.status === 'approved');
            }

            this.comments = filteredComments;
            this.renderComments();
            
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showToast('Failed to load comments', 'error');
        }
    }

    renderComments() {
        const commentsContainer = document.getElementById('commentsFeed');
        if (!commentsContainer) return;

        if (this.comments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No Comments Yet</h3>
                    <p>Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }

        commentsContainer.innerHTML = this.comments.map(comment => `
            <div class="comment-card ${comment.status === 'pending' ? 'pending' : ''}" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="author-avatar">
                            ${comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div class="author-info">
                            <strong>${comment.author}</strong>
                            ${comment.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                            <span class="comment-time">${this.formatTime(comment.timestamp)}</span>
                        </div>
                    </div>
                    ${this.isAdmin ? this.renderAdminControls(comment) : ''}
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                <div class="comment-actions">
                    <button class="action-btn like-btn" onclick="commentsSystem.likeComment('${comment.id}')">
                        <i class="fas fa-heart"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                    <button class="action-btn reply-btn" onclick="commentsSystem.showReplyForm('${comment.id}')">
                        <i class="fas fa-reply"></i>
                        Reply
                    </button>
                    ${this.isAdmin ? `
                        <button class="action-btn approve-btn" onclick="commentsSystem.moderateComment('${comment.id}', 'approved')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn reject-btn" onclick="commentsSystem.moderateComment('${comment.id}', 'rejected')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                ${comment.status === 'pending' ? '<div class="pending-badge">Awaiting Moderation</div>' : ''}
            </div>
        `).join('');

        this.updateCommentsStats();
    }

    renderAdminControls(comment) {
        return `
            <div class="comment-admin-controls">
                <select onchange="commentsSystem.moderateComment('${comment.id}', this.value)" class="moderation-select">
                    <option value="approved" ${comment.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="pending" ${comment.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="rejected" ${comment.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <button class="icon-btn danger" onclick="commentsSystem.deleteComment('${comment.id}')" title="Delete comment">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    async likeComment(commentId) {
        const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex !== -1) {
            comments[commentIndex].likes = (comments[commentIndex].likes || 0) + 1;
            localStorage.setItem('genz_comments', JSON.stringify(comments));
            
            await this.loadComments();
            this.showToast('Comment liked!', 'success');
        }
    }

    async moderateComment(commentId, status) {
        if (!this.isAdmin) {
            this.showToast('Admin access required', 'error');
            return;
        }

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
        if (!this.isAdmin) {
            this.showToast('Admin access required', 'error');
            return;
        }

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

    filterComments(searchTerm) {
        const filtered = this.comments.filter(comment => 
            comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredComments(filtered);
    }

    renderFilteredComments(filteredComments) {
        const commentsContainer = document.getElementById('commentsFeed');
        if (!commentsContainer) return;

        if (filteredComments.length === 0) {
            commentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Matching Comments</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        // Reuse the same rendering logic but with filtered comments
        const currentComments = this.comments;
        this.comments = filteredComments;
        this.renderComments();
        this.comments = currentComments;
    }

    sortComments(sortBy) {
        switch (sortBy) {
            case 'newest':
                this.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'oldest':
                this.comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'most_liked':
                this.comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
        }
        this.renderComments();
    }

    updateCommentsStats() {
        const totalComments = document.getElementById('totalComments');
        const pendingComments = document.getElementById('pendingComments');
        
        if (totalComments) {
            totalComments.textContent = this.comments.length;
        }
        
        if (pendingComments && this.isAdmin) {
            const pending = this.comments.filter(c => c.status === 'pending').length;
            pendingComments.textContent = pending;
            pendingComments.style.display = pending > 0 ? 'inline' : 'none';
        }
    }

    showLoadingState() {
        const commentsContainer = document.getElementById('commentsFeed');
        if (commentsContainer) {
            commentsContainer.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading comments...</p>
                </div>
            `;
        }
    }

    formatTime(timestamp) {
        const now = new Date();
        const commentTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return commentTime.toLocaleDateString();
    }

    showReplyForm(commentId) {
        // Implementation for reply functionality
        this.showToast('Reply feature coming soon!', 'info');
    }

    showToast(message, type = 'info') {
        // Use the existing toast system from app.js
        if (window.toast) {
            window.toast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }

    setupRealtimeUpdates() {
        // In a real app, this would set up Firebase listeners
        setInterval(() => {
            this.loadComments();
        }, 30000); // Refresh every 30 seconds
    }

    initModerationEvents() {
        // Additional moderation event listeners
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bulk-approve-btn')) {
                this.bulkModerate('approved');
            }
            if (e.target.closest('.bulk-reject-btn')) {
                this.bulkModerate('rejected');
            }
        });
    }

    async bulkModerate(status) {
        if (!this.isAdmin) return;
        
        const selectedComments = this.comments.filter(c => c.status === 'pending');
        if (selectedComments.length === 0) {
            this.showToast('No pending comments to moderate', 'info');
            return;
        }

        try {
            const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
            const updatedComments = comments.map(comment => {
                if (comment.status === 'pending') {
                    return { ...comment, status: status };
                }
                return comment;
            });
            
            localStorage.setItem('genz_comments', JSON.stringify(updatedComments));
            await this.loadComments();
            this.showToast(`Bulk ${status} completed`, 'success');
        } catch (error) {
            console.error('Error in bulk moderation:', error);
            this.showToast('Bulk moderation failed', 'error');
        }
    }
}

// Initialize comments system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commentsSystem = new CommentsSystem();
});
