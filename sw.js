const CACHE_NAME = 'hayah-kitchen-v5';

// العناصر الأساسية المطلوب تخزينها ليعمل التطبيق بدون إنترنت (Offline)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/lolog.jpg',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// مرحلة التثبيت: تخزين الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching core app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // تفعيل السيرفس وركر الجديد فوراً
  );
});

// مرحلة التنشيط: حذف الكاش القديم (v1, v2, v3, v4) لضمان ظهور التعديلات الجديدة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة على كل الصفحات المفتوحة فوراً
  );
});

// مرحلة جلب البيانات: جلب الملفات من الكاش، وإذا لم تكن موجودة يتم جلبها من شبكة الإنترنت
self.addEventListener('fetch', (event) => {
  // استثناء رابط الـ CSV الخاص بـ Google Sheets لكي يقرأ الأسعار والوجبات الجديدة دائماً من الإنترنت مباشر
  if (event.request.url.includes('docs.google.com/spreadsheets')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // إذا كان الملف غير مخزن (مثل صور الوجبات الجديدة)، يتم جلبها وحفظها في الكاش ديناميكياً
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      }).catch(() => {
        // إذا كان المستخدم أوفلاين تماماً والملف غير موجود بالكاش
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});
