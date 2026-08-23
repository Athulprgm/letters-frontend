/**
 * LETTERS Atelier Service Worker - Standard Web Push Notifications
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Receive Push Messages from Web Push Server
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'LETTERS Atelier',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'LETTERS Notification';
  const options = {
    body: data.body || 'You have a new update from LETTERS Atelier.',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    data: data.data || { url: '/' },
    vibrate: [100, 50, 100],
    tag: data.tag || (data.data && data.data.orderId ? `order-${data.data.orderId}` : 'letters-push'),
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Notification Click Handler - Focus or Open URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for an existing open window/tab from our domain
      for (const client of clientList) {
        if ('focus' in client) {
          // If already on the exact URL or admin, navigate and focus
          if (client.url.includes(targetUrl) || targetUrl === '/') {
            return client.focus();
          }
          // Navigate existing tab to target URL
          if ('navigate' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // If no matching tab is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
