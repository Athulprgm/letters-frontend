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
  faSun,
  faMoon,
  faPercent,
  faCircleCheck,
  faStore,
  faChevronRight,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useThemeStore } from '@/src/store/themeStore';
import { useOrderStore } from '@/src/store/orderStore';

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
  const { theme, toggleTheme } = useThemeStore();
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
    await logout();
    navigate('/admin/login');
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
      <header className="md:hidden bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] flex items-center justify-center cursor-pointer hover:bg-[var(--card)] transition-colors"
            aria-label="Toggle admin sidebar"
          >
            {mobileSidebarOpen ? <FontAwesomeIcon icon={faXmark} className="text-sm" /> : <FontAwesomeIcon icon={faBars} className="text-sm" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 -ml-1">
              <img src="/logo.png" alt="Letters" className="w-full h-full object-contain scale-110 drop-shadow-sm" />
            </div>
            <span className="font-bold text-sm text-[var(--text)] tracking-tight">
              {settings.brandName || 'Letters'}
            </span>
            <span className="text-[10px] uppercase font-bold bg-[var(--olive)]/10 text-[var(--olive)] px-1.5 py-0.5 rounded">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingOrdersCount > 0 && (
            <Link
              to="/admin/orders"
              className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center relative"
              title={`${pendingOrdersCount} Pending Orders`}
            >
              <FontAwesomeIcon icon={faBell} className="text-xs" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] flex items-center justify-center cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} className="text-xs" /> : <FontAwesomeIcon icon={faMoon} className="text-xs" />}
          </button>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] flex items-center justify-center"
            title="View Storefront"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
          </Link>
        </div>
      </header>

      {/* Classic E-Commerce Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 h-screen ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Brand Header */}
          <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 -ml-2">
                <img src="/logo.png" alt="Letters" className="w-full h-full object-contain scale-110 drop-shadow-md" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[var(--text)] tracking-tight leading-none">
                  {settings.brandName || 'Letters Store'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)]">Store Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text)] p-1 cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>

          {/* Navigation Items (Grouped Classic Admin) */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
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
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-normal transition-colors duration-150 ${
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
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--olive)]/15 text-[var(--olive)] flex items-center justify-center font-bold text-[10px]">
                  {(adminUser?.username || 'A')[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none text-[var(--text)]">{adminUser?.username || 'Administrator'}</span>
                  <span className="text-[9px] text-[var(--text-muted)] mt-0.5">Letters Store</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 text-xs cursor-pointer"
                title="Logout"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                title="View Online Storefront"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-[var(--text-muted)]" />
                <span>Storefront</span>
              </Link>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[11px] font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <FontAwesomeIcon icon={faSun} className="text-[10px] text-amber-400" /> : <FontAwesomeIcon icon={faMoon} className="text-[10px] text-[var(--text-muted)]" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Backdrop on mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 flex items-center justify-center -ml-1">
                <img src="/logo.png" alt="Letters Logo" className="w-full h-full object-contain scale-110 drop-shadow-sm" />
              </div>
              <span className="font-bold text-xs text-[var(--text)] tracking-tight">
                {settings.brandName || 'Letters'}
              </span>
            </Link>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-[var(--text-muted)] opacity-60" />
            <span className="font-bold text-xs text-[var(--text)]">{getCurrentPageTitle()}</span>
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

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-[var(--olive)]" />
              <span>Live Store</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] text-xs cursor-pointer transition-colors"
              title="Toggle Light / Dark Mode"
            >
              {theme === 'dark' ? <FontAwesomeIcon icon={faSun} className="text-amber-400" /> : <FontAwesomeIcon icon={faMoon} className="text-[var(--text-muted)]" />}
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
