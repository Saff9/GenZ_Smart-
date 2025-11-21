// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Create animated grid background with multiple colors
function createGridBackground() {
    const grid = document.getElementById('gridBackground');
    const gridSize = 60;
    
    // Create horizontal lines with different colors
    for (let i = 0; i < window.innerHeight / gridSize; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal';
        line.style.top = `${i * gridSize}px`;
        line.style.animationDelay = `${i * 0.08}s`;
        grid.appendChild(line);
    }
    
    // Create vertical lines with different colors
    for (let i = 0; i < window.innerWidth / gridSize; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical';
        line.style.left = `${i * gridSize}px`;
        line.style.animationDelay = `${i * 0.06}s`;
        grid.appendChild(line);
    }
    
    // Create diagonal lines
    for (let i = -2; i < 4; i++) {
        const line1 = document.createElement('div');
        line1.className = 'grid-line diagonal-1';
        line1.style.top = `${i * 200}px`;
        line1.style.animationDelay = `${i * 2}s`;
        grid.appendChild(line1);
        
        const line2 = document.createElement('div');
        line2.className = 'grid-line diagonal-2';
        line2.style.top = `${i * 200}px`;
        line2.style.animationDelay = `${i * 2.5}s`;
        grid.appendChild(line2);
    }
}

// Mobile Menu Animation
const mobileMenu = document.querySelector('.mobile-menu');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');
const mobileNavItems = document.querySelectorAll('.mobile-nav ul li');

mobileMenu.addEventListener('click', () => {
    mobileNav.classList.add('active');
    // Animate menu items with delay
    mobileNavItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 100 * index);
    });
});

mobileClose.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    // Reset animation for next open
    mobileNavItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
    });
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        mobileNavItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
        });
    });
});

// Admin Panel Function
function openAdminPanel() {
    window.location.href = 'admin.html';
}

// Load Projects from Firebase
function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    db.collection('projects').orderBy('createdAt', 'desc').limit(3).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                projectsGrid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                        <h3>No Projects Yet</h3>
                        <p>Projects will appear here once added through the admin panel.</p>
                    </div>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const project = doc.data();
                const projectId = doc.id;
                
                const projectCard = createProjectCard(project, projectId);
                projectsGrid.appendChild(projectCard);
            });
            
            // Initialize carousels after projects are loaded
            setTimeout(initCarousels, 100);
        })
        .catch((error) => {
            console.error("Error loading projects: ", error);
            projectsGrid.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <h3>Error Loading Projects</h3>
                    <p>Please check your Firebase configuration.</p>
                </div>
            `;
        });
}

// Create Project Card HTML
function createProjectCard(project, projectId) {
    const card = document.createElement('div');
    card.className = 'card project-card';
    card.setAttribute('data-category', project.category || 'all');
    
    // Create carousel HTML if multiple images exist
    let carouselHTML = '';
    if (project.images && project.images.length > 0) {
        carouselHTML = `
            <div class="project-carousel">
                <div class="carousel-container" id="carousel-${projectId}">
                    ${project.images.map((img, index) => `
                        <div class="carousel-slide">
                            <img src="${img}" alt="${project.title} Screenshot ${index + 1}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
                ${project.images.length > 1 ? `
                    <div class="carousel-arrow prev" onclick="moveCarousel('carousel-${projectId}', -1)">
                        <i class="fas fa-chevron-left"></i>
                    </div>
                    <div class="carousel-arrow next" onclick="moveCarousel('carousel-${projectId}', 1)">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                    <div class="carousel-nav">
                        ${project.images.map((_, index) => `
                            <div class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="setCarouselSlide('carousel-${projectId}', ${index})"></div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Default image if no images provided
        carouselHTML = `
            <div class="project-carousel">
                <div class="carousel-container" id="carousel-${projectId}">
                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80" alt="${project.title}">
                    </div>
                </div>
            </div>
        `;
    }
    
    card.innerHTML = `
        ${carouselHTML}
        <div class="project-content">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
                ${project.technologies ? project.technologies.map(tech => `
                    <span class="tech-tag">${tech}</span>
                `).join('') : ''}
            </div>
            <div class="project-links">
                ${project.githubUrl ? `<a href="${project.githubUrl}" class="project-link" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
                ${project.liveUrl ? `<a href="${project.liveUrl}" class="project-link" target="_blank"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Load Blog Preview from Firebase
function loadBlogPreview() {
    const blogPreview = document.getElementById('blogPreview');
    
    db.collection('blogPosts').orderBy('createdAt', 'desc').limit(3).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                blogPreview.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                        <h3>No Articles Yet</h3>
                        <p>Blog posts will appear here once added through the admin panel.</p>
                    </div>
                `;
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const postId = doc.id;
                
                const blogCard = createBlogCard(post, postId);
                blogPreview.appendChild(blogCard);
            });
        })
        .catch((error) => {
            console.error("Error loading blog posts: ", error);
            blogPreview.innerHTML = `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <h3>Error Loading Articles</h3>
                    <p>Please check your Firebase configuration.</p>
                </div>
            `;
        });
}

// Create Blog Card HTML
function createBlogCard(post, postId) {
    const card = document.createElement('div');
    card.className = 'card blog-card';
    
    card.innerHTML = `
        <div class="blog-image">
            <img src="${post.featuredImage || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'}" alt="${post.title}" loading="lazy">
        </div>
        <div class="blog-content">
            <h3>${post.title}</h3>
            <div class="blog-meta">
                <span><i class="far fa-calendar"></i> ${new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
                <span><i class="far fa-clock"></i> ${post.readTime || '5'} min read</span>
            </div>
            <p class="blog-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 150) : 'No content available')}...</p>
            <a href="blog.html#${postId}" class="btn btn-outline">Read More</a>
        </div>
    `;
    
    return card;
}

// Image Carousel Functionality
const carousels = {};

function initCarousels() {
    document.querySelectorAll('.carousel-container').forEach(container => {
        const id = container.id;
        const totalSlides = container.children.length;
        
        if (totalSlides > 1) {
            carousels[id] = {
                currentSlide: 0,
                totalSlides: totalSlides,
                autoPlay: setInterval(() => moveCarousel(id, 1), 5000)
            };
        }
    });
}

function moveCarousel(carouselId, direction) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    const container = document.getElementById(carouselId);
    const dots = container.parentElement.querySelectorAll('.carousel-dot');
    
    carousel.currentSlide = (carousel.currentSlide + direction + carousel.totalSlides) % carousel.totalSlides;
    
    container.style.transform = `translateX(-${carousel.currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === carousel.currentSlide);
    });
    
    // Reset autoplay timer
    clearInterval(carousel.autoPlay);
    carousel.autoPlay = setInterval(() => moveCarousel(carouselId, 1), 5000);
}

function setCarouselSlide(carouselId, slideIndex) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    
    const container = document.getElementById(carouselId);
    const dots = container.parentElement.querySelectorAll('.carousel-dot');
    
    carousel.currentSlide = slideIndex;
    container.style.transform = `translateX(-${carousel.currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === carousel.currentSlide);
    });
    
    // Reset autoplay timer
    clearInterval(carousel.autoPlay);
    carousel.autoPlay = setInterval(() => moveCarousel(carouselId, 1), 5000);
}

// Form Submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Simple form validation
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const message = this.querySelector('textarea').value;
    
    if (name && email && message) {
        // Save to Firebase
        db.collection('contactMessages').add({
            name: name,
            email: email,
            message: message,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        })
        .then(() => {
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        })
        .catch((error) => {
            console.error("Error sending message: ", error);
            alert('There was an error sending your message. Please try again.');
        });
    } else {
        alert('Please fill in all required fields.');
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Hero section animations
gsap.to('.hero h1', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.5
});

gsap.to('.hero p', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.8
});

gsap.to('.hero-btns', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 1.1
});

gsap.to('.hero-visual', {
    opacity: 1,
    duration: 1.5,
    delay: 1.5
});

// About section animations
gsap.to('.about-text h3', {
    scrollTrigger: {
        trigger: '.about-text h3',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 1
});

gsap.to('.about-text p', {
    scrollTrigger: {
        trigger: '.about-text',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 1,
    stagger: 0.3
});

gsap.to('.about-image', {
    scrollTrigger: {
        trigger: '.about-image',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 1
});

gsap.to('.stat', {
    scrollTrigger: {
        trigger: '.about-stats',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2
});

// Skills section animations
gsap.to('.skill-category', {
    scrollTrigger: {
        trigger: '.skills-container',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2
});

gsap.to('.skill-tag', {
    scrollTrigger: {
        trigger: '.skills-list',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.05
});

// Projects section animations
gsap.to('.project-card', {
    scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2
});

// Blog section animations
gsap.to('.blog-card', {
    scrollTrigger: {
        trigger: '.blog-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2
});

// Contact section animations
gsap.to('.contact-info h3', {
    scrollTrigger: {
        trigger: '.contact-info h3',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 1
});

gsap.to('.contact-info p', {
    scrollTrigger: {
        trigger: '.contact-info p',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 1
});

gsap.to('.contact-item', {
    scrollTrigger: {
        trigger: '.contact-info',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.2
});

gsap.to('.form-group', {
    scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    opacity: 1,
    x: 0,
    duration: 0.8,
    stagger: 0.2
});

// Initialize everything when page loads
window.addEventListener('load', () => {
    createGridBackground();
    loadProjects();
    loadBlogPreview();
});
