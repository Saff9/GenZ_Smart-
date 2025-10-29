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

// Initialize Quill editor
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

// ========== GLOBAL STATE ==========
let isAdmin = false;
let currentView = 'home';
let lastViewBeforePost = 'home';
let selectedCategory = 'thoughts';
let allPosts = [];
let editPostId = null;
let unsub = null;

const ADMIN_EMAIL = 'saffanakbar942@gmail.com';
const ADMIN_PASS = 'saffan942';

// ========== HELPER FUNCTIONS ==========
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

// ========== THEME MANAGEMENT ==========
function applyTheme(t){ 
    if(t === 'light') {
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

// ========== CLOCK FUNCTIONALITY ==========
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

// ========== LOGIN SYSTEM ==========
function initLoginSystem() {
    const openLogin = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const loginCancel = document.getElementById('loginCancel');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');

    // Open login modal
    if (openLogin) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            
            const drawer = document.getElementById('drawer');
            const drawerBackdrop = document.getElementById('drawerBackdrop');
            if (drawer) drawer.style.left = '-100%';
            if (drawerBackdrop) drawerBackdrop.style.display = 'none';
            
            if (loginModal) {
                loginModal.style.display = 'flex';
                if (loginEmail) loginEmail.value = '';
                if (loginPassword) loginPassword.value = '';
                setTimeout(() => {
                    if (loginEmail) loginEmail.focus();
                }, 300);
            }
        });
    }

    // Close login modal
    if (loginCancel) {
        loginCancel.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
        });
    }

    // Login submission
    if (loginSubmit) {
        loginSubmit.addEventListener('click', handleLogin);
    }

    // Enter key support for login
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
}

function handleLogin() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginModal = document.getElementById('loginModal');
    const loginSubmit = document.getElementById('loginSubmit');
    
    if (!loginEmail || !loginPassword || !loginSubmit) return;
    
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
    
    setTimeout(() => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
            isAdmin = true;
            if (loginModal) loginModal.style.display = 'none';
            
            updateAdminUI();
            toast('Welcome back, Admin! 👋', 'ok');
            
        } else {
            toast('Invalid email or password', 'err');
            if (loginModal) {
                loginModal.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    loginModal.style.animation = '';
                }, 500);
            }
        }
        
        // Reset button
        loginSubmit.innerHTML = originalText;
        loginSubmit.disabled = false;
    }, 800);
}

function updateAdminUI() {
    const adminTab = document.getElementById('adminTab');
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const composeQuickLink = document.getElementById('composeQuickLink');
    
    if (adminTab) adminTab.style.display = 'flex';
    if (adminNavLink) adminNavLink.style.display = 'flex';
    if (adminDrawerLink) adminDrawerLink.style.display = 'block';
    if (drawerLogout) drawerLogout.style.display = 'block';
    if (openLogin) openLogin.style.display = 'none';
    if (composeQuickLink) composeQuickLink.style.display = 'flex';
}

function logout() {
    isAdmin = false;
    
    const adminTab = document.getElementById('adminTab');
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const composeQuickLink = document.getElementById('composeQuickLink');
    const composer = document.getElementById('composer');
    const adminPanel = document.getElementById('adminPanel');
    
    if (adminTab) adminTab.style.display = 'none';
    if (adminNavLink) adminNavLink.style.display = 'none';
    if (adminDrawerLink) adminDrawerLink.style.display = 'none';
    if (drawerLogout) drawerLogout.style.display = 'none';
    if (openLogin) openLogin.style.display = 'block';
    if (composeQuickLink) composeQuickLink.style.display = 'none';
    if (composer) composer.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
    
    toast('Logged out successfully', 'ok');
    
    // If currently on admin view, switch to home
    if (currentView === 'admin') {
        showView('home');
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.getAttribute('data-view') === 'home') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
}

// ========== VIEW MANAGEMENT ==========
function hideAllViews(){ 
    const views = ['homeView', 'blogView', 'aboutView', 'postView', 'adminPanel'];
    views.forEach(view => {
        const element = document.getElementById(view);
        if (element) element.style.display = 'none';
    });
}

function showView(v){
    hideAllViews();
    currentView = v;
    
    if(v === 'home'){ 
        const homeView = document.getElementById('homeView');
        if (homeView) homeView.style.display = 'block';
        document.title = 'GenZ Smart — Home'; 
    }
    else if(v === 'blog'){ 
        const blogView = document.getElementById('blogView');
        if (blogView) blogView.style.display = 'block';
        document.title = 'GenZ Smart — Blog'; 
    }
    else if(v === 'about'){ 
        const aboutView = document.getElementById('aboutView');
        if (aboutView) aboutView.style.display = 'block';
        document.title = 'GenZ Smart — About'; 
    }
    else if(v === 'admin' && isAdmin) {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.style.display = 'block';
        document.title = 'GenZ Smart — Admin'; 
        updateAdminStats();
    }
    
    window.scrollTo({top:0,behavior:'smooth'});
}

// ========== TAB NAVIGATION ==========
function initTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => {
        t.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(x => x.classList.remove('active')); 
            
            // Add active class to clicked tab
            t.classList.add('active');
            
            // Get the view to show
            const view = t.getAttribute('data-view');
            
            // Special handling for admin tab
            if (view === 'admin' && !isAdmin) {
                toast('Please login as admin first', 'err');
                // Switch back to home tab
                tabs.forEach(tab => {
                    if (tab.getAttribute('data-view') === 'home') {
                        tab.classList.add('active');
                    }
                });
                return;
            }
            
            showView(view);
            
            // Close drawer if open
            const drawer = document.getElementById('drawer');
            const drawerBackdrop = document.getElementById('drawerBackdrop');
            if (drawer) {
                drawer.style.left = '-100%'; 
                if (drawerBackdrop) drawerBackdrop.style.display = 'none';
            }
        });
    });
}

// ========== ADMIN FUNCTIONALITY ==========
function initAdminFunctionality() {
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
            if (composer) composer.style.display = 'flex';
            window.scrollTo({top: composer.offsetTop - 20, behavior: 'smooth'});
        });
    }
    
    // Cancel compose
    const cancelCompose = document.getElementById('cancelCompose');
    if (cancelCompose) {
        cancelCompose.addEventListener('click', () => {
            quill.root.innerHTML = '';
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

function updateAdminStats() {
    const totalPosts = allPosts.length;
    const today = new Date().toDateString();
    const todayPosts = allPosts.filter(post => {
        const postDate = post.timestamp.toDate ? post.timestamp.toDate().toDateString() : new Date(post.timestamp).toDateString();
        return postDate === today;
    }).length;
    const totalLikes = allPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    const adminPostCount = document.getElementById('adminPostCount');
    const adminTodayPosts = document.getElementById('adminTodayPosts');
    const adminLikes = document.getElementById('adminLikes');
    const adminViews = document.getElementById('adminViews');
    
    if (adminPostCount) adminPostCount.textContent = totalPosts;
    if (adminTodayPosts) adminTodayPosts.textContent = todayPosts;
    if (adminLikes) adminLikes.textContent = totalLikes;
    if (adminViews) adminViews.textContent = totalViews;
}

// ========== POST MANAGEMENT ==========
function createCard(docSnap){
    const data = docSnap.data();
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
    
    const shareBtn = document.createElement('button'); 
    shareBtn.className='action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share</span>';
    
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
        
        if (isAdmin && currentView === 'admin') {
            updateAdminStats();
        }
    });
    
    // Share functionality
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: data.title || 'GenZ Smart Post',
                text: data.content ? data.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Check out this post',
                url: window.location.href
            }).then(() => {
                toast('Post shared!', 'ok');
            }).catch(err => {
                console.log('Error sharing:', err);
            });
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

async function editPost(id, data) {
    const d = await getDoc(doc(db, 'posts', id));
    if (!d.exists()) {
        toast('Post not found', 'err');
        return;
    }
    
    const pd = d.data();
    const composeTitle = document.getElementById('composeTitle');
    const composeImage = document.getElementById('composeImage');
    
    if (composeTitle) composeTitle.value = pd.title || '';
    if (composeImage) composeImage.value = pd.image || '';
    quill.root.innerHTML = pd.content || '';
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
    
    const composer = document.getElementById('composer');
    if (composer) {
        composer.style.display = 'flex';
        window.scrollTo({top: composer.offsetTop - 20, behavior: 'smooth'});
    }
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await deleteDoc(doc(db, 'posts', id));
        toast('Post deleted successfully', 'del');
        
        if (isAdmin) {
            updateAdminStats();
        }
    } catch (error) {
        toast('Error deleting post: ' + error.message, 'err');
    }
}

// ========== SINGLE POST VIEW ==========
function openSinglePost(id, data) {
    const postTitle = document.getElementById('postTitle');
    const postBody = document.getElementById('postBody');
    const postAuthor = document.getElementById('postAuthor');
    const postTime = document.getElementById('postTime');
    const postImg = document.getElementById('postImg');
    const postCategory = document.getElementById('postCategory');
    const postAdminActions = document.getElementById('postAdminActions');
    const postView = document.getElementById('postView');
    const postBack = document.getElementById('postBack');
    
    if (postTitle) postTitle.textContent = data.title || '';
    if (postBody) postBody.innerHTML = data.content || '';
    if (postAuthor) postAuthor.textContent = data.author || 'GenZ Smart';
    
    const when = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
    if (postTime) postTime.textContent = when.toDateString();

    if (data.category && postCategory) {
        postCategory.textContent = data.category.charAt(0).toUpperCase() + data.category.slice(1);
        postCategory.style.display = 'block';
    } else if (postCategory) {
        postCategory.style.display = 'none';
    }

    if(data.image && postImg){
        postImg.src = data.image; 
        postImg.style.display = 'block';
        postImg.onerror = () => {
            if (postImg) postImg.style.display = 'none';
        };
    } else if (postImg) {
        postImg.style.display = 'none';
    }

    if (postAdminActions) {
        postAdminActions.innerHTML = '';
        if (isAdmin && id !== 'pinned') {
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-ghost';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.onclick = async () => {
                const d = await getDoc(doc(db, 'posts', id));
                if (!d.exists()) {
                    toast('Post not found', 'err');
                    return;
                }
                
                const pd = d.data();
                const composeTitle = document.getElementById('composeTitle');
                const composeImage = document.getElementById('composeImage');
                
                if (composeTitle) composeTitle.value = pd.title || '';
                if (composeImage) composeImage.value = pd.image || '';
                quill.root.innerHTML = pd.content || '';
                editPostId = id;
                
                const categoryOptions = document.querySelectorAll('.category-option');
                categoryOptions.forEach(opt => {
                    if (opt.getAttribute('data-category') === pd.category) {
                        opt.classList.add('selected');
                        selectedCategory = pd.category;
                    } else {
                        opt.classList.remove('selected');
                    }
                });
                
                const composer = document.getElementById('composer');
                if (composer) {
                    composer.style.display = 'flex';
                    setTimeout(() => composer.scrollIntoView({behavior: 'smooth', block: 'center'}), 120);
                }
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-ghost';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.onclick = async () => {
                if (!confirm('Delete this post?')) return;
                try {
                    await deleteDoc(doc(db, 'posts', id));
                    toast('Post deleted', 'del');
                    showView('home');
                } catch (error) {
                    toast('Error deleting post: ' + error.message, 'err');
                }
            };
            
            postAdminActions.appendChild(editBtn);
            postAdminActions.appendChild(deleteBtn);
        }
    }

    // Set up back button
    if (postBack) {
        postBack.onclick = () => {
            if(lastViewBeforePost === 'blog') showView('blog'); 
            else showView('home');
            document.title = 'GenZ Smart — Community';
        };
    }

    hideAllViews();
    if (postView) postView.style.display = 'block';
    lastViewBeforePost = currentView || 'home';
    document.title = 'GenZ Smart — ' + (data.title || 'Post');
    window.scrollTo({top:0,behavior:'smooth'});
}

// ========== FEED MANAGEMENT ==========
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

// ========== REAL-TIME LISTENER ==========
function startRealtime() {
    const homeFeed = document.getElementById('homeFeed');
    const allFeed = document.getElementById('allFeed');
    
    if (homeFeed) clearChildren(homeFeed);
    if (allFeed) clearChildren(allFeed);
    
    const loading = document.createElement('div');
    loading.className = 'post-card';
    loading.style.textAlign = 'center';
    loading.innerHTML = 'Loading...';
    
    if (homeFeed) homeFeed.appendChild(loading);
    if (allFeed) allFeed.appendChild(loading.cloneNode(true));
    
    if (unsub) unsub();
    
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    unsub = onSnapshot(q, (snap) => {
        if (homeFeed) clearChildren(homeFeed);
        if (allFeed) clearChildren(allFeed);
        
        const docs = snap.docs || [];
        allPosts = docs;
        
        const total = docs.length || 0;
        const badgeCount = document.getElementById('badgeCount');
        const postCount = document.getElementById('postCount');
        
        if (badgeCount) badgeCount.textContent = total;
        if (postCount) postCount.textContent = total;
        
        // Update feeds based on current view
        if (currentView === 'home') {
            updateHomeFeed();
        } else if (currentView === 'blog') {
            updateBlogFeed();
        }
        
        // Update admin stats if on admin view
        if (isAdmin && currentView === 'admin') {
            updateAdminStats();
        }
        
        // Reveal animations
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(x => x.classList.add('in'));
        }, 80);
    }, (err) => {
        if (homeFeed) clearChildren(homeFeed);
        if (allFeed) clearChildren(allFeed);
        
        const e = document.createElement('div');
        e.className = 'post-card';
        e.textContent = 'Error loading posts: ' + err.message;
        if (homeFeed) homeFeed.appendChild(e);
        if (allFeed) allFeed.appendChild(e.cloneNode(true));
    });
}

// ========== INITIALIZATION ==========
function initApp() {
    // Apply saved theme
    if(localStorage.siteTheme === undefined) localStorage.siteTheme = 'dark';
    applyTheme(localStorage.siteTheme);
    
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize login system
    initLoginSystem();
    
    // Initialize tab navigation
    initTabNavigation();
    
    // Initialize admin functionality
    initAdminFunctionality();
    
    // Initialize event listeners
    initEventListeners();
    
    // Start real-time listener
    startRealtime();
    
    // Show home view
    showView('home');
}

function initEventListeners() {
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
            if (drawer) drawer.style.left = '0'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'block'; 
            
            if (window.innerWidth <= 768) {
                const drawerClock = document.getElementById('drawerClock');
                if (drawerClock) drawerClock.style.display = 'block';
            }
        });
    }
    
    if (closeDrawer) {
        closeDrawer.addEventListener('click', () => { 
            if (drawer) drawer.style.left = '-100%'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'none'; 
        });
    }
    
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', () => { 
            if (drawer) drawer.style.left = '-100%'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'none'; 
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
    
    // Back home button
    const backHome = document.getElementById('backHome');
    if (backHome) {
        backHome.addEventListener('click', () => {
            showView('home');
            document.querySelectorAll('.tab').forEach(tab => {
                if(tab.getAttribute('data-view') === 'home') {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogout = document.getElementById('drawerLogout');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (drawerLogout) drawerLogout.addEventListener('click', logout);
    
    // ESC key closes modals
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const loginModal = document.getElementById('loginModal');
            if (loginModal && loginModal.style.display === 'flex') {
                loginModal.style.display = 'none';
            }
            if (drawer) {
                drawer.style.left = '-100%';
                if (drawerBackdrop) drawerBackdrop.style.display = 'none';
            }
        }
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchInputBlog = document.getElementById('searchInputBlog');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const homeFeed = document.getElementById('homeFeed');
            if (homeFeed) {
                filterPosts(e.target.value, homeFeed, allPosts.filter(post => within7Days(post.timestamp)));
            }
        });
    }
    
    if (searchInputBlog) {
        searchInputBlog.addEventListener('input', (e) => {
            const allFeed = document.getElementById('allFeed');
            if (allFeed) {
                filterPosts(e.target.value, allFeed, allPosts);
            }
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

// Add shake animation for login errors
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
        t.style.cursor = 'pointer';
        t.addEventListener('click', () => openSinglePost(data.id, data));
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
    
    const shareBtn = document.createElement('button'); 
    shareBtn.className='action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share</span>';
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    pinnedPost.appendChild(actions);
}

// Create pinned post on home page
createPinnedPost();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
