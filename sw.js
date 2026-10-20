// ---------------------------------------------------------
// SERVICE WORKER: Damit die App auch ohne Internet startet.
//
// Strategie "erst Netz, sonst Speicher":
// - Mit Internet bekommst du immer die neueste Version der Dateien.
// - Ohne Internet lädt die App aus dem Zwischenspeicher.
// Wetter und Feiertage (andere Adressen) laufen nicht über den
// Service Worker, die verwaltet app.js selbst.
// ---------------------------------------------------------

const CACHE = 'schlauer-kalender-v1';
const DATEIEN = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'rezepte.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(DATEIEN)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request;
  const adresse = new URL(anfrage.url);

  // Nur eigene Dateien behandeln, alles andere geht direkt ins Netz.
  if (anfrage.method !== 'GET' || adresse.origin !== self.location.origin) return;

  ereignis.respondWith(
    fetch(anfrage)
      .then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE).then((cache) => cache.put(anfrage, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(anfrage).then((treffer) => treffer || caches.match('index.html')))
  );
});
