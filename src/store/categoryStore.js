import { create } from 'zustand';
import { defaultCategories } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

export const initialCategories = defaultCategories;

const saveToLocalStorage = (categories) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('letters_categories', JSON.stringify(categories));
    } catch (e) {}
  }
};

export const useCategoryStore = create((set, get) => ({
  categories: defaultCategories,
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });

    // 1. Try local storage cache first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('letters_categories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            set({ categories: parsed });
          }
        }
      } catch (e) {}
    }

    // 2. Fetch from backend API
    try {
      const res = await fetch(apiUrl(`/api/categories?t=${Date.now()}`));
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        set({ categories: data.categories, isLoading: false });
        saveToLocalStorage(data.categories);
        return;
      }
    } catch (e) {
      console.warn('Categories API fetch failed, using local cache', e);
    }
    set({ isLoading: false });
  },

  addCategory: async (category) => {
    const newCat = {
      ...category,
      id: category.id || `cat-${Date.now()}`,
      slug: category.slug || category.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      enabled: category.enabled ?? true,
      itemCount: category.itemCount || 0,
    };

    set((state) => {
      const updated = [newCat, ...state.categories];
      saveToLocalStorage(updated);
      return { categories: updated };
    });

    try {
      const res = await fetch(apiUrl('/api/categories'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        set({ categories: data.categories });
        saveToLocalStorage(data.categories);
        return data.category || newCat;
      }
    } catch (e) {
      console.error('Failed to sync category with API', e);
    }

    return newCat;
  },

  updateCategory: async (id, categoryData) => {
    let updatedCat = null;
    set((state) => {
      const updated = state.categories.map((c) => {
        if (c.id === id || c.slug === id) {
          updatedCat = { ...c, ...categoryData };
          return updatedCat;
        }
        return c;
      });
      saveToLocalStorage(updated);
      return { categories: updated };
    });

    try {
      const res = await fetch(apiUrl(`/api/categories/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        set({ categories: data.categories });
        saveToLocalStorage(data.categories);
        return data.category || updatedCat;
      }
    } catch (e) {
      console.error('Failed to sync category update with API', e);
    }

    return updatedCat;
  },

  deleteCategory: async (id) => {
    set((state) => {
      const updated = state.categories.filter((c) => c.id !== id && c.slug !== id);
      saveToLocalStorage(updated);
      return { categories: updated };
    });

    try {
      const res = await fetch(apiUrl(`/api/categories/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        set({ categories: data.categories });
        saveToLocalStorage(data.categories);
      }
    } catch (e) {
      console.error('Failed to sync category deletion with API', e);
    }
  },

  toggleCategoryStatus: async (id) => {
    const c = get().categories.find((item) => item.id === id || item.slug === id);
    if (!c) return;
    return get().updateCategory(id, { enabled: !c.enabled });
  },

  resetCategories: async () => {
    set({ categories: defaultCategories });
    saveToLocalStorage(defaultCategories);
  },
}));
