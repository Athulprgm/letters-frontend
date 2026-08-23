import { apiUrl } from '@/src/config/api';

/**
 * Convert a URL-safe Base64 string to a Uint8Array for PushManager subscription.
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the browser supports Web Push and Service Workers.
 */
export function isPushSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get the current notification permission state ('granted' | 'denied' | 'default' | 'unsupported').
 */
export function getNotificationPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Register or get the active Service Worker registration.
 */
export async function registerServiceWorker() {
  if (!isPushSupported()) {
    throw new Error('Web Push Notifications are not supported in this browser.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/',
  });

  await navigator.serviceWorker.ready;
  return registration;
}

/**
 * Get the existing browser push subscription if any.
 */
export async function getExistingPushSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('Failed to retrieve existing push subscription:', err);
    return null;
  }
}

/**
 * Subscribe the current browser to Web Push notifications.
 *
 * @param {Object} options
 * @param {'admin'|'user'} [options.role='user']
 * @param {string|null} [options.userId=null]
 * @returns {Promise<{success: boolean, subscription: PushSubscription}>}
 */
export async function subscribeToPushNotifications({ role = 'user', userId = null } = {}) {
  if (!isPushSupported()) {
    throw new Error('Web Push notifications are not supported by your browser.');
  }

  // 1. Request notification permission from user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notification permission was denied. Please enable notifications in your browser settings.'
        : 'Notification permission was dismissed.'
    );
  }

  // 2. Register Service Worker
  const registration = await registerServiceWorker();

  // 3. Obtain VAPID Public Key from environment
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID public key (VITE_VAPID_PUBLIC_KEY) is missing in frontend .env.');
  }
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // 4. Subscribe or retrieve existing subscription
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const subJson = subscription.toJSON();

  // 5. Send subscription to Laravel backend
  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subJson.keys?.p256dh || '',
      auth: subJson.keys?.auth || '',
    },
    role,
    user_id: userId || (role === 'admin' ? 'admin' : null),
  };

  const res = await fetch(apiUrl('/api/push/subscribe'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register push subscription on server.');
  }

  try {
    localStorage.setItem('letters_push_subscribed', 'true');
    localStorage.setItem('letters_push_endpoint', subscription.endpoint);
    localStorage.setItem('letters_push_role', role);
  } catch (e) {}

  return { success: true, subscription };
}

/**
 * Unsubscribe current browser from Web Push notifications.
 */
export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) return { success: false };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Notify backend to remove subscription record
      await fetch(apiUrl('/api/push/unsubscribe'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      }).catch((e) => console.warn('Unsubscribe API call failed:', e));
    }

    localStorage.removeItem('letters_push_subscribed');
    localStorage.removeItem('letters_push_endpoint');
    localStorage.removeItem('letters_push_role');

    return { success: true };
  } catch (err) {
    console.error('Error during unsubscribe:', err);
    return { success: false, error: err.message };
  }
}
