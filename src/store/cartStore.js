import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoaded: false,

  initCart: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_cart');
        if (saved) {
          set({ items: JSON.parse(saved), isLoaded: true });
          return;
        }
      } catch (e) {}
    }
    set({ items: [], isLoaded: true });
  },

  addToCart: (product, quantity = 1, customization = {}) => {
    set((state) => {
      const customKey = `${product.id}-${customization.recipientName || ''}-${customization.personalizedMessage || ''}`;
      const existingIndex = state.items.findIndex((item) => item.cartItemId === customKey);

      let updated;
      if (existingIndex > -1) {
        updated = [...state.items];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [
          ...state.items,
          {
            cartItemId: customKey,
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            image: product.images?.[0] || product.image || '',
            category: product.category,
            quantity: quantity,
            customization: {
              personalizedMessage: customization.personalizedMessage || '',
              recipientName: customization.recipientName || '',
              specialInstructions: customization.specialInstructions || '',
              occasion: customization.occasion || '',
            },
          },
        ];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  updateQuantity: (cartItemId, newQuantity) => {
    set((state) => {
      let updated;
      if (newQuantity <= 0) {
        updated = state.items.filter((item) => item.cartItemId !== cartItemId);
      } else {
        updated = state.items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        );
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  removeFromCart: (cartItemId) => {
    set((state) => {
      const updated = state.items.filter((item) => item.cartItemId !== cartItemId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letters_cart');
    }
    set({ items: [] });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
