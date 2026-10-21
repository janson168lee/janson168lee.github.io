// 人才適性適所檢測 Service Worker v1.0.0 (2026-10-21)
// 部署於 /talentfit/ 子路徑：全部使用相對路徑，導航 network-first＋離線快取
const CACHE = 'talentfit-v1.0.0-20261021';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './privacy.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // 外部資源直接走網路（本 App 無外部資源）
  if (!url.pathname.startsWith('/talentfit/')) return;

  // 導航請求：network-first，離線退回快取首頁
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // 其餘靜態資源：cache-first
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return r;
    }))
  );
});
