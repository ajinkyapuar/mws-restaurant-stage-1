const staticCacheName = 'restaurant-reviews-v24';

let urlsToCache = [
  './',
  'index.html',
  'restaurant.html',
  'sw_registration.js',
  'manifest.json',
  // 'favicon.ico',
  'css/responsive_index.css',
  'css/responsive_restaurant.css',
  'css/styles.css',
  'img/1.webp',
  'img/2.webp',
  'img/3.webp',
  'img/4.webp',
  'img/5.webp',
  'img/6.webp',
  'img/7.webp',
  'img/8.webp',
  'img/9.webp',
  'img/10.webp',
  'img/marker-icon-2x-red.png',
  'img/marker-shadow.png',
  'js/idb.js',
  'js/dbhelper.js',
  // 'js/indexController.js',
  'js/bouncemarker.js',
  'js/main.js',
  'js/restaurant_info.js',
  'http://localhost:1337/restaurants/',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://fonts.googleapis.com/css?family=Open+Sans:300,400',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  // 'https://fonts.gstatic.com/s/opensans/v15/mem5YaGs126MiZpBA-UN_r8OUuhp.woff',
  // 'https://fonts.gstatic.com/s/opensans/v15/mem8YaGs126MiZpBA-UFVZ0b.woff2',
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
    .open(staticCacheName)
    .then(cache => cache.addAll(urlsToCache))
    .then(self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cache => {
      if (cache !== staticCacheName) {
        console.log("[ServiceWorker] removing cached files from ", cache);
        return caches.delete(cache);
      }
    })))
  )
})

self.addEventListener("fetch", event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          // console.log("[ServiceWorker] Found in cache ", event.request.url);
          return response;
        }
        return fetch(event.request);
      })
    );
  }
});