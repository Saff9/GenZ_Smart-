// app.js

// Global variables
let quill;
const ADMIN_EMAIL = 'admin@genzsmart.com'; // Replace with real admin email
const ADMIN_PASSWORD = 'securepassword'; // Replace with real admin password
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutes

// Cached DOM elements
const heroWelcome = document.getElementById('heroWelcome');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const loginCancelBtn = document.getElementById('loginCancel');
const toastWrap = document.getElementById('toastWrap');
const themeToggle = document.getElementById('themeToggle');
const offlineIndicator = document.getElementById('offlineIndicator');
const adminNavLink = document.getElementById('adminNavLink');
const adminDrawerLink = document.getElementById('adminDrawerLink');
const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const closeDrawerBtn = document.getElementById('closeDrawer');
const drawerLogoutBtn = document.getElementById('drawerLogout');
const subscribeBtn = document.getElementById('subscribeBtn');
const shareSiteBtn = document.getElementById('shareSiteBtn');

let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
let lastLoginAttempt = parseInt(localStorage.getItem('lastLoginAttempt')) || 0;
let loggedIn = localStorage.getItem('isAdmin') === 'true';

// Utility: Show toast notification
function showToast(message, type = 'info', duration = 3000) {
  if (!toastWrap) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastWrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeOut');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

// Clock update
function updateClock() {
  const now = new Date();
  const timeElem = document.getElementById('clockTime');
  const dateElem = document.getElementById('clockDate');

  if(timeElem) timeElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if(dateElem) dateElem.textContent = now.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

// Theme toggle
function toggleTheme() {
  const body = document.body;
  if(body.classList.contains('dark')){
    body.classList.remove('dark');
    body.classList.add('light');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Load saved theme on load
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'light'){
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  }
}

// Welcome message display fix
function showWelcomeMessage() {
  if(heroWelcome){
    heroWelcome.style.opacity = '1';
    heroWelcome.style.transition = 'opacity 1s ease-in-out';
  }
}

// Hide welcome message
function hideWelcomeMessage(){
  if(heroWelcome){
    heroWelcome.style.opacity = '0';
  }
}

// Open login modal
function openLoginModal() {
  if(loginModal){
    loginModal.style.display = 'flex';
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loginEmail.value = '';
    loginPassword.value = '';
    togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
    loginPassword.type = 'password';
    loginEmail.focus();
  }
}

// Close login modal
function closeLoginModal() {
  if(loginModal){
    loginModal.style.display = 'none';
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }
}

// Toggle password visibility
function togglePasswordVisibility() {
  if(loginPassword.type === 'password'){
    loginPassword.type = 'text';
    togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    loginPassword.type = 'password';
    togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

// Login lockout check
function isLockedOut() {
  if(loginAttempts >= MAX_LOGIN_ATTEMPTS){
    const now = Date.now();
    if(now - lastLoginAttempt < LOCKOUT_TIME_MS){
      return true;
    } else {
      loginAttempts = 0;
      localStorage.setItem('loginAttempts', loginAttempts);
    }
  }
  return false;
}

// Handle login form submit
function handleLogin(e){
  e.preventDefault();
  if(isLockedOut()){
    showToast('Too many failed login attempts. Please try again later.', 'danger');
    return;
  }
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if(!email || !password){
    showToast('Please enter both email and password.', 'warning');
    return;
  }

  if(email === ADMIN_EMAIL && password === ADMIN_PASSWORD){
    loginAttempts = 0;
    localStorage.setItem('loginAttempts', loginAttempts);
    localStorage.setItem('isAdmin', 'true');
    loggedIn = true;
    closeLoginModal();
    showToast('Welcome back, Admin!', 'success');
    updateAdminLinks(true);
    openEditor();
  } else {
    loginAttempts++;
    lastLoginAttempt = Date.now();
    localStorage.setItem('loginAttempts', loginAttempts);
    localStorage.setItem('lastLoginAttempt', lastLoginAttempt);
    showToast('Invalid email or password.', 'danger');
  }
}

// Update UI for admin logged in state
function updateAdminLinks(isLoggedIn){
  adminNavLink.style.display = isLoggedIn ? 'inline-block' : 'none';
  adminDrawerLink.style.display = isLoggedIn ? 'block' : 'none';
  drawerLogoutBtn.style.display = isLoggedIn ? 'block' : 'none';
}

// Open mobile drawer
function openDrawer() {
  if(drawer && drawerBackdrop){
    drawer.style.left = '0';
    drawerBackdrop.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

// Close mobile drawer
function closeDrawer() {
  if(drawer && drawerBackdrop){
    drawer.style.left = '-100%';
    drawerBackdrop.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('isAdmin');
  loggedIn = false;
  updateAdminLinks(false);
  showToast('Logged out successfully', 'info');
  closeDrawer();
}

// Initialize Quill editor
function initQuillEditor(){
  const editorContainer = document.getElementById('editor-container');
  if(typeof Quill !== 'undefined' && editorContainer){
    quill = new Quill(editorContainer, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          ['link', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean']
        ]
      },
      placeholder: 'Share something with your community of 50K readers…'
    });
  }
}

// Open post editor modal
function openEditor(){
  const composer = document.getElementById('composer');
  if(composer){
    composer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if(quill) quill.setContents([]);
    if(quill) quill.focus();
  }
}

// Close post editor modal
function closeEditor(){
  const composer = document.getElementById('composer');
  if(composer){
    composer.style.display = 'none';
    document.body.style.overflow = 'auto';
    if(quill) quill.setContents([]);
  }
}

// Offline/online detection
function handleConnectionChange() {
  if(navigator.onLine){
    offlineIndicator.style.display = 'none';
    showToast('Back online', 'success');
  } else {
    offlineIndicator.style.display = 'block';
    showToast('You are offline', 'warning', 5000);
  }
}

// Initialize everything on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  updateClock();
  setInterval(updateClock, 1000);
  showWelcomeMessage();
  initQuillEditor();
  updateAdminLinks(loggedIn);

  // Event Listeners
  themeToggle?.addEventListener('click', toggleTheme);
  loginCancelBtn?.addEventListener('click', closeLoginModal);
  togglePasswordBtn?.addEventListener('click', togglePasswordVisibility);
  loginForm?.addEventListener('submit', handleLogin);

  menuBtn?.addEventListener('click', openDrawer);
  closeDrawerBtn?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);
  drawerLogoutBtn?.addEventListener('click', logout);

  subscribeBtn?.addEventListener('click', () => {
    showToast('Subscribed to updates!', 'success');
  });

  shareSiteBtn?.addEventListener('click', () => {
    if(navigator.share){
      navigator.share({
        title: 'GenZ Smart Community',
        text: 'Join 50K+ readers sharing ideas and motivation!',
        url: window.location.href
      }).then(() => showToast('Thanks for sharing!', 'success'))
      .catch(() => showToast('Sharing canceled or failed.', 'warning'));
    } else {
      alert('Sharing not supported on this browser. Copy this link: ' + window.location.href);
    }
  });

  // Show login modal if not logged in on admin page
  if(document.body.dataset.page === 'admin' && !loggedIn){
    openLoginModal();
  }

  // Offline detection
  window.addEventListener('online', handleConnectionChange);
  window.addEventListener('offline', handleConnectionChange);
  handleConnectionChange();
});

// Accessibility: Close login modal on Escape key
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    if(loginModal && loginModal.style.display === 'flex'){
      closeLoginModal();
    }
    if(drawer && drawer.style.left === '0px'){
      closeDrawer();
    }
  }
});
