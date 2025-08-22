(function(){
  const {auth, db, storage, provider, ts} = window.FB;

  // ---------- Global state ----------
  let currentUser = null;
  let selectedFolderId = null;
  let selectedChapterId = null;
  const LOCAL_KEY = 'learnx_local_v1';
  let local = loadLocal() || { folders: [], chapters: [], items: [] };

  // ---------- Elements ----------
  const D = sel => document.querySelector(sel);
  const E = {
    themeBtn: D('#themeBtn'),
    authArea: D('#authArea'),
    errorArea: D('#errorArea'),
    folders: D('#folders'),
    addFolderBtn: D('#addFolderBtn'),
    folderTitle: D('#folderTitle'),
    chapters: D('#chapters'),
    addChapterBtn: D('#addChapterBtn'),
    chapterTitle: D('#chapterTitle'),
    items: D('#items'),
    sort: D('#sort'),
    search: D('#search'),
    fileInput: D('#fileInput'),
    uploadBtn: D('#uploadBtn'),
    dropLayer: D('#dropLayer'),
    dropHint: D('#dropHint'),
    error: D('#errorArea')
  };

  // ---------- Utils ----------
  const uid = ()=> (crypto?.randomUUID? crypto.randomUUID(): Math.random().toString(36).slice(2));
  const now = ()=> new Date().toISOString();
  const esc = s => (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  function saveLocal(){ try{ localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); }catch{} }
  function loadLocal(){ try{ return JSON.parse(localStorage.getItem(LOCAL_KEY)); }catch{ return null; } }
  function showError(msg, persist=false){ E.error.innerHTML = `<div class="banner">${esc(msg)}</div>`; if(!persist) setTimeout(()=> E.error.innerHTML='', 6000); }

  // ---------- Theme ----------
  function applyTheme(t){ if(t==='light') document.documentElement.classList.add('light'); else document.documentElement.classList.remove('light'); localStorage.setItem('lx_theme', t); }
  E.themeBtn.addEventListener('click', ()=> applyTheme(document.documentElement.classList.contains('light')? 'dark':'light'));
  (function(){ const saved = localStorage.getItem('lx_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches? 'light':'dark'); applyTheme(saved); })();

  // ---------- Auth ----------
  async function trySetPersistence(){
    try{ await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); return; }
    catch(e){ try{ await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION); showError('Local persistence blocked — using session.'); }
      catch(e2){ showError('Storage blocked — auth will not persist across reloads.', true); } }
  }

  function renderAuth(){
    E.authArea.innerHTML='';
    if(currentUser){
      const d = document.createElement('div'); d.style.display='flex'; d.style.gap='8px'; d.style.alignItems='center';
      d.innerHTML = `<div class="small">${esc(currentUser.displayName||currentUser.email)}</div><button id="signOut" class="btn">Sign out</button>`;
      E.authArea.appendChild(d);
      d.querySelector('#signOut').addEventListener('click', ()=> auth.signOut());
    } else {
      const b = document.createElement('button'); b.className='btn primary'; b.textContent='Sign in with Google';
      b.addEventListener('click', async ()=>{ try{ await trySetPersistence(); await auth.signInWithPopup(provider); }catch(err){ alert('Sign-in failed: '+(err.message||err.code)); } });
      E.authArea.appendChild(b);
    }
  }

  auth.onAuthStateChanged(async (u)=>{
    currentUser = u; renderAuth();
    if(u){ await startRealtime(); await mergeLocalIntoServer(); }
    else { stopRealtime(); local = loadLocal() || {folders:[],chapters:[],items:[]}; renderAll(); }
  });

  // ---------- Firestore structure ----------
  // users/{uid}/folders      {id,name,parentId,order,createdAt}
  // users/{uid}/chapters     {id,name,folderId,order,createdAt}
  // users/{uid}/items        {id,type,title,url,mime,chapterId,order,createdAt,updatedAt}

  let unsubF=null, unsubC=null, unsubI=null;
  async function startRealtime(){
    const uid = currentUser.uid; stopRealtime();
    unsubF = db.collection('users').doc(uid).collection('folders').onSnapshot(s=>{
      const a=[]; s.forEach(d=> a.push({id:d.id, ...d.data()})); local.folders = a; renderFolders(); if(!selectedFolderId && a.length) selectFolder(a[0].id);
    });
    unsubC = db.collection('users').doc(uid).collection('chapters').onSnapshot(s=>{
      const a=[]; s.forEach(d=> a.push({id:d.id, ...d.data()})); local.chapters = a; renderChapters();
    });
    unsubI = db.collection('users').doc(uid).collection('items').onSnapshot(s=>{
      const a=[]; s.forEach(d=> a.push({id:d.id, ...d.data()})); local.items = a; renderItems();
    });
  }
  function stopRealtime(){ if(unsubF){unsubF();unsubF=null;} if(unsubC){unsubC();unsubC=null;} if(unsubI){unsubI();unsubI=null;} }

  async function mergeLocalIntoServer(){
    const uid = currentUser.uid; const U = db.collection('users').doc(uid);
    // push any local-only docs to server
    const [sf, sc, si] = await Promise.all([
      U.collection('folders').get(), U.collection('chapters').get(), U.collection('items').get()
    ]);
    const fids = new Set(sf.docs.map(d=>d.id));
    const cids = new Set(sc.docs.map(d=>d.id));
    const iids = new Set(si.docs.map(d=>d.id));

    for(const f of (local.folders||[])) if(!fids.has(f.id)) await U.collection('folders').doc(f.id).set({ name:f.name, parentId:f.parentId??null, order:f.order??Date.now(), createdAt: ts() });
    for(const c of (local.chapters||[])) if(!cids.has(c.id)) await U.collection('chapters').doc(c.id).set({ name:c.name, folderId:c.folderId, order:c.order??Date.now(), createdAt: ts() });
    for(const it of (local.items||[])) if(!iids.has(it.id)){
      const payload = {...it}; delete payload.id; if(it.data){ const blob = await (await fetch(it.data)).blob(); const ref = storage.ref(`uploads/${uid}/${it.id}-${Date.now()}`); await ref.put(blob); payload.url = await ref.getDownloadURL(); delete payload.data; }
      await U.collection('items').doc(it.id).set({ ...payload, createdAt: ts(), updatedAt: ts() });
    }
  }

  // ---------- CRUD helpers ----------
  const isSigned = ()=> !!currentUser;
  async function addFolder(name, parentId=null){
    const f = { id: uid(), name, parentId, order: Date.now(), createdAt: now() };
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('folders').doc(f.id).set({ name, parentId, order:f.order, createdAt: ts() });
    else { local.folders.push(f); saveLocal(); }
    renderFolders();
  }
  async function renameFolder(id, name){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('folders').doc(id).update({ name });
    else { local.folders = local.folders.map(x=> x.id===id? {...x,name}:x); saveLocal(); renderFolders(); }
  }
  async function moveFolder(id, newParent){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('folders').doc(id).update({ parentId:newParent, order: Date.now() });
    else { const f=local.folders.find(x=>x.id===id); if(f){ f.parentId=newParent; f.order=Date.now(); saveLocal(); renderFolders(); }}
  }
  async function deleteFolder(id){
    // delete chapters & items inside (client-side sweep)
    const ch = local.chapters.filter(c=>c.folderId===id).map(c=>c.id);
    for(const cid of ch) await deleteChapter(cid);
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('folders').doc(id).delete();
    else { local.folders = local.folders.filter(f=>f.id!==id); saveLocal(); renderFolders(); }
  }

  async function addChapter(name){
    if(!selectedFolderId) return alert('Select a folder first');
    const c = { id: uid(), name, folderId: selectedFolderId, order: Date.now(), createdAt: now() };
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('chapters').doc(c.id).set({ name:c.name, folderId:c.folderId, order:c.order, createdAt: ts() });
    else { local.chapters.push(c); saveLocal(); renderChapters(); }
  }
  async function renameChapter(id, name){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('chapters').doc(id).update({ name });
    else { local.chapters = local.chapters.map(x=> x.id===id? {...x,name}:x); saveLocal(); renderChapters(); }
  }
  async function moveChapter(id, newFolderId){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('chapters').doc(id).update({ folderId:newFolderId, order: Date.now() });
    else { const c=local.chapters.find(x=>x.id===id); if(c){ c.folderId=newFolderId; c.order=Date.now(); saveLocal(); renderChapters(); }}
  }
  async function deleteChapter(id){
    // delete items in chapter
    const items = local.items.filter(i=>i.chapterId===id).map(i=>i.id);
    for(const iid of items) await deleteItem(iid);
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('chapters').doc(id).delete();
    else { local.chapters = local.chapters.filter(c=>c.id!==id); saveLocal(); renderChapters(); }
  }

  async function addItemFromFile(file){
    if(!selectedChapterId) return alert('Select a chapter first');
    const it = { id: uid(), type: file.type.startsWith('video/')? 'video': (file.type.startsWith('image/')? 'image': 'file'), title: file.name, url:null, mime:file.type, chapterId: selectedChapterId, order: Date.now(), createdAt: now(), updatedAt: now() };
    if(isSigned()){
      const path = `uploads/${currentUser.uid}/${it.id}-${Date.now()}-${file.name}`; const ref = storage.ref(path);
      await ref.put(file); it.url = await ref.getDownloadURL();
      const payload = {...it}; delete payload.id; await db.collection('users').doc(currentUser.uid).collection('items').doc(it.id).set({ ...payload, createdAt: ts(), updatedAt: ts() });
    } else {
      it.data = await fileToDataURL(file); local.items.push(it); saveLocal(); renderItems();
    }
  }
  async function saveItem(it){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('items').doc(it.id).update({ ...it, updatedAt: ts() });
    else { local.items = local.items.map(x=> x.id===it.id? it:x); saveLocal(); renderItems(); }
  }
  async function deleteItem(id){
    if(isSigned()) await db.collection('users').doc(currentUser.uid).collection('items').doc(id).delete();
    else { local.items = local.items.filter(i=>i.id!==id); saveLocal(); renderItems(); }
  }

  // ---------- Renderers ----------
  function renderAll(){ renderFolders(); renderChapters(); renderItems(); }
  function renderFolders(){
    const tree = E.folders; tree.innerHTML='';
    const roots = local.folders.filter(f=>!f.parentId).sort((a,b)=>(a.order??0)-(b.order??0));
    roots.forEach(r=> renderFolderBranch(r, 0));

    // Drag to move folders between parents (use Sortable per depth)
  }
  function renderFolderBranch(folder, depth){
    const row = document.createElement('div'); row.className='folder-row'+(folder.id===selectedFolderId?' active':'');
    row.style.paddingLeft = (8 + depth*14)+'px';
    row.innerHTML = `<div class="lh"><div class="dot"></div><div>${esc(folder.name)}</div></div>
    <div class="actions">
      <button class="btn" data-act="add">+</button>
      <button class="btn" data-act="rename">✏️</button>
      ${folder.id? '<button class="btn" data-act="del">🗑️</button>':''}
    </div>`;

    row.addEventListener('click', (e)=>{ if(e.target.closest('button')) return; selectFolder(folder.id); });

    row.querySelectorAll('button').forEach(btn=> btn.addEventListener('click', async e=>{
      const act = btn.dataset.act; e.stopPropagation();
      if(act==='add'){ const name=prompt('Subfolder name'); if(!name) return; await addFolder(name, folder.id); }
      if(act==='rename'){ const name=prompt('Rename folder', folder.name); if(!name) return; await renameFolder(folder.id, name); }
      if(act==='del'){ if(confirm('Delete this folder and all its chapters & videos?')) await deleteFolder(folder.id); }
    }));

    E.folders.appendChild(row);
    const children = local.folders.filter(f=>f.parentId===folder.id).sort((a,b)=>(a.order??0)-(b.order??0));
    children.forEach(ch=> renderFolderBranch(ch, depth+1));
  }

  function selectFolder(id){ selectedFolderId = id; E.folderTitle.textContent = local.folders.find(f=>f.id===id)?.name || 'Folder'; renderChapters(); }

  function renderChapters(){
    E.chapters.innerHTML='';
    const list = local.chapters.filter(c=> c.folderId===selectedFolderId).sort((a,b)=>(a.order??0)-(b.order??0));
    list.forEach(c=>{
      const row = document.createElement('div'); row.className='chapter-row'+(c.id===selectedChapterId?' active':'');
      row.innerHTML = `<div>${esc(c.name)}</div><div class="actions"><button class="btn" data-act="open">Open</button><button class="btn" data-act="rename">✏️</button><button class="btn" data-act="del">🗑️</button></div>`;
      row.querySelector('[data-act=open]').addEventListener('click', ()=> selectChapter(c.id));
      row.querySelector('[data-act=rename]').addEventListener('click', async ()=>{ const name=prompt('Rename chapter', c.name); if(!name) return; await renameChapter(c.id,name); });
      row.querySelector('[data-act=del]').addEventListener('click', async ()=>{ if(confirm('Delete chapter and its items?')) await deleteChapter(c.id); });
      E.chapters.appendChild(row);
    });

    // Sortable for reordering chapters
    new Sortable(E.chapters, {
      animation: 180,
      onEnd: async (evt)=>{
        const ids = [...E.chapters.querySelectorAll('.chapter-row')].map(el=>{
          const name = el.querySelector('div').textContent; return list.find(c=>c.name===name)?.id; // simple map
        }).filter(Boolean);
        ids.forEach((id,ix)=>{
          const ch = local.chapters.find(c=>c.id===id); if(ch){ ch.order = ix; }
        });
        if(isSigned()) for(const ch of local.chapters.filter(c=>c.folderId===selectedFolderId)) await db.collection('users').doc(currentUser.uid).collection('chapters').doc(ch.id).update({ order: ch.order });
        saveLocal();
      }
    });
  }

  function selectChapter(id){ selectedChapterId = id; E.chapterTitle.textContent = local.chapters.find(c=>c.id===id)?.name || 'Chapter'; renderItems(); }

  function renderItems(){
    E.items.innerHTML=''; const q = (E.search.value||'').toLowerCase(); const sort = E.sort.value;
    let list = local.items.filter(i=> i.chapterId===selectedChapterId);
    if(sort==='order') list.sort((a,b)=>(a.order??0)-(b.order??0));
    if(sort==='updated') list.sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt));
    if(sort==='created') list.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    if(sort==='title') list.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
    if(q) list = list.filter(i=> (i.title||'').toLowerCase().includes(q) || (i.mime||'').toLowerCase().includes(q) );

    if(!selectedChapterId){ E.items.innerHTML = '<div class="muted">Select a chapter to see videos.</div>'; return; }

    if(list.length===0){ E.items.innerHTML = '<div class="muted">No videos yet — drag & drop or use Upload.</div>'; }

    list.forEach(it=>{
      const card = document.createElement('div'); card.className='card';
      const media = it.type==='video'? `<video controls src="${esc(it.url||it.data||'')}" preload="metadata"></video>`:
                    it.type==='image'? `<img src="${esc(it.url||it.data||'')}" />`:
                    `<div class="small">${esc(it.mime||'file')}</div>`;
      card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:start;gap:8px">
        <div style="flex:1"><h4>${esc(it.title||'(untitled)')}</h4>${media}</div>
        <div class="actions"><button class="btn" data-act="rename">✏️</button><button class="btn" data-act="del">🗑️</button></div>
      </div>`;
      card.querySelector('[data-act=rename]').addEventListener('click', async ()=>{ const title=prompt('Rename', it.title||''); if(!title) return; it.title=title; it.updatedAt=now(); await saveItem(it); });
      card.querySelector('[data-act=del]').addEventListener('click', async ()=>{ if(confirm('Delete item?')) await deleteItem(it.id); });
      E.items.appendChild(card);
    });

    // Sortable for reordering items
    new Sortable(E.items, {
      animation: 200,
      onEnd: async ()=>{
        const ids = [...E.items.querySelectorAll('.card')].map((el,ix)=>{
          const title = el.querySelector('h4').textContent; const it = local.items.filter(i=>i.chapterId===selectedChapterId).find(x=>x.title===title); if(it) it.order=ix; return it?.id;});
        if(isSigned()) for(const id of ids.filter(Boolean)){ const it = local.items.find(i=>i.id===id); await db.collection('users').doc(currentUser.uid).collection('items').doc(id).update({ order: it.order }); }
        saveLocal();
      }
    });
  }

  // ---------- File input & DnD ----------
  E.uploadBtn.addEventListener('click', ()=> E.fileInput.click());
  E.fileInput.addEventListener('change', async (e)=>{ const files=[...e.target.files]; for(const f of files) await addItemFromFile(f); E.fileInput.value=''; });

  ;['dragenter','dragover'].forEach(ev=> document.addEventListener(ev, e=>{ e.preventDefault(); E.dropLayer.classList.add('show'); E.dropHint.style.display='block'; }));
  ;['dragleave','dragend','drop'].forEach(ev=> document.addEventListener(ev, e=>{ if(ev==='drop') return; E.dropLayer.classList.remove('show'); E.dropHint.style.display='none'; }));
  document.addEventListener('drop', async (e)=>{ e.preventDefault(); E.dropLayer.classList.remove('show'); E.dropHint.style.display='none'; const files=[...(e.dataTransfer?.files||[])]; for(const f of files) await addItemFromFile(f); });

  function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

  // ---------- Buttons ----------
  E.addFolderBtn.addEventListener('click', async ()=>{ const name=prompt('Folder name', 'Physics'); if(!name) return; await addFolder(name, null); if(!selectedFolderId){ const f = local.folders.find(x=>x.name===name); if(f) selectFolder(f.id); }});
  E.addChapterBtn.addEventListener('click', async ()=>{ const name=prompt('Chapter name', 'Chapter 1'); if(!name) return; await addChapter(name); if(!selectedChapterId){ const c = local.chapters.find(x=>x.name===name && x.folderId===selectedFolderId); if(c) selectChapter(c.id); }});
  E.search.addEventListener('input', renderItems);
  E.sort.addEventListener('change', renderItems);

  // ---------- Seed local demo if empty ----------
  if(!local.folders.length){ const root = { id: uid(), name:'Physics', parentId:null, order:0, createdAt: now() }; local.folders=[root]; const ch={ id: uid(), name:'Chapter 1', folderId: root.id, order:0, createdAt: now() }; local.chapters=[ch]; saveLocal(); }
  selectedFolderId = local.folders[0]?.id || null; selectedChapterId = local.chapters.find(c=>c.folderId===selectedFolderId)?.id || null;
  renderAll();
})();