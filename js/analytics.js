// ========== GENZ SMART ANALYTICS DASHBOARD ==========
// Real-time analytics and insights for the community

class AnalyticsDashboard {
    constructor() {
        this.stats = {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            activeUsers: 69,
            totalReaders: 50000
        };
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadAnalyticsData();
        this.initCharts();
        this.initEventListeners();
        this.startRealtimeUpdates();
    }

    async loadAnalyticsData() {
        try {
            // Simulate API call to load analytics data
            const analyticsData = JSON.parse(localStorage.getItem('genz_analytics') || '{}');
            
            this.stats = {
                ...this.stats,
                ...analyticsData
            };

            this.updateStatsDisplay();
            
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    updateStatsDisplay() {
        // Update all stat elements
        Object.keys(this.stats).forEach(statKey => {
            const element = document.getElementById(statKey);
            if (element) {
                element.textContent = this.formatNumber(this.stats[statKey]);
            }
        });

        // Update progress bars
        this.updateProgressBars();
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    initCharts() {
        this.initTrafficChart();
        this.initEngagementChart();
        this.initPostsChart();
        this.initDevicesChart();
    }

    initTrafficChart() {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) return;

        // Simulated traffic data
        const trafficData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Page Views',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#1d9bf0',
                backgroundColor: 'rgba(29, 155, 240, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.charts.traffic = this.createChart(ctx, 'line', trafficData);
    }

    initEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        const engagementData = {
            labels: ['Likes', 'Comments', 'Shares', 'Saves'],
            datasets: [{
                data: [45, 25, 15, 15],
                backgroundColor: [
                    '#1d9bf0',
                    '#00ba7c',
                    '#f91880',
                    '#ffd400'
                ]
            }]
        };

        this.charts.engagement = this.createChart(ctx, 'doughnut', engagementData);
    }

    initPostsChart() {
        const ctx = document.getElementById('postsChart');
        if (!ctx) return;

        const postsData = {
            labels: ['Tech', 'Thoughts', 'Motivation', 'Ideas', 'Life'],
            datasets: [{
                label: 'Posts by Category',
                data: [12, 19, 8, 15, 7],
                backgroundColor: 'rgba(29, 155, 240, 0.8)',
                borderColor: '#1d9bf0',
                borderWidth: 2
            }]
        };

        this.charts.posts = this.createChart(ctx, 'bar', postsData);
    }

    initDevicesChart() {
        const ctx = document.getElementById('devicesChart');
        if (!ctx) return;

        const devicesData = {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    '#1d9bf0',
                    '#00ba7c',
                    '#f91880'
                ]
            }]
        };

        this.charts.devices = this.createChart(ctx, 'pie', devicesData);
    }

    createChart(ctx, type, data) {
        return new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text'),
                            usePointStyle: true
                        }
                    }
                },
                scales: type === 'line' || type === 'bar' ? {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text')
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text')
                        }
                    }
                } : {}
            }
        });
    }

    initEventListeners() {
        // Date range filter
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                this.filterByDateRange(e.target.value);
            });
        }

        // Export buttons
        const exportBtn = document.getElementById('exportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAnalyticsData());
        }

        // Refresh data
        const refreshBtn = document.getElementById('refreshAnalytics');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    filterByDateRange(range) {
        // Simulate filtering based on date range
        this.showToast(`Filtering data for: ${range}`, 'info');
        
        // In a real app, this would filter the actual data
        setTimeout(() => {
            this.updateChartsWithFilteredData(range);
        }, 1000);
    }

    updateChartsWithFilteredData(range) {
        // Simulate updated data based on filter
        const multiplier = this.getRangeMultiplier(range);
        
        Object.values(this.charts).forEach(chart => {
            if (chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (dataset.data && Array.isArray(dataset.data)) {
                        dataset.data = dataset.data.map(value => 
                            Math.round(value * multiplier)
                        );
                    }
                });
                chart.update();
            }
        });

        this.updateStatsWithFilteredData(multiplier);
    }

    getRangeMultiplier(range) {
        const multipliers = {
            'today': 0.1,
            'week': 0.3,
            'month': 0.7,
            'year': 1,
            'all': 1.2
        };
        return multipliers[range] || 1;
    }

    updateStatsWithFilteredData(multiplier) {
        const filteredStats = {};
        Object.keys(this.stats).forEach(key => {
            if (typeof this.stats[key] === 'number') {
                filteredStats[key] = Math.round(this.stats[key] * multiplier);
            }
        });
        
        // Update display with filtered stats
        Object.keys(filteredStats).forEach(statKey => {
            const element = document.getElementById(statKey);
            if (element) {
                element.textContent = this.formatNumber(filteredStats[statKey]);
            }
        });
    }

    async exportAnalyticsData() {
        try {
            // Simulate export process
            this.showToast('Preparing export...', 'info');
            
            const exportData = {
                stats: this.stats,
                timestamp: new Date().toISOString(),
                range: document.getElementById('dateRange')?.value || 'all'
            };

            // Create and download JSON file
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `genz-analytics-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.showToast('Analytics data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting analytics:', error);
            this.showToast('Export failed', 'error');
        }
    }

    async refreshData() {
        this.showToast('Refreshing analytics data...', 'info');
        
        // Simulate API call to refresh data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update with simulated new data
        Object.keys(this.stats).forEach(key => {
            if (typeof this.stats[key] === 'number') {
                this.stats[key] += Math.floor(Math.random() * 100);
            }
        });

        this.updateStatsDisplay();
        this.updateAllCharts();
        
        this.showToast('Analytics data refreshed!', 'success');
    }

    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart.data.datasets) {
                chart.data.datasets.forEach(dataset => {
                    if (dataset.data && Array.isArray(dataset.data)) {
                        dataset.data = dataset.data.map(value => 
                            value + Math.floor(Math.random() * 10)
                        );
                    }
                });
                chart.update('active');
            }
        });
    }

    updateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const target = parseInt(bar.getAttribute('data-target')) || 100;
            const current = parseInt(bar.getAttribute('data-current')) || 0;
            const percentage = Math.min((current / target) * 100, 100);
            
            bar.style.width = `${percentage}%`;
            bar.setAttribute('data-value', `${Math.round(percentage)}%`);
        });
    }

    startRealtimeUpdates() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateRealtimeStats();
        }, 10000); // Update every 10 seconds
    }

    updateRealtimeStats() {
        // Simulate small real-time changes
        const changes = {
            totalViews: Math.floor(Math.random() * 5),
            totalLikes: Math.floor(Math.random() * 3),
            totalComments: Math.floor(Math.random() * 2),
            totalShares: Math.floor(Math.random() * 1)
        };

        Object.keys(changes).forEach(key => {
            if (this.stats[key] !== undefined) {
                this.stats[key] += changes[key];
            }
        });

        this.updateStatsDisplay();
    }

    showToast(message, type = 'info') {
        if (window.toast) {
            window.toast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize analytics dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            window.analyticsDashboard = new AnalyticsDashboard();
        };
        document.head.appendChild(script);
    } else {
        window.analyticsDashboard = new AnalyticsDashboard();
    }
});
