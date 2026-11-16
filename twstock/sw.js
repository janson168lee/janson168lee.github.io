/* 台股當沖助手 sw.js — 離線快取殼 */
var CACHE='twstock-v1.0.0';
var ASSETS=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit)return hit;
      return fetch(e.request).then(function(res){
        if(res.ok&&e.request.url.indexOf(self.location.origin)===0){
          var cp=res.clone();caches.open(CACHE).then(function(c){c.put(e.request,cp);});
        }
        return res;
      }).catch(function(){return caches.match('./index.html');});
    })
  );
});
