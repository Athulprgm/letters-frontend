/**
 * LETTERS Atelier Service Worker - High Reliability Web Push & Real-Time Alerts
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
  const logoUrl = new URL(data.icon || '/logo.png', self.location.origin).href;
  const badgeUrl = new URL(data.badge || '/logo.png', self.location.origin).href;
  const targetUrl = (data.data && data.data.url) ? data.data.url : '/';

  const notificationTag = data.tag || (data.data && data.data.orderId
    ? `order-${data.data.orderId}-${Date.now()}`
    : `letters-push-${Date.now()}`);

  const options = {
    body: data.body || 'You have a new update from LETTERS Atelier.',
    icon: logoUrl,
    badge: badgeUrl,
    data: {
      url: targetUrl,
      timestamp: Date.now(),
      orderId: data.data?.orderId,
      type: data.data?.type || 'general',
      payload: data,
    },
    vibrate: [200, 100, 200, 100, 300],
    tag: notificationTag,
    renotify: true,
    requireInteraction: true,
  };

  // Broadcast message to any active browser tabs to play chime & refresh immediately
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.postMessage({
        type: 'PUSH_NOTIFICATION_RECEIVED',
        title: title,
        body: options.body,
        data: options.data,
      });
    }
  });

  // Display system notification
  const showNotificationPromise = self.registration.showNotification(title, options);

  event.waitUntil(Promise.all([showNotificationPromise, broadcastPromise]));
});

// 2. Notification Click Handler - Focus or Open URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetPath = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
  const urlToOpen = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Try to find a matching open tab
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url === urlToOpen || (targetPath.startsWith('/admin') && client.url.includes('/admin'))) {
            if ('navigate' in client && client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
      }

      // 2. If existing tab is open on our domain, navigate it
      if (clientList.length > 0 && 'navigate' in clientList[0] && 'focus' in clientList[0]) {
        clientList[0].navigate(urlToOpen);
        return clientList[0].focus();
      }

      // 3. Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

