var C = 'library-v1';
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  var r = e.request;
  if(r.method !== 'GET') return;
  var u = new URL(r.url);
  var heavy = /\.pdf$/i.test(u.pathname) || u.hostname === 'cdnjs.cloudflare.com';
  e.respondWith(caches.open(C).then(function(c){
    function net(){
      return fetch(r).then(function(res){
        if(res.ok && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) c.put(r.url, res.clone());
        return res;
      });
    }
    if(heavy){
      return c.match(r.url).then(function(hit){ return hit || net(); });
    }
    return net().catch(function(){ return c.match(r.url).then(function(h){ return h || c.match(self.registration.scope); }); });
  }));
});
