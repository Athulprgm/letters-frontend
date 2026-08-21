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

export const useFestivalStore = create((set, get) => ({
  festivals: defaultFestivals,
  showcaseFestival: evaluateShowcaseFestival(defaultFestivals),
  festivalHampers: defaultFestivalHampers,
  isLoaded: false,

  fetchFestivals: async () => {
    if (typeof window !== 'undefined') {
      try {
        const savedFestivals = localStorage.getItem('letters_festivals_list');
        if (savedFestivals) {
          const parsed = JSON.parse(savedFestivals);
          const resolved = evaluateShowcaseFestival(parsed);
          set({
            festivals: parsed,
            showcaseFestival: resolved,
            isLoaded: true,
          });
        }
      } catch (e) {}
    }

    try {
      const res = await fetch(apiUrl(`/api/festivals?t=${Date.now()}`), {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.festivals)) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({
          festivals: data.festivals,
          showcaseFestival: resolved,
          isLoaded: true,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
      }
    } catch (e) {
      console.warn('Using cached festival data', e);
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('letters_festivals_list', JSON.stringify(updatedList));
    }

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('letters_festivals_list', JSON.stringify(updatedList));
    }

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('letters_festivals_list', JSON.stringify(updatedList));
    }

    try {
      const res = await fetch(apiUrl(`/api/festivals?id=${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.festivals) {
        const resolved = data.showcaseFestival || evaluateShowcaseFestival(data.festivals);
        set({ festivals: data.festivals, showcaseFestival: resolved, isLoaded: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('letters_festivals_list', JSON.stringify(updatedList));
    }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('letters_festivals_list', JSON.stringify(data.festivals));
        }
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
