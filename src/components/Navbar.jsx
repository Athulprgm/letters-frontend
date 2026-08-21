'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faXmark,
  faBagShopping,
  faArrowRight,
  faChevronDown,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { useCategoryStore } from '../store/categoryStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { settings, getWhatsAppUrl } = useSettingsStore();
  const { categories } = useCategoryStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (isAdminRoute) return null;

  const handleWhatsAppQuickInquiry = () => {
    const message = `Hello ${settings.brandName || 'LETTERS'}, I would like to inquire about your bespoke gift hampers!`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Deals', href: '/deals', badge: 'Offers' },
    { label: 'Custom Hamper', href: '/custom-gift', badge: 'Bespoke' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Strip */}
      <div className="bg-gradient-to-r from-[var(--bg-subtle)] via-[var(--bg)] to-[var(--bg-subtle)] text-[var(--text)] text-[11px] py-2 px-4 sm:px-8 lg:px-12 xl:px-16 tracking-[0.2em] uppercase font-medium flex items-center justify-between border-b border-[var(--border)] select-none relative z-50 transition-colors font-sans-ui">
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-[var(--accent-hover)] font-semibold">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center shadow-xs">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-white text-[7px]" />
          </div>
          <span>Atelier Handcrafted</span>
        </div>

        <div className="flex-1 text-center truncate px-2 sm:px-4">
          <span className="text-[var(--text)] font-medium tracking-[0.22em]">
            {settings.announcementText || 'Complimentary Handwritten Keepsake Note on All Orders'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
          <span>Est. {settings.establishedYear || '2020'}</span>
          <span className="opacity-30">•</span>
          <button
            onClick={handleWhatsAppQuickInquiry}
            className="hover:text-[var(--accent-hover)] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-[var(--text)]"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-[var(--olive)] text-xs" />
            <span>WhatsApp Care</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[var(--border)] shadow-[0_4px_25px_-4px_rgba(35,45,32,0.08)]'
            : 'bg-[#FAF7F0] border-b border-[var(--border)]/60'
        }`}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-18 sm:h-[80px] flex items-center justify-between font-sans-ui">
          
          {/* Brand Logo & Name (Far Left) */}
          <Link href="/" className="flex items-center gap-3 group py-1 select-none flex-shrink-0">

            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt={settings.brandName || 'Letters'}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-[34px] sm:text-[40px] font-normal tracking-wide text-[var(--text)] leading-none group-hover:text-[var(--olive)] transition-colors"
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {/* Standard Nav Items with Home */}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.14em] font-medium transition-all relative py-2 flex items-center gap-1.5 group/nav ${
                    isActive
                      ? 'text-[var(--text)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[8.5px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[var(--maroon-light)] text-[var(--maroon)] border border-[var(--maroon)]/25">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--olive)] to-[var(--chandanam)] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--olive)] rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform origin-left" />
                  )}
                </Link>
              );
            })}

            {/* Collections Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                onMouseEnter={() => setCollectionsOpen(true)}
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-medium transition-colors py-2 cursor-pointer ${
                  collectionsOpen || pathname.startsWith('/category')
                    ? 'text-[var(--olive)] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                aria-expanded={collectionsOpen}
              >
                <span>Collections</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-[9px] transition-transform duration-300 ${collectionsOpen ? 'rotate-180 text-[var(--olive)]' : 'opacity-50'}`}
                />
              </button>

              <AnimatePresence>
                {collectionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onMouseLeave={() => setCollectionsOpen(false)}
                    className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[520px] p-6 rounded-3xl bg-[#FFFDF7] border border-[var(--border)] shadow-[0_24px_60px_-12px_rgba(30,40,28,0.25)] z-50 select-none"
                    style={{ isolation: 'isolate' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--olive)]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text)]">
                          Curated Collections
                        </span>
                      </div>
                      <Link
                        href="/shop"
                        onClick={() => setCollectionsOpen(false)}
                        className="text-xs font-semibold text-[var(--olive)] hover:underline transition-colors flex items-center gap-1.5"
                      >
                        <span>View All Categories</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                      </Link>
                    </div>

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {categories
                        .filter((c) => c.enabled)
                        .slice(0, 6)
                        .map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="p-3 rounded-2xl bg-[#F7F3EB] hover:bg-[#EFE9DF] border border-[var(--border)] hover:border-[var(--olive)]/60 transition-all flex items-center gap-3.5 group/item shadow-2xs"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-[var(--border)]/80">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover/item:scale-108 transition-transform duration-400"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-[var(--text)] truncate group-hover/item:text-[var(--olive)] transition-colors">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] truncate font-normal">
                                {cat.group || 'Bespoke Collection'}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>

                    {/* Bottom Custom Creation Box */}
                    <div className="pt-3 border-t border-[var(--border)]">
                      <Link
                        href="/custom-gift"
                        onClick={() => setCollectionsOpen(false)}
                        className="flex items-center justify-between bg-[#F1ECE2] hover:bg-[#EAE3D6] p-3.5 rounded-2xl border border-[var(--border)] transition-all group/custom"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[var(--olive)] text-white flex items-center justify-center text-xs shadow-2xs">
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[10px] text-[var(--chandanam-light)]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text)]">Design a Custom Hamper</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Pick box, gifts & personalized keepsake note</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--olive)] group-hover/custom:translate-x-1 transition-transform flex items-center gap-1">
                          Build <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Cart */}

            <Link
              href="/cart"
              className="relative w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--text)] bg-[var(--bg-subtle)] hover:bg-[var(--card)] border border-[var(--border)] active:scale-90 transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-xs"
              aria-label={`Shopping bag with ${itemCount} items`}
            >
              <FontAwesomeIcon icon={faBagShopping} className="text-[15px]" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-[var(--maroon)] to-[var(--maroon-hover)] text-white font-bold rounded-full text-[9px] flex items-center justify-center shadow-xs"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--text)] bg-[var(--bg-subtle)] hover:bg-[var(--card)] border border-[var(--border)] active:scale-90 transition-all duration-300 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              ) : (
                <FontAwesomeIcon icon={faBars} className="text-lg" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden bg-[#FFFDF7] border-b border-[var(--border)] shadow-2xl font-sans-ui"
            >
              <div className="px-6 py-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                
                {/* Main Navigation */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-[0.35em] text-[var(--text-muted)] font-bold mb-3">
                    Menu
                  </span>
                  
                  {[
                    { label: 'Home', href: '/' },
                    { label: 'Shop All Gifts', href: '/shop' },
                    { label: 'Mega Deals', href: '/deals' },
                    { label: 'Our Story & Craft', href: '/about' },
                    { label: 'Contact & Studio', href: '/contact' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-base font-bold tracking-wide text-[var(--text)] hover:text-[var(--olive)] py-3 flex items-center justify-between border-b border-[var(--border)]/50 transition-colors"
                    >
                      <span>{link.label}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs text-[var(--text-muted)]" />
                    </Link>
                  ))}

                  <Link
                    href="/custom-gift"
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-bold tracking-wide text-[var(--text)] hover:text-[var(--olive)] py-3 flex items-center justify-between border-b border-[var(--border)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>Custom Hamper Studio</span>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-[var(--maroon-light)] text-[var(--maroon)] border border-[var(--maroon)]/25 uppercase tracking-wider">
                        Bespoke
                      </span>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs text-[var(--text-muted)]" />
                  </Link>
                </div>

                {/* Categories Grid */}
                {categories && categories.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[9px] uppercase tracking-[0.35em] text-[var(--text-muted)] font-bold mb-3 block">
                      Curated Collections
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {categories
                        .filter((c) => c.enabled)
                        .slice(0, 6)
                        .map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="p-3 rounded-xl bg-[#F7F3EB] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:border-[var(--olive)] transition-all flex items-center justify-between"
                          >
                            <span className="truncate">{cat.name}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleWhatsAppQuickInquiry();
                    }}
                    className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[var(--olive)] to-[var(--olive-hover)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                    <span>WhatsApp Concierge</span>
                  </button>
                </div>

                {/* Footer Info */}
                <div className="pt-4 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>{settings.brandName || 'Letters'} Atelier</span>
                  <span>Est. {settings.establishedYear || '2020'}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
