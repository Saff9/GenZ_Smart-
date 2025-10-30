<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics — GenZ Smart Performance Dashboard</title>
    
    <!-- Favicon & PWA -->
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#1d9bf0">
    
    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Styles -->
    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/analytics.css">
</head>
<body class="dark" data-page="analytics">

<!-- Animated Background -->
<div class="bg-animation">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>
</div>

<div class="container">

    <!-- HEADER -->
    <header>
        <div class="brand">
            <div class="logo">
                <img src="assets/logo.png" alt="GenZ Smart Logo" style="width:100%; border-radius:12px;">
            </div>
            <div class="brand-text">
                <div class="site-title">GenZ Smart</div>
                <div class="site-subtitle">Analytics Dashboard</div>
            </div>
        </div>

        <div class="header-actions">
            <div class="online-status" id="onlineStatus" title="Online">
                <div class="status-dot"></div>
                <span>Online</span>
            </div>

            <div class="clock-container">
                <div class="clock-time" id="clockTime">00:00:00</div>
                <div class="clock-date" id="clockDate">Loading...</div>
            </div>
            
            <button id="themeToggle" class="icon-btn" title="Toggle theme">
                <i class="fas fa-sun"></i>
            </button>
            <button id="menuBtn" class="icon-btn" title="Menu">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <!-- NAVIGATION -->
    <nav class="main-nav">
        <a href="index.html" class="nav-link">
            <i class="fas fa-home"></i> Home
        </a>
        <a href="blog.html" class="nav-link">
            <i class="fas fa-book"></i> Blog
        </a>
        <a href="comments.html" class="nav-link">
            <i class="fas fa-comments"></i> Comments
        </a>
        <a href="about.html" class="nav-link">
            <i class="fas fa-user"></i> About
        </a>
        <a href="analytics.html" class="nav-link active">
            <i class="fas fa-chart-line"></i> Analytics
        </a>
        <a href="admin.html" class="nav-link" id="adminNavLink" style="display:none">
            <i class="fas fa-cog"></i> Admin
        </a>
    </nav>

    <!-- ANALYTICS DASHBOARD -->
    <section class="section">
        <div class="section-header">
            <h1><i class="fas fa-chart-line"></i> Analytics Dashboard</h1>
            <p>Track your website performance and audience insights</p>
        </div>

        <!-- Date Range Selector -->
        <div class="analytics-controls">
            <div class="date-range">
                <button class="date-btn active" data-range="7d">7 Days</button>
                <button class="date-btn" data-range="30d">30 Days</button>
                <button class="date-btn" data-range="90d">90 Days</button>
                <button class="date-btn" data-range="1y">1 Year</button>
                <input type="date" id="customStart" class="date-input">
                <span>to</span>
                <input type="date" id="customEnd" class="date-input">
                <button id="applyDateRange" class="btn-ghost">Apply</button>
            </div>
            
            <div class="export-options">
                <button id="exportAnalytics" class="btn-ghost">
                    <i class="fas fa-download"></i> Export Data
                </button>
            </div>
        </div>

        <!-- Overview Stats -->
        <div class="analytics-stats-grid">
            <div class="analytics-stat-card">
                <div class="stat-main">
                    <div class="stat-value" id="totalVisitors">0</div>
                    <div class="stat-label">Total Visitors</div>
                </div>
                <div class="stat-trend up">
                    <i class="fas fa-arrow-up"></i>
                    <span id="visitorsTrend">0%</span>
                </div>
            </div>
            
            <div class="analytics-stat-card">
                <div class="stat-main">
                    <div class="stat-value" id="pageViews">0</div>
                    <div class="stat-label">Page Views</div>
                </div>
                <div class="stat-trend up">
                    <i class="fas fa-arrow-up"></i>
                    <span id="viewsTrend">0%</span>
                </div>
            </div>
            
            <div class="analytics-stat-card">
                <div class="stat-main">
                    <div class="stat-value" id="avgTime">0m</div>
                    <div class="stat-label">Avg. Time</div>
                </div>
                <div class="stat-trend up">
                    <i class="fas fa-arrow-up"></i>
                    <span id="timeTrend">0%</span>
                </div>
            </div>
            
            <div class="analytics-stat-card">
                <div class="stat-main">
                    <div class="stat-value" id="bounceRate">0%</div>
                    <div class="stat-label">Bounce Rate</div>
                </div>
                <div class="stat-trend down">
                    <i class="fas fa-arrow-down"></i>
                    <span id="bounceTrend">0%</span>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid">
            <!-- Visitors Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-users"></i> Visitors Overview</h3>
                    <div class="chart-legend">
                        <span class="legend-item">
                            <div class="legend-color new"></div>
                            New Visitors
                        </span>
                        <span class="legend-item">
                            <div class="legend-color returning"></div>
                            Returning
                        </span>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="visitorsChart"></canvas>
                </div>
            </div>

            <!-- Page Views Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-eye"></i> Page Views</h3>
                    <div class="chart-actions">
                        <button class="chart-btn active" data-metric="views">Views</button>
                        <button class="chart-btn" data-metric="unique">Unique</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="pageViewsChart"></canvas>
                </div>
            </div>

            <!-- Traffic Sources -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-traffic-light"></i> Traffic Sources</h3>
                </div>
                <div class="chart-container">
                    <canvas id="sourcesChart"></canvas>
                </div>
            </div>

            <!-- Popular Posts -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-fire"></i> Popular Posts</h3>
                </div>
                <div class="popular-posts-list" id="popularPosts">
                    <!-- Popular posts will be loaded here -->
                </div>
            </div>

            <!-- Geographic Data -->
            <div class="chart-card full-width">
                <div class="chart-header">
                    <h3><i class="fas fa-globe-americas"></i> Geographic Distribution</h3>
                </div>
                <div class="geo-grid">
                    <div class="geo-chart">
                        <canvas id="geoChart"></canvas>
                    </div>
                    <div class="country-list">
                        <h4>Top Countries</h4>
                        <div id="countryList">
                            <!-- Country list will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Device Breakdown -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-mobile-alt"></i> Device Usage</h3>
                </div>
                <div class="chart-container">
                    <canvas id="devicesChart"></canvas>
                </div>
            </div>

            <!-- Engagement Metrics -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3><i class="fas fa-heart"></i> Engagement</h3>
                </div>
                <div class="engagement-stats">
                    <div class="engagement-item">
                        <div class="engagement-value" id="avgLikes">0</div>
                        <div class="engagement-label">Avg. Likes/Post</div>
                    </div>
                    <div class="engagement-item">
                        <div class="engagement-value" id="avgComments">0</div>
                        <div class="engagement-label">Avg. Comments/Post</div>
                    </div>
                    <div class="engagement-item">
                        <div class="engagement-value" id="avgShares">0</div>
                        <div class="engagement-label">Avg. Shares/Post</div>
                    </div>
                    <div class="engagement-item">
                        <div class="engagement-value" id="completionRate">0%</div>
                        <div class="engagement-label">Read Completion</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Real-time Activity -->
        <div class="analytics-section">
            <div class="section-header">
                <h2><i class="fas fa-clock"></i> Real-time Activity</h2>
                <p>Live visitor activity on your site</p>
            </div>
            <div class="realtime-widget">
                <div class="realtime-stats">
                    <div class="realtime-stat">
                        <div class="realtime-value" id="activeNow">0</div>
                        <div class="realtime-label">Active Now</div>
                    </div>
                    <div class="realtime-stat">
                        <div class="realtime-value" id="todayVisitors">0</div>
                        <div class="realtime-label">Today</div>
                    </div>
                    <div class="realtime-stat">
                        <div class="realtime-value" id="yesterdayVisitors">0</div>
                        <div class="realtime-label">Yesterday</div>
                    </div>
                </div>
                <div class="activity-feed" id="realtimeActivity">
                    <!-- Real-time activities will appear here -->
                </div>
            </div>
        </div>

        <!-- SEO Performance -->
        <div class="analytics-section">
            <div class="section-header">
                <h2><i class="fas fa-search"></i> SEO Performance</h2>
                <p>Search engine optimization metrics</p>
            </div>
            <div class="seo-metrics">
                <div class="seo-metric">
                    <div class="metric-value">95%</div>
                    <div class="metric-label">SEO Score</div>
                    <div class="metric-progress">
                        <div class="progress-bar" style="width: 95%"></div>
                    </div>
                </div>
                <div class="seo-metric">
                    <div class="metric-value">1.2s</div>
                    <div class="metric-label">Load Time</div>
                    <div class="metric-progress">
                        <div class="progress-bar" style="width: 90%"></div>
                    </div>
                </div>
                <div class="seo-metric">
                    <div class="metric-value">100%</div>
                    <div class="metric-label">Mobile Friendly</div>
                    <div class="metric-progress">
                        <div class="progress-bar" style="width: 100%"></div>
                    </div>
                </div>
                <div class="seo-metric">
                    <div class="metric-value">85%</div>
                    <div class="metric-label">Core Web Vitals</div>
                    <div class="metric-progress">
                        <div class="progress-bar" style="width: 85%"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="footer-content">
            <div class="footer-brand">
                <div class="logo" style="width:30px;height:30px;font-size:12px;">GZ</div>
                <span>GenZ Smart</span>
            </div>
            <div class="footer-links">
                <a href="index.html">Home</a>
                <a href="blog.html">Blog</a>
                <a href="comments.html">Comments</a>
                <a href="about.html">About</a>
                <a href="analytics.html">Analytics</a>
                <a href="settings.html">Settings</a>
            </div>
            <div class="footer-copyright">
                © 2025 GenZ Smart Blog — All rights reserved • <span id="currentYear">2025</span>
            </div>
        </div>
    </footer>
</div>

<!-- Drawer (menu) -->
<div id="drawerBackdrop" style="display:none"></div>
<nav id="drawer">
    <button id="closeDrawer" style="background:transparent;border:0;color:var(--text);font-size:18px">✕</button>
    <div style="margin-top:15px">
        <div style="font-weight:800;font-family:Poppins; font-size: 1.1rem;">GenZ Smart</div>
        
        <div class="clock-container" style="margin:15px 0; display:none;" id="drawerClock">
            <div class="clock-time" id="drawerClockTime">00:00:00</div>
            <div class="clock-date" id="drawerClockDate">Loading...</div>
        </div>
        
        <div style="margin-top:12px"><a href="index.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-home"></i> Home</a></div>
        <div style="margin-top:6px"><a href="blog.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-book"></i> Blog</a></div>
        <div style="margin-top:6px"><a href="comments.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-comments"></i> Comments</a></div>
        <div style="margin-top:6px"><a href="about.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-user"></i> About</a></div>
        <div style="margin-top:6px"><a href="analytics.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-chart-line"></i> Analytics</a></div>
        <div id="adminDrawerLink" style="margin-top:6px;display:none"><a href="admin.html" style="text-decoration:none;color:var(--text);font-weight:600; display: block; padding: 8px 0;"><i class="fas fa-cog"></i> Admin</a></div>
        <div style="height:1px;background:var(--divider);margin:12px 0"></div>
        <button id="openLogin" style="background:var(--accent-gradient);color:#fff;padding:10px 14px;border-radius:6px;border:0;font-weight:600;cursor:pointer; width: 100%;font-size:14px"><i class="fas fa-lock"></i> Admin Login</button>
        <button id="drawerLogout" style="background:transparent;border:1px solid var(--divider);color:var(--text);padding:10px 14px;border-radius:6px;font-weight:600;cursor:pointer; width: 100%;font-size:14px;margin-top:8px;display:none"><i class="fas fa-sign-out-alt"></i> Logout</button>
    </div>
</nav>

<!-- Toast area -->
<div class="toast-wrap" id="toastWrap" aria-live="polite"></div>

<!-- Scripts -->
<script type="module" src="js/app.js"></script>
<script src="js/analytics.js"></script>
<script src="js/notifications.js"></script>
</body>
</html>
