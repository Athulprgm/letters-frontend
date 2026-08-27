import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBagShopping,
  faXmark,
  faArrowRight,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
import { useOrderStore } from '@/src/store/orderStore';
import {
  playNotificationSound,
  setupNotificationListeners,
  showLocalNotification,
} from '@/src/utils/pushNotification';

export default function OrderNotificationManager() {
  const navigate = useNavigate();
  const { orders, fetchOrders } = useOrderStore();
  const [activeAlert, setActiveAlert] = useState(null);
  const knownOrderIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // 1. Auto-verify push subscription on admin startup if permission is granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      import('@/src/utils/pushNotification').then(({ subscribeToPushNotifications }) => {
        subscribeToPushNotifications({ role: 'admin' }).catch(() => {});
      });
    }
  }, []);

  // 2. Listen for Service Worker Web Push events
  useEffect(() => {
    const cleanup = setupNotificationListeners((pushData) => {
      // Re-fetch latest orders from backend immediately
      fetchOrders();

      const orderId = pushData.data?.orderId;
      setActiveAlert({
        id: orderId || `alert-${Date.now()}`,
        title: pushData.title || '🔔 New Order Received',
        body: pushData.body || 'A new order has been placed in your store.',
        url: pushData.data?.url || '/admin/orders',
        timestamp: Date.now(),
      });
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [fetchOrders]);


  // 2. Track newly fetched orders on background poll
  useEffect(() => {
    if (!orders || !Array.isArray(orders)) return;

    if (isInitialLoadRef.current) {
      orders.forEach((o) => {
        if (o?.id) knownOrderIdsRef.current.add(String(o.id));
      });
      isInitialLoadRef.current = false;
      return;
    }

    // Identify newly added pending orders
    const newOrders = orders.filter(
      (o) => o?.id && !knownOrderIdsRef.current.has(String(o.id)) && o.status === 'Pending'
    );

    // Update known IDs
    orders.forEach((o) => {
      if (o?.id) knownOrderIdsRef.current.add(String(o.id));
    });

    if (newOrders.length > 0) {
      const latest = newOrders[0];
      playNotificationSound();

      const formattedTotal = Number(latest.total || 0).toLocaleString();
      const customer = latest.customerName || 'Customer';

      setActiveAlert({
        id: latest.id,
        title: '🛍️ New Order Received!',
        body: `Order #${latest.id} • ${customer} • ₹${formattedTotal}`,
        url: '/admin/orders',
        timestamp: Date.now(),
      });

      // Also trigger a browser local notification in case tab is unfocused
      showLocalNotification('🛍️ New Order Received!', {
        body: `Order #${latest.id} from ${customer} (₹${formattedTotal})`,
        data: { url: '/admin/orders', orderId: latest.id },
      });
    }
  }, [orders]);

  // Auto-dismiss alert after 10 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[var(--card)] border-2 border-[var(--olive)] rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3.5 relative overflow-hidden">
        {/* Left Glow & Icon */}
        <div className="w-10 h-10 rounded-xl bg-[var(--olive)] text-white flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
          <FontAwesomeIcon icon={faBagShopping} className="text-base" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--olive)]/15 text-[var(--olive)] px-2 py-0.5 rounded-full">
              Live Alert
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Just now</span>
          </div>

          <h4 className="text-xs font-bold text-[var(--text)] mt-1 truncate">
            {activeAlert.title}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
            {activeAlert.body}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                navigate(activeAlert.url || '/admin/orders');
                setActiveAlert(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--olive)] hover:bg-[var(--olive-hover)] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>View Order</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </button>
            <button
              onClick={() => setActiveAlert(null)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setActiveAlert(null)}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>
    </div>
  );
}
