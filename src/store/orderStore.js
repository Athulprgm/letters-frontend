import { create } from 'zustand';
import { defaultOrders } from '@/src/data/initialData';
import { useSettingsStore } from './settingsStore';
import { apiUrl } from '@/src/config/api';

export const initialOrders = defaultOrders;

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

export const useOrderStore = create((set, get) => ({
  orders: defaultOrders,
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(apiUrl('/api/orders'));
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        set({ orders: data.orders, isLoading: false });
        safeSaveOrders(data.orders);
        return;
      }
    } catch (e) {
      console.warn('API orders fetch failed, falling back to local orders', e);
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_orders');
        if (saved) {
          set({ orders: JSON.parse(saved), isLoading: false });
          return;
        }
      } catch (e) {}
    }

    set({ orders: defaultOrders, isLoading: false });
  },

  createOrder: async (orderData) => {
    const state = get();
    const count = state.orders.length + 1;
    const year = new Date().getFullYear();
    const orderId = `LET-${year}-${String(count).padStart(4, '0')}`;

    const newOrder = {
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
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((s) => {
      const updated = [newOrder, ...s.orders];
      safeSaveOrders(updated);
      return { orders: updated };
    });

    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      const data = await res.json();
      if (data.success && data.order) {
        return data.order;
      }
    } catch (e) {
      console.error('Failed to sync order with API', e);
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_orders', JSON.stringify(updated));
      }
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_orders', JSON.stringify(updated));
      }
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
    const showPrices = settings.showPricesGlobally !== false;
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
