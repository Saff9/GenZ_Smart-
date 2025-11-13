/* ========== 
   GenZ Smart - admin.js
   Logic for the Admin Dashboard: Content Management, User Management, and Moderation.
========== */

// Ensure GenZApp is loaded for access to db, toast, currentUser, isAdmin, etc.
const { db, toast, currentUser, isAdmin } = window.GenZApp || {};

// DOM Elements
const adminPage = document.getElementById('adminPage');
const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
const adminContentSections = document.querySelectorAll('.admin-content-section');
const userListContainer = document.getElementById('userListContainer');
const moderationListContainer = document.getElementById('moderationListContainer');
const postManagementList = document.getElementById('postManagementList');

let currentAdminTab = 'users';

/**
 * Renders the list of users for management.
 */
function renderUserManagement() {
    if (!userListContainer) return;
    userListContainer.innerHTML = '';
    
    if (db.users.length === 0) {
        userListContainer.innerHTML = '<div class="empty-state-small"><p>No users found.</p></div>';
        return;
    }

    db.users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'admin-list-item user-item';
        userItem.innerHTML = `
            <div class="user-info">
                <img src="${user.avatar || 'assets/your-photo.jpg'}" alt="Avatar">
                <div>
                    <span class="user-name">${user.name}</span>
                    <span class="user-id">ID: ${user.id}</span>
                </div>
            </div>
            <div class="user-actions">
                <span class="tag ${user.isAdmin ? 'tag-purple' : 'tag-secondary'}">${user.isAdmin ? 'Admin' : 'User'}</span>
                <button class="action-btn toggle-admin-btn" data-user-id="${user.id}" ${user.id === currentUser.id ? 'disabled' : ''}>
                    <i class="fas fa-user-shield"></i> ${user.isAdmin ? 'Demote' : 'Promote'}
                </button>
                <button class="action-btn delete-user-btn action-danger" data-user-id="${user.id}" ${user.id === currentUser.id ? 'disabled' : ''}>
                    <i class="fas fa-user-slash"></i> Delete
                </button>
            </div>
        `;
        
        userItem.querySelector('.toggle-admin-btn')?.addEventListener('click', handleToggleAdmin);
        userItem.querySelector('.delete-user-btn')?.addEventListener('click', handleDeleteUser);
        
        userListContainer.appendChild(userItem);
    });
}

/**
 * Handles toggling a user's admin status.
 */
function handleToggleAdmin(e) {
    const userId = e.currentTarget.getAttribute('data-user-id');
    const user = db.users.find(u => u.id === userId);

    if (user && userId !== currentUser.id && confirm(`Are you sure you want to ${user.isAdmin ? 'DEMOTE' : 'PROMOTE'} ${user.name}?`)) {
        user.isAdmin = !user.isAdmin;
        localStorage.setItem('GenZDb', JSON.stringify(db));
        toast(`${user.name} is now a ${user.isAdmin ? 'Global Admin' : 'Standard User'}.`, 'info');
        renderUserManagement();
        // Re-run app init to update global isAdmin status if necessary (though it won't affect the current user's session without reload, it updates the DB)
    }
}

/**
 * Handles deleting a user.
 */
function handleDeleteUser(e) {
    const userId = e.currentTarget.getAttribute('data-user-id');
    const index = db.users.findIndex(u => u.id === userId);

    if (index !== -1 && userId !== currentUser.id && confirm(`WARNING: This will permanently delete user ${db.users[index].name} and all associated data. Continue?`)) {
        db.users.splice(index, 1);
        // Also delete their comments
        db.comments = db.comments.filter(c => c.user.id !== userId);
        
        localStorage.setItem('GenZDb', JSON.stringify(db));
        toast('User permanently deleted.', 'danger');
        renderUserManagement();
    }
}


/**
 * Renders the list of comments awaiting moderation (status === 'pending').
 */
function renderModerationQueue() {
    if (!moderationListContainer) return;
    moderationListContainer.innerHTML = '';

    const pendingComments = db.comments.filter(c => c.status === 'pending');
    
    if (pendingComments.length === 0) {
        moderationListContainer.innerHTML = '<div class="empty-state-small"><p>The moderation queue is clear. Good job!</p></div>';
        return;
    }

    pendingComments.forEach(comment => {
        const item = document.createElement('div');
        item.className = 'admin-list-item comment-moderation-item';
        item.setAttribute('data-id', comment.id);

        const commentTextSnippet = comment.text.length > 100 ? comment.text.substring(0, 100) + '...' : comment.text;

        item.innerHTML = `
            <div class="comment-content-moderation">
                <span class="comment-author">${comment.user.name} <span class="text-muted">(${comment.user.id})</span></span>
                <p class="comment-body">${commentTextSnippet}</p>
                <span class="comment-time">${new Date(comment.timestamp).toLocaleString()}</span>
            </div>
            <div class="moderation-actions">
                <button class="action-btn action-success approve-comment-btn" data-comment-id="${comment.id}">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="action-btn action-danger reject-comment-btn" data-comment-id="${comment.id}">
                    <i class="fas fa-times"></i> Reject/Delete
                </button>
            </div>
        `;
        
        item.querySelector('.approve-comment-btn').addEventListener('click', handleModerateAction('approved'));
        item.querySelector('.reject-comment-btn').addEventListener('click', handleModerateAction('deleted'));

        moderationListContainer.appendChild(item);
    });
}

/**
 * Higher-order function to handle comment moderation actions.
 * @param {string} newStatus - The new status ('approved' or 'deleted').
 */
function handleModerateAction(newStatus) {
    return (e) => {
        const commentId = e.currentTarget.getAttribute('data-comment-id');
        const index = db.comments.findIndex(c => c.id === commentId);

        if (index !== -1) {
            const comment = db.comments[index];
            if (newStatus === 'deleted' && !confirm(`Are you sure you want to delete this comment by ${comment.user.name}?`)) {
                return;
            }

            if (newStatus === 'deleted') {
                db.comments.splice(index, 1); // Permanent delete
                toast('Comment rejected and deleted.', 'danger');
            } else {
                comment.status = newStatus;
                toast('Comment approved successfully.', 'success');
            }
            
            localStorage.setItem('GenZDb', JSON.stringify(db));
            
            // Re-render moderation list
            renderModerationQueue();
            
            // Re-render main comments feed if we were on that page (via the global event hook)
            document.dispatchEvent(new Event('commentsPageLoaded')); 
        }
    };
}


/**
 * Renders the list of posts for content management.
 */
function renderPostManagement() {
    if (!postManagementList) return;
    postManagementList.innerHTML = '';
    
    if (db.posts.length === 0) {
        postManagementList.innerHTML = '<div class="empty-state-small"><p>No posts found. Add a new one!</p></div>';
        return;
    }
    
    // Sort posts by creation time, newest first
    db.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    db.posts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'admin-list-item post-item';
        
        item.innerHTML = `
            <div class="post-info">
                <span class="post-title">${post.title}</span>
                <span class="post-details">
                    By: ${post.author} | Views: ${post.views} | Status: <span class="tag ${post.status === 'draft' ? 'tag-danger' : 'tag-success'}">${post.status}</span>
                </span>
            </div>
            <div class="post-actions">
                <button class="action-btn action-success edit-post-btn" data-post-id="${post.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn action-danger delete-post-btn" data-post-id="${post.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Note: Actual editing/creation would involve a modal or separate page. 
        // Here we just mock the buttons.
        item.querySelector('.edit-post-btn').addEventListener('click', () => toast(`Editing post: ${post.title}`, 'info'));
        item.querySelector('.delete-post-btn').addEventListener('click', handleDeletePost);

        postManagementList.appendChild(item);
    });
}

/**
 * Handles deleting a blog post.
 */
function handleDeletePost(e) {
    const postId = e.currentTarget.getAttribute('data-post-id');
    const index = db.posts.findIndex(p => p.id === postId);

    if (index !== -1 && confirm(`Are you sure you want to permanently delete the post: ${db.posts[index].title}?`)) {
        db.posts.splice(index, 1);
        localStorage.setItem('GenZDb', JSON.stringify(db));
        toast('Post permanently deleted.', 'danger');
        renderPostManagement();
        // Trigger a re-render of the main blog feed
        document.dispatchEvent(new Event('blogPageLoaded'));
    }
}


/**
 * Handles the navigation between admin tabs.
 */
function handleAdminNav(e) {
    const target = e.target.closest('.admin-nav-btn');
    if (!target) return;
    
    adminNavBtns.forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
    
    currentAdminTab = target.getAttribute('data-tab');
    
    adminContentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${currentAdminTab}Management`) {
            section.classList.add('active');
        }
    });

    // Re-render content for the active tab
    if (currentAdminTab === 'users') renderUserManagement();
    if (currentAdminTab === 'moderation') renderModerationQueue();
    if (currentAdminTab === 'content') renderPostManagement();
}

/**
 * Initializes the admin page functionality.
 */
function initAdminPage() {
    if (!adminPage) return; // Not on admin page

    // 1. Authorization Check
    if (!isAdmin) {
         adminPage.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <p>Access Denied.</p>
                <p>The Admin Dashboard is only accessible to Administrators.</p>
            </div>
        `;
        return;
    }
    
    // 2. Initial Render (Default tab: Users)
    renderUserManagement();
    
    // 3. Event Listeners for Navigation
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', handleAdminNav);
    });

    // 4. Handle URL tab parameter (e.g., /admin.html?tab=moderation)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');

    if (tabParam) {
        const targetBtn = document.querySelector(`.admin-nav-btn[data-tab="${tabParam}"]`);
        if (targetBtn) {
            targetBtn.click(); // Simulate a click to switch to the tab
        }
    }
}

// Attach to global init (called in app.js)
document.addEventListener('adminPageLoaded', initAdminPage);
