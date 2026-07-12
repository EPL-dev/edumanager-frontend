// Service Worker AgriFin Pro — mise en cache de l'app pour un fonctionnement 100% hors-ligne
// une fois qu'elle a été ouverte au moins une fois avec une connexion.
var CACHE_NAME = 'agrifin-pro-v1';
var ASSETS_TO_CACHE = [
  './AgriFin-Pro.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './chart.umd.min.js' // ne sera mis en cache que si le fichier est présent localement
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // On ajoute chaque fichier séparément : si l'un d'eux est absent (ex. chart.umd.min.js
      // non téléchargé localement), les autres sont quand même mis en cache.
      return Promise.all(
        ASSETS_TO_CACHE.map(function(url) {
          return cache.add(url).catch(function() { /* fichier optionnel absent, on ignore */ });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Stratégie : cache d'abord, puis réseau en secours (et mise à jour du cache si succès réseau)
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });
      return cached || networkFetch;
    })
  );
});
