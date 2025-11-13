/* ========== 
   GenZ Smart - comments.js
   Complete logic for the Comments Page, Moderation, and Real-time Replies.
========== */

// Ensure GenZApp is loaded for access to db, toast, etc.
const { db, currentUser, toast, addNotification, isAdmin, logEngagement } = window.GenZApp || {};

// Reference to the main comments container
const commentsFeed = document.getElementById('commentsFeed');
const postCommentBtn = document.getElementById('postCommentBtn');
const commentInput = document.getElementById('commentText');
const filterTabs = document.querySelectorAll('.filter-tab');

let currentFilter = 'all';

/**
 * Creates a Comment Card DOM element.
 * @param {Object} comment - The comment object from the database.
 * @param {boolean} isReply - True if the card represents a reply.
 * @returns {HTMLElement} The constructed comment card element.
 */
function createCommentCard(comment, isReply = false) {
    const card = document.createElement('div');
    card.className = `comment-card ${isReply ? 'comment-reply' : ''}`;
    card.setAttribute('data-id', comment.id);

    const userAvatarUrl = comment.user.avatar || 'assets/your-photo.jpg';

    card.innerHTML = `
        <div class="comment-avatar">
            <img src="${userAvatarUrl}" alt="${comment.user.name}'s Avatar">
        </div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">${comment.user.name}</span>
                <span class="comment-time" title="${new Date(comment.timestamp).toLocaleString()}">${timeSince(comment.timestamp)} ago</span>
                ${comment.status === 'moderated' ? '<span class="tag" style="background: var(--danger); color: white;">Moderated</span>' : ''}
                ${comment.user.isAdmin ? '<span class="tag" style="background: var(--purple); color: white;">Admin</span>' : ''}
            </div>
            <p class="comment-body">${comment.text.replace(/\n/g, '<br>')}</p>
            <div class="comment-card-actions">
                <button class="action-btn like-btn" data-comment-id="${comment.id}">
                    <i class="fas fa-heart"></i> <span class="like-count">${comment.likes || 0}</span>
                </button>
                <button class="action-btn reply-btn" data-comment-id="${comment.id}" data-parent-id="${comment.parentId || ''}">
                    <i class="fas fa-reply"></i> Reply
                </button>
                ${(comment.user.id === currentUser.id || isAdmin) ? `
                    <button class="action-btn delete-btn" data-comment-id="${comment.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
                ${isAdmin && comment.status !== 'moderated' ? `
                    <button class="action-btn moderate-btn" data-comment-id="${comment.id}">
                        <i class="fas fa-gavel"></i> Moderate
                    </button>
                ` : ''}
            </div>
            ${!isReply && comment.replies && comment.replies.length > 0 ? `
                <div class="comment-replies" data-parent-id="${comment.id}">
                    <div class="show-replies-toggle text-btn" data-toggle-id="${comment.id}">
                        <i class="fas fa-chevron-down"></i> Show ${comment.replies.length} Replies
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Handle button clicks
    card.querySelectorAll('.like-btn').forEach(btn => btn.addEventListener('click', handleLikeComment));
    card.querySelectorAll('.reply-btn').forEach(btn => btn.addEventListener('click', handleReplyModal));
    card.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDeleteComment));
    card.querySelectorAll('.moderate-btn').forEach(btn => btn.addEventListener('click', handleModerateComment));

    if (!isReply) {
        // Handle reply section toggle
        const repliesContainer = card.querySelector('.comment-replies');
        if (repliesContainer) {
            const toggleBtn = card.querySelector('.show-replies-toggle');
            toggleBtn.addEventListener('click', () => {
                toggleReplies(comment, repliesContainer, toggleBtn);
            });
        }
    }

    return card;
}

/**
 * Toggles the visibility and content of replies for a parent comment.
 */
function toggleReplies(parentComment, repliesContainer, toggleBtn) {
    if (repliesContainer.classList.contains('active')) {
        // Hide replies
        repliesContainer.classList.remove('active');
        // Remove all reply cards (except the toggle button)
        Array.from(repliesContainer.children).forEach(child => {
            if (!child.classList.contains('show-replies-toggle')) {
                child.remove();
            }
        });
        toggleBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${parentComment.replies.length} Replies`;
    } else {
        // Show replies
        parentComment.replies.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        parentComment.replies.forEach(reply => {
            const replyCard = createCommentCard(reply, true);
            repliesContainer.appendChild(replyCard);
        });
        repliesContainer.classList.add('active');
        toggleBtn.innerHTML = `<i class="fas fa-chevron-up"></i> Hide Replies`;
    }
}


/**
 * Renders the full comments feed based on the current filter.
 */
function renderCommentsFeed(filter = currentFilter) {
    if (!commentsFeed) return;
    commentsFeed.innerHTML = '';
    
    // Fetch comments and structure them with replies
    let allComments = db.comments.filter(c => filter === 'all' || (filter === 'moderated' && c.status === 'moderated') || (filter === 'pending' && c.status === 'pending'));

    // Separate top-level comments and replies
    const topLevelComments = allComments
        .filter(c => !c.parentId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

    const repliesMap = allComments
        .filter(c => c.parentId)
        .reduce((map, reply) => {
            map[reply.parentId] = map[reply.parentId] || [];
            map[reply.parentId].push(reply);
            return map;
        }, {});

    // Attach replies to their parent comments
    const structuredComments = topLevelComments.map(comment => ({
        ...comment,
        replies: repliesMap[comment.id] || []
    }));
    
    // Render
    if (structuredComments.length === 0) {
        commentsFeed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>No comments found for this filter.</p>
                <p>Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }

    structuredComments.forEach(comment => {
        const card = createCommentCard(comment);
        commentsFeed.appendChild(card);
    });
    
    // Update stats
    updateCommentStats();
}

/**
 * Handles posting a new comment or a reply.
 * @param {string} text - The comment text.
 * @param {string} parentId - The ID of the parent comment (if it's a reply).
 */
function postComment(text, parentId = null) {
    if (!text.trim()) {
        toast('Comment cannot be empty.', 'error');
        return;
    }

    const newComment = {
        id: `c${Date.now()}`,
        parentId: parentId,
        user: { 
            id: currentUser.id, 
            name: currentUser.name, 
            avatar: currentUser.avatar,
            isAdmin: currentUser.isAdmin
        },
        text: text.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
        status: isAdmin ? 'approved' : 'pending' // Admin comments bypass moderation
    };

    db.comments.push(newComment);
    localStorage.setItem('GenZDb', JSON.stringify(db));
    
    // Clear input
    if (parentId) {
        document.getElementById('replyModal').style.display = 'none';
        document.getElementById('replyText').value = '';
    } else {
        commentInput.value = '';
    }

    // Logging engagement
    logEngagement('comment_posted', { id: newComment.id, parentId: newComment.parentId });

    // Send a notification to the admin/moderator if pending
    if (newComment.status === 'pending') {
         addNotification({
            type: 'moderation',
            message: `A new comment by ${newComment.user.name} is awaiting moderation.`,
            timestamp: new Date().toISOString(),
            link: '/admin.html?tab=moderation',
            icon: 'fas fa-gavel'
        }, 'admin');
        toast('Comment posted. Awaiting moderation.', 'warning');
    } else {
        toast('Comment posted successfully!', 'success');
    }

    renderCommentsFeed();
}

/**
 * Handles the Like button click.
 */
function handleLikeComment(e) {
    const btn = e.currentTarget;
    const commentId = btn.getAttribute('data-comment-id');
    const comment = db.comments.find(c => c.id === commentId);

    if (comment) {
        if (!btn.classList.contains('liked')) {
            comment.likes = (comment.likes || 0) + 1;
            btn.classList.add('liked');
            toast('Liked comment!', 'info');
        } else {
            comment.likes = Math.max(0, (comment.likes || 0) - 1);
            btn.classList.remove('liked');
            toast('Unliked comment.', 'info');
        }
        
        btn.querySelector('.like-count').textContent = comment.likes;
        localStorage.setItem('GenZDb', JSON.stringify(db));
        logEngagement('comment_liked', { id: comment.id });
    }
}

/**
 * Opens the reply modal.
 */
function handleReplyModal(e) {
    const commentId = e.currentTarget.getAttribute('data-comment-id');
    const parentId = e.currentTarget.getAttribute('data-parent-id');
    const targetCommentId = parentId || commentId; // The ID of the top-level comment we are replying to

    const comment = db.comments.find(c => c.id === commentId);

    if (comment) {
        const modal = document.getElementById('replyModal');
        const originalCommentEl = document.getElementById('originalCommentText');
        
        originalCommentEl.innerHTML = `<i class="fas fa-quote-left"></i> Replying to <b>${comment.user.name}</b>: "${comment.text.substring(0, 50)}..."`;
        modal.setAttribute('data-parent-id', targetCommentId);
        modal.style.display = 'flex';
    }
}

/**
 * Handles deleting a comment (soft delete/hide for users, permanent for admin).
 */
function handleDeleteComment(e) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const commentId = e.currentTarget.getAttribute('data-comment-id');
    const index = db.comments.findIndex(c => c.id === commentId);

    if (index !== -1) {
        if (isAdmin) {
            // Admin can permanently delete
            db.comments.splice(index, 1);
            toast('Comment permanently deleted (Admin).', 'danger');
        } else {
            // Standard user delete: hide it
            db.comments[index].status = 'deleted'; 
            toast('Comment deleted.', 'success');
        }
        localStorage.setItem('GenZDb', JSON.stringify(db));
        renderCommentsFeed();
    }
}

/**
 * Handles moderating/flagging a comment. (Admin only visible).
 */
function handleModerateComment(e) {
    if (!isAdmin) return;
    
    if (!confirm("Are you sure you want to flag and moderate this comment?")) return;

    const commentId = e.currentTarget.getAttribute('data-comment-id');
    const comment = db.comments.find(c => c.id === commentId);

    if (comment) {
        comment.status = 'moderated';
        localStorage.setItem('GenZDb', JSON.stringify(db));
        toast(`Comment ${commentId} flagged and moderated.`, 'warning');
        renderCommentsFeed();
    }
}


/**
 * Updates the comment statistics displayed at the top of the page.
 */
function updateCommentStats() {
    const totalComments = db.comments.length;
    const pendingCount = db.comments.filter(c => c.status === 'pending').length;
    const approvedCount = db.comments.filter(c => c.status === 'approved').length;
    
    document.getElementById('totalComments').textContent = totalComments;
    document.getElementById('pendingComments').textContent = pendingCount;
    document.getElementById('approvedComments').textContent = approvedCount;

    // Show pending stats only to admin
    const pendingStats = document.querySelector('.pending-stat-item');
    if (pendingStats) {
        pendingStats.style.display = isAdmin ? 'flex' : 'none';
    }
}

/**
 * Utility function to calculate time since an event.
 */
function timeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) { return interval + " years"; }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) { return interval + " months"; }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) { return interval + " days"; }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) { return interval + " hours"; }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) { return interval + " minutes"; }
    return "just now";
}

/**
 * Initialization function for the comments page.
 */
function initCommentsPage() {
    if (!commentsFeed) return; // Not on the comments page

    // 1. Initial Render
    renderCommentsFeed();

    // 2. Event Listeners for Posting
    postCommentBtn?.addEventListener('click', () => {
        postComment(commentInput.value);
    });

    // Handle Enter/Shift+Enter in quick comment box
    commentInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postComment(commentInput.value);
        }
    });
    
    // 3. Event Listeners for Filters
    filterTabs.forEach(tab => {
        if (tab.getAttribute('data-filter') === 'moderated' && !isAdmin) {
             tab.style.display = 'none'; // Hide moderation tab for non-admins
             return;
        }

        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderCommentsFeed(currentFilter);
        });
    });

    // 4. Reply Modal Submission
    const replyModal = document.getElementById('replyModal');
    const replyPostBtn = document.getElementById('replyPostBtn');
    const replyCloseBtn = document.getElementById('replyCloseBtn');
    
    replyPostBtn?.addEventListener('click', () => {
        const parentId = replyModal.getAttribute('data-parent-id');
        const replyText = document.getElementById('replyText').value;
        postComment(replyText, parentId);
    });
    
    replyCloseBtn?.addEventListener('click', () => {
        replyModal.style.display = 'none';
    });
    
    replyModal?.addEventListener('click', (e) => {
        if (e.target === replyModal) {
            replyModal.style.display = 'none';
        }
    });

    // 5. Initial Filter state for admin
    if (isAdmin) {
        document.querySelector('[data-filter="moderated"]').style.display = 'inline-flex';
    } else {
        document.querySelector('[data-filter="moderated"]')?.style.display = 'none';
    }
}

// Attach to global init (called in app.js)
document.addEventListener('commentsPageLoaded', initCommentsPage);
