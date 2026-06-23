const CACHE_NAME = 'v1';

// عند التثبيت، نطلب من المتصفح تفعيل التحديث فوراً
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// تنظيف النسخ القديمة فور تفعيل النسخة الجديدة
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
});

// هذا الكود يضمن جلب البيانات من الإنترنت أولاً (لضمان ظهور تحديثات الشيت)
// وإذا حدثت مشكلة في الإنترنت، يعرض النسخة المخزنة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
