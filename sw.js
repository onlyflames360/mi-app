
const CACHE_NAME = 'ppco-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Manejar el evento de clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Escuchar mensajes para mostrar notificaciones locales (simulación de push)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data.payload;
    self.registration.showNotification(title, {
      body,
      icon: icon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=PPCO',
      vibrate: [200, 100, 200],
      tag: tag || 'ppco-notif',
      badge: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PPCO',
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    });
  }
});
