const CACHE_NAME = 'hayah-kitchen-cache-v2'; // قمنا بتغيير رقم الفيرجن هنا لإجبار الموبايل على التحديث
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './images/lolog.jpg'
];

// 1. مرحلة التثبيت وتخزين الملفات الأساسية فقط
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app shell assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting()) // إجبار السيرفيس وركر الجديد على التفعيل فوراً
    );
});

// 2. مرحلة التنشيط وحذف أي كاش قديم ميت من جولات التجارب السابقة
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. التحكم في جلب البيانات ومنع كاش جوجل شيت نهائياً
self.addEventListener('fetch', (event) => {
    const requestUrl = event.request.url;

    // 🌟 التعديل السحري: إذا كان الطلب رايح لجوجل شيت، هاته من النت فوراً ومتحطهوش في الكاش نهائي
    if (requestUrl.includes('docs.google.com')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // في حالة إن العميل معندوش نت خالص، جرب تشوف لو فيه نسخة قديمة مسعفة
                return caches.match(event.request);
            })
        );
        return;
    }

    // باقي ملفات الأبلكيشن العادية (الصور، الستاين) بتيجي من الكاش عشان السرعة
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
