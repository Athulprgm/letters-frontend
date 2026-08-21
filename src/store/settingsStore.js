import { create } from 'zustand';
import { apiUrl } from '@/src/config/api';

export const defaultSettings = {
  brandName: 'LETTERS',
  establishedYear: '2020',
  tagline: 'Making your special moments a lot more memorable',
  heroHeading: 'Make Every Moment More Memorable.',
  heroDescription: 'Thoughtfully curated hampers, bouquets and personalized gifts for the moments that matter most.',
  whatsappNumber: '919497219574',
  phoneNumber: '+91 94972 19574',
  email: 'hello@lettersgifting.com',
  address: 'LETTERS Gifting Studio, Kerala, India',
  instagram: 'https://instagram.com/lettersgifting',
  facebook: 'https://facebook.com/lettersgifting',
  announcementText: '✨ Handcrafted with love • Express delivery available for special occasions • WhatsApp ordering enabled',
  orderMessagePrefix: 'New Order — LETTERS',
};

export const useSettingsStore = create((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,

  fetchSettings: async () => {
    try {
      const res = await fetch(apiUrl('/api/settings'));
      const data = await res.json();
      if (data.success && data.settings) {
        set({ settings: data.settings, isLoaded: true });
        return;
      }
    } catch (e) {
      console.warn('Using client-side settings cache', e);
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_settings');
        if (saved) {
          set({ settings: { ...defaultSettings, ...JSON.parse(saved) }, isLoaded: true });
          return;
        }
      } catch (e) {}
    }
    set({ settings: defaultSettings, isLoaded: true });
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
    const number = (get().settings.whatsappNumber || '919497219574').replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${number}?text=${encoded}`;
  },
}));
