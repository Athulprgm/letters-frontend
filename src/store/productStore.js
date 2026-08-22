import { create } from 'zustand';
import { defaultProducts } from '@/src/data/initialData';
import { apiUrl } from '@/src/config/api';

const getInitialProducts = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('letters_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }
  return defaultProducts;
};

const safeSaveProducts = (products) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('letters_products', JSON.stringify(products));
  } catch (e) {
    try {
      // If quota exceeded, strip large base64 image strings
      const lightweight = products.map((p) => {
        const prod = { ...p };
        if (prod.images && Array.isArray(prod.images)) {
          prod.images = prod.images.filter((img) => typeof img === 'string' && !img.startsWith('data:'));
        }
        if (typeof prod.image === 'string' && prod.image.startsWith('data:')) {
          delete prod.image;
        }
        return prod;
      });
      localStorage.setItem('letters_products', JSON.stringify(lightweight));
    } catch (inner) {}
  }
};

let inFlightProductsPromise = null;
let lastProductsFetchedAt = 0;

export const initialProducts = defaultProducts;

export const useProductStore = create((set, get) => ({
  products: getInitialProducts(),
  isLoading: false,

  fetchProducts: async (force = false) => {
    const now = Date.now();
    // Cache for 15 seconds unless forced
    if (!force && now - lastProductsFetchedAt < 15000 && get().products.length > 0) {
      return get().products;
    }

    if (inFlightProductsPromise) {
      return inFlightProductsPromise;
    }

    inFlightProductsPromise = (async () => {
      try {
        const res = await fetch(apiUrl(`/api/products?t=${Date.now()}`), {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (pe) {
            return get().products;
          }

          if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
            set({ products: data.products, isLoading: false });
            safeSaveProducts(data.products);
            lastProductsFetchedAt = Date.now();
            return data.products;
          }
        }
      } catch (e) {
        console.warn('API fetch failed, using local products cache', e);
      } finally {
        inFlightProductsPromise = null;
        set({ isLoading: false });
      }
      return get().products;
    })();

    return inFlightProductsPromise;
  },

  addProduct: async (productData) => {
    const slug =
      productData.slug ||
      productData.name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

    const newProd = {
      ...productData,
      id: `prod-${Date.now()}`,
      slug,
      categorySlug: (productData.category || '').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      price: Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      images:
        productData.images && productData.images.length > 0
          ? productData.images
          : ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'],
      stock: Number(productData.stock) || 100,
      showPrice: productData.showPrice !== undefined ? !!productData.showPrice : true,
      featured: !!productData.featured,
      customizable: productData.customizable !== undefined ? !!productData.customizable : true,
      active: productData.active !== undefined ? !!productData.active : true,
      rating: 5.0,
      reviewsCount: 0,
      tag: productData.tag || 'New',
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updated = [newProd, ...state.products];
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_products', JSON.stringify(updated));
      }
      return { products: updated };
    });

    try {
      await fetch(apiUrl('/api/products'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd),
      });
    } catch (e) {
      console.error('Failed to sync product creation with API', e);
    }

    return newProd;
  },

  updateProduct: async (id, productData) => {
    let updatedProduct = null;
    set((state) => {
      const updated = state.products.map((p) => {
        if (p.id === id || p.slug === id) {
          const cat = productData.category || p.category;
          updatedProduct = {
            ...p,
            ...productData,
            price: productData.price !== undefined ? Number(productData.price) : p.price,
            originalPrice: productData.originalPrice !== undefined ? Number(productData.originalPrice) : p.originalPrice,
            stock: productData.stock !== undefined ? Number(productData.stock) : (p.stock || 100),
            showPrice: productData.showPrice !== undefined ? !!productData.showPrice : (p.showPrice !== false),
            categorySlug: cat.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
            updatedAt: new Date().toISOString(),
          };
          return updatedProduct;
        }
        return p;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_products', JSON.stringify(updated));
      }
      return { products: updated };
    });

    try {
      await fetch(apiUrl(`/api/products/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
    } catch (e) {
      console.error('Failed to sync product update with API', e);
    }

    return updatedProduct;
  },

  toggleProductShowPrice: (id) => {
    set((state) => {
      const updated = state.products.map((p) => {
        if (p.id === id) {
          const newShowPrice = p.showPrice === false ? true : false;
          const updatedProd = { ...p, showPrice: newShowPrice };
          // Sync with API
          fetch(apiUrl(`/api/products/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showPrice: newShowPrice }),
          }).catch(console.error);
          return updatedProd;
        }
        return p;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_products', JSON.stringify(updated));
      }
      return { products: updated };
    });
  },

  setAllProductsShowPrice: (showPrice) => {
    set((state) => {
      const updated = state.products.map((p) => {
        const updatedProd = { ...p, showPrice };
        fetch(apiUrl(`/api/products/${p.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ showPrice }),
        }).catch(console.error);
        return updatedProd;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_products', JSON.stringify(updated));
      }
      return { products: updated };
    });
  },

  deleteProduct: async (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id && p.slug !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('letters_products', JSON.stringify(updated));
      }
      return { products: updated };
    });

    try {
      await fetch(apiUrl(`/api/products/${id}`), { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to sync product deletion with API', e);
    }
  },

  toggleProductActive: async (id) => {
    const p = get().products.find((item) => item.id === id || item.slug === id);
    if (!p) return;
    return get().updateProduct(id, { active: !p.active });
  },

  toggleProductFeatured: async (id) => {
    const p = get().products.find((item) => item.id === id || item.slug === id);
    if (!p) return;
    return get().updateProduct(id, { featured: !p.featured });
  },

  resetProducts: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('letters_products');
    }
    set({ products: defaultProducts });
  },

  getProductBySlug: (slug) => {
    return get().products.find((p) => p.slug === slug || p.id === slug);
  },

  getProductsByCategory: (categoryNameOrSlug) => {
    return get().products.filter(
      (p) =>
        p.active &&
        (p.category.toLowerCase() === categoryNameOrSlug.toLowerCase() ||
          p.categorySlug === categoryNameOrSlug.toLowerCase())
    );
  },
}));
