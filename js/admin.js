// ========== GENZ SMART ADMIN PANEL ==========
class AdminPanel {
    constructor() {
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
        this.posts = [];
        this.init();
    }

    async init() {
        if (!this.isAdmin) {
            this.showToast('Admin access required', 'error');
            return;
        }

        await this.loadPosts();
        this.initEventListeners();
        this.initQuillEditor();
    }

    async loadPosts() {
        try {
            const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
            this.posts = posts;
            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    initEventListeners() {
        // New Post Button
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.toggleComposer());
        }

        // Close Composer
        const closeComposer = document.getElementById('closeComposer');
        if (closeComposer) {
            closeComposer.addEventListener('click', () => this.toggleComposer());
        }

        // Publish Post
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishPost());
        }

        // Category selection
        document.querySelectorAll('.category-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectCategory(e.target);
            });
        });
    }

    initQuillEditor() {
        const editorContainer = document.getElementById('editor-container');
        if (!editorContainer || typeof Quill === 'undefined') {
            console.warn('Quill editor not available');
            return;
        }

        try {
            this.quill = new Quill('#editor-container', {
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        ['link', 'blockquote'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                    ]
                },
                placeholder: 'Write your post content here...',
                theme: 'snow'
            });
        } catch (error) {
            console.error('Error initializing Quill:', error);
        }
    }

    toggleComposer() {
        const composer = document.getElementById('composer');
        if (!composer) return;

        if (composer.style.display === 'none' || !composer.style.display) {
            composer.style.display = 'block';
            // Reset form
            document.getElementById('composeTitle').value = '';
            document.getElementById('composeImage').value = '';
            if (this.quill) {
                this.quill.root.innerHTML = '';
            }
        } else {
            composer.style.display = 'none';
        }
    }

    selectCategory(element) {
        const options = document.querySelectorAll('.category-option');
        options.forEach(opt => opt.classList.remove('selected'));
        element.classList.add('selected');
    }

    async publishPost() {
        const title = document.getElementById('composeTitle').value.trim();
        const imageUrl = document.getElementById('composeImage').value.trim();
        const content = this.quill ? this.quill.root.innerHTML : '';
        const category = document.querySelector('.category-option.selected')?.dataset.category || 'thoughts';
        const isPinned = document.getElementById('pinPost')?.checked || false;

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
                likes: 0,
                views: 0,
                comments: 0
            };

            await this.savePost(postData);
            this.toggleComposer();
            await this.loadPosts();
            
            this.showToast('Post published successfully!', 'success');
            
        } catch (error) {
            console.error('Error publishing post:', error);
            this.showToast('Failed to publish post', 'error');
        }
    }

    async savePost(postData) {
        return new Promise((resolve) => {
            const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
            posts.unshift(postData);
            localStorage.setItem('genz_posts', JSON.stringify(posts));
            resolve(postData);
        });
    }

    renderPosts() {
        const postsContainer = document.getElementById('postsTable');
        if (!postsContainer) return;

        if (this.posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <p>No posts yet</p>
                </div>
            `;
            return;
        }

        // For admin table view
        const tableBody = postsContainer.querySelector('tbody');
        if (tableBody) {
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

    showToast(message, type = 'info') {
        // Use existing toast system or fallback
        if (window.toast) {
            window.toast(message, type);
        } else {
            alert(message); // Fallback
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
