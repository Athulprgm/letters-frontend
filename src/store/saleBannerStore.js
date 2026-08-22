import { create } from 'zustand';
import { defaultSaleBanner } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

// Helper to safely write to localStorage without throwing QuotaExceededError
const safeSaveLocalStorage = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // If quota exceeded (due to large base64 image), attempt saving without large image data
    try {
      if (data && typeof data === 'object') {
        const lightweight = { ...data };
        if (typeof lightweight.image === 'string' && lightweight.image.startsWith('data:')) {
          delete lightweight.image;
        }
        localStorage.setItem(key, JSON.stringify(lightweight));
      }
    } catch (innerErr) {
      console.warn('localStorage quota reached, skipped local caching:', innerErr);
    }
  }
};

export const useSaleBannerStore = create((set, get) => ({
  saleBanner: defaultSaleBanner,
  isLoaded: false,

  fetchSaleBanner: async () => {
    // 1. Sync from localStorage on client first for instant UI response
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_sale_banner');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            set({ saleBanner: { ...defaultSaleBanner, ...parsed }, isLoaded: true });
          }
        }
      } catch (e) {
        console.warn('Error reading cached sale banner', e);
      }
    }

    // 2. Fetch fresh data from server API
    try {
      const res = await fetch(apiUrl(`/api/sale-banner?t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.saleBanner) {
          const merged = { ...defaultSaleBanner, ...data.saleBanner };
          set({ saleBanner: merged, isLoaded: true });
          safeSaveLocalStorage('letters_sale_banner', merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Using cached sale banner due to fetch error:', e);
    }
  },

  updateSaleBanner: async (newBanner) => {
    const current = get().saleBanner || defaultSaleBanner;
    const updated = { ...current, ...newBanner };
    set({ saleBanner: updated, isLoaded: true });

    safeSaveLocalStorage('letters_sale_banner', updated);

    try {
      const res = await fetch(apiUrl('/api/sale-banner'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.saleBanner) {
          const merged = { ...defaultSaleBanner, ...data.saleBanner };
          set({ saleBanner: merged, isLoaded: true });
          safeSaveLocalStorage('letters_sale_banner', merged);
          return merged;
        }
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
