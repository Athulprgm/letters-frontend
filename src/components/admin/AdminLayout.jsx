import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
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
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeStore } from '../../store/themeStore';
import { useOrderStore } from '../../store/orderStore';

const adminNavLinks = [
  { label: 'Dashboard', href: '/admin', icon: faGauge },
  { label: 'Orders', href: '/admin/orders', icon: faBagShopping, badge: true },
  { label: 'Products', href: '/admin/products', icon: faBox },
  { label: 'Categories', href: '/admin/categories', icon: faLayerGroup },
  { label: 'Settings', href: '/admin/settings', icon: faGear },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminUser } = useAuthStore();
  const { settings } = useSettingsStore();
  const { theme, toggleTheme } = useThemeStore();
  const { orders } = useOrderStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text)]"
            aria-label="Toggle admin sidebar"
          >
            {mobileSidebarOpen ? <FontAwesomeIcon icon={faXmark} className="text-base" /> : <FontAwesomeIcon icon={faBars} className="text-base" />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="Letters" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand-calligraphy text-2xl font-normal text-[var(--text)] tracking-wide">
                {settings.brandName && settings.brandName.toUpperCase() === 'LETTERS' ? 'Letters' : (settings.brandName || 'Letters')}
              </span>
              <span className="text-[10px] uppercase font-bold text-[var(--accent-secondary)] tracking-wider">Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text)]"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} className="text-sm" /> : <FontAwesomeIcon icon={faMoon} className="text-sm" />}
          </button>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text)]"
            title="View Storefront"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
          </Link>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="Letters" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-brand-calligraphy text-2xl font-normal text-[var(--text)] tracking-wide leading-tight">
                  {settings.brandName && settings.brandName.toUpperCase() === 'LETTERS' ? 'Letters' : (settings.brandName || 'Letters')}
                </h2>
                <p className="text-[9px] uppercase tracking-widest text-[var(--accent-secondary)] font-bold">
                  Admin Panel
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <FontAwesomeIcon icon={faXmark} className="text-base" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {adminNavLinks.map((link) => {
              const isActive = location.pathname === link.href;

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[var(--accent)] text-[var(--text)] font-bold shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={link.icon} className="text-sm" />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && pendingOrdersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span className="font-semibold">{adminUser?.username || 'Store Admin'}</span>
            <span className="text-[9px] uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[var(--border)] text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" /> Storefront
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[var(--border)] text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
            >
              {theme === 'dark' ? <FontAwesomeIcon icon={faSun} className="text-xs" /> : <FontAwesomeIcon icon={faMoon} className="text-xs" />} Theme
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>

    </div>
  );
}
