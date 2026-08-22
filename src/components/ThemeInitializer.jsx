import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { useFestivalStore } from '../store/festivalStore';
import { useSaleBannerStore } from '../store/saleBannerStore';
import { useAuthStore } from '../store/authStore';

export default function ThemeInitializer() {
  const { initTheme } = useThemeStore();
  const { fetchSettings } = useSettingsStore();
  const { initCart } = useCartStore();
  const { fetchProducts } = useProductStore();
  const { fetchCategories } = useCategoryStore();
  const { fetchFestivals } = useFestivalStore();
  const { fetchSaleBanner } = useSaleBannerStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    if (initTheme) initTheme();
    if (initCart) initCart();
    if (initAuth) initAuth();

    // Fire background cache sync in parallel
    if (fetchSettings) fetchSettings();
    if (fetchProducts) fetchProducts();
    if (fetchCategories) fetchCategories();
    if (fetchFestivals) fetchFestivals();
    if (fetchSaleBanner) fetchSaleBanner();
  }, []);

  return null;
}
