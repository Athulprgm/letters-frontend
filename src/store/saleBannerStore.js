import { create } from 'zustand';
import { defaultSaleBanner } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

export const useSaleBannerStore = create((set, get) => ({
  saleBanner: defaultSaleBanner,
  isLoaded: false,

  fetchSaleBanner: async () => {
    // 1. Sync from localStorage on client
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_sale_banner');
        if (saved) {
          set({ saleBanner: { ...defaultSaleBanner, ...JSON.parse(saved) }, isLoaded: true });
        }
      } catch (e) {}
    }

    // 2. Fetch fresh data from server API
    try {
      const res = await fetch(apiUrl(`/api/sale-banner?t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.saleBanner) {
        set({ saleBanner: data.saleBanner, isLoaded: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_sale_banner', JSON.stringify(data.saleBanner));
        }
        return;
      }
    } catch (e) {
      console.warn('Using cached sale banner', e);
    }
  },

  updateSaleBanner: async (newBanner) => {
    const updated = { ...get().saleBanner, ...newBanner };
    set({ saleBanner: updated, isLoaded: true });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('letters_sale_banner', JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      const res = await fetch(apiUrl('/api/sale-banner'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      const data = await res.json();
      if (data.success && data.saleBanner) {
        set({ saleBanner: data.saleBanner, isLoaded: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_sale_banner', JSON.stringify(data.saleBanner));
        }
        return data.saleBanner;
      }
    } catch (e) {
      console.error('Failed to sync sale banner with server', e);
    }

    return updated;
  },

  toggleSaleBanner: async () => {
    const current = get().saleBanner.enabled;
    return get().updateSaleBanner({ enabled: !current });
  },

  toggleTopBar: async () => {
    const current = get().saleBanner.showTopBar;
    return get().updateSaleBanner({ showTopBar: !current });
  },
}));
