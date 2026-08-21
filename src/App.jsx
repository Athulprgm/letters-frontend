import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Global Initializers
import ThemeInitializer from './components/ThemeInitializer';
import Preloader from './components/Preloader';

// Storefront Shell Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import FestiveBottomCutout from './components/FestiveBottomCutout';

// Storefront Pages
import HomePage from './pages/Home';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomGiftPage from './pages/CustomGiftPage';
import DealsPage from './pages/DealsPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';

// Admin Layout & Pages
import AdminLayout from './pages/admin/layout';
import AdminDashboardPage from './pages/admin/page';
import AdminLoginPage from './pages/admin/login/page';
import AdminProductsPage from './pages/admin/products/page';
import AdminCategoriesPage from './pages/admin/categories/page';
import AdminOrdersPage from './pages/admin/orders/page';
import AdminFestivalHampersPage from './pages/admin/festival-hampers/page';
import AdminSaleBannerPage from './pages/admin/sale-banner/page';
import AdminSettingsPage from './pages/admin/settings/page';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <ThemeInitializer />
      
      {isAdminRoute ? (
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/festival-hampers" element={<AdminFestivalHampersPage />} />
            <Route path="/admin/sale-banner" element={<AdminSaleBannerPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
        </AdminLayout>
      ) : (
        <>
          <Preloader />
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/custom-gift" element={<CustomGiftPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
          <FloatingWhatsApp />
          <FestiveBottomCutout />
        </>
      )}
    </div>
  );
}
