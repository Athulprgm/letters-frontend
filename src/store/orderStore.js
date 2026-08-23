import { create } from 'zustand';
import { defaultOrders } from '@/src/data/initialData';
import { useSettingsStore } from './settingsStore';
import { apiUrl } from '@/src/config/api';

export const initialOrders = defaultOrders;

export const normalizeOrderItem = (raw) => {
  if (!raw) return null;
  
  let parsedItems = [];
  if (Array.isArray(raw.items)) {
    parsedItems = raw.items;
  } else if (typeof raw.items === 'string') {
    try {
      parsedItems = JSON.parse(raw.items) || [];
    } catch {
      parsedItems = [];
    }
  }

  return {
    id: String(raw.id || `LET-${Date.now()}`),
    customerName: raw.customerName || raw.customer_name || raw.name || 'Valued Patron',
    phone: String(raw.phone || ''),
    whatsappNumber: String(raw.whatsappNumber || raw.whatsapp_number || raw.phone || ''),
    address: String(raw.address || ''),
    pincode: String(raw.pincode || ''),
    deliveryDate: String(raw.deliveryDate || raw.delivery_date || 'Standard Delivery'),
    occasion: String(raw.occasion || 'Celebration'),
    items: Array.isArray(parsedItems) ? parsedItems : [],
    subtotal: Number(raw.subtotal) || 0,
    total: Number(raw.total) || Number(raw.subtotal) || 0,
    customization: String(raw.customization || ''),
    specialInstructions: String(raw.specialInstructions || raw.special_instructions || raw.notes || ''),
    status: String(raw.status || 'Pending'),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
};

const safeSaveOrders = (orders) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('letters_orders', JSON.stringify(orders));
  } catch (e) {
    try {
      // If full order details exceed quota, trim lightweight order list
      const lightweight = orders.slice(0, 50).map((o) => ({
        id: o.id,
        customerName: o.customerName,
        phone: o.phone,
        whatsappNumber: o.whatsappNumber,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      }));
      localStorage.setItem('letters_orders', JSON.stringify(lightweight));
    } catch (inner) {
      console.warn('localStorage full: keeping orders in memory only', inner);
    }
  }
};

const loadLocalOrders = () => {
  if (typeof window === 'undefined') return defaultOrders;
  try {
    const saved = localStorage.getItem('letters_orders');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeOrderItem).filter(Boolean);
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached orders', e);
  }
  return defaultOrders;
};

export const useOrderStore = create((set, get) => ({
  orders: loadLocalOrders(),
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(apiUrl('/api/orders'));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const normalized = data.orders.map(normalizeOrderItem).filter(Boolean);
          set({ orders: normalized, isLoading: false });
          safeSaveOrders(normalized);
          return normalized;
        }
      }
    } catch (e) {
      console.warn('API orders fetch failed, falling back to local orders', e);
    }

    const cached = loadLocalOrders();
    set({ orders: cached, isLoading: false });
    return cached;
  },

  createOrder: async (orderData) => {
    const state = get();
    const count = state.orders.length + 1;
    const year = new Date().getFullYear();
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = orderData.id || `LET-${year}-${String(count).padStart(3, '0')}${uniqueSuffix}`;

    const newOrder = normalizeOrderItem({
      id: orderId,
      customerName: orderData.customerName || orderData.name,
      phone: orderData.phone || '',
      whatsappNumber: orderData.whatsappNumber || orderData.phone || '',
      address: orderData.address || '',
      pincode: orderData.pincode || '',
      deliveryDate: orderData.deliveryDate || '',
      occasion: orderData.occasion || 'Special Occasion',
      items: orderData.items || [],
      subtotal: Number(orderData.subtotal) || 0,
      total: Number(orderData.total) || Number(orderData.subtotal) || 0,
      customization: orderData.customization || '',
      specialInstructions: orderData.specialInstructions || orderData.notes || '',
      status: orderData.status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Optimistic UI update immediately
    set((s) => {
      const updated = [newOrder, ...s.orders.filter((o) => o.id !== newOrder.id)];
      safeSaveOrders(updated);
      return { orders: updated };
    });

    try {
      let pushEndpoint = orderData.push_endpoint || null;
      if (!pushEndpoint && typeof window !== 'undefined') {
        pushEndpoint = localStorage.getItem('letters_push_endpoint') || null;
      }

      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          push_endpoint: pushEndpoint,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          const serverOrder = normalizeOrderItem(data.order);
          set((s) => {
            const updated = [serverOrder, ...s.orders.filter((o) => o.id !== serverOrder.id && o.id !== newOrder.id)];
            safeSaveOrders(updated);
            return { orders: updated };
          });
          return serverOrder;
        }
      }
    } catch (e) {
      console.error('Failed to sync order with API, retained in local storage', e);
    }

    return newOrder;
  },

  updateOrderStatus: async (orderId, newStatus) => {
    set((state) => {
      const updated = state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      );
      safeSaveOrders(updated);
      return { orders: updated };
    });

    try {
      await fetch(apiUrl(`/api/orders/${orderId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to sync order status with API', e);
    }
  },

  deleteOrder: async (orderId) => {
    set((state) => {
      const updated = state.orders.filter((order) => order.id !== orderId);
      safeSaveOrders(updated);
      return { orders: updated };
    });

    try {
      await fetch(apiUrl(`/api/orders/${orderId}`), { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to sync order deletion with API', e);
    }
  },

  getOrderById: (orderId) => {
    return get().orders.find((o) => o.id === orderId);
  },

  generateWhatsAppMessage: (order) => {
    const settings = useSettingsStore.getState().settings;
    const showPrices = settings.showPricesGlobally === true;
    const inquiryLabel = settings.priceInquiryLabel || 'Price on Request';

    let itemsText = '';
    (order.items || []).forEach((item, index) => {
      const priceStr = showPrices ? ` — ₹${item.price * item.quantity}` : '';
      itemsText += `${index + 1}. ${item.name} × ${item.quantity}${priceStr}\n`;
      if (item.customization?.recipientName || item.customization?.personalizedMessage) {
        itemsText += `   ↳ For: ${item.customization.recipientName || 'N/A'}${item.customization.personalizedMessage ? ` | Msg: "${item.customization.personalizedMessage}"` : ''}\n`;
      }
    });

    const totalText = showPrices ? `*Total Amount:* ₹${order.total}` : `*Pricing Status:* ${inquiryLabel} / Custom Quote`;

    const message = `*${settings.orderMessagePrefix || 'Order Inquiry — LETTERS'}*
Order ID: #${order.id}

*Customer:*
• Name: ${order.customerName}
• Phone: ${order.phone}
• WhatsApp: ${order.whatsappNumber}
• Address: ${order.address}, PIN: ${order.pincode}
• Preferred Delivery: ${order.deliveryDate || 'Standard'}
• Occasion: ${order.occasion || 'Celebration'}

*Items Selected:*
${itemsText}
${totalText}

*Customization Details:*
${order.customization || 'None'}

*Special Instructions:*
${order.specialInstructions || 'None'}

Please confirm details and share dispatch timeline.`;

    return message;
  },
}));

