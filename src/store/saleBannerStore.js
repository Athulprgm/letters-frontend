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

const getInitialSaleBanner = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('letters_sale_banner');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSaleBanner, ...parsed };
        }
      }
    } catch (e) {}
  }
  return defaultSaleBanner;
};

let inFlightSaleBannerPromise = null;
let lastSaleBannerFetchedAt = 0;

export const useSaleBannerStore = create((set, get) => ({
  saleBanner: getInitialSaleBanner(),
  isLoaded: true,

  fetchSaleBanner: async (force = false) => {
    const now = Date.now();
    if (!force && now - lastSaleBannerFetchedAt < 15000) {
      return get().saleBanner;
    }

    if (inFlightSaleBannerPromise) {
      return inFlightSaleBannerPromise;
    }

    inFlightSaleBannerPromise = (async () => {
      try {
        const res = await fetch(apiUrl(`/api/sale-banner?t=${Date.now()}`), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (pe) {
            return get().saleBanner;
          }

          if (data && data.success && data.saleBanner) {
            const merged = { ...defaultSaleBanner, ...data.saleBanner };
            set({ saleBanner: merged, isLoaded: true });
            safeSaveLocalStorage('letters_sale_banner', merged);
            lastSaleBannerFetchedAt = Date.now();
            return merged;
          }
        }
      } catch (e) {
        console.warn('Using cached sale banner due to fetch error:', e);
      } finally {
        inFlightSaleBannerPromise = null;
      }
      return get().saleBanner;
    })();

    return inFlightSaleBannerPromise;
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
