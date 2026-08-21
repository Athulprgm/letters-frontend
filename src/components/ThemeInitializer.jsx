import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { useAuthStore } from '../store/authStore';

export default function ThemeInitializer() {
  const { initTheme } = useThemeStore();
  const { fetchSettings } = useSettingsStore();
  const { initCart } = useCartStore();
  const { fetchProducts } = useProductStore();
  const { fetchCategories } = useCategoryStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    if (initTheme) initTheme();
    if (initCart) initCart();
    if (fetchSettings) fetchSettings();
    if (fetchProducts) fetchProducts();
    if (fetchCategories) fetchCategories();
    if (initAuth) initAuth();
  }, []);

  return null;
}
