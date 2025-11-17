/portfolio-website
├── public/
│   ├── images/
│   │   ├── profile.jpg
│   │   ├── logo.svg
│   │   └── projects/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── CookieConsent.jsx
│   │   ├── sections/
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Blog.jsx
│   │   │   └── Contact.jsx
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   └── BlogCard.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── PostEditor.jsx
│   │       └── ProjectManager.jsx
│   ├── pages/
│   │   ├── index.jsx
│   │   ├── projects.jsx
│   │   ├── blog/
│   │   │   ├── index.jsx
│   │   │   └── [slug].jsx
│   │   ├── about.jsx
│   │   ├── contact.jsx
│   │   └── admin/
│   │       ├── login.jsx
│   │       ├── dashboard.jsx
│   │       └── posts.jsx
│   ├── lib/
│   │   ├── db.js (database connection)
│   │   ├── auth.js (authentication)
│   │   ├── seo.js (SEO helpers)
│   │   └── utils.js (utility functions)
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.css
│   ├── context/
│   │   └── ThemeContext.jsx
│   └── data/
│       ├── projects.json (static fallback)
│       └── blog-posts.json (static fallback)
├── .env.local (environment variables)
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── package.json
