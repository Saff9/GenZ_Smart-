// comments.js - simple client-side comments stored in localStorage
document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('commentForm');
  const list = document.getElementById('comments');

  function render(){
    list.innerHTML = '';
    const comments = JSON.parse(localStorage.getItem('gzs_comments') || '[]').slice().reverse();
    if (comments.length === 0) {
      list.innerHTML = '<li>No comments yet. Be the first!</li>';
      return;
    }
    comments.forEach(c=>{
      const li = document.createElement('li');
      li.innerHTML = '<strong>'+escapeHtml(c.name)+'</strong> <small>'+new Date(c.ts).toLocaleString()+'</small><p>'+escapeHtml(c.text)+'</p>';
      list.appendChild(li);
    });
  }

  function escapeHtml(s){ return s.replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim() || 'Anonymous';
    const text = document.getElementById('comment').value.trim();
    if (!text) return;
    const comments = JSON.parse(localStorage.getItem('gzs_comments') || '[]');
    comments.push({name, text, ts: new Date().toISOString()});
    localStorage.setItem('gzs_comments', JSON.stringify(comments));
    form.reset();
    render();
  });

  render();
});
