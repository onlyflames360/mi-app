
const CACHE_NAME = 'ppoc-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap'
];

// Instalación: Guardar archivos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Manejo de eventos PUSH (para recibir notificaciones con pantalla bloqueada)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'PPOC Alerta', body: 'Tienes una nueva actualización en tus turnos.' };
  
  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/1170/1170576.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/1170/1170576.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo de clics en las notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Estrategia de Fetch Híbrida
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Para el documento principal (index.html), priorizamos Red (Network First)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para el resto (Imágenes, Fuentes, Scripts), usamos Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback silencioso
      });

      return cachedResponse || fetchPromise;
    })
  );
});
