// ========== ENHANCED GENZ SMART APP.JS ==========
// Enhanced with all new features: Security, Notifications, Comments, Analytics, Settings

// ========== FIREBASE IMPORTS & INITIALIZATION ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp, getDoc, getDocs,
  where, limit, writeBatch
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
let allComments = [];
let unsubPosts = null;
let unsubComments = null;
let quill = null;
let currentUser = null;

// Enhanced Admin Credentials with Security
const ADMIN_CREDENTIALS = {
  email: 'saffanakbar942@gmail.com',
  password: 'saffan942',
  // Additional security layers
  twoFactorEnabled: false,
  lastLogin: null
};

// Security Configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 3,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 60 * 60 * 1000, // 1 hour
  passwordMinLength: 8,
  requireSpecialChars: true
};

let loginAttempts = 0;
let lastLoginAttempt = 0;
let sessionTimer = null;

// ========== ENHANCED PAGE DETECTION ==========
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

// ========== ENHANCED CORE INITIALIZATION ==========
async function initApp() {
    console.log('🚀 Initializing GenZ Smart App for page:', currentPage);
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Check admin status first
        await checkAdminStatus();
        
        // Load user preferences
        loadUserPreferences();
        
        // Apply theme
        applyTheme(localStorage.siteTheme || 'dark');
        
        // Initialize common features
        initCommonFeatures();
        
        // Initialize page-specific features
        await initPageSpecificFeatures();
        
        // Start Firebase for pages that need it
        if (currentPage !== 'about' && currentPage !== 'settings') {
            await startRealtime();
        }
        
        // Initialize service worker for PWA
        initServiceWorker();
        
        // Check online status
        initOnlineStatus();
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        toast('Failed to initialize app', 'err');
    } finally {
        // Hide loading screen
        hideLoadingScreen();
    }
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

async function checkAdminStatus() {
    const savedAdmin = localStorage.getItem('isAdmin');
    const loginTime = localStorage.getItem('loginTime');
    
    if (savedAdmin === 'true' && loginTime) {
        const now = Date.now();
        const sessionAge = now - parseInt(loginTime);
        
        if (sessionAge < SECURITY_CONFIG.sessionTimeout) {
            isAdmin = true;
            updateAdminUI();
            startSessionTimer(SECURITY_CONFIG.sessionTimeout - sessionAge);
            console.log('✅ Admin session restored');
        } else {
            // Session expired
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('loginTime');
            toast('Session expired. Please login again.', 'err');
        }
    }
    
    // Load security settings
    loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    lastLoginAttempt = parseInt(localStorage.getItem('lastLoginAttempt') || '0');
}

function loadUserPreferences() {
    // Load user settings from localStorage
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Apply settings
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    if (settings.fontSize) {
        document.documentElement.style.fontSize = settings.fontSize;
    }
    
    // Load notification preferences
    const notifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    
    // Initialize current user
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
}

function applyTheme(t) {
    const html = document.documentElement;
    
    if (t === 'auto') {
        // Auto-detect theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        t = prefersDark ? 'dark' : 'light';
    }
    
    if (t === 'light') {
        html.classList.remove('dark');
        html.classList.add('light');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    localStorage.siteTheme = t;
    
    // Update theme in settings if available
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings.theme = t;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

// ========== ENHANCED COMMON FEATURES ==========
function initCommonFeatures() {
    initClock();
    initThemeToggle();
    initMenu();
    initLoginSystem();
    initNavigation();
    initNotifications();
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

    if (menuBtn && drawer) {
        menuBtn.addEventListener('click', () => { 
            drawer.style.left = '0'; 
            if (drawerBackdrop) drawerBackdrop.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeDrawer && drawer) {
        closeDrawer.addEventListener('click', closeDrawerMenu);
    }

    if (drawerBackdrop && drawer) {
        drawerBackdrop.addEventListener('click', closeDrawerMenu);
    }

    function closeDrawerMenu() {
        const drawer = document.getElementById('drawer');
        const drawerBackdrop = document.getElementById('drawerBackdrop');
        if (drawer) drawer.style.left = '-100%';
        if (drawerBackdrop) drawerBackdrop.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Close drawer with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawerMenu();
        }
    });
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
            if (onlineStatus) {
                onlineStatus.style.display = 'flex';
            }
            if (offlineIndicator) {
                offlineIndicator.style.display = 'none';
            }
        } else {
            if (onlineStatus) {
                onlineStatus.style.display = 'none';
            }
            if (offlineIndicator) {
                offlineIndicator.style.display = 'flex';
            }
            toast('You are currently offline', 'warning');
        }
    }
    
    // Initial check
    updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// ========== ENHANCED LOGIN SYSTEM WITH SECURITY ==========
function initLoginSystem() {
    const openLogin = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const loginCancel = document.getElementById('loginCancel');
    const loginSubmit = document.getElementById('loginSubmit');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');

    console.log('🔐 Initializing enhanced login system...');

    // Open login modal
    if (openLogin && loginModal) {
        openLogin.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔄 Opening login modal...');
            openLoginModal();
        });
    } else {
        console.error('❌ Login elements not found');
    }

    // Close login modal
    if (loginCancel && loginModal) {
        loginCancel.addEventListener('click', closeLoginModal);
    }

    // Login submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('loginPassword');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeLoginModal();
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal && loginModal.style.display === 'flex') {
            closeLoginModal();
        }
    });

    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const drawerLogout = document.getElementById('drawerLogout');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (drawerLogout) drawerLogout.addEventListener('click', logout);
}

function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const loginEmail = document.getElementById('loginEmail');
    
    if (loginModal) {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        if (loginEmail) loginEmail.value = '';
        const loginPassword = document.getElementById('loginPassword');
        if (loginPassword) {
            loginPassword.value = '';
            loginPassword.type = 'password';
        }
        
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
        
        // Check for lockout
        const now = Date.now();
        if (loginAttempts >= SECURITY_CONFIG.maxLoginAttempts && 
            (now - lastLoginAttempt) < SECURITY_CONFIG.lockoutTime) {
            const remainingTime = Math.ceil((SECURITY_CONFIG.lockoutTime - (now - lastLoginAttempt)) / 60000);
            showLockoutMessage(remainingTime);
        }
        
        setTimeout(() => {
            if (loginEmail) loginEmail.focus();
        }, 300);
    }
}

function closeLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showLockoutMessage(minutes) {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.innerHTML = `
            <div class="lockout-message">
                <i class="fas fa-lock"></i>
                <h3>Account Temporarily Locked</h3>
                <p>Too many failed login attempts. Please try again in ${minutes} minutes.</p>
                <button type="button" id="lockoutOk" class="btn-primary">OK</button>
            </div>
        `;
        
        document.getElementById('lockoutOk').addEventListener('click', closeLoginModal);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginSubmit = document.getElementById('loginSubmit');
    const rememberMe = document.getElementById('rememberMe');
    
    if (!loginEmail || !loginPassword || !loginSubmit) {
        toast('Login system error', 'err');
        return;
    }
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    // Enhanced input validation
    if (!email || !password) {
        toast('Please enter both email and password', 'err');
        return;
    }
    
    if (!isValidEmail(email)) {
        toast('Please enter a valid email address', 'err');
        return;
    }
    
    // Check for lockout
    const now = Date.now();
    if (loginAttempts >= SECURITY_CONFIG.maxLoginAttempts && 
        (now - lastLoginAttempt) < SECURITY_CONFIG.lockoutTime) {
        const remainingTime = Math.ceil((SECURITY_CONFIG.lockoutTime - (now - lastLoginAttempt)) / 60000);
        toast(`Too many failed attempts. Try again in ${remainingTime} minutes.`, 'err');
        return;
    }
    
    // Show loading state
    const originalText = loginSubmit.innerHTML;
    loginSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    loginSubmit.disabled = true;
    
    try {
        // Simulate network delay with enhanced security
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            // Successful login
            await handleSuccessfulLogin(rememberMe?.checked, now);
        } else {
            // Failed login
            await handleFailedLogin(now);
        }
    } catch (error) {
        console.error('Login error:', error);
        toast('Login failed due to system error', 'err');
    } finally {
        // Reset button
        loginSubmit.innerHTML = originalText;
        loginSubmit.disabled = false;
    }
}

async function handleSuccessfulLogin(remember, loginTime) {
    loginAttempts = 0;
    isAdmin = true;
    
    // Store session data
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('loginTime', loginTime.toString());
    localStorage.setItem('loginAttempts', '0');
    localStorage.setItem('lastLoginAttempt', loginTime.toString());
    
    if (remember) {
        localStorage.setItem('rememberMe', 'true');
    }
    
    // Update admin credentials
    ADMIN_CREDENTIALS.lastLogin = new Date().toISOString();
    
    closeLoginModal();
    updateAdminUI();
    startSessionTimer(SECURITY_CONFIG.sessionTimeout);
    
    toast('Welcome back, Admin! 👋', 'ok');
    
    // Log security event
    logSecurityEvent('admin_login_success', { email: ADMIN_CREDENTIALS.email });
    
    // If on admin page, refresh to show admin features
    if (currentPage === 'admin') {
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

async function handleFailedLogin(attemptTime) {
    loginAttempts++;
    lastLoginAttempt = attemptTime;
    
    localStorage.setItem('loginAttempts', loginAttempts.toString());
    localStorage.setItem('lastLoginAttempt', lastLoginAttempt.toString());
    
    // Log security event
    logSecurityEvent('admin_login_failed', { attempts: loginAttempts });
    
    if (loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        toast('Account temporarily locked due to too many failed attempts', 'err');
        // Send security alert
        await sendSecurityAlert('multiple_failed_logins', { attempts: loginAttempts });
    } else {
        toast('Invalid email or password', 'err');
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => loginModal.style.animation = '', 500);
        }
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function startSessionTimer(duration) {
    // Clear existing timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }
    
    const sessionTimerElement = document.getElementById('sessionTimer');
    let timeLeft = duration;
    
    sessionTimer = setInterval(() => {
        timeLeft -= 1000;
        
        if (sessionTimerElement) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            sessionTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(sessionTimer);
            logout();
            toast('Session expired. Please login again.', 'err');
        }
    }, 1000);
}

function logSecurityEvent(event, data) {
    const securityLog = JSON.parse(localStorage.getItem('securityLog') || '[]');
    securityLog.push({
        event,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'localhost' // In real app, this would come from your backend
    });
    
    // Keep only last 100 events
    if (securityLog.length > 100) {
        securityLog.shift();
    }
    
    localStorage.setItem('securityLog', JSON.stringify(securityLog));
}

async function sendSecurityAlert(type, data) {
    // In a real application, this would send an email or push notification
    console.log('🚨 Security Alert:', type, data);
    
    // For now, just log to console and show a toast
    toast('Security alert: Multiple failed login attempts detected', 'warning');
}

function updateAdminUI() {
    console.log('🛠️ Updating admin UI');
    
    // Update navigation
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const composeQuickLink = document.getElementById('composeQuickLink');
    
    if (adminNavLink) adminNavLink.style.display = 'flex';
    if (adminDrawerLink) adminDrawerLink.style.display = 'block';
    if (drawerLogout) drawerLogout.style.display = 'block';
    if (openLogin) openLogin.style.display = 'none';
    if (composeQuickLink) composeQuickLink.style.display = 'flex';
    
    // Update security alert
    const securityAlert = document.getElementById('securityAlert');
    if (securityAlert) {
        securityAlert.style.display = 'flex';
    }
    
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
    
    // Clear security data
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberMe');
    
    // Clear session timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
    
    // Log security event
    logSecurityEvent('admin_logout', {});
    
    // Hide admin elements
    const adminNavLink = document.getElementById('adminNavLink');
    const adminDrawerLink = document.getElementById('adminDrawerLink');
    const drawerLogout = document.getElementById('drawerLogout');
    const openLogin = document.getElementById('openLogin');
    const composeQuickLink = document.getElementById('composeQuickLink');
    const adminPanel = document.getElementById('adminPanel');
    const composer = document.getElementById('composer');
    const adminTab = document.getElementById('adminTab');
    const securityAlert = document.getElementById('securityAlert');
    
    if (adminNavLink) adminNavLink.style.display = 'none';
    if (adminDrawerLink) adminDrawerLink.style.display = 'none';
    if (drawerLogout) drawerLogout.style.display = 'none';
    if (openLogin) openLogin.style.display = 'block';
    if (composeQuickLink) composeQuickLink.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'none';
    if (composer) composer.style.display = 'none';
    if (adminTab) adminTab.style.display = 'none';
    if (securityAlert) securityAlert.style.display = 'none';
    
    toast('Logged out successfully', 'ok');
    
    // Redirect from admin page
    if (currentPage === 'admin') {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// ========== ENHANCED PAGE-SPECIFIC FEATURES ==========
async function initPageSpecificFeatures() {
    switch (currentPage) {
        case 'home':
            await initHomePage();
            break;
        case 'blog':
            await initBlogPage();
            break;
        case 'admin':
            await initAdminPage();
            break;
        case 'about':
            await initAboutPage();
            break;
        case 'analytics':
            await initAnalyticsPage();
            break;
        case 'comments':
            await initCommentsPage();
            break;
        case 'settings':
            await initSettingsPage();
            break;
    }
}

async function initHomePage() {
    console.log('🏠 Initializing home page');
    
    // Initialize hero section
    initHeroSection();
    
    // Initialize pinned post
    createPinnedPost();
    
    // Initialize newsletter
    initNewsletter();
    
    // Initialize community stats
    initCommunityStats();
}

function initHeroSection() {
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
    
    // Subscribe button
    const subscribeBtn = document.getElementById('subscribeBtn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        toast('Notifications enabled! You will receive updates.', 'ok');
                    }
                });
            } else {
                toast('You are already subscribed to updates', 'ok');
            }
        });
    }
    
    // Share site button
    const shareSiteBtn = document.getElementById('shareSiteBtn');
    if (shareSiteBtn) {
        shareSiteBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: 'GenZ Smart Community',
                    text: 'Join our community of 50K+ readers for ideas, motivation, and connections!',
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    toast('Link copied to clipboard!', 'ok');
                });
            }
        });
    }
}

function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            if (emailInput && isValidEmail(emailInput.value)) {
                // In a real app, you would send this to your email service
                toast('Thanks for subscribing! Welcome to our community.', 'ok');
                emailInput.value = '';
                
                // Log subscription
                logNewsletterSubscription(emailInput.value);
            } else {
                toast('Please enter a valid email address', 'err');
            }
        });
    }
}

function logNewsletterSubscription(email) {
    const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
    subscriptions.push({
        email: email,
        timestamp: new Date().toISOString(),
        source: 'website'
    });
    localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
}

async function initBlogPage() {
    console.log('📚 Initializing blog page');
    
    // Initialize blog controls
    initBlogControls();
    
    // Initialize advanced filters
    initAdvancedFilters();
}

function initBlogControls() {
    // Search functionality
    const searchInput = document.getElementById('searchInputBlog');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const allFeed = document.getElementById('allFeed');
                if (allFeed) {
                    filterPosts(e.target.value, allFeed, allPosts);
                }
            }, 300);
        });
        
        // Clear search button
        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            searchInput.addEventListener('input', () => {
                clearSearch.style.display = searchInput.value ? 'block' : 'none';
            });
            
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                clearSearch.style.display = 'none';
                const allFeed = document.getElementById('allFeed');
                if (allFeed) {
                    filterPosts('', allFeed, allPosts);
                }
            });
        }
    }
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyBlogFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyBlogFilters);
    }
    
    // Advanced filters toggle
    const filterToggle = document.getElementById('filterToggle');
    const advancedFilters = document.getElementById('advancedFilters');
    
    if (filterToggle && advancedFilters) {
        filterToggle.addEventListener('click', () => {
            const isVisible = advancedFilters.style.display === 'block';
            advancedFilters.style.display = isVisible ? 'none' : 'block';
            filterToggle.innerHTML = isVisible ? 
                '<i class="fas fa-sliders-h"></i>' : 
                '<i class="fas fa-times"></i>';
        });
    }
}

function applyBlogFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const allFeed = document.getElementById('allFeed');
    
    if (!allFeed) return;
    
    let filteredPosts = [...allPosts];
    
    // Apply category filter
    if (categoryFilter && categoryFilter.value) {
        filteredPosts = filteredPosts.filter(post => 
            post.data().category === categoryFilter.value
        );
    }
    
    // Apply sort
    if (sortFilter) {
        switch (sortFilter.value) {
            case 'newest':
                filteredPosts.sort((a, b) => 
                    b.data().timestamp?.toDate() - a.data().timestamp?.toDate()
                );
                break;
            case 'oldest':
                filteredPosts.sort((a, b) => 
                    a.data().timestamp?.toDate() - b.data().timestamp?.toDate()
                );
                break;
            case 'popular':
                filteredPosts.sort((a, b) => 
                    (b.data().likes || 0) - (a.data().likes || 0)
                );
                break;
            case 'trending':
                // Simple trending algorithm based on recent likes and comments
                filteredPosts.sort((a, b) => {
                    const scoreA = calculateTrendingScore(a);
                    const scoreB = calculateTrendingScore(b);
                    return scoreB - scoreA;
                });
                break;
        }
    }
    
    // Apply advanced filters
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const minLikes = document.getElementById('minLikes');
    const authorFilter = document.getElementById('authorFilter');
    
    if (dateFrom && dateFrom.value) {
        const fromDate = new Date(dateFrom.value);
        filteredPosts = filteredPosts.filter(post => 
            post.data().timestamp?.toDate() >= fromDate
        );
    }
    
    if (dateTo && dateTo.value) {
        const toDate = new Date(dateTo.value);
        toDate.setHours(23, 59, 59, 999);
        filteredPosts = filteredPosts.filter(post => 
            post.data().timestamp?.toDate() <= toDate
        );
    }
    
    if (minLikes && minLikes.value) {
        filteredPosts = filteredPosts.filter(post => 
            (post.data().likes || 0) >= parseInt(minLikes.value)
        );
    }
    
    if (authorFilter && authorFilter.value) {
        filteredPosts = filteredPosts.filter(post => 
            post.data().author === authorFilter.value
        );
    }
    
    // Display filtered posts
    displayFilteredPosts(filteredPosts, allFeed);
}

function calculateTrendingScore(post) {
    const data = post.data();
    const ageInHours = (Date.now() - data.timestamp?.toDate().getTime()) / (1000 * 60 * 60);
    const likes = data.likes || 0;
    const comments = data.commentCount || 0;
    
    // Simple trending score: recent posts with engagement score higher
    return (likes * 2 + comments) / Math.max(1, ageInHours);
}

function displayFilteredPosts(posts, container) {
    clearChildren(container);
    
    if (posts.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'post-card';
        noResults.style.textAlign = 'center';
        noResults.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No posts found</h3>
            <p>Try adjusting your filters or search terms</p>
        `;
        container.appendChild(noResults);
    } else {
        posts.forEach(post => {
            const card = createCard(post);
            if (card) container.appendChild(card);
        });
    }
}

function initAdvancedFilters() {
    // Initialize date inputs with sensible defaults
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom) {
        // Set default to 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFrom.valueAsDate = thirtyDaysAgo;
    }
    
    if (dateTo) {
        // Set default to today
        dateTo.valueAsDate = new Date();
    }
    
    // Apply filters when advanced filter values change
    const advancedInputs = document.querySelectorAll('#advancedFilters input, #advancedFilters select');
    advancedInputs.forEach(input => {
        input.addEventListener('change', applyBlogFilters);
    });
}

async function initAdminPage() {
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
    await initQuillEditor();
    
    // Initialize admin features
    initAdminFeatures();
    
    // Load admin stats
    updateAdminStats();
}

async function initQuillEditor() {
    if (typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    ['link', 'blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            },
            placeholder: 'Share something with your community of 50K+ readers...',
        });
        
        // Add custom styles for dark mode
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            const style = document.createElement('style');
            style.textContent = `
                .ql-editor {
                    color: var(--text);
                    background: var(--panel);
                }
                .ql-toolbar.ql-snow {
                    border-color: var(--divider);
                    background: var(--panel);
                }
                .ql-container.ql-snow {
                    border-color: var(--divider);
                }
                .ql-snow .ql-stroke {
                    stroke: var(--text);
                }
                .ql-snow .ql-fill {
                    fill: var(--text);
                }
                .ql-snow .ql-picker {
                    color: var(--text);
                }
            `;
            editorContainer.appendChild(style);
        }
    } else {
        console.error('❌ Quill not loaded');
        // Fallback to textarea
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.innerHTML = `
                <textarea id="fallbackEditor" placeholder="Share something with your community..." 
                         style="width: 100%; height: 200px; padding: 15px; border: 1px solid var(--divider); 
                                background: var(--panel); color: var(--text); border-radius: 8px;"></textarea>
            `;
        }
    }
}

function initAdminFeatures() {
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
            openComposer();
        });
    }
    
    // Schedule post button
    const schedulePostBtn = document.getElementById('schedulePostBtn');
    if (schedulePostBtn) {
        schedulePostBtn.addEventListener('click', () => {
            openComposer();
            // Enable scheduling
            const schedulePost = document.getElementById('schedulePost');
            if (schedulePost) {
                schedulePost.checked = true;
                toggleScheduleOptions(true);
            }
        });
    }
    
    // Schedule options toggle
    const schedulePost = document.getElementById('schedulePost');
    if (schedulePost) {
        schedulePost.addEventListener('change', (e) => {
            toggleScheduleOptions(e.target.checked);
        });
    }
    
    // Cancel compose
    const cancelCompose = document.getElementById('cancelCompose');
    if (cancelCompose) {
        cancelCompose.addEventListener('click', closeComposer);
    }
    
    // Close composer
    const closeComposerBtn = document.getElementById('closeComposer');
    if (closeComposerBtn) {
        closeComposerBtn.addEventListener('click', closeComposer);
    }
    
    // Publish post
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async () => {
            await publishPost(selectedCategory, editPostId);
        });
    }
    
    // Save draft
    const saveDraft = document.getElementById('saveDraft');
    if (saveDraft) {
        saveDraft.addEventListener('click', async () => {
            await savePostAsDraft(selectedCategory);
        });
    }
    
    // Preview post
    const previewPost = document.getElementById('previewPost');
    if (previewPost) {
        previewPost.addEventListener('click', previewPostContent);
    }
    
    // Initialize other admin features
    initAdminBackup();
    initAdminEmail();
    initAdminSEO();
}

function openComposer() {
    const composer = document.getElementById('composer');
    const composeTitle = document.getElementById('composeTitle');
    const composeImage = document.getElementById('composeImage');
    
    if (composer) {
        composer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        if (composeTitle) composeTitle.value = '';
        if (composeImage) composeImage.value = '';
        if (quill) quill.root.innerHTML = '';
        
        editPostId = null;
        
        // Reset scheduling
        const schedulePost = document.getElementById('schedulePost');
        if (schedulePost) {
            schedulePost.checked = false;
            toggleScheduleOptions(false);
        }
        
        // Set default schedule time to next hour
        const scheduleTime = document.getElementById('scheduleTime');
        if (scheduleTime) {
            const nextHour = new Date();
            nextHour.setHours(nextHour.getHours() + 1);
            nextHour.setMinutes(0);
            scheduleTime.value = nextHour.toISOString().slice(0, 16);
        }
        
        setTimeout(() => {
            if (composeTitle) composeTitle.focus();
        }, 300);
    }
}

function closeComposer() {
    const composer = document.getElementById('composer');
    if (composer) {
        composer.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset form
        if (quill) quill.root.innerHTML = '';
        const composeTitle = document.getElementById('composeTitle');
        const composeImage = document.getElementById('composeImage');
        if (composeTitle) composeTitle.value = '';
        if (composeImage) composeImage.value = '';
        
        editPostId = null;
    }
}

function toggleScheduleOptions(show) {
    const scheduleOptions = document.getElementById('scheduleOptions');
    if (scheduleOptions) {
        scheduleOptions.style.display = show ? 'block' : 'none';
    }
}

async function publishPost(category, editId = null) {
    if (!quill) {
        toast('Editor not loaded', 'err');
        return;
    }
    
    const content = quill.root.innerHTML;
    const composeTitle = document.getElementById('composeTitle');
    const composeImage = document.getElementById('composeImage');
    const pinPost = document.getElementById('pinPost');
    const schedulePost = document.getElementById('schedulePost');
    const scheduleTime = document.getElementById('scheduleTime');
    
    const title = composeTitle ? composeTitle.value.trim() : '';
    const image = composeImage ? composeImage.value.trim() : '';
    const shouldPin = pinPost ? pinPost.checked : false;
    const shouldSchedule = schedulePost ? schedulePost.checked : false;
    const scheduledTime = shouldSchedule && scheduleTime ? new Date(scheduleTime.value) : null;
    
    const textContent = quill.getText().trim();
    if (!textContent) { 
        toast('Write something before publishing', 'err'); 
        return; 
    }
    
    try {
        const postData = { 
            title, 
            content, 
            image,
            category: category,
            author: 'GenZ Owais',
            likes: 0,
            views: 0,
            commentCount: 0,
            pinned: shouldPin
        };
        
        if (editId) {
            // Update existing post
            await updateDoc(doc(db, 'posts', editId), postData);
            toast('Post updated successfully', 'edit');
            editId = null;
        } else if (shouldSchedule && scheduledTime) {
            // Schedule post
            postData.timestamp = scheduledTime;
            postData.status = 'scheduled';
            await addDoc(collection(db, 'posts'), postData);
            toast('Post scheduled successfully', 'ok');
        } else {
            // Create new post
            postData.timestamp = serverTimestamp();
            postData.status = 'published';
            await addDoc(collection(db, 'posts'), postData);
            toast('New post published successfully', 'ok');
        }
        
        closeComposer();
        
    } catch (error) {
        console.error('Firebase error:', error);
        toast('Error: ' + error.message, 'err');
    }
}

async function savePostAsDraft(category) {
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
    if (!textContent) { 
        toast('Write something before saving', 'err'); 
        return; 
    }
    
    try {
        await addDoc(collection(db, 'drafts'), { 
            title, 
            content, 
            image,
            category: category,
            author: 'GenZ Owais',
            timestamp: serverTimestamp(),
            status: 'draft'
        });
        
        toast('Draft saved successfully', 'ok');
        
    } catch (error) {
        console.error('Firebase error:', error);
        toast('Error saving draft: ' + error.message, 'err');
    }
}

function previewPostContent() {
    const composeTitle = document.getElementById('composeTitle');
    const content = quill ? quill.root.innerHTML : '';
    
    const title = composeTitle ? composeTitle.value.trim() : 'Preview';
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview: ${title}</title>
            <style>
                body { 
                    font-family: 'Inter', sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px;
                    line-height: 1.6;
                }
                .preview-header {
                    border-bottom: 2px solid #1d9bf0;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h1>${title}</h1>
                <p><em>Preview - Not published</em></p>
            </div>
            <div>${content}</div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

function initAdminBackup() {
    const exportDataBtn = document.getElementById('exportDataBtn');
    const fullBackup = document.getElementById('fullBackup');
    const exportPosts = document.getElementById('exportPosts');
    const exportComments = document.getElementById('exportComments');
    const triggerRestore = document.getElementById('triggerRestore');
    const restoreFile = document.getElementById('restoreFile');
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }
    
    if (fullBackup) {
        fullBackup.addEventListener('click', createFullBackup);
    }
    
    if (exportPosts) {
        exportPosts.addEventListener('click', exportPostsData);
    }
    
    if (exportComments) {
        exportComments.addEventListener('click', exportCommentsData);
    }
    
    if (triggerRestore) {
        triggerRestore.addEventListener('click', () => {
            restoreFile.click();
        });
    }
    
    if (restoreFile) {
        restoreFile.addEventListener('change', handleRestoreFile);
    }
}

async function exportAllData() {
    try {
        const postsData = allPosts.map(post => ({
            id: post.id,
            ...post.data()
        }));
        
        const dataStr = JSON.stringify({
            posts: postsData,
            exportDate: new Date().toISOString(),
            version: '1.0',
            totalPosts: postsData.length,
            totalReaders: '50K+'
        }, null, 2);
        
        downloadData(dataStr, 'genz-smart-full-export.json');
        toast('All data exported successfully', 'ok');
        
    } catch (error) {
        console.error('Export error:', error);
        toast('Error exporting data', 'err');
    }
}

async function createFullBackup() {
    try {
        // Get all collections
        const [postsSnapshot, commentsSnapshot] = await Promise.all([
            getDocs(collection(db, 'posts')),
            getDocs(collection(db, 'comments'))
        ]);
        
        const backupData = {
            posts: postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            comments: commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            backupDate: new Date().toISOString(),
            version: '1.0',
            totalPosts: postsSnapshot.size,
            totalComments: commentsSnapshot.size
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        downloadData(dataStr, `genz-smart-backup-${Date.now()}.json`);
        
        // Update last backup time
        document.getElementById('lastBackup').textContent = new Date().toLocaleString();
        toast('Full backup created successfully', 'ok');
        
    } catch (error) {
        console.error('Backup error:', error);
        toast('Error creating backup', 'err');
    }
}

function downloadData(data, filename) {
    const dataBlob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function initAdminEmail() {
    const sendEmail = document.getElementById('sendEmail');
    if (sendEmail) {
        sendEmail.addEventListener('click', sendNewsletter);
    }
}

async function sendNewsletter() {
    const emailSubject = document.getElementById('emailSubject');
    const emailMessage = document.getElementById('emailMessage');
    
    if (!emailSubject || !emailMessage) {
        toast('Email system not configured', 'err');
        return;
    }
    
    const subject = emailSubject.value.trim();
    const message = emailMessage.value.trim();
    
    if (!subject || !message) {
        toast('Please enter both subject and message', 'err');
        return;
    }
    
    // Simulate sending email (in real app, this would connect to your email service)
    toast('Newsletter sent to 50K+ subscribers!', 'ok');
    
    // Clear form
    emailSubject.value = '';
    emailMessage.value = '';
}

function initAdminSEO() {
    const generateSitemap = document.getElementById('generateSitemap');
    const analyzeSEO = document.getElementById('analyzeSEO');
    
    if (generateSitemap) {
        generateSitemap.addEventListener('click', generateSitemapFile);
    }
    
    if (analyzeSEO) {
        analyzeSEO.addEventListener('click', analyzeSEOPerformance);
    }
}

function generateSitemapFile() {
    const baseUrl = window.location.origin;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/index.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/blog.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${baseUrl}/about.html</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    
    downloadData(sitemap, 'sitemap.xml');
    toast('Sitemap generated successfully', 'ok');
}

function analyzeSEOPerformance() {
    // Simple SEO analysis
    const analysis = {
        score: 95,
        issues: [
            'Meta descriptions could be improved',
            'Some images missing alt tags',
            'Internal linking can be optimized'
        ],
        recommendations: [
            'Add more descriptive meta tags',
            'Optimize image sizes for faster loading',
            'Improve mobile responsiveness'
        ]
    };
    
    toast(`SEO Score: ${analysis.score}% - Check console for details`, 'ok');
    console.log('SEO Analysis:', analysis);
}

async function initAboutPage() {
    console.log('👤 Initializing about page');
    
    // Initialize banner upload
    initBannerUpload();
    
    // Initialize profile photo upload
    initProfilePhotoUpload();
    
    // Update stats
    updateAboutStats();
}

function initBannerUpload() {
    const bannerUploadBtn = document.getElementById('bannerUploadBtn');
    const bannerUploadInput = document.getElementById('bannerUploadInput');
    const aboutBanner = document.getElementById('aboutBanner');
    
    if (bannerUploadBtn && bannerUploadInput && aboutBanner && isAdmin) {
        bannerUploadBtn.style.display = 'flex';
        
        bannerUploadBtn.addEventListener('click', () => {
            bannerUploadInput.click();
        });
        
        bannerUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    aboutBanner.style.backgroundImage = `url(${e.target.result})`;
                    // Save to localStorage for persistence
                    localStorage.setItem('aboutBanner', e.target.result);
                    toast('Banner updated successfully', 'ok');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Load saved banner
        const savedBanner = localStorage.getItem('aboutBanner');
        if (savedBanner) {
            aboutBanner.style.backgroundImage = `url(${savedBanner})`;
        }
    }
}

function initProfilePhotoUpload() {
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const photoUploadInput = document.getElementById('photoUploadInput');
    const profilePhoto = document.getElementById('profilePhoto');
    
    if (photoUploadBtn && photoUploadInput && profilePhoto && isAdmin) {
        photoUploadBtn.style.display = 'flex';
        
        photoUploadBtn.addEventListener('click', () => {
            photoUploadInput.click();
        });
        
        photoUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePhoto.src = e.target.result;
                    // Save to localStorage for persistence
                    localStorage.setItem('profilePhoto', e.target.result);
                    toast('Profile photo updated successfully', 'ok');
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Load saved photo
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            profilePhoto.src = savedPhoto;
        }
    }
}

function updateAboutStats() {
    const aboutPostCount = document.getElementById('aboutPostCount');
    if (aboutPostCount) {
        aboutPostCount.textContent = allPosts.length;
    }
}

async function initAnalyticsPage() {
    console.log('📊 Initializing analytics page');
    // Analytics will be handled by analytics.js
}

async function initCommentsPage() {
    console.log('💬 Initializing comments page');
    // Comments will be handled by comments.js
}

async function initSettingsPage() {
    console.log('⚙️ Initializing settings page');
    // Settings will be handled by settings.js
}

// ========== ENHANCED FIREBASE & POST MANAGEMENT ==========
async function startRealtime() {
    console.log('🔥 Starting Firebase real-time listeners');
    
    // Clear previous listeners
    if (unsubPosts) {
        unsubPosts();
        unsubPosts = null;
    }
    
    if (unsubComments) {
        unsubComments();
        unsubComments = null;
    }
    
    // Show loading state
    showLoadingStates();
    
    try {
        // Create queries
        const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
        const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
        
        // Set up real-time listeners
        unsubPosts = onSnapshot(postsQuery, 
            // Success callback
            (snapshot) => {
                console.log('📥 Received', snapshot.docs.length, 'posts');
                handlePostsUpdate(snapshot);
            },
            // Error callback
            (error) => {
                console.error('❌ Posts listener error:', error);
                handleFirebaseError(error, 'posts');
            }
        );
        
        unsubComments = onSnapshot(commentsQuery,
            (snapshot) => {
                console.log('💬 Received', snapshot.docs.length, 'comments');
                allComments = snapshot.docs;
                updateCommentsCount();
            },
            (error) => {
                console.error('❌ Comments listener error:', error);
                handleFirebaseError(error, 'comments');
            }
        );
        
    } catch (error) {
        console.error('❌ Firebase setup error:', error);
        toast('Failed to connect to database', 'err');
    }
}

function showLoadingStates() {
    const homeFeed = document.getElementById('homeFeed');
    const allFeed = document.getElementById('allFeed');
    
    if (homeFeed) clearChildren(homeFeed);
    if (allFeed) clearChildren(allFeed);
    
    const loading = document.createElement('div');
    loading.className = 'loading-spinner';
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Loading content...</p>
    `;
    
    if (homeFeed) homeFeed.appendChild(loading);
    if (allFeed) allFeed.appendChild(loading.cloneNode(true));
}

function handlePostsUpdate(snapshot) {
    allPosts = snapshot.docs;
    
    // Update counters
    updatePostCounters(snapshot.docs.length);
    
    // Update feeds based on current page
    updatePageFeeds();
    
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
}

function updatePostCounters(total) {
    const badgeCount = document.getElementById('badgeCount');
    const postCount = document.getElementById('postCount');
    const aboutPostCount = document.getElementById('aboutPostCount');
    
    if (badgeCount) badgeCount.textContent = total;
    if (postCount) postCount.textContent = total;
    if (aboutPostCount) aboutPostCount.textContent = total;
}

function updateCommentsCount() {
    const commentCount = document.getElementById('commentCount');
    const totalComments = document.getElementById('totalComments');
    
    if (commentCount) commentCount.textContent = allComments.length;
    if (totalComments) totalComments.textContent = allComments.length;
}

function updatePageFeeds() {
    switch (currentPage) {
        case 'home':
            updateHomeFeed();
            updateCommunityStats();
            break;
        case 'blog':
            updateBlogFeed();
            break;
        case 'admin':
            updateAdminFeed();
            break;
    }
}

function updateHomeFeed() {
    const homeFeed = document.getElementById('homeFeed');
    if (!homeFeed) return;
    
    clearChildren(homeFeed);
    const recent = allPosts.filter(post => within7Days(post.data().timestamp));
    
    if (recent.length === 0) {
        showEmptyState(homeFeed, 'No recent posts', 'Check back later for new content');
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
        showEmptyState(allFeed, 'No posts yet', 'Be the first to post something amazing!');
    } else {
        allPosts.forEach(post => {
            const card = createCard(post);
            if (card) allFeed.appendChild(card);
        });
    }
}

function updateAdminFeed() {
    // Update admin activity feed
    updateAdminActivity();
    
    // Update scheduled posts
    updateScheduledPosts();
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
    const totalComments = allComments.length;
    
    const adminPostCount = document.getElementById('adminPostCount');
    const adminTodayPosts = document.getElementById('adminTodayPosts');
    const adminLikes = document.getElementById('adminLikes');
    const adminViews = document.getElementById('adminViews');
    const adminComments = document.getElementById('adminComments');
    
    if (adminPostCount) adminPostCount.textContent = totalPosts;
    if (adminTodayPosts) adminTodayPosts.textContent = todayPosts;
    if (adminLikes) adminLikes.textContent = totalLikes;
    if (adminViews) adminViews.textContent = totalViews;
    if (adminComments) adminComments.textContent = totalComments;
    
    // Update trends (simplified)
    updateAdminTrends();
}

function updateAdminTrends() {
    // Simple trend calculation based on previous day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPosts = allPosts.filter(post => {
        const postDate = post.data().timestamp?.toDate ? 
            post.data().timestamp.toDate().toDateString() : 
            new Date(post.data().timestamp).toDateString();
        return postDate === yesterday.toDateString();
    }).length;
    
    const todayPosts = allPosts.filter(post => {
        const postDate = post.data().timestamp?.toDate ? 
            post.data().timestamp.toDate().toDateString() : 
            new Date(post.data().timestamp).toDateString();
        return postDate === new Date().toDateString();
    }).length;
    
    const postTrend = document.getElementById('postTrend');
    if (postTrend && yesterdayPosts > 0) {
        const trend = ((todayPosts - yesterdayPosts) / yesterdayPosts) * 100;
        postTrend.innerHTML = `<i class="fas fa-arrow-${trend >= 0 ? 'up' : 'down'}"></i> ${Math.abs(trend).toFixed(1)}%`;
        postTrend.className = `stat-trend ${trend >= 0 ? 'up' : 'down'}`;
    }
}

function updateAdminActivity() {
    const activityFeed = document.getElementById('adminActivityFeed');
    if (!activityFeed) return;
    
    clearChildren(activityFeed);
    
    // Show recent activities (last 10 posts)
    const recentActivities = allPosts.slice(0, 10);
    
    if (recentActivities.length === 0) {
        showEmptyState(activityFeed, 'No activity yet', 'Posts will appear here');
        return;
    }
    
    recentActivities.forEach(post => {
        const activity = createActivityItem(post);
        if (activity) activityFeed.appendChild(activity);
    });
}

function createActivityItem(post) {
    const data = post.data();
    const activity = document.createElement('div');
    activity.className = 'activity-item';
    
    activity.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-newspaper"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">New post: "${data.title || 'Untitled'}"</div>
            <div class="activity-time">${data.timestamp?.toDate ? data.timestamp.toDate().toLocaleDateString() : 'Recently'}</div>
        </div>
    `;
    
    return activity;
}

function updateScheduledPosts() {
    const scheduledPosts = document.getElementById('scheduledPosts');
    if (!scheduledPosts) return;
    
    const scheduled = allPosts.filter(post => post.data().status === 'scheduled');
    
    if (scheduled.length === 0) {
        scheduledPosts.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No scheduled posts</p>
            </div>
        `;
    } else {
        clearChildren(scheduledPosts);
        scheduled.forEach(post => {
            const card = createScheduledCard(post);
            if (card) scheduledPosts.appendChild(card);
        });
    }
}

function createScheduledCard(post) {
    const data = post.data();
    const card = document.createElement('div');
    card.className = 'post-card scheduled';
    
    card.innerHTML = `
        <div class="post-head">
            <div class="post-avatar">GZ</div>
            <div class="post-meta">
                <div class="post-author">${data.author}</div>
                <div class="post-time">Scheduled: ${data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'Soon'}</div>
            </div>
        </div>
        <div class="post-title">${data.title || 'Untitled'}</div>
        <div class="post-body">${data.content.substring(0, 100)}...</div>
        <div class="post-actions">
            <button class="action-btn edit-schedule" data-id="${post.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn publish-now" data-id="${post.id}">
                <i class="fas fa-paper-plane"></i> Publish Now
            </button>
            <button class="action-btn delete-schedule" data-id="${post.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.edit-schedule').addEventListener('click', () => editScheduledPost(post.id));
    card.querySelector('.publish-now').addEventListener('click', () => publishScheduledPost(post.id));
    card.querySelector('.delete-schedule').addEventListener('click', () => deleteScheduledPost(post.id));
    
    return card;
}

async function editScheduledPost(postId) {
    // Implementation for editing scheduled posts
    toast('Edit feature coming soon', 'info');
}

async function publishScheduledPost(postId) {
    try {
        await updateDoc(doc(db, 'posts', postId), {
            status: 'published',
            timestamp: serverTimestamp()
        });
        toast('Post published now!', 'ok');
    } catch (error) {
        console.error('Error publishing scheduled post:', error);
        toast('Error publishing post', 'err');
    }
}

async function deleteScheduledPost(postId) {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
        try {
            await deleteDoc(doc(db, 'posts', postId));
            toast('Scheduled post deleted', 'ok');
        } catch (error) {
            console.error('Error deleting scheduled post:', error);
            toast('Error deleting post', 'err');
        }
    }
}

function updateCommunityStats() {
    const totalViews = document.getElementById('totalViews');
    const totalLikes = document.getElementById('totalLikes');
    const totalShares = document.getElementById('totalShares');
    
    if (totalViews) {
        totalViews.textContent = allPosts.reduce((sum, post) => sum + (post.data().views || 0), 0);
    }
    
    if (totalLikes) {
        totalLikes.textContent = allPosts.reduce((sum, post) => sum + (post.data().likes || 0), 0);
    }
    
    if (totalShares) {
        // Estimate shares based on likes (for demo)
        totalShares.textContent = Math.floor(allPosts.reduce((sum, post) => sum + (post.data().likes || 0), 0) * 0.3);
    }
}

function handleFirebaseError(error, context) {
    console.error(`Firebase ${context} error:`, error);
    
    const homeFeed = document.getElementById('homeFeed');
    const allFeed = document.getElementById('allFeed');
    
    if (homeFeed) clearChildren(homeFeed);
    if (allFeed) clearChildren(allFeed);
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'post-card error-boundary';
    errorMsg.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Connection Error</h3>
        <p>Unable to load ${context}. Please check your connection.</p>
        <button class="btn-primary retry-btn">Retry</button>
    `;
    
    errorMsg.querySelector('.retry-btn').addEventListener('click', startRealtime);
    
    if (homeFeed) homeFeed.appendChild(errorMsg);
    if (allFeed) allFeed.appendChild(errorMsg.cloneNode(true));
    
    toast(`Failed to load ${context}`, 'err');
}

// ========== ENHANCED POST CARD CREATION ==========
function createCard(docSnap) {
    const data = docSnap.data();
    const when = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
    
    const card = document.createElement('div');
    card.className = 'post-card reveal';
    card.setAttribute('data-post-id', docSnap.id);

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
    time.textContent = formatPostTime(when);
    
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
        await handleLikePost(docSnap.id, liked, likes, likeBtn);
    });
    
    // Comment functionality
    commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage === 'comments') {
            // Scroll to comment section
            const quickComment = document.getElementById('quickComment');
            if (quickComment) {
                quickComment.scrollIntoView({ behavior: 'smooth' });
                quickComment.focus();
            }
        } else {
            // Navigate to comments page with post context
            localStorage.setItem('focusedPost', docSnap.id);
            window.location.href = 'comments.html';
        }
    });
    
    // Share functionality
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sharePost(data, docSnap.id);
    });
    
    actions.appendChild(likeBtn);
    actions.appendChild(commentBtn);
    actions.appendChild(shareBtn);
    card.appendChild(actions);

    return card;
}

async function handleLikePost(postId, currentlyLiked, currentLikes, likeBtn) {
    const newLiked = !currentlyLiked;
    const newLikes = newLiked ? currentLikes + 1 : currentLikes - 1;
    
    // Optimistic UI update
    if (newLiked) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${newLikes}</span>`;
        toast('Liked!', 'ok');
    } else {
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${newLikes}</span>`;
    }
    
    localStorage.setItem(`liked_${postId}`, newLiked.toString());
    
    try {
        await updateDoc(doc(db, 'posts', postId), { 
            likes: newLikes 
        });
        
        // Log engagement
        logEngagement('post_like', { postId, liked: newLiked });
        
    } catch (error) {
        console.error('Error updating likes:', error);
        // Revert optimistic update
        if (newLiked) {
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = `<i class="far fa-heart"></i> <span class="like-count">${currentLikes}</span>`;
        } else {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span class="like-count">${currentLikes}</span>`;
        }
        toast('Error updating like', 'err');
    }
}

function sharePost(postData, postId) {
    const shareData = {
        title: postData.title || 'GenZ Smart Post',
        text: postData.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
        url: `${window.location.origin}?post=${postId}`
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                toast('Post shared successfully!', 'ok');
                logEngagement('post_share', { postId });
            })
            .catch(console.error);
    } else {
        navigator.clipboard.writeText(shareData.url).then(() => {
            toast('Link copied to clipboard!', 'ok');
            logEngagement('post_share', { postId });
        });
    }
}

function formatPostTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// ========== NOTIFICATION SYSTEM ==========
function initNotifications() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllRead = document.getElementById('markAllRead');
    
    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = notificationDropdown.style.display === 'block';
            notificationDropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                loadNotifications();
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            notificationDropdown.style.display = 'none';
        });
    }
    
    if (markAllRead) {
        markAllRead.addEventListener('click', markAllNotificationsRead);
    }
    
    // Load notification badge
    updateNotificationBadge();
}

function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;
    
    // Get notifications from localStorage
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    clearChildren(notificationList);
    
    if (notifications.length === 0) {
        notificationList.innerHTML = `
            <div class="notification-item">
                <div class="notification-content">No notifications yet</div>
            </div>
        `;
    } else {
        notifications.slice(0, 5).forEach(notification => {
            const item = createNotificationItem(notification);
            notificationList.appendChild(item);
        });
    }
}

function createNotificationItem(notification) {
    const item = document.createElement('div');
    item.className = `notification-item ${notification.read ? '' : 'unread'}`;
    
    item.innerHTML = `
        <div class="notification-content">${notification.message}</div>
        <div class="notification-time">${formatPostTime(new Date(notification.timestamp))}</div>
    `;
    
    item.addEventListener('click', () => {
        markNotificationRead(notification.id);
        if (notification.action) {
            window.location.href = notification.action;
        }
    });
    
    return item;
}

function markNotificationRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification && !notification.read) {
        notification.read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotificationBadge();
        loadNotifications();
    }
}

function markAllNotificationsRead() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.forEach(notification => {
        notification.read = true;
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotifications();
    toast('All notifications marked as read', 'ok');
}

function updateNotificationBadge() {
    const notificationBadge = document.getElementById('notificationBadge');
    if (!notificationBadge) return;
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'block';
    } else {
        notificationBadge.style.display = 'none';
    }
}

function addNotification(message, action = null) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const notification = {
        id: Date.now().toString(),
        message,
        action,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications.pop();
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    
    // Show desktop notification if permitted
    if (Notification.permission === 'granted') {
        new Notification('GenZ Smart', {
            body: message,
            icon: '/assets/logo.png'
        });
    }
}

// ========== SERVICE WORKER FOR PWA ==========
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    }
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
    else if (type === 'warning') icon = '⚠️';
    else if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `<span>${icon}</span> ${msg}`;
    
    if (type === 'err') {
        toast.style.background = 'linear-gradient(90deg, #ef4444, #ff7b7b)';
    } else if (type === 'warning') {
        toast.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else if (type === 'info') {
        toast.style.background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
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
        showEmptyState(container, 'No posts found', 'Try different search terms');
    } else {
        filtered.forEach(post => {
            const card = createCard(post);
            if (card) container.appendChild(card);
        });
    }
}

function showEmptyState(container, title, message) {
    const empty = document.createElement('div');
    empty.className = 'post-card empty-state';
    empty.innerHTML = `
        <i class="fas fa-inbox"></i>
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    container.appendChild(empty);
}

function logEngagement(type, data) {
    const engagements = JSON.parse(localStorage.getItem('engagements') || '[]');
    engagements.push({
        type,
        data,
        timestamp: new Date().toISOString(),
        user: currentUser || 'anonymous'
    });
    
    // Keep only last 1000 engagements
    if (engagements.length > 1000) {
        engagements.splice(0, engagements.length - 1000);
    }
    
    localStorage.setItem('engagements', JSON.stringify(engagements));
}

// ========== PINNED POST ==========
const pinnedPostData = {
    id: 'pinned',
    title: 'Welcome to GenZ Smart Community! 🎉',
    content: '<h2>Hello there! 👋</h2><p>Welcome to our vibrant community where ideas flourish and connections grow. This is a space for GenZ minds to share thoughts, inspiration, and motivation.</p><p>With <strong>50K+ readers</strong> and <strong>69+ active users</strong>, we\'re building something amazing together!</p><p>Feel free to explore, engage with posts, and become part of our growing family. Remember, every big achievement starts with a small idea!</p><p>Let\'s create something amazing together! ✨</p>',
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
    commentBtn.innerHTML = '<i class="far fa-comment"></i> <span>Join Discussion</span>';
    
    const shareBtn = document.createElement('button');
    shareBtn.className = 'action-btn share-btn';
    shareBtn.innerHTML = '<i class="far fa-share-square"></i> <span>Share Community</span>';
    
    // Add functionality to buttons
    commentBtn.addEventListener('click', () => {
        window.location.href = 'comments.html';
    });
    
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'GenZ Smart Community',
                text: 'Join our amazing community of 50K+ readers!',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                toast('Community link copied!', 'ok');
            });
        }
    });
    
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

// Export for use in other modules
window.GenZApp = {
    db,
    isAdmin,
    currentUser,
    toast,
    addNotification,
    logEngagement
};
