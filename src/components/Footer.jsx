'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faEnvelope,
  faPhone,
  faLocationDot,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '../store/settingsStore';
import { useCategoryStore } from '../store/categoryStore';

export default function Footer() {
  const pathname = usePathname();
  const { settings, getWhatsAppUrl } = useSettingsStore();
  const { categories } = useCategoryStore();

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const msg = `Hello ${settings.brandName}, I would like to inquire about your gifts and hampers collection.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <footer className="bg-[var(--card)] text-[var(--text)] transition-colors duration-200 border-t border-[var(--border)] pt-20 pb-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-16 border-b border-[var(--border)]">
        
        {/* Brand & Story */}
        <div className="lg:col-span-2 space-y-5">
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="w-11 h-11 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl p-1 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt={settings.brandName || 'Letters'}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-[34px] sm:text-[38px] font-normal tracking-wide text-[var(--text)] leading-none group-hover:text-[var(--olive)] transition-colors"
                style={{
                  fontFamily: "'Alex Brush', 'Pinyon Script', 'Great Vibes', cursive",
                }}
              >
                {settings.brandName && settings.brandName.toUpperCase() === 'LETTERS' ? 'Letters' : (settings.brandName || 'Letters')}
              </span>
              <span className="text-[7.5px] tracking-[0.34em] text-[var(--text-muted)] font-bold uppercase mt-0.5 font-sans-ui">
                EST. {settings.establishedYear || '2020'}
              </span>
            </div>
          </Link>

          <p className="text-[var(--text-muted)] text-xs leading-relaxed max-w-sm">
            {settings.tagline}. Thoughtfully curated luxury hampers, bespoke floral & chocolate bouquets, customized keepsakes, and personalized gifting.
          </p>

          {/* Social and WhatsApp Buttons - Rounded Pill/Circle Frame */}
          <div className="flex items-center gap-2 pt-2">
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:text-[#232D20] hover:border-[var(--accent)] transition-colors"
              aria-label="Instagram"
            >
              <FontAwesomeIcon icon={faInstagram} className="text-sm" />
            </a>
            <button
              onClick={handleWhatsAppClick}
              className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--olive)] hover:text-white hover:border-[var(--olive)] transition-colors cursor-pointer"
              aria-label="WhatsApp"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
            </button>
            <a
              href={`mailto:${settings.email}`}
              className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:text-[#232D20] hover:border-[var(--accent)] transition-colors"
              aria-label="Email"
            >
              <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
            </a>
          </div>
        </div>

        {/* Categories Quick Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] border-b border-[var(--border)] pb-2">Collections</h3>
          <ul className="space-y-2 text-xs text-[var(--text-muted)]">
            {categories.filter(c => c.enabled).slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-[var(--accent-hover)] transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] border-b border-[var(--border)] pb-2">Navigation</h3>
          <ul className="space-y-2 text-xs text-[var(--text-muted)]">
            <li><Link href="/" className="hover:text-[var(--accent-hover)] transition-colors">Home</Link></li>
            <li><Link href="/shop" className="hover:text-[var(--accent-hover)] transition-colors">Shop All Gifts</Link></li>
            <li><Link href="/custom-gift" className="hover:text-[var(--accent-hover)] transition-colors">Custom Gift Builder</Link></li>
            <li><Link href="/about" className="hover:text-[var(--accent-hover)] transition-colors">About LETTERS</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--accent-hover)] transition-colors">Contact & Studio</Link></li>
            <li><Link href="/admin" className="hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1.5"><FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" /> Admin Portal</Link></li>
          </ul>
        </div>

        {/* Studio Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] border-b border-[var(--border)] pb-2">Studio Contact</h3>
          <ul className="space-y-2.5 text-xs text-[var(--text-muted)]">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-[var(--accent-hover)] text-xs flex-shrink-0" />
              <span>{settings.phoneNumber}</span>
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-[var(--accent-hover)] text-xs flex-shrink-0" />
              <span className="truncate">{settings.email}</span>
            </li>
            <li className="flex items-start gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="text-[var(--accent-hover)] text-xs flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </li>
          </ul>

          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-[#C9A46C] text-[#1C1C1A] hover:bg-[#A9824D] hover:text-[#FFFDF9] transition-colors mt-4 cursor-pointer shadow-sm"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-sm" /> Order on WhatsApp
          </button>
        </div>

      </div>

      {/* Footer Bottom Strip */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10.5px] text-[var(--text-muted)] font-medium">
        <p>© {new Date().getFullYear()} {settings.brandName} Gifting (EST. {settings.establishedYear}). All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-[var(--text)]">About Us</Link>
          <Link href="/contact" className="hover:text-[var(--text)]">Customer Care</Link>
          <Link href="/admin" className="hover:text-[var(--text)] flex items-center gap-1.5"><FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" /> Admin</Link>
        </div>
      </div>
    </footer>
  );
}
