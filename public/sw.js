const CACHE_VERSION = 'letters-cache-v3.2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// 1. Receive Push Messages from Web Push Server (Wakes device even when browser is closed)
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

  const title = data.title || '🔔 New Order Alert — LETTERS';
  const logoUrl = new URL(data.icon || '/logo.png', self.location.origin).href;
  const badgeUrl = new URL(data.badge || '/logo.png', self.location.origin).href;
  const targetUrl = (data.data && data.data.url) ? data.data.url : '/admin/orders';
  const phone = data.data?.phone || data.data?.whatsapp || '';

  const notificationTag = data.tag || (data.data && data.data.orderId
    ? `order-${data.data.orderId}-${Date.now()}`
    : `letters-alert-${Date.now()}`);

  // Interactive WhatsApp-like Action Buttons
  const actions = [];
  if (targetUrl.includes('/admin/orders') || data.data?.orderId) {
    actions.push({
      action: 'view_order',
      title: '📦 View Order',
    });
  }
  if (phone) {
    actions.push({
      action: 'open_whatsapp',
      title: '💬 Customer WhatsApp',
    });
  }

  const options = {
    body: data.body || 'New custom order received! Tap to review details in studio manager.',
    icon: logoUrl,
    badge: badgeUrl,
    data: {
      url: targetUrl,
      timestamp: Date.now(),
      orderId: data.data?.orderId,
      phone: phone,
      type: data.data?.type || 'order',
      payload: data,
    },
    // Distinct WhatsApp-style double buzz pattern
    vibrate: [200, 80, 200, 80, 250, 100, 350],
    tag: notificationTag,
    renotify: true,
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    actions: actions.length > 0 ? actions : undefined,
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

// 2. Notification Click Handler - Focus or Open URL / WhatsApp
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  let targetPath = notifData.url || '/admin/orders';

  // Handle action buttons
  if (event.action === 'open_whatsapp' && notifData.phone) {
    const cleanPhone = notifData.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone);
    const waUrl = `https://wa.me/${formattedPhone}?text=Hello!%20Thank%20you%20for%20your%20order%20with%20LETTERS%20Atelier.`;
    event.waitUntil(self.clients.openWindow(waUrl));
    return;
  }

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


