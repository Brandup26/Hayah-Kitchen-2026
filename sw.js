const CACHE_NAME = 'hayah-kitchen-v1';
// الملفات الأساسية التي سيتم حفظها في الموبايل لسرعة خارقة
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  './images/logo.jpg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// تثبيت التطبيق وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل المحرك وتحديث الكاش القديم
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
    })
  );
  self.clients.claim();
});

// استراتيجية العرض: جلب الملفات من الكاش أولاً لسرعة البرق، وإذا لم توجد يجلبها من النت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // تحديث الكاش في الخلفية لضمان التحديثات الجديدة
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* تجاهل خطأ الشبكة في الخلفية */});
        
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
