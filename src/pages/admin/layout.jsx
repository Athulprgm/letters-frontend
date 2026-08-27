import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGauge,
  faBagShopping,
  faBox,
  faLayerGroup,
  faGear,
  faArrowRightFromBracket,
  faArrowUpRightFromSquare,
  faBars,
  faXmark,
  faGift,
  faPercent,
  faCircleCheck,
  faStore,
  faChevronRight,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useOrderStore } from '@/src/store/orderStore';

import { confirmDialog } from '@/src/store/confirmStore';
import AdminLoadingOverlay from '@/src/components/admin/AdminLoadingOverlay';
import NotificationToggle from '@/src/components/NotificationToggle';
import OrderNotificationManager from '@/src/components/admin/OrderNotificationManager';
import NotificationPermissionPrompt from '@/src/components/admin/NotificationPermissionPrompt';



const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: faGauge },
    ],
  },
  {
    title: 'Store Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: faBox },
      { label: 'Categories', href: '/admin/categories', icon: faLayerGroup },
      { label: 'Festival Hampers', href: '/admin/festival-hampers', icon: faGift },
    ],
  },
  {
    title: 'Sales & Orders',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: faBagShopping, badge: true },
      { label: 'Sale & Banners', href: '/admin/sale-banner', icon: faPercent },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Store Settings', href: '/admin/settings', icon: faGear },
    ],
  },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { isAuthenticated, isInitialized, logout, adminUser, initAuth } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { orders, fetchOrders } = useOrderStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);


  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    initAuth();
    fetchSettings();
    fetchOrders();
  }, [initAuth, fetchSettings, fetchOrders]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !isLoginPage) {
      navigate('/admin/login', { replace: true });
    }
  }, [isInitialized, isAuthenticated, isLoginPage, navigate]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isInitialized || (!isAuthenticated && !isLoginPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--olive)] border-t-transparent animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Verifying Store Access...</p>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const handleLogout = async () => {
    const isConfirmed = await confirmDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to log out of LETTERS Admin Console?',
      confirmText: 'Sign Out',
      cancelText: 'Stay',
      type: 'warning',
    });
    if (isConfirmed) {
      await logout();
      navigate('/admin/login');
    }
  };


  // Determine current page title for breadcrumb
  const getCurrentPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.startsWith('/admin/orders')) return 'Orders Management';
    if (pathname.startsWith('/admin/products')) return 'Product Catalog';
    if (pathname.startsWith('/admin/categories')) return 'Categories';
    if (pathname.startsWith('/admin/festival-hampers')) return 'Festival Hampers';
    if (pathname.startsWith('/admin/sale-banner')) return 'Sale & Banners';
    if (pathname.startsWith('/admin/settings')) return 'Store Settings';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row antialiased">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[var(--card)] border-b border-[var(--border)] px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] flex items-center justify-center cursor-pointer hover:bg-[var(--card)] transition-colors flex-shrink-0"
            aria-label="Toggle admin sidebar"
          >
            {mobileSidebarOpen ? <FontAwesomeIcon icon={faXmark} className="text-sm" /> : <FontAwesomeIcon icon={faBars} className="text-sm" />}
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="Letters" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs sm:text-sm text-[var(--text)] tracking-tight truncate">
                {settings.brandName || 'Letters'}
              </span>
              <span className="text-[9px] uppercase font-bold text-[var(--olive)] leading-none">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {pendingOrdersCount > 0 && (
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300 dark:border-amber-800"
              title={`${pendingOrdersCount} Pending Orders`}
            >
              <FontAwesomeIcon icon={faBell} className="text-[10px]" />
              <span>{pendingOrdersCount}</span>
            </Link>
          )}

          {/* Main Notification Button on Tablet & Mobile */}
          <NotificationToggle role="admin" />

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] flex items-center justify-center"
            title="View Storefront"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-[var(--olive)]" />
          </Link>
        </div>
      </header>



      {/* Classic E-Commerce Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 h-screen max-h-screen ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Letters" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm text-[var(--text)] tracking-tight leading-none truncate">
                  {settings.brandName || 'Letters'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">Store Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text)] p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer"
              aria-label="Close sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>

          {/* Navigation Items (Grouped Classic Admin) */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] opacity-70">
                  {group.title}
                </p>
                <div className="space-y-0.5 mt-1">
                  {group.items.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));

                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-normal transition-colors duration-150 ${
                          isActive
                            ? 'bg-[var(--olive)] text-white font-bold shadow-xs'
                            : 'text-[var(--text)]/80 hover:bg-[var(--bg)] hover:text-[var(--text)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FontAwesomeIcon
                            icon={link.icon}
                            className={`text-sm w-4 text-center ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}
                          />
                          <span>{link.label}</span>
                        </div>

                        {link.badge && pendingOrdersCount > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isActive ? 'bg-white text-[var(--olive)]' : 'bg-amber-500 text-white'
                            }`}
                          >
                            {pendingOrdersCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Admin Card & Actions */}
          <div className="p-3.5 border-t border-[var(--border)] bg-[var(--bg)]/40 space-y-2.5">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[var(--olive)]/15 text-[var(--olive)] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {(adminUser?.username || 'A')[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold leading-none text-[var(--text)] truncate">{adminUser?.username || 'Administrator'}</span>
                  <span className="text-[9px] text-[var(--text-muted)] mt-0.5">Letters Store</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs cursor-pointer flex-shrink-0"
                title="Logout"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </button>
            </div>

            <div>
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                title="View Online Storefront"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-[var(--olive)]" />
                <span>View Online Storefront</span>
              </Link>
            </div>
          </div>

        </div>
      </aside>

      {/* Backdrop on mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <Link to="/admin" className="font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              Admin
            </Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-[var(--text-muted)] opacity-50" />
            <span className="font-bold text-[var(--text)]">{getCurrentPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-[11px] text-[var(--text)]">Store Status: Online</span>
            </div>

            {pendingOrdersCount > 0 && (
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800"
              >
                <FontAwesomeIcon icon={faBell} className="text-xs" />
                <span>{pendingOrdersCount} Pending {pendingOrdersCount === 1 ? 'Order' : 'Orders'}</span>
              </Link>
            )}

            <NotificationToggle role="admin" />

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-[var(--olive)]" />
              <span>Live Store</span>
            </Link>
          </div>
        </header>


        {/* Page Content View */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)] border-t border-[var(--border)] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          to="/admin"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname === '/admin'
              ? 'text-[var(--olive)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <FontAwesomeIcon icon={faGauge} className="text-sm mb-0.5" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold relative transition-colors ${
            pathname.startsWith('/admin/orders')
              ? 'text-[var(--olive)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <div className="relative">
            <FontAwesomeIcon icon={faBagShopping} className="text-sm mb-0.5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[8px] font-extrabold px-1 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/products"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname.startsWith('/admin/products')
              ? 'text-[var(--olive)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <FontAwesomeIcon icon={faBox} className="text-sm mb-0.5" />
          <span>Products</span>
        </Link>

        <Link
          to="/admin/categories"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname.startsWith('/admin/categories')
              ? 'text-[var(--olive)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <FontAwesomeIcon icon={faLayerGroup} className="text-sm mb-0.5" />
          <span>Categories</span>
        </Link>

        <Link
          to="/admin/settings"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
            pathname.startsWith('/admin/settings')
              ? 'text-[var(--olive)] font-bold'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <FontAwesomeIcon icon={faGear} className="text-sm mb-0.5" />
          <span>Settings</span>
        </Link>
      </nav>

      <OrderNotificationManager />
      <NotificationPermissionPrompt />
      <AdminLoadingOverlay />
    </div>
  );
}


