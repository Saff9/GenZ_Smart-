// ========== GENZ SMART APP.JS ==========
// Complete initialization with error handling

// ========== FIREBASE CONFIGURATION ==========
const firebaseConfig = {
    apiKey: "AIzaSyBZTAhJne3gOVwBrZ_NHQFo0ubWR8HzNL8",
    authDomain: "sample-firebase-ai-app-d0a89.firebaseapp.com",
    projectId: "sample-firebase-ai-app-d0a89",
    storageBucket: "sample-firebase-ai-app-d0a89.firebasestorage.app",
    messagingSenderId: "537274583564",
    appId: "1:537274583564:web:44ea454c2abed7d9a4bc29"
};

// ========== GLOBAL STATE ==========
let isAdmin = false;
let currentPage = getCurrentPage();

// ========== CORE INITIALIZATION ==========
async function initApp() {
    console.log('🚀 Initializing GenZ Smart App...');
    
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Check admin status
        await checkAdminStatus();
        
        // Load user preferences
        loadUserPreferences();
        
        // Apply theme
        applyTheme(localStorage.siteTheme || 'dark');
        
        // Initialize common features
        initCommonFeatures();
        
        // Load initial data
        await loadInitialData();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showToast('Failed to initialize app. Some features may not work.', 'error');
    } finally {
        // Hide loading screen
        hideLoadingScreen();
    }
}

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('blog.html')) return 'blog';
    if (path.includes('about.html')) return 'about';
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('analytics.html')) return 'analytics';
    if (path.includes('comments.html')) return 'comments';
    if (path.includes('settings.html')) return 'settings';
    return 'home';
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

async function checkAdminStatus() {
    const savedAdmin = localStorage.getItem('isAdmin');
    const loginTime = localStorage.getItem('loginTime');
    
    if (savedAdmin === 'true' && loginTime) {
        const now = Date.now();
        const sessionAge = now - parseInt(loginTime);
        const sessionTimeout = 60 * 60 * 1000; // 1 hour
        
        if (sessionAge < sessionTimeout) {
            isAdmin = true;
            updateAdminUI();
            console.log('✅ Admin session active');
        } else {
            // Session expired
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('loginTime');
            console.log('❌ Admin session expired');
        }
    }
}

function loadUserPreferences() {
    // Load theme
    const savedTheme = localStorage.getItem('siteTheme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
    
    // Load other preferences
    const settings = JSON.parse(localStorage.getItem('genz_settings') || '{}');
    if (settings.fontSize) {
        document.documentElement.style.fontSize = settings.fontSize;
    }
}

function applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    if (theme === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    localStorage.setItem('siteTheme', theme);
}

function initCommonFeatures() {
    initClock();
    initThemeToggle();
    initMenu();
    initLoginSystem();
    initNavigation();
    initOnlineStatus();
}

function initClock() {
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update all clock elements
        const timeElements = document.querySelectorAll('.clock-time');
        const dateElements = document.querySelectorAll('.clock-date');
        
        timeElements.forEach(el => {
            if (el) el.textContent = time;
        });
        dateElements.forEach(el => {
            if (el) el.textContent = date;
        });
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = localStorage.siteTheme || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
}

function initMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawer = document.getElementById('drawer');

    function openDrawer() {
        if (drawer) {
            drawer.style.left = '0';
            if (drawerBackdrop) drawerBackdrop.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDrawerMenu() {
        if (drawer) drawer.style.left = '-100%';
        if (drawerBackdrop) drawerBackdrop.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', openDrawer);
    }

    if (closeDrawer) {
        closeDrawer.addEventListener('click', closeDrawerMenu);
    }

    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', closeDrawerMenu);
    }

    // Close drawer with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawerMenu();
        }
    });
}

function initLoginSystem() {
    const openLogin = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const loginCancel = document.getElementById('loginCancel');
    const loginForm = document.getElementById('loginForm');

    // Open login modal
    if (openLogin && loginModal) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close login modal
    if (loginCancel && loginModal) {
        loginCancel.addEventListener('click', () => {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogout = document.getElementById('drawerLogout');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (drawerLogout) drawerLogout.addEventListener('click', logout);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginSubmit = document.getElementById('loginSubmit');
    
    if (!loginEmail || !loginPassword) return;
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    // Simple validation
    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }
    
    // Show loading state
    if (loginSubmit) {
        loginSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        loginSubmit.disabled = true;
    }
    
    try {
        // Simulate authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check credentials (in real app, this would be server-side)
        if (email === 'saffanakbar942@gmail.com' && password === 'saffan942') {
            // Successful login
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            
            updateAdminUI();
            closeLoginModal();
            showToast('Welcome back, Admin! 👋', 'success');
            
            // Refresh if on admin page
            if (currentPage === 'admin') {
                setTimeout(() => window.location.reload(), 500);
            }
        } else {
            showToast('Invalid email or password', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed', 'error');
    } finally {
        // Reset button
        if (loginSubmit) {
            loginSubmit.innerHTML = 'Sign In';
            loginSubmit.disabled = false;
        }
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function logout() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('loginTime');
    updateAdminUI();
    showToast('Logged out successfully', 'success');
    
    if (currentPage === 'admin') {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function updateAdminUI() {
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const composeQuickLink = document.getElementById('composeQuickLink');
    
    if (isAdmin) {
        if (adminNavLink) adminNavLink.style.display = 'flex';
        if (adminDrawerLink) adminDrawerLink.style.display = 'block';
        if (drawerLogout) drawerLogout.style.display = 'block';
        if (openLogin) openLogin.style.display = 'none';
        if (composeQuickLink) composeQuickLink.style.display = 'flex';
    } else {
        if (adminNavLink) adminNavLink.style.display = 'none';
        if (adminDrawerLink) adminDrawerLink.style.display = 'none';
        if (drawerLogout) drawerLogout.style.display = 'none';
        if (openLogin) openLogin.style.display = 'block';
        if (composeQuickLink) composeQuickLink.style.display = 'none';
    }
}

function initNavigation() {
    // Update active nav link based on current page
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if ((currentPage === 'home' && href === 'index.html') ||
            (currentPage === 'blog' && href === 'blog.html') ||
            (currentPage === 'about' && href === 'about.html') ||
            (currentPage === 'admin' && href === 'admin.html') ||
            (currentPage === 'analytics' && href === 'analytics.html') ||
            (currentPage === 'comments' && href === 'comments.html') ||
            (currentPage === 'settings' && href === 'settings.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initOnlineStatus() {
    const onlineStatus = document.getElementById('onlineStatus');
    const offlineIndicator = document.getElementById('offlineIndicator');
    
    function updateOnlineStatus() {
        if (navigator.onLine) {
            if (onlineStatus) onlineStatus.style.display = 'flex';
            if (offlineIndicator) offlineIndicator.style.display = 'none';
        } else {
            if (onlineStatus) onlineStatus.style.display = 'none';
            if (offlineIndicator) offlineIndicator.style.display = 'flex';
            showToast('You are currently offline', 'warning');
        }
    }
    
    // Initial check
    updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

async function loadInitialData() {
    try {
        // Load posts for home page
        if (currentPage === 'home' || currentPage === 'blog') {
            await loadPosts();
        }
        
        // Update stats
        updateStats();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

async function loadPosts() {
    try {
        const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
        
        // If no posts exist, create sample posts
        if (posts.length === 0) {
            await createSamplePosts();
            return;
        }
        
        // Render posts based on current page
        if (currentPage === 'home') {
            renderHomePosts(posts);
        } else if (currentPage === 'blog') {
            renderAllPosts(posts);
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

async function createSamplePosts() {
    const samplePosts = [
        {
            id: 'post_1',
            title: 'Welcome to GenZ Smart!',
            content: 'This is the beginning of our amazing community. Share your ideas, thoughts, and connect with like-minded people.',
            category: 'thoughts',
            author: 'GenZ Owais',
            timestamp: new Date().toISOString(),
            likes: 15,
            views: 120,
            comments: 8,
            isPinned: true
        },
        {
            id: 'post_2',
            title: 'The Power of Small Ideas',
            content: 'Great things often start as small ideas. Never underestimate the potential of your thoughts and creativity.',
            category: 'ideas',
            author: 'GenZ Owais',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            likes: 23,
            views: 156,
            comments: 12
        }
    ];
    
    localStorage.setItem('genz_posts', JSON.stringify(samplePosts));
    return samplePosts;
}

function renderHomePosts(posts) {
    const homeFeed = document.getElementById('homeFeed');
    const pinnedPostContainer = document.getElementById('pinnedPostContainer');
    
    if (!homeFeed) return;
    
    // Find pinned post
    const pinnedPost = posts.find(post => post.isPinned);
    if (pinnedPost && pinnedPostContainer) {
        renderPinnedPost(pinnedPost);
    }
    
    // Show recent posts (max 6, excluding pinned)
    const recentPosts = posts
        .filter(post => !post.isPinned)
        .slice(0, 6);
    
    if (recentPosts.length === 0) {
        homeFeed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet</p>
                <small>Be the first to share your thoughts!</small>
            </div>
        `;
        return;
    }
    
    homeFeed.innerHTML = recentPosts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-head">
                <div class="post-avatar">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div class="post-meta">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${formatTime(post.timestamp)}</div>
                </div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <div class="post-body">
                ${post.content}
            </div>
            <div class="post-actions">
                <button class="action-btn" onclick="likePost('${post.id}')">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes || 0}</span>
                </button>
                <button class="action-btn" onclick="showPost('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments || 0}</span>
                </button>
                <button class="action-btn" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
            <div class="post-tags">
                <span class="tag">${post.category}</span>
            </div>
        </div>
    `).join('');
}

function renderPinnedPost(post) {
    const pinnedPost = document.getElementById('pinnedPost');
    if (!pinnedPost) return;
    
    pinnedPost.innerHTML = `
        <div class="post-head">
            <div class="post-avatar">
                ${post.author.charAt(0).toUpperCase()}
            </div>
            <div class="post-meta">
                <div class="post-author">${post.author}</div>
                <div class="post-time">${formatTime(post.timestamp)}</div>
            </div>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <div class="post-body">
            ${post.content}
        </div>
        <div class="post-actions">
            <button class="action-btn" onclick="likePost('${post.id}')">
                <i class="fas fa-heart"></i>
                <span>${post.likes || 0}</span>
            </button>
            <button class="action-btn" onclick="showPost('${post.id}')">
                <i class="fas fa-comment"></i>
                <span>${post.comments || 0}</span>
            </button>
        </div>
    `;
}

function renderAllPosts(posts) {
    const allFeed = document.getElementById('allFeed');
    if (!allFeed) return;
    
    if (posts.length === 0) {
        allFeed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet</p>
                <small>Be the first to share your thoughts!</small>
            </div>
        `;
        return;
    }
    
    allFeed.innerHTML = posts.map(post => `
        <div class="post-card ${post.isPinned ? 'pinned' : ''}" data-post-id="${post.id}">
            ${post.isPinned ? '<div class="pin-indicator">📌 Pinned</div>' : ''}
            <div class="post-head">
                <div class="post-avatar">
                    ${post.author.charAt(0).toUpperCase()}
                </div>
                <div class="post-meta">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${formatTime(post.timestamp)}</div>
                </div>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <div class="post-body">
                ${post.content}
            </div>
            <div class="post-actions">
                <button class="action-btn" onclick="likePost('${post.id}')">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes || 0}</span>
                </button>
                <button class="action-btn" onclick="showPost('${post.id}')">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments || 0}</span>
                </button>
                <button class="action-btn" onclick="sharePost('${post.id}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </button>
            </div>
            <div class="post-tags">
                <span class="tag">${post.category}</span>
                <span class="tag">${post.views || 0} views</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    // Update post count
    const postCount = document.getElementById('postCount');
    const aboutPostCount = document.getElementById('aboutPostCount');
    const totalPostsBlog = document.getElementById('totalPostsBlog');
    
    const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
    const postCountValue = posts.length;
    
    if (postCount) postCount.textContent = postCountValue;
    if (aboutPostCount) aboutPostCount.textContent = postCountValue;
    if (totalPostsBlog) totalPostsBlog.textContent = postCountValue;
    
    // Update comment count
    const comments = JSON.parse(localStorage.getItem('genz_comments') || '[]');
    const commentCount = document.getElementById('commentCount');
    const totalCommentsBlog = document.getElementById('totalCommentsBlog');
    
    if (commentCount) commentCount.textContent = comments.length;
    if (totalCommentsBlog) totalCommentsBlog.textContent = comments.length;
    
    // Update view counts
    const totalViews = document.getElementById('totalViews');
    const totalViewsBlog = document.getElementById('totalViewsBlog');
    const totalLikes = document.getElementById('totalLikes');
    const totalShares = document.getElementById('totalShares');
    
    const totalViewsValue = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikesValue = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    
    if (totalViews) totalViews.textContent = totalViewsValue;
    if (totalViewsBlog) totalViewsBlog.textContent = totalViewsValue;
    if (totalLikes) totalLikes.textContent = totalLikesValue;
    if (totalShares) totalShares.textContent = Math.floor(totalViewsValue * 0.1); // Estimate shares
}

function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return postTime.toLocaleDateString();
}

// Global functions for post interactions
function likePost(postId) {
    const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
        localStorage.setItem('genz_posts', JSON.stringify(posts));
        
        // Update UI
        if (currentPage === 'home' || currentPage === 'blog') {
            loadPosts();
        }
        
        showToast('Post liked!', 'success');
    }
}

function showPost(postId) {
    // Navigate to post detail or comments
    window.location.href = `comments.html?postId=${postId}`;
}

function sharePost(postId) {
    const posts = JSON.parse(localStorage.getItem('genz_posts') || '[]');
    const post = posts.find(p => p.id === postId);
    
    if (post && navigator.share) {
        navigator.share({
            title: post.title,
            text: post.content,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const text = `${post.title}\n\n${post.content}\n\nShared from GenZ Smart`;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Post copied to clipboard!', 'success');
        });
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastWrap = document.getElementById('toastWrap');
    if (!toastWrap) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    toastWrap.appendChild(toast);
    
    // Remove toast after delay
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.5s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add CSS for toast animations
const toastStyles = `
@keyframes toastOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100px);
    }
}

.toast.success {
    border-left-color: var(--success);
}

.toast.error {
    border-left-color: var(--danger);
}

.toast.warning {
    border-left-color: var(--warning);
}
`;

// Inject toast styles
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);
