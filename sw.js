/* يحفظ ملفات التطبيق على الجهاز ليفتح فوراً حتى مع إنترنت ضعيف أو مقطوع.
   كل نسخة جديدة من التطبيق تُنزَّل كاملة في الخلفية، وتُستعمل من الفتح التالي.
   بيانات قاعدة البيانات لا تُحفظ هنا */
var C = 'c2-v31';
var FILES = ['./', 'index.html', 'app.css', 'config.js', 'data1.js', 'data2.js', 'bank.js', 'art.js', 'app.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/college-logo.png', 'icons/college-logo-160.png', 'icons/college-mark-white.png'];

self.addEventListener('install', function (e) {
  /* cache:'reload' يتجاوز ذاكرة المتصفح المؤقتة، فتُحفظ أحدث الملفات فعلاً */
  e.waitUntil(caches.open(C).then(function (c) {
    return Promise.all(FILES.map(function (f) { return fetch(new Request(f, { cache: 'reload' })).then(function (r) { if (r.ok) return c.put(f, r); }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); }));
});

/* شبكة بمهلة: إن لم تُجب خلال ms نستعمل النسخة المحفوظة */
function netWithTimeout(req, ms) {
  return new Promise(function (resolve, reject) {
    var done = false, t = setTimeout(function () { if (!done) { done = true; reject(new Error('timeout')); } }, ms);
    fetch(req).then(function (r) { if (!done) { done = true; clearTimeout(t); resolve(r); } }, function (err) { if (!done) { done = true; clearTimeout(t); reject(err); } });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  var isPage = req.mode === 'navigate';
  e.respondWith(caches.open(C).then(function (c) {
    return c.match(isPage ? './' : req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit; /* فتح فوري من الجهاز */
      return netWithTimeout(req, isPage ? 4000 : 8000).then(function (r) {
        if (r.ok) c.put(req, r.clone());
        return r;
      }).catch(function () {
        return c.match(isPage ? 'index.html' : req, { ignoreSearch: true }).then(function (h2) { return h2 || fetch(req); });
      });
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow('./');
  }));
});
