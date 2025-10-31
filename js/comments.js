// Basic comments system
class CommentsSystem {
    constructor() {
        this.comments = [];
        this.init();
    }

    async init() {
        await this.loadComments();
        this.initEventListeners();
    }

    async loadComments() {
        this.comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
        this.renderComments();
    }

    initEventListeners() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        }
    }

    async handleCommentSubmit(e) {
        e.preventDefault();
        
        const content = e.target.querySelector('#commentContent').value.trim();
        const author = e.target.querySelector('#commentAuthor').value.trim() || 'Anonymous';

        if (!content) {
            alert('Please enter a comment');
            return;
        }

        const commentData = {
            id: 'comment_' + Date.now(),
            content: content,
            author: author,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        await this.saveComment(commentData);
        e.target.reset();
        this.showToast('Comment posted!');
    }

    async saveComment(commentData) {
        const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
        comments.unshift(commentData);
        localStorage.setItem('genz_comments', JSON.stringify(comments));
        await this.loadComments();
    }

    renderComments() {
        const container = document.getElementById('commentsFeed');
        if (!container) return;

        container.innerHTML = this.comments.map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <strong>${comment.author}</strong>
                    <span>${new Date(comment.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
    }

    showToast(message) {
        alert(message); // Simple fallback
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.commentsSystem = new CommentsSystem();
});
