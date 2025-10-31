// ========== GENZ SMART SETTINGS MANAGEMENT ==========
// User preferences and application settings

class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'dark',
            accent: 'blue',
            fontSize: 'medium',
            layoutDensity: 'compact',
            pushNotifications: true,
            emailNotifications: false,
            newPostAlerts: true,
            commentReplies: true,
            communityUpdates: false,
            dataCollection: false,
            searchVisibility: true,
            commentModeration: false,
            privacy: 'public',
            reducedMotion: false,
            highContrast: false,
            largerText: false,
            keyboardNav: true,
            screenReader: true,
            developerMode: false,
            offlineMode: true,
            performanceMode: false,
            customCSS: ''
        };
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.loadSettings();
        this.initEventListeners();
        this.initTabNavigation();
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('genz_settings') || '{}');
        this.settings = { ...this.settings, ...savedSettings };
        this.populateSettingsForm();
    }

    populateSettingsForm() {
        // Set theme options
        this.setRadioValue('theme', this.settings.theme);
        
        // Set accent color
        this.setRadioValue('accent', this.settings.accent);
        
        // Set font size
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.settings.fontSize);
        });
        
        // Set layout density
        this.setSelectValue('layoutDensity', this.settings.layoutDensity);
        
        // Set toggle switches
        this.setToggleState('pushNotifications', this.settings.pushNotifications);
        this.setToggleState('emailNotifications', this.settings.emailNotifications);
        this.setToggleState('newPostAlerts', this.settings.newPostAlerts);
        this.setToggleState('commentReplies', this.settings.commentReplies);
        this.setToggleState('communityUpdates', this.settings.communityUpdates);
        this.setToggleState('dataCollection', this.settings.dataCollection);
        this.setToggleState('searchVisibility', this.settings.searchVisibility);
        this.setToggleState('commentModeration', this.settings.commentModeration);
        this.setToggleState('reducedMotion', this.settings.reducedMotion);
        this.setToggleState('highContrast', this.settings.highContrast);
        this.setToggleState('largerText', this.settings.largerText);
        this.setToggleState('keyboardNav', this.settings.keyboardNav);
        this.setToggleState('screenReader', this.settings.screenReader);
        this.setToggleState('developerMode', this.settings.developerMode);
        this.setToggleState('offlineMode', this.settings.offlineMode);
        this.setToggleState('performanceMode', this.settings.performanceMode);
        
        // Set privacy options
        this.setRadioValue('privacy', this.settings.privacy);
        
        // Set custom CSS
        const customCSS = document.getElementById('customCSS');
        if (customCSS) {
            customCSS.value = this.settings.customCSS || '';
        }
    }

    setRadioValue(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) radio.checked = true;
    }

    setSelectValue(id, value) {
        const select = document.getElementById(id);
        if (select) select.value = value;
    }

    setToggleState(id, state) {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = state;
    }

    initEventListeners() {
        // Theme selection
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
                this.markUnsavedChanges();
            });
        });

        // Accent color selection
        document.querySelectorAll('input[name="accent"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.accent = e.target.value;
                this.applyAccentColor();
                this.markUnsavedChanges();
            });
        });

        // Font size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.fontSize = e.target.dataset.size;
                this.applyFontSize();
                this.markUnsavedChanges();
            });
        });

        // Layout density
        const layoutDensity = document.getElementById('layoutDensity');
        if (layoutDensity) {
            layoutDensity.addEventListener('change', (e) => {
                this.settings.layoutDensity = e.target.value;
                this.applyLayoutDensity();
                this.markUnsavedChanges();
            });
        }

        // Toggle switches
        document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.settings[e.target.id] = e.target.checked;
                this.markUnsavedChanges();
                
                // Apply immediate changes for certain settings
                if (['reducedMotion', 'highContrast', 'largerText'].includes(e.target.id)) {
                    this.applyAccessibilitySettings();
                }
            });
        });

        // Privacy options
        document.querySelectorAll('input[name="privacy"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.privacy = e.target.value;
                this.markUnsavedChanges();
            });
        });

        // Custom CSS
        const customCSS = document.getElementById('customCSS');
        if (customCSS) {
            customCSS.addEventListener('input', (e) => {
                this.settings.customCSS = e.target.value;
                this.applyCustomCSS();
                this.markUnsavedChanges();
            });
        }

        // Action buttons
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }

        const resetChanges = document.getElementById('resetChanges');
        if (resetChanges) {
            resetChanges.addEventListener('click', () => this.resetChanges());
        }

        const clearData = document.getElementById('clearData');
        if (clearData) {
            clearData.addEventListener('click', () => this.clearBrowsingData());
        }

        const exportData = document.getElementById('exportAccountData');
        if (exportData) {
            exportData.addEventListener('click', () => this.exportAccountData());
        }

        const deleteAccount = document.getElementById('deleteAccount');
        if (deleteAccount) {
            deleteAccount.addEventListener('click', () => this.deleteAccount());
        }

        const resetSettings = document.getElementById('resetSettings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => this.resetToDefaults());
        }

        const editProfile = document.getElementById('editProfile');
        if (editProfile) {
            editProfile.addEventListener('click', () => this.editProfile());
        }

        // Account connection buttons
        document.querySelectorAll('.account-connect').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.connectAccount(e.target.closest('.account-item').querySelector('span').textContent);
            });
        });

        document.querySelectorAll('.account-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.disconnectAccount(e.target.closest('.account-item').querySelector('span').textContent);
            });
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    initTabNavigation() {
        const tabs = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabName}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    applySettings() {
        this.applyTheme();
        this.applyAccentColor();
        this.applyFontSize();
        this.applyLayoutDensity();
        this.applyAccessibilitySettings();
        this.applyCustomCSS();
    }

    applyTheme() {
        if (window.applyTheme) {
            window.applyTheme(this.settings.theme);
        }
    }

    applyAccentColor() {
        const root = document.documentElement;
        const accents = {
            blue: { primary: '#1d9bf0', secondary: '#1a8cd8' },
            purple: { primary: '#7856ff', secondary: '#6b46ff' },
            green: { primary: '#00ba7c', secondary: '#00a870' },
            orange: { primary: '#ff7e00', secondary: '#e67100' }
        };

        const accent = accents[this.settings.accent] || accents.blue;
        
        root.style.setProperty('--accent', accent.primary);
        root.style.setProperty('--accent-light', accent.secondary);
        root.style.setProperty('--gradient-start', accent.primary);
        root.style.setProperty('--gradient-end', accent.secondary);
    }

    applyFontSize() {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px'
        };
        
        document.documentElement.style.fontSize = sizes[this.settings.fontSize] || sizes.medium;
    }

    applyLayoutDensity() {
        document.body.classList.remove('layout-comfortable', 'layout-compact', 'layout-spacious');
        document.body.classList.add(`layout-${this.settings.layoutDensity}`);
    }

    applyAccessibilitySettings() {
        // Reduced motion
        if (this.settings.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
        }

        // High contrast
        document.body.classList.toggle('high-contrast', this.settings.highContrast);

        // Larger text
        document.body.classList.toggle('larger-text', this.settings.largerText);
    }

    applyCustomCSS() {
        let styleElement = document.getElementById('custom-css-style');
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'custom-css-style';
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = this.settings.customCSS;
    }

    markUnsavedChanges() {
        this.unsavedChanges = true;
        this.updateSaveButton();
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes •';
            saveBtn.style.background = 'var(--warning)';
        }
    }

    async saveSettings() {
        try {
            localStorage.setItem('genz_settings', JSON.stringify(this.settings));
            this.unsavedChanges = false;
            
            const saveBtn = document.getElementById('saveSettings');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                saveBtn.style.background = 'var(--success)';
                
                setTimeout(() => {
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                    saveBtn.style.background = '';
                }, 2000);
            }
            
            this.showToast('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    resetChanges() {
        if (!this.unsavedChanges) {
            this.showToast('No changes to reset', 'info');
            return;
        }

        if (confirm('Are you sure you want to reset all unsaved changes?')) {
            this.loadSettings();
            this.applySettings();
            this.unsavedChanges = false;
            
            const saveBtn = document.getElementById('saveSettings');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                saveBtn.style.background = '';
            }
            
            this.showToast('Changes reset successfully', 'success');
        }
    }

    clearBrowsingData() {
        if (confirm('This will clear all locally stored data including your preferences. Are you sure?')) {
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear cookies
            document.cookie.split(';').forEach(cookie => {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            });
            
            this.showToast('Browsing data cleared successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    exportAccountData() {
        try {
            const accountData = {
                settings: this.settings,
                preferences: JSON.parse(localStorage.getItem('genz_preferences') || '{}'),
                readingHistory: JSON.parse(localStorage.getItem('genz_reading_history') || '[]'),
                exportedAt: new Date().toISOString()
            };

            const dataStr = JSON.stringify(accountData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `genz-smart-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showToast('Account data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting account data:', error);
            this.showToast('Failed to export account data', 'error');
        }
    }

    deleteAccount() {
        if (confirm('This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?')) {
            if (confirm('Type "DELETE" to confirm account deletion:')) {
                // Simulate account deletion
                localStorage.clear();
                sessionStorage.clear();
                
                this.showToast('Account deleted successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        }
    }

    resetToDefaults() {
        if (confirm('This will reset all settings to their default values. Are you sure?')) {
            this.settings = {
                theme: 'dark',
                accent: 'blue',
                fontSize: 'medium',
                layoutDensity: 'compact',
                pushNotifications: true,
                emailNotifications: false,
                newPostAlerts: true,
                commentReplies: true,
                communityUpdates: false,
                dataCollection: false,
                searchVisibility: true,
                commentModeration: false,
                privacy: 'public',
                reducedMotion: false,
                highContrast: false,
                largerText: false,
                keyboardNav: true,
                screenReader: true,
                developerMode: false,
                offlineMode: true,
                performanceMode: false,
                customCSS: ''
            };
            
            this.populateSettingsForm();
            this.applySettings();
            this.unsavedChanges = true;
            
            this.showToast('Settings reset to defaults', 'success');
        }
    }

    editProfile() {
        this.showToast('Profile editing coming soon!', 'info');
    }

    connectAccount(platform) {
        this.showToast(`Connecting ${platform} account...`, 'info');
        // In a real app, this would open OAuth flow
    }

    disconnectAccount(platform) {
        if (confirm(`Disconnect ${platform} account?`)) {
            this.showToast(`${platform} account disconnected`, 'success');
        }
    }

    showToast(message, type = 'info') {
        if (window.toast) {
            window.toast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
