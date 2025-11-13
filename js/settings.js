/* ========== 
   GenZ Smart - settings.js
   Logic for the User Settings Page, including Profile updates and App Preferences.
========== */

// Ensure GenZApp is loaded for access to db, toast, currentUser, etc.
const { db, currentUser, toast } = window.GenZApp || {};

// DOM Elements
const settingsForm = document.getElementById('userSettingsForm');
const profileNameInput = document.getElementById('profileName');
const profileBioInput = document.getElementById('profileBio');
const avatarUploadInput = document.getElementById('avatarUpload');
const currentAvatar = document.getElementById('currentAvatar');
const themeToggle = document.getElementById('themeToggle');
const notifEmailToggle = document.getElementById('notifEmailToggle');
const notifPushToggle = document.getElementById('notifPushToggle');

/**
 * Loads the current user settings into the form fields.
 */
function loadUserSettings() {
    if (!settingsForm) return; // Not on the settings page

    // Update Profile Tab
    profileNameInput.value = currentUser.name;
    profileBioInput.value = currentUser.bio || '';
    currentAvatar.src = currentUser.avatar || 'assets/your-photo.jpg';

    // Update Preferences Tab
    const preferences = currentUser.preferences || {};

    themeToggle.checked = preferences.theme === 'dark';
    document.body.classList.toggle('dark-theme', themeToggle.checked);
    
    notifEmailToggle.checked = preferences.emailNotifications !== false;
    notifPushToggle.checked = preferences.pushNotifications !== false;
}

/**
 * Handles the submission of the settings form.
 * @param {Event} e - The form submit event.
 */
function handleSettingsSubmit(e) {
    e.preventDefault();

    // 1. Profile Data Update
    currentUser.name = profileNameInput.value.trim();
    currentUser.bio = profileBioInput.value.trim();

    // 2. Preferences Update
    currentUser.preferences = {
        ...currentUser.preferences,
        theme: themeToggle.checked ? 'dark' : 'light',
        emailNotifications: notifEmailToggle.checked,
        pushNotifications: notifPushToggle.checked
    };

    // Apply theme immediately
    document.body.classList.toggle('dark-theme', themeToggle.checked);

    // 3. Save to Mock DB
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        db.users[userIndex] = { ...db.users[userIndex], ...currentUser };
    }
    localStorage.setItem('GenZDb', JSON.stringify(db));

    // 4. Feedback
    toast('Settings saved successfully!', 'success');
}

/**
 * Handles the profile picture upload.
 */
function handleAvatarUpload() {
    const file = avatarUploadInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newAvatarUrl = e.target.result;
            
            // 1. Update UI
            currentAvatar.src = newAvatarUrl;
            
            // 2. Update current user and save (Base64 data URL)
            currentUser.avatar = newAvatarUrl;

            const userIndex = db.users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                db.users[userIndex].avatar = newAvatarUrl;
            }
            localStorage.setItem('GenZDb', JSON.stringify(db));
            
            toast('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Handles tab switching in the settings page.
 */
function handleTabSwitch(e) {
    const tabBtn = e.target.closest('.settings-tab-btn');
    if (!tabBtn) return;
    
    const tabId = tabBtn.getAttribute('data-tab');

    // Remove active class from all buttons and content
    document.querySelectorAll('.settings-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.settings-content').forEach(content => content.classList.remove('active'));

    // Add active class to the clicked button and corresponding content
    tabBtn.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
}

/**
 * Initializes the settings page functionality.
 */
function initSettingsPage() {
    if (!settingsForm) return; // Exit if not on the correct page

    loadUserSettings();

    // Event Listeners
    settingsForm.addEventListener('submit', handleSettingsSubmit);
    avatarUploadInput.addEventListener('change', handleAvatarUpload);
    document.querySelectorAll('.settings-tabs').forEach(tabsContainer => {
        tabsContainer.addEventListener('click', handleTabSwitch);
    });

    // Theme toggle changes live
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeToggle.checked);
    });
}

// Attach to global init (called in app.js)
document.addEventListener('settingsPageLoaded', initSettingsPage);
