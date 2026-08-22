import { create } from 'zustand';
import { defaultFestivals, defaultFestivalHampers } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

/**
 * Calculates dynamic status: ACTIVE | PRE_BOOKING | UPCOMING | ENDED | DRAFT
 */
export function getFestivalStatus(festival, currentDate = new Date()) {
  if (!festival) return 'INACTIVE';
  if (festival.status !== 'published' && festival.active === false) return 'DRAFT';

  const now = new Date(currentDate).getTime();
  const start = new Date(festival.startDate + 'T00:00:00').getTime();
  const end = new Date(festival.endDate + 'T23:59:59').getTime();

  let preStart;
  if (festival.preBookingStartDate) {
    preStart = new Date(festival.preBookingStartDate + 'T00:00:00').getTime();
  } else {
    const sDate = new Date(festival.startDate);
    sDate.setMonth(sDate.getMonth() - 1);
    preStart = sDate.getTime();
  }

  if (now > end) {
    return 'ENDED';
  }
  if (now >= start && now <= end) {
    return 'ACTIVE';
  }
  if (now < start) {
    if (festival.preBookingEnabled && now >= preStart) {
      return 'PRE_BOOKING';
    }
    return 'UPCOMING';
  }
  return 'UPCOMING';
}

/**
 * Resolves current winning showcase festival:
 * 1. Current Active (startDate <= now <= endDate)
 * 2. Upcoming in Pre-Booking Window (preBookingStartDate <= now < startDate & preBookingEnabled)
 * 3. null
 */
export function evaluateShowcaseFestival(festivals = [], currentDate = new Date()) {
  const published = (festivals || []).filter((f) => f.status === 'published' || (f.status !== 'draft' && f.active !== false));
  const evaluated = published.map((f) => ({
    ...f,
    computedStatus: getFestivalStatus(f, currentDate),
  }));

  const activeFestivals = evaluated.filter((f) => f.computedStatus === 'ACTIVE');
  if (activeFestivals.length > 0) {
    activeFestivals.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    return activeFestivals[0];
  }

  const preBookingFestivals = evaluated.filter((f) => f.computedStatus === 'PRE_BOOKING');
  if (preBookingFestivals.length > 0) {
    preBookingFestivals.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return preBookingFestivals[0];
  }

  return null;
}

// Helper to safely write to localStorage without throwing QuotaExceededError
const safeSaveLocalStorage = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    try {
      if (Array.isArray(data)) {
        // Strip large base64 images to prevent quota overflow
        const lightweight = data.map((f) => {
          const item = { ...f };
          if (typeof item.banner === 'string' && item.banner.startsWith('data:')) {
            delete item.banner;
          }
          if (typeof item.bannerImage === 'string' && item.bannerImage.startsWith('data:')) {
            delete item.bannerImage;
          }
          if (Array.isArray(item.products)) {
            item.products = item.products.map((p) => {
              const prod = { ...p };
              if (typeof prod.image === 'string' && prod.image.startsWith('data:')) {
                delete prod.image;
              }
              return prod;
            });
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(lightweight));
      }
    } catch (innerErr) {
      console.warn('localStorage quota reached for festivals:', innerErr);
    }
  }
};

const getInitialFestivals = () => {
  if (typeof window !== 'undefined') {
    try {
      const savedFestivals = localStorage.getItem('letters_festivals_list');
      if (savedFestivals) {
        const parsed = JSON.parse(savedFestivals);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return defaultFestivals;
};

const initialFestivalsList = getInitialFestivals();

let inFlightFestivalsPromise = null;
let lastFestivalsFetchedAt = 0;

export const useFestivalStore = create((set, get) => ({
  festivals: initialFestivalsList,
  showcaseFestival: evaluateShowcaseFestival(initialFestivalsList),
  festivalHampers: defaultFestivalHampers,
  isLoaded: true,

  fetchFestivals: async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFestivalsFetchedAt < 15000 && get().festivals.length > 0) {
      return get().festivals;
    }

    if (inFlightFestivalsPromise) {
      return inFlightFestivalsPromise;
    }

    inFlightFestivalsPromise = (async () => {
      try {
        const res = await fetch(apiUrl(`/api/festivals?t=${Date.now()}`), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (parseErr) {
            return get().festivals;
          }

          if (data && data.success && Array.isArray(data.festivals)) {
            const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
            set({
              festivals: data.festivals,
              showcaseFestival: resolved,
              isLoaded: true,
            });
            safeSaveLocalStorage('letters_festivals_list', data.festivals);
            lastFestivalsFetchedAt = Date.now();
            return data.festivals;
          }
        }
      } catch (e) {
        console.warn('Using cached festival data due to network error:', e);
      } finally {
        inFlightFestivalsPromise = null;
      }
      return get().festivals;
    })();

    return inFlightFestivalsPromise;
  },

  // Alias for backward-compatibility
  fetchFestivalHampers: async () => {
    return get().fetchFestivals();
  },

  createFestival: async (festivalData) => {
    // Optimistic calculation
    let preBookingStartDate = festivalData.preBookingStartDate;
    if (!preBookingStartDate && festivalData.startDate) {
      const sDate = new Date(festivalData.startDate);
      sDate.setMonth(sDate.getMonth() - 1);
      preBookingStartDate = sDate.toISOString().split('T')[0];
    }

    const tempNew = {
      id: `fest-${Date.now()}`,
      ...festivalData,
      preBookingStartDate: preBookingStartDate || festivalData.startDate,
      products: festivalData.products || [],
      status: festivalData.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentList = get().festivals || [];
    const updatedList = [tempNew, ...currentList];
    const resolved = evaluateShowcaseFestival(updatedList);

    set({ festivals: updatedList, showcaseFestival: resolved, isLoaded: true });
    safeSaveLocalStorage('letters_festivals_list', updatedList);

    try {
      const res = await fetch(apiUrl('/api/festivals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(festivalData),
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
        return data.festival;
      }
    } catch (e) {
      console.error(e);
    }
    return tempNew;
  },

  updateFestival: async (id, updateData) => {
    const currentList = get().festivals || [];
    const updatedList = currentList.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    });
    const resolved = evaluateShowcaseFestival(updatedList);
    set({ festivals: updatedList, showcaseFestival: resolved, isLoaded: true });
    safeSaveLocalStorage('letters_festivals_list', updatedList);

    try {
      const res = await fetch(apiUrl('/api/festivals'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data: updateData }),
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteFestival: async (id) => {
    const currentList = get().festivals || [];
    const updatedList = currentList.filter((f) => f.id !== id);
    const resolved = evaluateShowcaseFestival(updatedList);
    set({ festivals: updatedList, showcaseFestival: resolved, isLoaded: true });
    safeSaveLocalStorage('letters_festivals_list', updatedList);

    try {
      const res = await fetch(apiUrl(`/api/festivals?id=${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
      }
    } catch (e) {
      console.error(e);
    }
  },

  addProductToFestival: async (festivalId, productData) => {
    try {
      const res = await fetch(apiUrl('/api/festivals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ festivalId, product: productData }),
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
        return data.product;
      }
    } catch (e) {
      console.error(e);
    }

    // Local fallback
    const newProduct = {
      id: `fp-${Date.now()}`,
      ...productData,
      active: productData.active !== false,
      createdAt: new Date().toISOString(),
    };
    const currentList = get().festivals || [];
    const updatedList = currentList.map((f) => {
      if (f.id === festivalId) {
        return { ...f, products: [newProduct, ...(f.products || [])] };
      }
      return f;
    });
    const resolved = evaluateShowcaseFestival(updatedList);
    set({ festivals: updatedList, showcaseFestival: resolved, isLoaded: true });
    safeSaveLocalStorage('letters_festivals_list', updatedList);
    return newProduct;
  },

  updateFestivalProduct: async (festivalId, productId, productData) => {
    try {
      const res = await fetch(apiUrl('/api/festivals'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_product',
          festivalId,
          productId,
          productData,
        }),
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteFestivalProduct: async (festivalId, productId) => {
    try {
      const res = await fetch(apiUrl(`/api/festivals?festivalId=${festivalId}&productId=${productId}`), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
      }
    } catch (e) {
      console.error(e);
    }
  },

  toggleFestivalProduct: async (festivalId, productId) => {
    try {
      const res = await fetch(apiUrl('/api/festivals'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_product',
          festivalId,
          productId,
        }),
      });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        safeSaveLocalStorage('letters_festivals_list', data.festivals);
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
