// Luna: fresh network first, cached app shell only when offline.
const CACHE='luna-shell-v15';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('luna-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  if(url.pathname.endsWith('/version.txt')||url.searchParams.has('luna_refresh'))return;
  e.respondWith((async()=>{
    try{
      const response=await fetch(req,{cache:'no-store'});
      if(response.ok){const cache=await caches.open(CACHE);e.waitUntil(cache.put(req,response.clone()))}
      return response;
    }catch(err){
      const cached=await caches.match(req);
      if(cached)return cached;
      if(req.mode==='navigate')return await caches.match('./index.html')||Response.error();
      return Response.error();
    }
  })());
});
