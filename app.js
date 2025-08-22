// app.js
(async function(){
  const { auth, db, storage, provider, ts } = window.FB;

  // DOM refs
  const $ = sel => document.querySelector(sel);
  const E = {
    themeBtn: $('#themeBtn'),
    authArea: $('#authArea'),
    messageArea: $('#messageArea'),
    folders: $('#folders'),
    addFolderBtn: $('#addFolderBtn'),
    folderTitle: $('#folderTitle'),
    chapters: $('#chapters'),
    addChapterBtn: $('#addChapterBtn'),
    chapterTitle: $('#chapterTitle'),
    items: $('#items'),
    uploadBtn: $('#uploadBtn'),
    fileInput: $('#fileInput'),
    dropLayer: $('#dropLayer'),
    dropHint: $('#dropHint'),
    search: $('#search'),
    modalRoot: $('#modalRoot'),
    messageArea: $('#messageArea')
  };

  // state
  let currentUser = null;
  let selectedFolderId = null;
  let selectedChapterId = null;
  // local fallback (signed-out experience)
  let local = { folders: [], chapters: [], videos: [] };
  const LOCAL_KEY = 'gslx_public_v1';

  // constants
  const MAX_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

  // load local if exists
  try { const raw = localStorage.getItem(LOCAL_KEY); if(raw) local = JSON.parse(raw); } catch(e){ /* ignore */ }

  // theme
  E.themeBtn.addEventListener('click', ()=> document.documentElement.classList.toggle('light'));

  // convenience: show message
  function showMsg(msg, persist=false){
    E.messageArea.innerHTML = `<div class="banner">${escapeHtml(msg)}</div>`;
    if(!persist) setTimeout(()=> E.messageArea.innerHTML = '', 5000);
  }
  function escapeHtml(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  // ---------------- AUTH ----------------
  async function setPersistencePreferLocal(){
    try{
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }catch(e){
      try{ await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION); showMsg('Local storage blocked — using session.', false); }
      catch(e2){ showMsg('Storage blocked — sign-in will not persist across reloads.', true); }
    }
  }

  function renderAuth(){
    E.authArea.innerHTML = '';
    if(currentUser){
      const el = document.createElement('div'); el.style.display='flex'; el.style.gap='8px'; el.style.alignItems='center';
      el.innerHTML = `<div class="small">${escapeHtml(currentUser.displayName || currentUser.email)}</div><button id="signOut" class="btn">Sign out</button>`;
      E.authArea.appendChild(el);
      el.querySelector('#signOut').addEventListener('click', ()=> auth.signOut());
    } else {
      const b = document.createElement('button'); b.className='btn primary'; b.textContent='Sign in to Upload';
      b.addEventListener('click', async ()=>{
        try{
          await setPersistencePreferLocal();
          await auth.signInWithPopup(provider);
        }catch(err){
          console.error(err);
          showMsg('Sign in failed: ' + (err && err.message ? err.message : 'unknown'), true);
        }
      });
      E.authArea.appendChild(b);
    }
  }

  auth.onAuthStateChanged(async u=>{
    currentUser = u;
    renderAuth();
    // Firestore listeners always active to show public content
    // but we also merge local to cloud when signing in
    if(u){
      await mergeLocalToCloud(u.uid).catch(e=> console.warn('merge failed', e));
    }
  });

  // ---------------- FIRESTORE LISTENERS (public read) ----------------
  // Global collections:
  // folders (id,name,order,createdAt)
  // chapters (id,name,folderId,order,createdAt)
  // videos   (id,title,mime,size,folderId,chapterId,storagePath,downloadURL,uploaderUid,createdAt)

  // Subscribe to real-time public data
  db.collection('folders').orderBy('order','asc').onSnapshot(snap=>{
    const arr=[]; snap.forEach(d=> arr.push({ id: d.id, ...d.data() }));
    local.folders = arr; renderFolders();
    // try auto-select
    if(!selectedFolderId && arr.length) selectFolder(arr[0].id);
  });

  db.collection('chapters').orderBy('order','asc').onSnapshot(snap=>{
    const arr=[]; snap.forEach(d=> arr.push({ id: d.id, ...d.data() }));
    local.chapters = arr; renderChapters();
  });

  db.collection('videos').orderBy('createdAt','desc').onSnapshot(snap=>{
    const arr=[]; snap.forEach(d=> arr.push({ id: d.id, ...d.data() }));
    local.videos = arr; renderItems();
  });

  // ---------------- RENDERERS ----------------
  function renderFolders(){
    E.folders.innerHTML = '';
    (local.folders || []).forEach(f=>{
      const row = document.createElement('div'); row.className='folder-row' + (f.id===selectedFolderId? ' active':'');
      row.innerHTML = `<div>${escapeHtml(f.name)}</div><div class="actions"><button class="btn" data-act="rename">✏️</button></div>`;
      row.addEventListener('click', ()=> selectFolder(f.id));
      row.querySelector('[data-act=rename]').addEventListener('click', async (e)=>{ e.stopPropagation(); if(!currentUser) return alert('Sign in to edit.'); const name = prompt('Rename folder', f.name); if(!name) return; await db.collection('folders').doc(f.id).update({ name }); });
      E.folders.appendChild(row);
    });
  }

  function selectFolder(id){
    selectedFolderId = id;
    const f = (local.folders||[]).find(x=>x.id===id);
    E.folderTitle.textContent = f ? f.name : 'Select a folder';
    renderChapters();
  }

  function renderChapters(){
    E.chapters.innerHTML = '';
    if(!selectedFolderId) return;
    const arr = (local.chapters || []).filter(c => c.folderId === selectedFolderId).sort((a,b)=>(a.order||0)-(b.order||0));
    arr.forEach(c=>{
      const row = document.createElement('div'); row.className='chapter-row' + (c.id===selectedChapterId? ' active':'');
      row.innerHTML = `<div>${escapeHtml(c.name)}</div><div class="actions"><button class="btn" data-act="open">Open</button></div>`;
      row.querySelector('[data-act=open]').addEventListener('click', ()=> selectChapter(c.id));
      E.chapters.appendChild(row);
    });
  }

  function selectChapter(id){
    selectedChapterId = id;
    const c = (local.chapters||[]).find(x=>x.id===id);
    E.chapterTitle.textContent = c ? c.name : 'Select a chapter';
    renderItems();
  }

  function renderItems(){
    E.items.innerHTML = '';
    if(!selectedChapterId){ E.items.innerHTML = '<div class="muted">Select a chapter to view videos.</div>'; return; }
    let arr = (local.videos || []).filter(v => v.chapterId === selectedChapterId);
    const q = (E.search.value||'').trim().toLowerCase();
    if(q) arr = arr.filter(v => (v.title||'').toLowerCase().includes(q));
    if(arr.length === 0){ E.items.innerHTML = '<div class="muted">No videos yet.</div>'; return; }

    arr.forEach(v=>{
      const card = document.createElement('div'); card.className='card';
      const media = v.mime && v.mime.startsWith('video/') ? `<video controls src="${escapeHtml(v.downloadURL||v.url||'')}" preload="metadata"></video>` :
                    v.mime && v.mime.startsWith('image/') ? `<img src="${escapeHtml(v.downloadURL||v.url||v.data||'')}" />` :
                    `<div class="small">${escapeHtml(v.mime||'file')}</div>`;
      const downloadLink = v.downloadURL ? `<a href="${escapeHtml(v.downloadURL)}" target="_blank" rel="noopener" download>Download</a>` : '';
      card.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px">
        <div style="flex:1"><h4>${escapeHtml(v.title || '(untitled)')}</h4>${media}<div class="small muted">Size: ${v.size ? humanSize(v.size) : '—'}</div></div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">${downloadLink}${currentUser ? `<button class="btn" data-id="${v.id}" data-act="delete">Delete</button>` : ''}</div>
      </div>`;
      if(currentUser){
        card.querySelector('[data-act=delete]')?.addEventListener('click', async ()=> {
          if(!confirm('Delete video?')) return;
          try{
            // remove storage object then firestore doc
            if(v.storagePath) await storage.ref(v.storagePath).delete().catch(()=>{/*ignore*/});
            await db.collection('videos').doc(v.id).delete();
            showMsg('Deleted');
          }catch(e){ console.error(e); showMsg('Delete failed', true); }
        });
      }
      E.items.appendChild(card);
    });
  }

  function humanSize(bytes){
    if(!bytes) return '';
    const units = ['B','KB','MB','GB','TB'];
    let i=0; let v=bytes;
    while(v>=1024 && i<units.length-1){ v/=1024; i++; }
    return `${v.toFixed(v>=100?0:1)} ${units[i]}`;
  }

  // ---------------- CREATE folder/chapter ----------------
  E.addFolderBtn.addEventListener('click', async ()=>{
    if(!currentUser) return alert('Sign in to create a folder.');
    const name = prompt('Folder name (e.g., Physics)');
    if(!name) return;
    const doc = db.collection('folders').doc();
    await doc.set({ name, order: Date.now(), createdAt: ts() });
    showMsg('Folder created');
  });

  E.addChapterBtn.addEventListener('click', async ()=>{
    if(!currentUser) return alert('Sign in to create a chapter.');
    if(!selectedFolderId) return alert('Select a folder first.');
    const name = prompt('Chapter name (e.g., Chapter 1)');
    if(!name) return;
    const doc = db.collection('chapters').doc();
    await doc.set({ name, folderId: selectedFolderId, order: Date.now(), createdAt: ts() });
    showMsg('Chapter created');
  });

  // ---------------- UPLOAD logic ----------------
  E.uploadBtn.addEventListener('click', ()=> {
    if(!currentUser){ alert('Sign in to upload files.'); return; }
    if(!selectedChapterId){ alert('Select a chapter to upload into.'); return; }
    E.fileInput.click();
  });

  E.fileInput.addEventListener('change', async (e)=>{
    const files = [...e.target.files];
    await uploadFiles(files);
    E.fileInput.value = '';
  });

  // Global drag/drop
  ['dragenter','dragover'].forEach(ev => document.addEventListener(ev, e => {
    e.preventDefault();
    E.dropLayer.classList.add('show'); E.dropHint.style.display = 'block';
  }));
  ['dragleave','dragend'].forEach(ev => document.addEventListener(ev, e => {
    E.dropLayer.classList.remove('show'); E.dropHint.style.display = 'none';
  }));
  document.addEventListener('drop', async (e)=>{
    e.preventDefault();
    E.dropLayer.classList.remove('show'); E.dropHint.style.display = 'none';
    const files = [...(e.dataTransfer?.files || [])];
    if(files.length === 0) return;
    if(!currentUser) return alert('Sign in to upload files.');
    if(!selectedChapterId) return alert('Select a chapter first.');
    await uploadFiles(files);
  });

  async function uploadFiles(files){
    for(const file of files){
      if(file.size > MAX_BYTES){ alert(`${file.name} is larger than 1 GB and will not be uploaded.`); continue; }
      // create video doc with pending state (so viewers can see pending status if desired)
      const vidRef = db.collection('videos').doc();
      // Storage path structure:
      // uploads/{folderId}/{chapterId}/{timestamp}-{random}-{filename}
      const safeName = file.name.replace(/\s+/g,'_');
      const storagePath = `uploads/${selectedFolderId}/${selectedChapterId}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName}`;
      // show a temporary progress card
      const progressCard = createUploadCard(file.name);
      E.items.prepend(progressCard);

      try{
        const ref = storage.ref(storagePath);
        const uploadTask = ref.put(file);
        await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            snapshot => {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              updateUploadCard(progressCard, pct);
            },
            err => { console.error(err); updateUploadCard(progressCard, -1, 'Upload failed'); reject(err); },
            async ()=> {
              const url = await ref.getDownloadURL();
              // write metadata to Firestore (public collection)
              await vidRef.set({
                title: file.name,
                mime: file.type,
                size: file.size,
                folderId: selectedFolderId,
                chapterId: selectedChapterId,
                storagePath,
                downloadURL: url,
                uploaderUid: currentUser.uid,
                createdAt: ts()
              });
              updateUploadCard(progressCard, 100, 'Completed');
              resolve();
            }
          );
        });
      }catch(e){
        console.error('Upload error', e);
        updateUploadCard(progressCard, -1, 'Failed');
        showMsg('Upload failed: ' + (e.message||e.code||'unknown'), true);
      } finally {
        setTimeout(()=> { if(progressCard && progressCard.remove) progressCard.remove(); renderItems(); }, 1200);
      }
    }
  }

  function createUploadCard(name){
    const el = document.createElement('div'); el.className = 'card';
    el.innerHTML = `<div><h4>${escapeHtml(name)}</h4><div class="small muted">Uploading... <span class="pct">0%</span></div><div class="progress" style="height:8px;background:rgba(255,255,255,.05);border-radius:6px;margin-top:8px"><div class="bar" style="height:100%;width:0%;background:linear-gradient(90deg,#7c3aed,#06b6d4);border-radius:6px"></div></div></div>`;
    return el;
  }

  function updateUploadCard(card, pct, status){
    if(!card) return;
    const pctEl = card.querySelector('.pct');
    const bar = card.querySelector('.bar');
    if(pct >= 0){
      pctEl.textContent = pct + '%';
      if(bar) bar.style.width = pct + '%';
    } else {
      pctEl.textContent = status || 'Error';
      if(bar) bar.style.width = '100%';
      if(bar) bar.style.background = 'linear-gradient(90deg,#ff5252,#ff8a80)';
    }
  }

  // ---------------- Merge local to cloud (basic) ----------------
  // When user signs in we do not automatically push local site-only content to global public collection
  // (to avoid accidental public leaks). If you want that, implement explicit "Publish local to cloud" action.
  async function mergeLocalToCloud(uid){
    // placeholder: we intentionally do not auto-publish local items to global public collections
    // to avoid accidental leaking of private local content.
    return;
  }

  // ---------------- Misc helpers ----------------
  function showModal(html){
    E.modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
    return { close: ()=> E.modalRoot.innerHTML = '' };
  }

  // ---------------- initial UI seed ----------------
  // If Firestore has no folders (fresh project), you can seed a default folder/chapter.
  async function seedIfEmpty(){
    const fSnap = await db.collection('folders').limit(1).get();
    if(!fSnap.empty) return;
    // create sample folder & chapter for immediate demo
    const fRef = db.collection('folders').doc();
    await fRef.set({ name: 'Physics', order: 0, createdAt: ts() });
    const cRef = db.collection('chapters').doc();
    await cRef.set({ name: 'Chapter 1', folderId: fRef.id, order: 0, createdAt: ts() });
  }
  seedIfEmpty().catch(()=>{/*ignore*/});

})();
