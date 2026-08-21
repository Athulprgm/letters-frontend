import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faUser,
  faArrowRight,
  faShieldHalved,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { settings } = useSettingsStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)] transition-colors duration-200">
      <div className="w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl p-7 sm:p-8 shadow-sm space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] p-2 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <img src="/logo.png" alt="Letters" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            {settings.brandName || 'Letters Store'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            E-Commerce Admin Portal
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-sm flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
              Admin Username or Email
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                autoComplete="username"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
              Password
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verifying credentials...' : 'Sign In to Store Admin'}</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-1.5">
          <p className="flex items-center justify-center gap-1.5 text-[11px]">
            <FontAwesomeIcon icon={faShieldHalved} className="text-[var(--olive)] text-xs" />
            <span>Secure administrator login</span>
          </p>
          <div>
            <Link to="/" className="text-[11px] font-semibold text-[var(--olive)] hover:underline">
              ← Return to Online Store
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
