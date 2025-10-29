// ========== FIREBASE IMPORTS & INITIALIZATION ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZTAhJne3gOVwBrZ_NHQFo0ubWR8HzNL8",
  authDomain: "sample-firebase-ai-app-d0a89.firebaseapp.com",
  projectId: "sample-firebase-ai-app-d0a89",
  storageBucket: "sample-firebase-ai-app-d0a89.firebasestorage.app",
  messagingSenderId: "537274583564",
  appId: "1:537274583564:web:44ea454c2abed7d9a4bc29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== GLOBAL STATE ==========
let isAdmin = false;
let currentPage = getCurrentPage();
let allPosts = [];
let unsub = null;
let quill = null;

const ADMIN_EMAIL = 'saffanakbar942@gmail.com';
const ADMIN_PASS = 'saffan942';

// ========== PAGE DETECTION ==========
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('blog.html')) return 'blog';
    if (path.includes('about.html')) return 'about';
    if (path.includes('admin.html')) return 'admin';
    return 'home';
}

// ========== CORE INITIALIZATION ==========
function initApp() {
    console.log('🚀 Initializing app for page:', currentPage);
    
    // Check admin status first
    checkAdminStatus();
    
    // Apply theme
    applyTheme(localStorage.siteTheme || 'dark');
    
    // Initialize common features
    initCommonFeatures();
    
    // Initialize page-specific features
    initPageSpecificFeatures();
    
    // Start Firebase for pages that need it
    if (currentPage !== 'about') {
        startRealtime();
    }
}

function checkAdminStatus() {
    const savedAdmin = localStorage.getItem('isAdmin');
    if (savedAdmin === 'true') {
        isAdmin = true;
        updateAdminUI();
        console.log('✅ Admin status restored');
    }
}

function applyTheme(t) {
    if (t === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    localStorage.siteTheme = t;
}

// ========== COMMON FEATURES ==========
function initCommonFeatures() {
    initClock();
    initThemeToggle();
    initMenu();
    initLoginSystem();
    initNavigation();
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
        
        timeElements.forEach(el => el.textContent = time);
        dateElements.forEach(el => el.textContent = date);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            applyTheme(localStorage.siteTheme === 'dark' ? 'light' : 'dark');
        });
    }
}

function initMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawer = document.getElementById('drawer');

    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', () => { 
            drawer.style.left = '0'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'block';
        });
    }

    if (closeDrawer && drawer) {
        closeDrawer.addEventListener('click', () => { 
            drawer.style.left = '-100%'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'none';
        });
    }

    if (drawerBackdrop && drawer) {
        drawerBackdrop.addEventListener('click', () => { 
            drawer.style.left = '-100%'; 
            drawerBackdrop.style.display = 'none';
        });
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
            (currentPage === 'admin' && href === 'admin.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ========== LOGIN SYSTEM ==========
function initLoginSystem() {
    const openLogin = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const loginCancel = document.getElementById('loginCancel');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    // Open login modal
    if (openLogin && loginModal) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close drawer if open
            const drawer = document.getElementById('drawer');
            const drawerBackdrop = document.getElementById('drawerBackdrop');
            if (drawer) drawer.style.left = '-100%';
            if (drawerBackdrop) drawerBackdrop.style.display = 'none';
            
            // Show login modal
            loginModal.style.display = 'flex';
            if (loginEmail) loginEmail.value = '';
            if (loginPassword) loginPassword.value = '';
            setTimeout(() => {
                if (loginEmail) loginEmail.focus();
            }, 300);
        });
    }

    // Close login modal
    if (loginCancel && loginModal) {
        loginCancel.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // Login submission
    if (loginSubmit) {
        loginSubmit.addEventListener('click', handleLogin);
    }

    // Enter key support
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.style.display = 'none';
        });
    }

    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogout = document.getElementById('drawerLogout');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (drawerLogout) drawerLogout.addEventListener('click', logout);
}

function handleLogin() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginModal = document.getElementById('loginModal');
    const loginSubmit = document.getElementById('loginSubmit');
    
    if (!loginEmail || !loginPassword || !loginSubmit) {
        toast('Login system error', 'err');
        return;
    }
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        toast('Please enter both email and password', 'err');
        return;
    }
    
    // Show loading state
    const originalText = loginSubmit.innerHTML;
    loginSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    loginSubmit.disabled = true;
    
    // Simulate network delay
    setTimeout(() => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            
            if (loginModal) loginModal.style.display = 'none';
            updateAdminUI();
            toast('Welcome back, Admin! 👋', 'ok');
            
            // If on admin page, refresh to show admin features
            if (currentPage === 'admin') {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
            
        } else {
            toast('Invalid email or password', 'err');
            if (loginModal) {
                loginModal.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => loginModal.style.animation = '', 500);
            }
        }
        
        // Reset button
        loginSubmit.innerHTML = originalText;
        loginSubmit.disabled = false;
    }, 800);
}

function updateAdminUI() {
    console.log('🛠️ Updating admin UI');
    
    // Update navigation
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    
    if (adminNavLink) adminNavLink.style.display = 'flex';
    if (adminDrawerLink) adminDrawerLink.style.display = 'block';
    if (drawerLogout) drawerLogout.style.display = 'block';
    if (openLogin) openLogin.style.display = 'none';
    
    // Page-specific admin elements
    if (currentPage === 'admin') {
        const adminPanel = document.getElementById('adminPanel');
        const composer = document.getElementById('composer');
        const adminTab = document.getElementById('adminTab');
        
        if (adminPanel) adminPanel.style.display = 'block';
        if (composer) composer.style.display = 'flex';
        if (adminTab) adminTab.style.display = 'flex';
    }
}

function logout() {
    console.log('👋 Logging out');
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    
    // Hide admin elements
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const adminPanel = document.getElementById('adminPanel');
    const composer = document.getElementById('composer');
    const adminTab = document.getElementById('adminTab');
    
    if (adminNavLink) adminNavLink.style.display = 'none';
    if (adminDrawerLink) adminDrawerLink.style.display = 'none';
    if (drawerLogout) drawerLogout.style.display = 'none';
    if (openLogin) openLogin.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    if (composer) composer.style.display = 'none';
    if (adminTab) adminTab.style.display = 'none';
    
    toast('Logged out successfully', 'ok');
    
    // Redirect from admin page
    if (currentPage === 'admin') {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ========== PAGE-SPECIFIC FEATURES ==========
function initPageSpecificFeatures() {
    switch (currentPage) {
        case 'home':
            initHomePage();
            break;
        case 'blog':
            initBlogPage();
            break;
        case 'admin':
            initAdminPage();
            break;
        case 'about':
            initAboutPage();
            break;
    }
}

function initHomePage() {
    console.log('🏠 Initializing home page');
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            startRealtime();
            toast('Refreshed', 'ok');
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const homeFeed = document.getElementById('homeFeed');
            if (homeFeed) {
                filterPosts(e.target.value, homeFeed, allPosts.filter(post => within7Days(post.timestamp)));
            }
        });
    }
    
    // Create pinned post
    createPinnedPost();
}

function initBlogPage() {
    console.log('📚 Initializing blog page');
    
    // Search functionality
    const searchInput = document.getElementById('searchInputBlog');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const allFeed = document.getElementById('allFeed');
            if (allFeed) {
                filterPosts(e.target.value, allFeed, allPosts);
            }
        });
    }
    
    // Back home button
    const backHome = document.getElementById('backHome');
    if (backHome) {
        backHome.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

function initAdminPage() {
    console.log('⚙️ Initializing admin page');
    
    // Redirect if not admin
    if (!isAdmin) {
        toast('Please login as admin first', 'err');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Initialize Quill editor
    if (typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link', 'blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                ]
            },
            placeholder: 'Share something with your community...',
        });
    } else {
        console.error('❌ Quill not loaded');
    }
    
    let selectedCategory = 'thoughts';
    let editPostId = null;
    
    // Category selection
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
        option.addEventListener('click', () => {
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedCategory = option.getAttribute('data-category');
        });
    });
    
    // New post button
    const newPostBtn = document.getElementById('newPostBtn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            const composeTitle = document.getElementById('composeTitle');
            const composeImage = document.getElementById('composeImage');
            const composer = document.getElementById('composer');
            
            if (composeTitle) composeTitle.value = '';
            if (composeImage) composeImage.value = '';
            if (quill) quill.root.innerHTML = '';
            editPostId = null;
            if (composer) composer.style.display = 'flex';
        });
    }
    
    // Cancel compose
    const cancelCompose = document.getElementById('cancelCompose');
    if (cancelCompose) {
        cancelCompose.addEventListener('click', () => {
            if (quill) quill.root.innerHTML = '';
            const composeTitle = document.getElementById('composeTitle');
            const composeImage = document.getElementById('composeImage');
            if (composeTitle) composeTitle.value = '';
            if (composeImage) composeImage.value = '';
            editPostId = null;
            const composer = document.getElementById('composer');
            if (composer) composer.style.display = 'none';
        });
    }
    
    // Publish post
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            if (!quill) {
                toast('Editor not loaded', 'err');
                return;
            }
            
            const content = quill.root.innerHTML;
            const composeTitle = document.getElementById('composeTitle');
            const composeImage = document.getElementById('composeImage');
            
            const title = composeTitle ? composeTitle.value.trim() : '';
            const image = composeImage ? composeImage.value.trim() : '';
            
            const textContent = quill.getText().trim();
            if(!textContent){ 
                toast('Write something before publishing','err'); 
                return; 
            }
            
            try {
                if (editPostId) {
                    // Update existing post
                    await updateDoc(doc(db, 'posts', editPostId), { 
                        title, 
                        content, 
                        image,
                        category: selectedCategory
                    });
                    
                    toast('Post updated successfully', 'edit');
                    editPostId = null;
                } else {
                    // Create new post
                    await addDoc(collection(db, 'posts'), { 
                        title, 
                        content, 
                        image, 
                        author: 'GenZ Owais', 
                        timestamp: serverTimestamp(),
                        category: selectedCategory,
                        likes: 0,
                        views: 0
                    });
                    
                    toast('New post published successfully', 'ok');
                }
                
                // Reset form
                quill.root.innerHTML = '';
                if (composeTitle) composeTitle.value = '';
                if (composeImage) composeImage.value = '';
                const composer = document.getElementById('composer');
                if (composer) composer.style.display = 'none';
                
            } catch (error) {
                console.error('Firebase error:', error);
                toast('Error: ' + error.message, 'err');
            }
        });
    }
    
    // Export data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(allPosts.map(post => ({
                id: post.id,
                ...post.data()
            })), null, 2);
            
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'genz-smart-posts.json';
            link.click();
            URL.revokeObjectURL(url);
            toast('Data exported successfully', 'ok');
        });
    }
}

function initAboutPage() {
    console.log('👤 Initializing about page');
    // About page is static, no Firebase needed
}

// ========== FIREBASE & POST MANAGEMENT ==========
function startRealtime() {
    console.log('🔥 Starting Firebase real-time listener');
    
    // Clear previous listener
    if (unsub) {
        unsub();
        unsub = null;
    }
    
    // Show loading state
    const homeFeed = document.getElementById('homeFeed');
    const allFeed = document.getElementById('allFeed');
    
    if (homeFeed) clearChildren(homeFeed);
    if (allFeed) clearChildren(allFeed);
    
    const loading = document.createElement('div');
    loading.className = 'post-card';
    loading.style.textAlign = 'center';
    loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading posts...';
    
    if (homeFeed) homeFeed.appendChild(loading);
    if (allFeed) allFeed.appendChild(loading.cloneNode(true));
    
    // Create query for posts
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    
    // Set up real-time listener
    unsub = onSnapshot(q, 
        // Success callback
        (snapshot) => {
            console.log('📥 Received', snapshot.docs.length, 'posts');
            
            allPosts = snapshot.docs;
            
            // Update counters
            const total = snapshot.docs.length;
            const badgeCount = document.getElementById('badgeCount');
            const postCount = document.getElementById('postCount');
            
            if (badgeCount) badgeCount.textContent = total;
            if (postCount) postCount.textContent = total;
            
            // Update feeds based on current page
            if (currentPage === 'home') {
                updateHomeFeed();
            } else if (currentPage === 'blog') {
                updateBlogFeed();
            }
            
            // Update admin stats if on admin page
            if (isAdmin && currentPage === 'admin') {
                updateAdminStats();
            }
            
            // Add reveal animations
            setTimeout(() => {
                document.querySelectorAll('.reveal').forEach(x => {
                    if (!x.classList.contains('in')) {
                        x.classList.add('in');
                    }
                });
            }, 100);
        },
        // Error callback
        (error) => {
            console.error('❌ Firebase error:', error);
            
            const homeFeed = document.getElementById('homeFeed');
            const allFeed = document.getElementById('allFeed');
            
            if (homeFeed) clearChildren(homeFeed);
            if (allFeed) clearChildren(allFeed);
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'post-card';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.color = 'var(--danger)';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error loading posts';
            
            if (homeFeed) homeFeed.appendChild(errorMsg);
            if (allFeed) allFeed.appendChild(errorMsg.cloneNode(true));
            
            toast('Failed to load posts', 'err');
        }
    );
}

function updateHomeFeed() {
    const homeFeed = document.getElementById('homeFeed');
    if (!homeFeed) return;
    
    clearChildren(homeFeed);
    const recent = allPosts.filter(post => within7Days(post.data().timestamp));
    
    if (recent.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'post-card';
        empty.style.textAlign = 'center';
        empty.innerHTML = '<i class="fas fa-inbox"></i><br>No posts in the last 7 days.';
        homeFeed.appendChild(empty);
    } else {
        recent.forEach(post => {
            const card = createCard(post);
            if (card) homeFeed.appendChild(card);
        });
    }
}

function updateBlogFeed() {
    const allFeed = document.getElementById('allFeed');
    if (!allFeed) return;
    
    clearChildren(allFeed);
    
    if (allPosts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'post-card';
        empty.style.textAlign = 'center';
        empty.innerHTML = '<i class="fas fa-inbox"></i><br>No posts yet. Be the first to post!';
        allFeed.appendChild(empty);
    } else {
        allPosts.forEach(post => {
            const card = createCard(post);
            if (card) allFeed.appendChild(card);
        });
    }
}

function updateAdminStats() {
    const totalPosts = allPosts.length;
    const today = new Date().toDateString();
    const todayPosts = allPosts.filter(post => {
        const postDate = post.data().timestamp?.toDate ? 
            post.data().timestamp.toDate().toDateString() : 
            new Date(post.data().timestamp).toDateString();
        return postDate === today;
    }).length;
    
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.data().likes || 0), 0);
    const totalViews = allPosts.reduce((sum, post) => sum + (post.data().views || 0), 0);
    
    const adminPostCount = document.getElementById('adminPostCount');
    const adminTodayPosts = document.getElementById('adminTodayPosts');
    const adminLikes = document.getElementById('adminLikes');
    const adminViews = document.getElementById('adminViews');
    
    if (adminPostCount) adminPostCount.textContent = totalPosts;
    if (adminTodayPosts) adminTodayPosts.textContent = todayPosts;
    if (adminLikes) adminLikes.textContent = totalLikes;
    if (adminViews) adminViews.textContent = totalViews;
}

// ========== POST CARD CREATION ==========
function createCard(docSnap) {
    const data = docSnap.data();
    const when = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
    
    const card = document.createElement('div');
    card.className = 'post-card reveal';

    // Header with avatar and meta
    const head = document.createElement('div');
    head.className = 'post-head';
    
    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.textContent = 'GZ';
    
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    
    const author = document.createElement('div');
    author.className = 'post-author';
    author.textContent = data.author || 'GenZ Smart';
    
    const time = document.createElement('div');
    time.className = 'post-time';
    time.textContent = when.toLocaleDateString();
    
    meta.appendChild(author);
    meta.appendChild(time);
    head.appendChild(avatar);
    head.appendChild(meta);
    card.appendChild(head);

    // Title
    if (data.title && data.title.trim() !== '') {
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = data.title;
        card.appendChild(title);
    }

    // Content with read more
    const body = document.createElement('div');
    body.className = 'post-body';
    
    const textContent = data.content.replace(/<[^>]*>/g, '');
    if (textContent.length > 150) {
        const short = textContent.slice(0, 150) + '...';
        body.innerHTML = linkifySafe(short);
        body.classList.add('collapsed');
        
        const readMore = document.createElement('div');
        readMore.className = 'read-more';
        readMore.textContent = 'Read more';
        
        readMore.addEventListener('click', (e) => {
            e.stopPropagation();
            if (body.classList.contains('collapsed')) {
                body.innerHTML = data.content;
                body.classList.remove('collapsed');
                readMore.textContent = 'Show less';
            } else {
                body.innerHTML = linkifySafe(short);
                body.classList.add('collapsed');
                readMore.textContent = 'Read more';
            }
        });
        
        card.appendChild(readMore);
    } else {
        body.innerHTML = data.content;
    }
    
    card.appendChild(body);

    // Image
    if (data.image) {
        const img = document.createElement('img');
        img.className = 'post-image';
        img.src = data.image;
        img.alt = 'Post image';
        img.onerror = () => img.style.display = 'none';
        card.appendChild(img);
    }

    // Category tag
    if (data.category) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = data.category.charAt(0).toUpperCase() + data.category.slice(1);
        tags.appendChild(tag);
        card.appendChild(tags);
    }

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    
    // Like button
    const likeBtn = document.createElement('button');
    likeBtn.className = 'action-btn like-btn';
    likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${data.likes || 0}</span>`;
    
    // Comment button
    const commentBtn = document.createElement('button');
    commentBtn.className = 'action-btn comment-btn';
    commentBtn.innerHTML = '<i class="far fa-comment"></i> <span>Comment</span>';
    
    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share</span>';
    
    // Like functionality
    let liked = localStorage.getItem(`liked_${docSnap.id}`) === 'true';
    let likes = data.likes || 0;
    
    if (liked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${likes}</span>`;
    }
    
    likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        liked = !liked;
        
        if (liked) {
            likeBtn.classList.add('liked');
            likes++;
            toast('Liked!', 'ok');
        } else {
            likeBtn.classList.remove('liked');
            likes--;
        }
        
        likeBtn.innerHTML = `<i class="${liked ? 'fas' : 'far'} fa-heart"></i> <span class="like-count">${likes}</span>`;
        localStorage.setItem(`liked_${docSnap.id}`, liked);
        
        try {
            await updateDoc(doc(db, 'posts', docSnap.id), { 
                likes: likes 
            });
        } catch (error) {
            console.error('Error updating likes:', error);
        }
    });
    
    // Share functionality
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shareData = {
            title: data.title || 'GenZ Smart Post',
            text: textContent.substring(0, 100) + '...',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                toast('Link copied to clipboard!', 'ok');
            });
        }
    });
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    card.appendChild(actions);

    return card;
}

// ========== HELPER FUNCTIONS ==========
function toast(msg, type = 'ok') {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = '✨';
    if (type === 'edit') icon = '✏️';
    else if (type === 'del') icon = '🗑️';
    else if (type === 'err') icon = '❌';
    
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    
    if (type === 'err') {
        toast.style.background = 'linear-gradient(90deg, #ef4444, #ff7b7b)';
    }
    
    wrap.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastIn 0.5s ease reverse forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function clearChildren(node) {
    if (node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
}

function within7Days(ts) {
    if (!ts) return false;
    const timestamp = ts.toDate ? ts.toDate() : new Date(ts);
    return (Date.now() - timestamp.getTime()) <= 7 * 24 * 60 * 60 * 1000;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function linkifySafe(text) {
    if (!text) return '';
    const escaped = escapeHtml(text);
    return escaped.replace(/(https?:\/\/[^\s]+)/g, url => 
        `<a href="${url}" target="_blank" rel="noopener" style="color: var(--accent)">${url}</a>`
    );
}

function filterPosts(query, container, posts) {
    if (!container) return;
    
    clearChildren(container);
    
    if (!query.trim()) {
        posts.forEach(post => {
            const card = createCard(post);
            if (card) container.appendChild(card);
        });
        return;
    }
    
    const filtered = posts.filter(post => {
        const searchable = (post.data().title + ' ' + post.data().content.replace(/<[^>]*>/g, '')).toLowerCase();
        return searchable.includes(query.toLowerCase());
    });
    
    if (filtered.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'post-card';
        noResults.style.textAlign = 'center';
        noResults.innerHTML = '<i class="fas fa-search"></i><br>No posts found.';
        container.appendChild(noResults);
    } else {
        filtered.forEach(post => {
            const card = createCard(post);
            if (card) container.appendChild(card);
        });
    }
}

// ========== PINNED POST ==========
const pinnedPostData = {
    id: 'pinned',
    title: 'Welcome to GenZ Smart Community! 🎉',
    content: '<h2>Hello there! 👋</h2><p>Welcome to our vibrant community where ideas flourish and connections grow. This is a space for GenZ minds to share thoughts, inspiration, and motivation.</p><p>Feel free to explore, engage with posts, and become part of our growing family. Remember, every big achievement starts with a small idea!</p><p>Let\'s create something amazing together! ✨</p>',
    author: 'GenZ Owais',
    timestamp: new Date('2022-01-01'),
    category: 'welcome',
    likes: 42,
    pinned: true
};

function createPinnedPost() {
    const pinnedPost = document.getElementById('pinnedPost');
    if (!pinnedPost) return;
    
    clearChildren(pinnedPost);
    
    const data = pinnedPostData;
    const when = data.timestamp;
    
    // Header
    const head = document.createElement('div');
    head.className = 'post-head';
    
    const avatar = document.createElement('div');
    avatar.className = 'post-avatar';
    avatar.textContent = 'GZ';
    
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    
    const author = document.createElement('div');
    author.className = 'post-author';
    author.textContent = data.author;
    
    const time = document.createElement('div');
    time.className = 'post-time';
    time.textContent = when.toDateString();
    
    meta.appendChild(author);
    meta.appendChild(time);
    head.appendChild(avatar);
    head.appendChild(meta);
    pinnedPost.appendChild(head);

    // Title
    if (data.title) {
        const title = document.createElement('div');
        title.className = 'post-title';
        title.textContent = data.title;
        pinnedPost.appendChild(title);
    }

    // Content
    const body = document.createElement('div');
    body.className = 'post-body';
    body.innerHTML = data.content;
    pinnedPost.appendChild(body);

    // Category
    if (data.category) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = data.category.charAt(0).toUpperCase() + data.category.slice(1);
        tags.appendChild(tag);
        pinnedPost.appendChild(tags);
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'post-actions';
    
    const likeBtn = document.createElement('button');
    likeBtn.className = 'action-btn like-btn liked';
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${data.likes}</span>`;
    
    const commentBtn = document.createElement('button');
    commentBtn.className = 'action-btn comment-btn';
    commentBtn.innerHTML = '<i class="far fa-comment"></i> <span>Comment</span>';
    
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share</span>';
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    pinnedPost.appendChild(actions);
}

// ========== ANIMATIONS ==========
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        50% { transform: translateX(8px); }
        75% { transform: translateX(-8px); }
    }
`;
document.head.appendChild(shakeStyle);

// ========== START THE APP ==========
document.addEventListener('DOMContentLoaded', initApp);
