// Admin Panel JavaScript
let currentUser = null;

// Check authentication state
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        // User is signed in
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('dashboardSection').classList.add('active');
        loadDashboardStats();
        loadProjects();
        loadBlogPosts();
        loadMessages();
    } else {
        // User is signed out
        document.getElementById('loginSection').classList.add('active');
        document.getElementById('dashboardSection').classList.remove('active');
    }
});

// Admin Login
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.querySelector('#adminLoginForm input[type="email"]').value;
    const password = document.querySelector('#adminLoginForm input[type="password"]').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Login successful - handled by auth state listener
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Tab Navigation
document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all tabs
        document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab
        link.classList.add('active');
        const tabId = link.getAttribute('data-tab') + 'Section';
        document.getElementById(tabId).classList.add('active');
    });
});

// Load Dashboard Statistics
async function loadDashboardStats() {
    try {
        // Projects count
        const projectsSnapshot = await db.collection('projects').get();
        document.getElementById('projectsCount').textContent = projectsSnapshot.size;
        
        // Blog posts count
        const blogSnapshot = await db.collection('blogPosts').get();
        document.getElementById('blogCount').textContent = blogSnapshot.size;
        
        // Unread messages count
        const messagesSnapshot = await db.collection('contactMessages')
            .where('read', '==', false)
            .get();
        document.getElementById('messagesCount').textContent = messagesSnapshot.size;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Project Management
let editingProjectId = null;

function showProjectForm(project = null) {
    const form = document.getElementById('projectForm');
    form.style.display = 'block';
    
    if (project) {
        // Editing existing project
        editingProjectId = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectTechnologies').value = project.technologies?.join(', ') || '';
        document.getElementById('projectCategory').value = project.category || 'web';
        document.getElementById('projectGithub').value = project.githubUrl || '';
        document.getElementById('projectLiveUrl').value = project.liveUrl || '';
        
        // Show existing images
        if (project.images && project.images.length > 0) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = project.images.map(img => 
                `<img src="${img}" class="preview-image" alt="Preview">`
            ).join('');
        }
    } else {
        // Adding new project
        editingProjectId = null;
        document.getElementById('projectFormElement').reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideProjectForm() {
    document.getElementById('projectForm').style.display = 'none';
    editingProjectId = null;
}

// Handle project form submission
document.getElementById('projectFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        technologies: document.getElementById('projectTechnologies').value.split(',').map(t => t.trim()),
        category: document.getElementById('projectCategory').value,
        githubUrl: document.getElementById('projectGithub').value || null,
        liveUrl: document.getElementById('projectLiveUrl').value || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add createdAt for new projects
    if (!editingProjectId) {
        projectData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    try {
        // Handle image uploads
        const imageFiles = document.getElementById('projectImages').files;
        if (imageFiles.length > 0) {
            const imageUrls = await uploadImages(imageFiles);
            projectData.images = imageUrls;
        }
        
        // Save to Firestore
        if (editingProjectId) {
            await db.collection('projects').doc(editingProjectId).update(projectData);
        } else {
            await db.collection('projects').add(projectData);
        }
        
        alert('Project saved successfully!');
        hideProjectForm();
        loadProjects();
        loadDashboardStats();
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Error saving project: ' + error.message);
    }
});

// Upload images to Firebase Storage
async function uploadImages(files) {
    const uploadPromises = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = storage.ref(`projects/${Date.now()}_${file.name}`);
        const uploadTask = storageRef.put(file);
        
        uploadPromises.push(
            uploadTask.then(snapshot => snapshot.ref.getDownloadURL())
        );
    }
    
    return Promise.all(uploadPromises);
}

// Load projects for admin
async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    
    try {
        const snapshot = await db.collection('projects')
            .orderBy('createdAt', 'desc')
            .get();
        
        projectsList.innerHTML = '';
        
        if (snapshot.empty) {
            projectsList.innerHTML = '<div class="content-item">No projects found.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const project = doc.data();
            const projectId = doc.id;
            
            const projectItem = document.createElement('div');
            projectItem.className = 'content-item';
            projectItem.innerHTML = `
                <div class="content-info">
                    <h4>${project.title}</h4>
                    <p>${project.description.substring(0, 100)}...</p>
                    <small>Technologies: ${project.technologies?.join(', ') || 'None'}</small>
                </div>
                <div class="content-actions">
                    <button class="btn btn-sm" onclick="editProject('${projectId}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject('${projectId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            projectsList.appendChild(projectItem);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = '<div class="content-item">Error loading projects.</div>';
    }
}

// Edit project
function editProject(projectId) {
    db.collection('projects').doc(projectId).get()
        .then(doc => {
            if (doc.exists) {
                showProjectForm({ id: projectId, ...doc.data() });
            }
        })
        .catch(error => {
            console.error('Error loading project:', error);
            alert('Error loading project: ' + error.message);
        });
}

// Delete project
async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await db.collection('projects').doc(projectId).delete();
            loadProjects();
            loadDashboardStats();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project: ' + error.message);
        }
    }
}

// Blog Management (similar structure to projects)
let editingBlogId = null;

function showBlogForm(post = null) {
    const form = document.getElementById('blogForm');
    form.style.display = 'block';
    
    if (post) {
        editingBlogId = post.id;
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogExcerpt').value = post.excerpt || '';
        document.getElementById('blogContent').value = post.content || '';
        document.getElementById('blogReadTime').value = post.readTime || 5;
    } else {
        editingBlogId = null;
        document.getElementById('blogFormElement').reset();
    }
    
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideBlogForm() {
    document.getElementById('blogForm').style.display = 'none';
    editingBlogId = null;
}

// Blog form submission
document.getElementById('blogFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('blogTitle').value,
        excerpt: document.getElementById('blogExcerpt').value,
        content: document.getElementById('blogContent').value,
        readTime: parseInt(document.getElementById('blogReadTime').value),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Handle featured image upload
    const featuredImageFile = document.getElementById('blogFeaturedImage').files[0];
    if (featuredImageFile) {
        blogData.featuredImage = await uploadFeaturedImage(featuredImageFile);
    }
    
    if (!editingBlogId) {
        blogData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    try {
        if (editingBlogId) {
            await db.collection('blogPosts').doc(editingBlogId).update(blogData);
        } else {
            await db.collection('blogPosts').add(blogData);
        }
        
        alert('Blog post saved successfully!');
        hideBlogForm();
        loadBlogPosts();
        loadDashboardStats();
    } catch (error) {
        console.error('Error saving blog post:', error);
        alert('Error saving blog post: ' + error.message);
    }
});

// Upload featured image
async function uploadFeaturedImage(file) {
    const storageRef = storage.ref(`blog/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

// Load blog posts for admin
async function loadBlogPosts() {
    const blogList = document.getElementById('blogPostsList');
    
    try {
        const snapshot = await db.collection('blogPosts')
            .orderBy('createdAt', 'desc')
            .get();
        
        blogList.innerHTML = '';
        
        if (snapshot.empty) {
            blogList.innerHTML = '<div class="content-item">No blog posts found.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            
            const postItem = document.createElement('div');
            postItem.className = 'content-item';
            postItem.innerHTML = `
                <div class="content-info">
                    <h4>${post.title}</h4>
                    <p>${post.excerpt || post.content.substring(0, 100)}...</p>
                    <small>Published: ${new Date(post.createdAt?.toDate()).toLocaleDateString()}</small>
                </div>
                <div class="content-actions">
                    <button class="btn btn-sm" onclick="editBlogPost('${postId}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBlogPost('${postId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            blogList.appendChild(postItem);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogList.innerHTML = '<div class="content-item">Error loading blog posts.</div>';
    }
}

// Edit blog post
function editBlogPost(postId) {
    db.collection('blogPosts').doc(postId).get()
        .then(doc => {
            if (doc.exists) {
                showBlogForm({ id: postId, ...doc.data() });
            }
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            alert('Error loading blog post: ' + error.message);
        });
}

// Delete blog post
async function deleteBlogPost(postId) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        try {
            await db.collection('blogPosts').doc(postId).delete();
            loadBlogPosts();
            loadDashboardStats();
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Error deleting blog post: ' + error.message);
        }
    }
}

// Load contact messages
async function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    
    try {
        const snapshot = await db.collection('contactMessages')
            .orderBy('createdAt', 'desc')
            .get();
        
        messagesList.innerHTML = '';
        
        if (snapshot.empty) {
            messagesList.innerHTML = '<div class="content-item">No messages found.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const message = doc.data();
            const messageId = doc.id;
            
            const messageItem = document.createElement('div');
            messageItem.className = `content-item ${message.read ? '' : 'unread'}`;
            messageItem.innerHTML = `
                <div class="content-info">
                    <h4>${message.name} - ${message.email}</h4>
                    <p>${message.message}</p>
                    <small>Received: ${new Date(message.createdAt?.toDate()).toLocaleString()}</small>
                </div>
                <div class="content-actions">
                    <button class="btn btn-sm" onclick="markAsRead('${messageId}')">
                        <i class="fas fa-check"></i> Mark Read
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMessage('${messageId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            messagesList.appendChild(messageItem);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesList.innerHTML = '<div class="content-item">Error loading messages.</div>';
    }
}

// Mark message as read
async function markAsRead(messageId) {
    try {
        await db.collection('contactMessages').doc(messageId).update({
            read: true
        });
        loadMessages();
        loadDashboardStats();
    } catch (error) {
        console.error('Error marking message as read:', error);
        alert('Error updating message: ' + error.message);
    }
}

// Delete message
async function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            await db.collection('contactMessages').doc(messageId).delete();
            loadMessages();
            loadDashboardStats();
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Error deleting message: ' + error.message);
        }
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    createGridBackground();
});
