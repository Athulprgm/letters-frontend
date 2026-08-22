import { create } from 'zustand';
import { apiUrl } from '@/src/config/api';

export const defaultSettings = {
  brandName: 'LETTERS',
  establishedYear: '2020',
  tagline: 'Making your special moments a lot more memorable',
  heroHeading: 'Make Every Moment More Memorable.',
  heroDescription: 'Thoughtfully curated hampers, bouquets and personalized gifts for the moments that matter most.',
  whatsappNumber: '917559085513',
  phoneNumber: '+91 75590 85513',
  email: 'ameenaaami770@gmail.com',
  address: 'LETTERS Gifting Studio, Kerala, India',
  instagram: 'https://www.instagram.com/le_tte_rs_?igsi=MWtkYTVhc204MTUyMw==',
  announcementText: '✨ Handcrafted with love • Express delivery available for special occasions • WhatsApp ordering enabled',
  orderMessagePrefix: 'New Order — LETTERS',
  showPricesGlobally: false,
  priceInquiryLabel: 'Price on Request',
};

const getInitialSettings = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('letters_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.whatsappNumber === '919497219574') {
            parsed.whatsappNumber = '917559085513';
          }
          if (parsed.phoneNumber === '+91 94972 19574') {
            parsed.phoneNumber = '+91 75590 85513';
          }
          if (!parsed.email || parsed.email === 'hello@lettersgifting.com') {
            parsed.email = 'ameenaaami770@gmail.com';
          }
          if (!parsed.instagram || parsed.instagram === 'https://instagram.com/lettersgifting') {
            parsed.instagram = 'https://www.instagram.com/le_tte_rs_?igsi=MWtkYTVhc204MTUyMw==';
          }
          if ('facebook' in parsed) {
            delete parsed.facebook;
          }
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (e) {}
  }
  return defaultSettings;
};

let inFlightSettingsPromise = null;
let lastSettingsFetchedAt = 0;

export const useSettingsStore = create((set, get) => ({
  settings: getInitialSettings(),
  isLoaded: true,

  fetchSettings: async (force = false) => {
    const now = Date.now();
    if (!force && now - lastSettingsFetchedAt < 15000) {
      return get().settings;
    }

    if (inFlightSettingsPromise) {
      return inFlightSettingsPromise;
    }

    inFlightSettingsPromise = (async () => {
      try {
        const res = await fetch(apiUrl(`/api/settings?t=${Date.now()}`), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (pe) {
            return get().settings;
          }

          if (data && data.success && data.settings) {
            const merged = { ...defaultSettings, ...data.settings };
            set({ settings: merged, isLoaded: true });
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('letters_settings', JSON.stringify(merged));
              } catch (e) {}
            }
            lastSettingsFetchedAt = Date.now();
            return merged;
          }
        }
      } catch (e) {
        console.warn('Using client-side settings cache', e);
      } finally {
        inFlightSettingsPromise = null;
      }
      return get().settings;
    })();

    return inFlightSettingsPromise;
  },

  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('letters_settings', JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error('Failed to sync settings with server API', e);
    }

    return updated;
  },

  resetSettings: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letters_settings');
    }
    set({ settings: defaultSettings });
    try {
      await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultSettings),
      });
    } catch (e) {}
  },

  getWhatsAppUrl: (message) => {
    const number = (get().settings.whatsappNumber || '917559085513').replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encoded}`;
  },
}));
