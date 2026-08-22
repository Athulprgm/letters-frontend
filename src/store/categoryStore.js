import { create } from 'zustand';
import { defaultCategories } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

export const initialCategories = defaultCategories;

const getInitialCategories = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('letters_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return defaultCategories;
};

const saveToLocalStorage = (categories) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('letters_categories', JSON.stringify(categories));
    } catch (e) {}
  }
};

let inFlightCategoriesPromise = null;
let lastCategoriesFetchedAt = 0;

export const useCategoryStore = create((set, get) => ({
  categories: getInitialCategories(),
  isLoading: false,

  fetchCategories: async (force = false) => {
    const now = Date.now();
    if (!force && now - lastCategoriesFetchedAt < 15000 && get().categories.length > 0) {
      return get().categories;
    }

    if (inFlightCategoriesPromise) {
      return inFlightCategoriesPromise;
    }

    inFlightCategoriesPromise = (async () => {
      try {
        const res = await fetch(apiUrl(`/api/categories?t=${Date.now()}`), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (pe) {
            return get().categories;
          }

          if (data && data.success && Array.isArray(data.categories) && data.categories.length > 0) {
            set({ categories: data.categories, isLoading: false });
            saveToLocalStorage(data.categories);
            lastCategoriesFetchedAt = Date.now();
            return data.categories;
          }
        }
      } catch (e) {
        console.warn('Categories API fetch failed, using local cache', e);
      } finally {
        inFlightCategoriesPromise = null;
        set({ isLoading: false });
      }
      return get().categories;
    })();

    return inFlightCategoriesPromise;
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
