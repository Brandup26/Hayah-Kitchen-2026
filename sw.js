const CACHE_NAME = 'hayah-kitchen-v5'; // تغيير اسم الكاش لإجبار الموبايل على التحديث فوراً

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/lolog.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية جلب ديناميكية: دائمًا جلب الجديد من السيرفر وشيت جوجل أولاً، وحفظ نسخة احتياطية للطوارئ
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // إذا كان الملف سليم، نحدث الكاش بالنسخة الجديدة فوراً
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // في حالة قطع الإنترنت تماماً عند العميل، يتم سحب الصور من الكاش تلقائياً
        return caches.match(event.request);
      })
  );
});
