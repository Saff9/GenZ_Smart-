// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, getDoc, getDocs
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

// Global state
let isAdmin = false;
let allPosts = [];
let unsub = null;
let selectedCategory = 'thoughts';
let editPostId = null;

// Admin credentials
const ADMIN_EMAIL = 'saffanakbar942@gmail.com';
const ADMIN_PASS = 'saffan942';

// Pinned post data
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

// Helper functions
function toast(msg, type='ok'){
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;
    
    const d = document.createElement('div'); 
    d.className='toast';
    
    let icon = '✨';
    if(type === 'edit') icon = '✏️';
    else if(type === 'del') icon = '🗑️';
    else if(type === 'err') icon = '❌';
    
    d.innerHTML = `<span>${icon}</span> ${msg}`;
    
    if(type === 'err') d.style.background = 'linear-gradient(90deg,#ef4444,#ff7b7b)';
    
    wrap.appendChild(d); 
    setTimeout(()=> { 
        d.style.animation = 'toastIn 0.5s ease reverse forwards';
        setTimeout(() => d.remove(), 500);
    }, 2700);
}

function clearChildren(node){ 
    if (node) {
        while(node.firstChild) node.removeChild(node.firstChild); 
    }
}

function within7Days(ts){ 
    if (!ts) return false;
    const timestamp = ts.toDate ? ts.toDate() : new Date(ts);
    return (Date.now() - timestamp.getTime()) <= 7*24*60*60*1000; 
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
        `<a href="${url}" target="_blank" rel="noopener" style="color:var(--accent)">${url}</a>`
    );
}

// Enhanced share functionality
function createEnhancedShareButton(postId, postData) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share</span>';
    
    shareBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        
        const shareData = {
            title: postData.title || 'GenZ Smart Post',
            text: postData.content ? 
                  postData.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                  'Check out this post from GenZ Smart',
            url: `${window.location.origin}${window.location.pathname}?post=${postId}`
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast('Post shared successfully!', 'ok');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showCustomShareDialog(shareData);
                }
            }
        } else {
            showCustomShareDialog(shareData);
        }
    });
    
    return shareBtn;
}

function showCustomShareDialog(shareData) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-dialog">
            <div class="share-header">
                <div class="logo" style="width:40px;height:40px;display:grid;place-items:center;background:var(--accent-gradient);border-radius:10px;color:white;font-weight:800;font-size:14px;">GZ</div>
                <h3>Share This Post</h3>
                <button class="close-share">&times;</button>
            </div>
            <div class="share-options">
                <button class="share-option" data-platform="twitter">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button class="share-option" data-platform="facebook">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button class="share-option" data-platform="linkedin">
                    <i class="fab fa-linkedin"></i> LinkedIn
                </button>
                <button class="share-option" data-platform="copy">
                    <i class="fas fa-link"></i> Copy Link
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    shareModal.querySelector('.close-share').addEventListener('click', () => {
        shareModal.remove();
    });
    
    shareModal.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.getAttribute('data-platform');
            shareToPlatform(platform, shareData);
            shareModal.remove();
        });
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.remove();
        }
    });
}

function shareToPlatform(platform, shareData) {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedText = encodeURIComponent(shareData.text);
    const encodedTitle = encodeURIComponent(shareData.title);
    
    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        copy: null
    };
    
    if (platform === 'copy') {
        navigator.clipboard.writeText(shareData.url).then(() => {
            toast('Link copied to clipboard!', 'ok');
        });
    } else {
        window.open(urls[platform], '_blank', 'width=600,height=400');
        toast(`Shared on ${platform}!`, 'ok');
    }
}

// Theme functionality
function applyTheme(t) { 
    if(t === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        if (document.getElementById('themeToggle')) {
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        if (document.getElementById('themeToggle')) {
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    localStorage.siteTheme = t; 
}

// Clock functionality
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');
    const drawerClockTime = document.getElementById('drawerClockTime');
    const drawerClockDate = document.getElementById('drawerClockDate');
    
    if (clockTime) clockTime.textContent = time;
    if (clockDate) clockDate.textContent = date;
    if (drawerClockTime) drawerClockTime.textContent = time;
    if (drawerClockDate) drawerClockDate.textContent = date;
    
    if (clockTime) {
        clockTime.style.animation = 'none';
        void clockTime.offsetWidth;
        clockTime.style.animation = 'clockTick 0.5s ease';
    }
}

// Create post card
function createCard(docSnap){
    const data = docSnap.data();
    if (data.pinned) return null;
    
    const when = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
    const card = document.createElement('div'); 
    card.className = 'post-card reveal';

    // Head section
    const head = document.createElement('div'); 
    head.className = 'post-head';
    
    const av = document.createElement('div'); 
    av.className = 'post-avatar';
    av.textContent = 'GZ';
    
    const meta = document.createElement('div'); 
    meta.className = 'post-meta';
    
    const name = document.createElement('div'); 
    name.className='post-author'; 
    name.textContent = data.author || 'GenZ Smart';
    
    const time = document.createElement('div'); 
    time.className='post-time'; 
    time.textContent = when.toDateString();
    
    meta.appendChild(name); 
    meta.appendChild(time);
    head.appendChild(av); 
    head.appendChild(meta);
    card.appendChild(head);

    // Title
    if(data.title && data.title.toString().trim() !== ''){
        const t = document.createElement('div'); 
        t.className='post-title'; 
        t.textContent = data.title;
        t.style.cursor = 'pointer';
        t.addEventListener('click', () => openSinglePost(docSnap.id, data));
        card.appendChild(t);
    }

    // Body with read more functionality
    const body = document.createElement('div'); 
    body.className = 'post-body';
    const full = data.content || '';
    
    const textContent = full.replace(/<[^>]*>/g, '');
    if (textContent.length > 100) {
        const short = textContent.slice(0, 100);
        body.innerHTML = linkifySafe(short) + '...';
        body.classList.add('collapsed');
        
        const readMore = document.createElement('div');
        readMore.className = 'read-more';
        readMore.textContent = 'Read more';
        
        let expanded = false;
        readMore.addEventListener('click', (e) => {
            e.stopPropagation();
            expanded = !expanded;
            if (expanded) {
                body.innerHTML = data.content;
                readMore.textContent = 'Show less';
                body.classList.remove('collapsed');
            } else {
                body.innerHTML = linkifySafe(short) + '...';
                readMore.textContent = 'Read more';
                body.classList.add('collapsed');
            }
        });
        
        card.appendChild(readMore);
    } else {
        body.innerHTML = data.content;
    }
    
    body.style.cursor = 'pointer';
    body.addEventListener('click', () => openSinglePost(docSnap.id, data));
    card.appendChild(body);

    // Image if exists
    if(data.image){
        const im = document.createElement('img'); 
        im.className='post-image'; 
        im.src = data.image;
        im.onerror = () => im.style.display = 'none';
        im.addEventListener('click', (e) => {
            e.stopPropagation();
            openSinglePost(docSnap.id, data);
        });
        card.appendChild(im);
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

    // Post actions
    const actions = document.createElement('div'); 
    actions.className = 'post-actions';
    
    const likeBtn = document.createElement('button'); 
    likeBtn.className='action-btn like-btn';
    likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${data.likes || 0}</span>`;
    
    const commentBtn = document.createElement('button'); 
    commentBtn.className='action-btn comment-btn';
    commentBtn.innerHTML = '<i class="far fa-comment"></i> <span>Comment</span>';
    
    const shareBtn = createEnhancedShareButton(docSnap.id, data);
    
    // Like functionality
    let liked = localStorage.getItem(`liked_${docSnap.id}`) === 'true';
    let likes = data.likes || 0;
    
    if (liked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${likes + 1}</span>`;
    }
    
    likeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        liked = !liked;
        
        if (liked) {
            likeBtn.classList.add('liked');
            likes++;
            likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${likes}</span>`;
            toast('Liked!', 'ok');
        } else {
            likeBtn.classList.remove('liked');
            likes--;
            likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${likes}</span>`;
        }
        
        localStorage.setItem(`liked_${docSnap.id}`, liked);
        
        try {
            await updateDoc(doc(db, 'posts', docSnap.id), { likes });
        } catch (error) {
            console.error('Error updating likes:', error);
        }
        
        if (isAdmin && document.body.getAttribute('data-page') === 'admin') {
            updateAdminStats();
        }
    });
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    card.appendChild(actions);

    // Admin actions
    if (isAdmin) {
        const adminActions = document.createElement('div');
        adminActions.className = 'post-actions';
        adminActions.style.marginTop = '10px';
        adminActions.style.borderTop = '1px solid var(--divider)';
        adminActions.style.paddingTop = '10px';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editPost(docSnap.id, data);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePost(docSnap.id);
        });
        
        adminActions.appendChild(editBtn);
        adminActions.appendChild(deleteBtn);
        card.appendChild(adminActions);
    }

    return card;
}

// Create pinned post
function createPinnedPost() {
    const pinnedPost = document.getElementById('pinnedPost');
    if (!pinnedPost) return;
    
    clearChildren(pinnedPost);
    
    const data = pinnedPostData;
    const when = data.timestamp;
    
    // Head section
    const head = document.createElement('div'); 
    head.className = 'post-head';
    
    const av = document.createElement('div'); 
    av.className = 'post-avatar';
    av.textContent = 'GZ';
    
    const meta = document.createElement('div'); 
    meta.className = 'post-meta';
    
    const name = document.createElement('div'); 
    name.className='post-author'; 
    name.textContent = data.author;
    
    const time = document.createElement('div'); 
    time.className='post-time'; 
    time.textContent = when.toDateString();
    
    meta.appendChild(name); 
    meta.appendChild(time);
    head.appendChild(av); 
    head.appendChild(meta);
    pinnedPost.appendChild(head);

    // Title
    if(data.title && data.title.trim() !== ''){
        const t = document.createElement('div'); 
        t.className='post-title'; 
        t.textContent = data.title;
        t.style.cursor = 'default';
        pinnedPost.appendChild(t);
    }

    // Body
    const body = document.createElement('div'); 
    body.className = 'post-body';
    body.innerHTML = data.content;
    pinnedPost.appendChild(body);

    // Category tag
    if (data.category) {
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = data.category.charAt(0).toUpperCase() + data.category.slice(1);
        tags.appendChild(tag);
        pinnedPost.appendChild(tags);
    }

    // Post actions
    const actions = document.createElement('div'); 
    actions.className = 'post-actions';
    
    const likeBtn = document.createElement('button'); 
    likeBtn.className='action-btn like-btn';
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${data.likes || 0}</span>`;
    likeBtn.classList.add('liked');
    
    const commentBtn = document.createElement('button'); 
    commentBtn.className='action-btn comment-btn';
    commentBtn.innerHTML = '<i class="far fa-comment"></i> <span>Comment</span>';
    
    const shareBtn = createEnhancedShareButton('pinned', data);
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    pinnedPost.appendChild(actions);
}

// Update feeds based on current page
function updateFeeds() {
    const page = document.body.getAttribute('data-page');
    
    if (page === 'home') {
        updateHomeFeed();
    } else if (page === 'blog') {
        updateBlogFeed();
    } else if (page === 'admin') {
        updateAdminStats();
    } else if (page === 'about') {
        updateAboutStats();
    }
}

function updateHomeFeed() {
    const homeFeed = document.getElementById('homeFeed');
    if (!homeFeed) return;
    
    clearChildren(homeFeed);
    const recent = allPosts.filter(post => within7Days(post.timestamp));
    
    if (recent.length === 0) {
        const e = document.createElement('div'); 
        e.className='post-card'; 
        e.textContent = 'No posts in the last 7 days.'; 
        homeFeed.appendChild(e);
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
        const e = document.createElement('div'); 
        e.className='post-card'; 
        e.textContent = 'No posts yet.'; 
        allFeed.appendChild(e);
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
        const postDate = post.timestamp.toDate ? post.timestamp.toDate().toDateString() : new Date(post.timestamp).toDateString();
        return postDate === today;
    }).length;
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.likes || 0), 0) + pinnedPostData.likes;
    const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    const adminPostCount = document.getElementById('adminPostCount');
    const adminTodayPosts = document.getElementById('adminTodayPosts');
    const adminLikes = document.getElementById('adminLikes');
    const adminViews = document.getElementById('adminViews');
    
    if (adminPostCount) adminPostCount.textContent = totalPosts + 1;
    if (adminTodayPosts) adminTodayPosts.textContent = todayPosts;
    if (adminLikes) adminLikes.textContent = totalLikes;
    if (adminViews) adminViews.textContent = totalViews;
}

function updateAboutStats() {
    const aboutPostCount = document.getElementById('aboutPostCount');
    if (aboutPostCount) {
        aboutPostCount.textContent = allPosts.length + 1;
    }
}

// Real-time listener for posts
function startRealtime() {
    if (unsub) unsub();
    
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs || [];
        allPosts = docs;
        
        const total = docs.length || 0;
        const badgeCount = document.getElementById('badgeCount');
        const postCount = document.getElementById('postCount');
        
        if (badgeCount) badgeCount.textContent = total;
        if (postCount) postCount.textContent = total + 1;
        
        // Create pinned post on home page
        if (document.body.getAttribute('data-page') === 'home') {
            createPinnedPost();
        }
        
        updateFeeds();
        
        // Reveal animations
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(x => x.classList.add('in'));
        }, 80);
    }, (err) => {
        console.error('Error loading posts:', err);
        toast('Error loading posts', 'err');
    });
}

// Initialize Quill editor
function initQuill() {
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) return null;
    
    const quill = new Quill('#editor-container', {
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
    
    return quill;
}

// Initialize the app based on current page
function initApp() {
    // Apply saved theme
    if(localStorage.siteTheme === undefined) localStorage.siteTheme = 'dark';
    applyTheme(localStorage.siteTheme);
    
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Start real-time listener
    startRealtime();
    
    // Initialize page-specific functionality
    const page = document.body.getAttribute('data-page');
    
    if (page === 'admin') {
        initAdminPage();
    } else if (page === 'home') {
        initHomePage();
    } else if (page === 'blog') {
        initBlogPage();
    }
    
    // Initialize common event listeners
    initCommonEvents();
}

function initCommonEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            applyTheme(localStorage.siteTheme === 'dark' ? 'light' : 'dark');
        });
    }
    
    // Menu functionality
    const menuBtn = document.getElementById('menuBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawer = document.getElementById('drawer');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => { 
            drawer.style.left = '0'; 
            drawerBackdrop.style.display = 'block'; 
            
            if (window.innerWidth <= 768) {
                const drawerClock = document.getElementById('drawerClock');
                if (drawerClock) drawerClock.style.display = 'block';
            }
        });
    }
    
    if (closeDrawer) {
        closeDrawer.addEventListener('click', () => { 
            drawer.style.left = '-100%'; 
            drawerBackdrop.style.display = 'none'; 
        });
    }
    
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => { 
            drawer.style.left = '-100%'; 
            drawerBackdrop.style.display = 'none'; 
        });
    }
    
    // Login functionality
    const openLogin = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const loginCancel = document.getElementById('loginCancel');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (openLogin) {
        openLogin.addEventListener('click', () => {
            if (drawer) {
                drawer.style.left = '-100%'; 
                drawerBackdrop.style.display = 'none';
            }
            if (loginModal) loginModal.style.display = 'flex';
        });
    }
    
    if (loginCancel) {
        loginCancel.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
        });
    }
    
    if (loginSubmit) {
        loginSubmit.addEventListener('click', () => {
            const email = loginEmail ? loginEmail.value.trim() : '';
            const password = loginPassword ? loginPassword.value.trim() : '';
            
            if (!email || !password) {
                toast('Please enter email and password', 'err');
                return;
            }
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
                isAdmin = true;
                if (loginModal) loginModal.style.display = 'none';
                
                // Update UI for admin
                const adminNavLink = document.getElementById('adminNavLink');
                const adminDrawerLink = document.getElementById('adminDrawerLink');
                const drawerLogout = document.getElementById('drawerLogout');
                const openLoginBtn = document.getElementById('openLogin');
                
                if (adminNavLink) adminNavLink.style.display = 'flex';
                if (adminDrawerLink) adminDrawerLink.style.display = 'block';
                if (drawerLogout) drawerLogout.style.display = 'block';
                if (openLoginBtn) openLoginBtn.style.display = 'none';
                
                toast('Admin signed in successfully', 'ok');
                
                // If on admin page, show composer
                if (document.body.getAttribute('data-page') === 'admin') {
                    const composer = document.getElementById('composer');
                    if (composer) composer.style.display = 'block';
                }
            } else {
                toast('Invalid credentials', 'err');
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogout = document.getElementById('drawerLogout');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (drawerLogout) {
        drawerLogout.addEventListener('click', logout);
    }
    
    // ESC key closes modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (loginModal && loginModal.style.display === 'flex') {
                loginModal.style.display = 'none';
            }
            if (drawer) {
                drawer.style.left = '-100%';
                if (drawerBackdrop) drawerBackdrop.style.display = 'none';
            }
            
            // Close share modal if exists
            const shareModal = document.querySelector('.share-modal');
            if (shareModal) shareModal.remove();
        }
    });
}

function logout() {
    isAdmin = false;
    
    const composer = document.getElementById('composer');
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    
    if (composer) composer.style.display = 'none';
    if (adminNavLink) adminNavLink.style.display = 'none';
    if (adminDrawerLink) adminDrawerLink.style.display = 'none';
    if (drawerLogout) drawerLogout.style.display = 'none';
    if (openLogin) openLogin.style.display = 'block';
    
    toast('Logged out successfully', 'ok');
    
    // If on admin page, redirect to home
    if (document.body.getAttribute('data-page') === 'admin') {
        window.location.href = 'index.html';
    }
}

function initAdminPage() {
    const quill = initQuill();
    if (!quill) return;
    
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
            quill.root.innerHTML = '';
            editPostId = null;
            if (composer) composer.style.display = 'block';
        });
    }
    
    // Close composer
    const closeComposer = document.getElementById('closeComposer');
    const cancelCompose = document.getElementById('cancelCompose');
    
    if (closeComposer) {
        closeComposer.addEventListener('click', () => {
            const composer = document.getElementById('composer');
            if (composer) composer.style.display = 'none';
        });
    }
    
    if (cancelCompose) {
        cancelCompose.addEventListener('click', () => {
            const composer = document.getElementById('composer');
            if (composer) composer.style.display = 'none';
        });
    }
    
    // Publish post
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
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
                    await updateDoc(doc(db, 'posts', editPostId), { 
                        title, 
                        content, 
                        image,
                        category: selectedCategory
                    });
                    
                    toast('Post updated successfully', 'edit');
                    editPostId = null;
                } else {
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
                
                quill.root.innerHTML = '';
                if (composeTitle) composeTitle.value = '';
                if (composeImage) composeImage.value = '';
                const composer = document.getElementById('composer');
                if (composer) composer.style.display = 'none';
            } catch (error) {
                toast('Error publishing post: ' + error.message, 'err');
            }
        });
    }
    
    // Export data
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const dataStr = JSON.stringify(allPosts, null, 2);
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

function initHomePage() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const homeFeed = document.getElementById('homeFeed');
            if (!homeFeed) return;
            
            filterPosts(e.target.value, homeFeed, allPosts.filter(post => within7Days(post.timestamp)));
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => { 
            startRealtime();
            toast('Refreshed','ok'); 
        });
    }
    
    // Quick compose link for admin
    const composeQuickLink = document.getElementById('composeQuickLink');
    if (composeQuickLink && isAdmin) {
        composeQuickLink.style.display = 'flex';
        composeQuickLink.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
}

function initBlogPage() {
    // Search functionality
    const searchInputBlog = document.getElementById('searchInputBlog');
    if (searchInputBlog) {
        searchInputBlog.addEventListener('input', (e) => {
            const allFeed = document.getElementById('allFeed');
            if (!allFeed) return;
            
            filterPosts(e.target.value, allFeed, allPosts);
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            filterBlogPosts();
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            filterBlogPosts();
        });
    }
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
        const searchText = (post.title + ' ' + post.content.replace(/<[^>]*>/g, '')).toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    if (filtered.length === 0) {
        const e = document.createElement('div'); 
        e.className='post-card'; 
        e.textContent = 'No posts found.'; 
        container.appendChild(e);
    } else {
        filtered.forEach(post => {
            const card = createCard(post);
            if (card) container.appendChild(card);
        });
    }
}

function filterBlogPosts() {
    const allFeed = document.getElementById('allFeed');
    if (!allFeed) return;
    
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    const category = categoryFilter ? categoryFilter.value : '';
    const sort = sortFilter ? sortFilter.value : 'newest';
    
    let filteredPosts = [...allPosts];
    
    // Filter by category
    if (category) {
        filteredPosts = filteredPosts.filter(post => post.data().category === category);
    }
    
    // Sort posts
    filteredPosts.sort((a, b) => {
        const aData = a.data();
        const bData = b.data();
        
        if (sort === 'newest') {
            return (bData.timestamp?.toDate?.() || new Date(bData.timestamp)) - 
                   (aData.timestamp?.toDate?.() || new Date(aData.timestamp));
        } else if (sort === 'oldest') {
            return (aData.timestamp?.toDate?.() || new Date(aData.timestamp)) - 
                   (bData.timestamp?.toDate?.() || new Date(bData.timestamp));
        } else if (sort === 'popular') {
            return (bData.likes || 0) - (aData.likes || 0);
        }
        return 0;
    });
    
    clearChildren(allFeed);
    
    if (filteredPosts.length === 0) {
        const e = document.createElement('div'); 
        e.className='post-card'; 
        e.textContent = 'No posts found.'; 
        allFeed.appendChild(e);
    } else {
        filteredPosts.forEach(post => {
            const card = createCard(post);
            if (card) allFeed.appendChild(card);
        });
    }
}

async function editPost(id, data) {
    const d = await getDoc(doc(db, 'posts', id));
    if (!d.exists()) {
        toast('Post not found', 'err');
        return;
    }
    
    const pd = d.data();
    const composeTitle = document.getElementById('composeTitle');
    const composeImage = document.getElementById('composeImage');
    const composer = document.getElementById('composer');
    
    if (composeTitle) composeTitle.value = pd.title || '';
    if (composeImage) composeImage.value = pd.image || '';
    
    const quill = document.querySelector('#editor-container .ql-editor');
    if (quill) quill.innerHTML = pd.content || '';
    
    editPostId = id;
    
    // Set category
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(opt => {
        if (opt.getAttribute('data-category') === pd.category) {
            opt.classList.add('selected');
            selectedCategory = pd.category;
        } else {
            opt.classList.remove('selected');
        }
    });
    
    if (composer) {
        composer.style.display = 'block';
        composer.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await deleteDoc(doc(db, 'posts', id));
        toast('Post deleted successfully', 'del');
        
        if (isAdmin && document.body.getAttribute('data-page') === 'admin') {
            updateAdminStats();
        }
    } catch (error) {
        toast('Error deleting post: ' + error.message, 'err');
    }
}

// Open single post view (for future implementation)
function openSinglePost(id, data) {
    // This would open a single post view - for now just show a message
    toast('Opening post: ' + (data.title || 'Untitled'), 'ok');
}

// Dynamic hero quotes
const quotes = [
    '"Small ideas, big ripples."',
    '"Dream big, start small."',
    '"Creativity is intelligence having fun."',
    '"Your vibe attracts your tribe."',
    '"Stay curious, stay hungry."',
    '"Make today so awesome yesterday gets jealous."'
];

let quoteIndex = 0;
const heroQuote = document.getElementById('heroQuote');

if (heroQuote) {
    setInterval(() => {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        heroQuote.style.opacity = 0;
        setTimeout(() => {
            heroQuote.textContent = quotes[quoteIndex];
            heroQuote.style.opacity = 1;
        }, 500);
    }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
