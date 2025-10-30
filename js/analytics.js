// analytics.js - simple demo analytics (stores synthetic data in localStorage)
document.addEventListener('DOMContentLoaded', function () {
  const visitorsEl = document.getElementById('visitors');
  const pageviewsEl = document.getElementById('pageviews');
  const bounceEl = document.getElementById('bounce');
  const eventsList = document.getElementById('eventsList');

  // generate synthetic last 7 days data if none exists
  let data = JSON.parse(localStorage.getItem('gzs_analytics')) || null;
  if (!data) {
    const today = new Date();
    data = { days: [], visitors: [], pageviews: [], events: [] };
    for (let i=6;i>=0;i--){
      const d = new Date(today);
      d.setDate(today.getDate()-i);
      data.days.push(d.toISOString().slice(0,10));
      data.visitors.push(Math.floor(50 + Math.random()*250));
      data.pageviews.push(Math.floor(100 + Math.random()*600));
    }
    data.events.push({ts: new Date().toISOString(), text: 'Analytics initialized with synthetic data.'});
    localStorage.setItem('gzs_analytics', JSON.stringify(data));
  }

  const totalVisitors = data.visitors.reduce((a,b)=>a+b,0);
  const totalPageviews = data.pageviews.reduce((a,b)=>a+b,0);
  const avgBounce = (30 + Math.floor(Math.random()*40)) + '%';

  visitorsEl.textContent = totalVisitors.toLocaleString();
  pageviewsEl.textContent = totalPageviews.toLocaleString();
  bounceEl.textContent = avgBounce;

  const ctx = document.getElementById('trafficChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.days,
      datasets: [{
        label: 'Pageviews',
        data: data.pageviews,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // events list
  data.events.slice().reverse().forEach(ev=>{
    const li = document.createElement('li');
    li.textContent = (new Date(ev.ts)).toLocaleString() + ' — ' + ev.text;
    eventsList.appendChild(li);
  });
});
