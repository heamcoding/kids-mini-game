// 몽실이와 놀이터 service worker: 앱 파일을 미리 저장해 두고 인터넷 없이도 실행
// Design: Vite hashes the JS/CSS bundle names, so FILES between the PRECACHE/END markers is
// rewritten at build time (vite-plugins/swPrecache.ts) with every file emitted into dist/
// (index.html, assets/*, icons, sprites, manifest). The fallback list below is only used if
// the file is served unbuilt. On top of that, every same-origin GET and the Google Fonts hosts
// are cached at runtime (cache-first), so anything missed is stored after its first load.
// Updating installed apps: the build rewrites CACHE with a hash of every emitted file, so any change
// (even a sprite) ships a new cache; the new worker skipWaiting()s, claims clients and
// activate deletes every other cache.
const CACHE='mongsil-v3';
const FILES=/*PRECACHE*/["./","index.html","manifest.webmanifest"]/*END*/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const isFont=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(url.origin!==location.origin&&!isFont)return;
  if(url.pathname.startsWith('/api/'))return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
    return res}).catch(()=>caches.match('index.html'))))});
