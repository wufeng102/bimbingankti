/* Service worker E-Theses System. Hanya menyimpan cangkang aplikasi (HTML, ikon).
   Data bimbingan dan berkas tidak pernah disimpan di perangkat. */
var VER = 'etheses-v3';
var SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'logo.png', 'favicon-64.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // API, Firebase, CDN: langsung ke jaringan
  if (req.mode === 'navigate') { // halaman: jaringan dulu agar pembaruan cepat sampai, cadangan dari cache saat offline
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(VER).then(function (c) { c.put('./', cp); }); return r;
    }).catch(function () { return caches.match('./'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (r) {
      if (r.ok) { var cp = r.clone(); caches.open(VER).then(function (c) { c.put(req, cp); }); }
      return r;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
