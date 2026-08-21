'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowDown,
  faCheck,
  faBagShopping,
  faEye,
  faFeatherPointed,
  faCertificate,
  faShieldHalved,
  faCamera,
  faXmark,
  faCalendarDays,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { useFestivalStore, getFestivalStatus } from '../store/festivalStore';
import { DoodleSparkle, DoodleOliveBranch, DoodleStarburst, DoodleSwirl } from './Doodles';

export default function FestivalHamperSection() {
  const addToCart = useCartStore((state) => state.addToCart);
  const { getWhatsAppUrl } = useSettingsStore();
  const { festivals, showcaseFestival, isLoaded, fetchFestivals } = useFestivalStore();

  const [addedIds, setAddedIds] = useState({});
  const [inspectItem, setInspectItem] = useState(null);

  // Customizer modal state
  const [recipientName, setRecipientName] = useState('');
  const [letterLanguage, setLetterLanguage] = useState('English');
  const [waxSealColor, setWaxSealColor] = useState('Gold');

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  // Determine current active/showcase festival and its dynamic status
  const currentFestival = showcaseFestival;
  const festivalStatus = currentFestival ? (currentFestival.computedStatus || getFestivalStatus(currentFestival)) : 'INACTIVE';
  const isPreBooking = festivalStatus === 'PRE_BOOKING';
  const isActive = festivalStatus === 'ACTIVE';

  // Filter only active products belonging to this festival
  const activeProducts = useMemo(() => {
    if (!currentFestival || !Array.isArray(currentFestival.products)) return [];
    return currentFestival.products.filter((p) => p.active !== false && p.enabled !== false);
  }, [currentFestival]);

  // Edge case: If no eligible festival (neither ACTIVE nor PRE_BOOKING), do not render
  if (isLoaded && (!currentFestival || (!isActive && !isPreBooking))) {
    return null;
  }

  // If initial load or still fetching and no data, render null to prevent layout shifts
  if (!currentFestival) {
    return null;
  }

  const handleAddToCart = (product, e, customNoteDetails = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const preBookingNote = isPreBooking
      ? ` [PRE-BOOKING: ${currentFestival.name} • Dispatches prior to ${currentFestival.startDate}]`
      : '';

    const productLike = {
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      images: [product.image || (product.images && product.images[0])],
      image: product.image || (product.images && product.images[0]),
      category: `${currentFestival.name} Hamper`,
      slug: (product.title || product.name).toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      isPreBooking,
      festivalName: currentFestival.name,
      festivalStartDate: currentFestival.startDate,
      customNote: customNoteDetails
        ? `To: ${customNoteDetails.recipient || 'Beloved'} | Script: ${customNoteDetails.lang} | Seal: ${customNoteDetails.seal}${preBookingNote}`
        : `Includes complimentary handwritten calligraphy card${preBookingNote}`,
    };

    addToCart(productLike, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleWhatsAppOrder = (product, e, customNoteDetails = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let noteText = '';
    if (customNoteDetails && customNoteDetails.recipient) {
      noteText = `\n- Recipient Name: ${customNoteDetails.recipient}\n- Letter Script: ${customNoteDetails.lang}\n- Wax Seal Tone: ${customNoteDetails.seal}`;
    }

    const preBookingTag = isPreBooking
      ? `\n📌 *Order Type:* Pre-Booking (Festival Starts: ${currentFestival.startDate})`
      : '';

    const priceText = product.showPrice === false
      ? 'Price on Request'
      : `₹${product.price?.toLocaleString()} ${product.originalPrice ? `(Original: ₹${product.originalPrice?.toLocaleString()})` : ''}`;

    const msg = `*${isPreBooking ? 'Festival Pre-Booking Inquiry' : 'Festival Hamper Inquiry'} — LETTERS Atelier*\n\n🌟 *Hamper:* ${product.title || product.name}\n💎 *Price:* ${priceText}\n🎉 *Festival:* ${currentFestival.name}\n📍 *Craft/Origin:* ${product.origin || 'Kerala Atelier'}${preBookingTag}${noteText}\n\nHello LETTERS team! I would like to ${isPreBooking ? 'pre-book' : 'order'} this artisanal Festival Hamper. Please share custom quote, delivery timeframes, and packaging details.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  const handleWhatsAppBannerInquiry = () => {
    const msg = `*Celebration Inquiry — LETTERS Atelier*\n\n🎉 *Festival/Celebration:* ${currentFestival.name}\n🌟 *Theme:* ${currentFestival.title}\n📅 *Festival Dates:* ${currentFestival.startDate} to ${currentFestival.endDate}\n📌 *Status:* ${isPreBooking ? 'Pre-Booking Active' : 'Celebrations Live'}\n\nHello LETTERS team! I would like to inquire about curating and ordering festival hampers for ${currentFestival.name}. Please share custom hamper options.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  const scrollToShowcase = () => {
    const el = document.getElementById('festival-curations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Formatted date string for user friendliness
  const formattedDates = `${new Date(currentFestival.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(currentFestival.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <section
      id="festival"
      className="bg-[var(--bg)] border-b border-[var(--border)]/40 relative overflow-hidden transition-colors duration-400"
    >
      {/* Anchor for external links */}
      <span id="festival-hampers" className="absolute -top-24" />

      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH CINEMATIC FESTIVAL BILLBOARD BANNER WITH TEXT OVERLAY */}
      {/* ========================================================================= */}
      <div className="w-full relative overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center bg-[#172013] text-[#FAF6EE] select-none border-b border-[var(--border)]/60">
        
        {/* Full Bleed Background Image with Fallback */}
        <div className="absolute inset-0 z-0">
          <Image
            src={currentFestival.banner || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=1920&q=85'}
            alt={currentFestival.title || currentFestival.name}
            fill
            sizes="100vw"
            className="object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Multi-layered cinematic gradient for superior legibility and luxury depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 sm:to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,160,77,0.25),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(62,83,55,0.35),transparent_70%)]" />
        </div>

        {/* Decorative corner hand-drawn flourishes */}
        <div className="absolute top-8 right-10 text-[#C8A97E]/20 pointer-events-none hidden xl:block z-10">
          <DoodleOliveBranch className="w-40 h-40" />
        </div>
        <div className="absolute bottom-10 right-16 text-[#C8A97E]/20 pointer-events-none hidden xl:block z-10">
          <DoodleSparkle className="w-8 h-8" />
        </div>

        {/* Overlaid Banner Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-12 sm:py-16 lg:py-20 relative z-10 w-full flex flex-col justify-between">
          
          {/* Top Status & Date Badge (Single Minimal Pill) */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-[11px] font-semibold text-[#FAF6EE] bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 inline-flex items-center gap-2 shadow-xs">
              <FontAwesomeIcon icon={faCalendarDays} className="text-[10px] text-[#F3B868]" />
              <span>{currentFestival.name} Collection ({formattedDates})</span>
            </span>
            {isPreBooking && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-600 text-white shadow-xs">
                Pre-Booking Active
              </span>
            )}
          </div>

          {/* Main Minimal Overlay Narrative */}
          <div className="max-w-2xl">
            {/* Calligraphy Eyebrow */}
            {currentFestival.calligraphy && (
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[#F3B868] drop-shadow-sm font-normal"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(26px, 3.5vw, 34px)', letterSpacing: '0.02em' }}
                >
                  {currentFestival.calligraphy}
                </span>
              </div>
            )}

            {/* Headline Title */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl font-bold text-[#FFFDF8] leading-[1.1] tracking-tight mb-3 drop-shadow-md">
              {currentFestival.title || `${currentFestival.name} Festive Atelier`}
            </h1>

            {/* Single Concise Luxury Description */}
            <p className="text-[#FAF6EE]/85 text-xs sm:text-sm leading-relaxed mb-6 font-light max-w-xl">
              {currentFestival.tagline || currentFestival.description || 'Handcrafted Nilavilakku, Kasavu keepsakes, and traditional festive delicacies prepared fresh to order.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mb-6">
              {activeProducts.length > 0 && (
                <button
                  onClick={scrollToShowcase}
                  className="gold-btn px-6 sm:px-7 py-3 sm:py-3.5 text-xs font-bold tracking-wider uppercase shadow-lg inline-flex items-center gap-2 active:scale-95 transform transition-transform cursor-pointer"
                >
                  <span>{isPreBooking ? 'Explore Pre-Booking' : 'Explore Hampers'}</span>
                  <FontAwesomeIcon icon={faArrowDown} className="text-[11px]" />
                </button>
              )}

              <button
                onClick={handleWhatsAppBannerInquiry}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#FAF6EE] backdrop-blur-md border border-white/20 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-sm" />
                <span>WhatsApp Atelier Concierge</span>
              </button>
            </div>
          </div>

          {/* Minimal Footnote Strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#FAF6EE]/75 pt-4 border-t border-white/15">
            <span className="flex items-center gap-1.5">
              <span>✨ Pan-India Express Delivery</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCamera} className="text-[#25D366] text-[10px]" />
              <span>Live Photo Approval Before Dispatch</span>
            </span>
            <span>🕯️ Handcrafted in Kerala Atelier</span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FESTIVAL PRODUCTS & ATELIER ASSURANCES CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">

        {/* ========================================================================= */}
        {/* 2. CURRENT FESTIVAL PRODUCTS SHELF */}
        {/* Only rendered if there are active products for this festival */}
        {/* ========================================================================= */}
        {activeProducts.length > 0 && (
          <div id="festival-curations" className="scroll-mt-8 mb-16">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <DoodleStarburst className="w-4 h-4 text-[var(--chandanam)]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    {isPreBooking ? 'Pre-Booking Showcase' : 'Active Festival Curations'}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] mt-0.5">
                  {currentFestival.name} Hamper Editions
                </h3>
              </div>

              {isPreBooking && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  <span>Pre-Booking Window Active • Ships Before {new Date(currentFestival.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeProducts.map((item) => {
                const isAdded = addedIds[item.id];
                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="card-minimal flex flex-col justify-between h-full group bg-[var(--card)] overflow-hidden border border-[var(--border)] hover:border-[var(--olive)]/50 transition-all duration-300 rounded-2xl shadow-2xs hover:shadow-md"
                  >
                    {/* Visual Frame */}
                    <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                      <Image
                        src={item.image || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80'}
                        alt={item.title || item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {isPreBooking ? (
                          <span className="text-[9.5px] font-black bg-amber-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                            PRE-BOOKING
                          </span>
                        ) : item.badge ? (
                          <span className="text-[9.5px] font-semibold bg-white/90 dark:bg-black/80 backdrop-blur-md text-[var(--text)] px-2.5 py-0.5 rounded-full border border-[var(--border)] shadow-2xs">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>

                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="absolute top-3 right-3 text-[9.5px] font-bold bg-[#721C28] text-white px-2 py-0.5 rounded-full shadow-2xs z-10">
                          Save ₹{(item.originalPrice - item.price).toLocaleString()}
                        </span>
                      )}

                      {/* Hover Quick Inspect Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                        <button
                          onClick={() => setInspectItem(item)}
                          className="bg-white/95 dark:bg-black/90 text-[var(--text)] text-xs font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                          <span>Inspect Hamper</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
                      <div>
                        {/* Festival Tag */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className="text-[var(--chandanam)] truncate"
                            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '17px' }}
                          >
                            {currentFestival.calligraphy || currentFestival.name}
                          </span>
                          <span className={`text-[9.5px] font-medium px-2 py-0.5 rounded-full ${isPreBooking ? 'text-amber-800 bg-amber-500/15 dark:text-amber-300' : 'text-[var(--olive)] bg-[var(--olive)]/10'}`}>
                            {isPreBooking ? 'Pre-Order' : 'In Stock'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-heading text-[15px] font-bold text-[var(--text)] leading-snug line-clamp-1 mb-1 group-hover:text-[var(--olive)] transition-colors">
                          {item.title || item.name}
                        </h4>

                        {/* Brief description */}
                        <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        {/* Inclusions Preview */}
                        {item.highlights && item.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.highlights.slice(0, 2).map((h, i) => (
                              <span
                                key={i}
                                className="text-[9.5px] font-medium px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                              >
                                ✓ {h}
                              </span>
                            ))}
                            {item.highlights.length > 2 && (
                              <span className="text-[9.5px] text-[var(--text-muted)] px-1 self-center">
                                +{item.highlights.length - 2} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        {item.showPrice !== false ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-lg font-bold text-[var(--text)]">
                              ₹{item.price?.toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-[11px] text-[var(--text-muted)] line-through">
                                ₹{item.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-[var(--olive)]">
                              Price on Request
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]/50">
                        <button
                          onClick={(e) => handleAddToCart(item, e)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-semibold active:scale-95 transition-all duration-300 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : isPreBooking
                              ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                              : 'bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)] shadow-2xs'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Added
                            </>
                          ) : isPreBooking ? (
                            <>
                              <FontAwesomeIcon icon={faClock} className="text-[9px]" /> Pre-Book
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faBagShopping} className="text-[9px]" /> Add to Cart
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleWhatsAppOrder(item, e)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[11px] font-medium bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--olive)]/50 active:scale-95 transition-all duration-200 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-xs" /> WhatsApp
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ATELIER ASSURANCES & CRAFTSMANSHIP STRIP */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[var(--chandanam)]/10 text-[var(--chandanam)] flex items-center justify-center flex-shrink-0 text-sm">
              <FontAwesomeIcon icon={faCertificate} />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text)]">Kerala Artisan Guilds</h4>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Authentic Mannar bell-metal & handloom craft sourcing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center flex-shrink-0 text-sm">
              <FontAwesomeIcon icon={faFeatherPointed} />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text)]">Hand-Penned Calligraphy</h4>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Complimentary custom personalized wax-sealed greeting note.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 text-sm">
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text)]">Live Preview Approval</h4>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                HD photo & video of your exact packed hamper sent on WhatsApp prior to dispatch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 text-sm">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[var(--text)]">Insured Shipping</h4>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                Multi-layer shockproof gift packaging with pan-India delivery tracking.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. HAMPER STORY & LIVE PERSONALIZATION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setInspectItem(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--border)] text-[var(--text)] flex items-center justify-center text-sm transition-colors cursor-pointer z-10"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Visual Preview */}
                <div className="md:col-span-5">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--bg-subtle)] mb-3 border border-[var(--border)]">
                    <Image
                      src={inspectItem.image || (inspectItem.images && inspectItem.images[0]) || 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=800&q=80'}
                      alt={inspectItem.title || inspectItem.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]/60 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--chandanam)] font-semibold mb-1">
                      <DoodleSparkle className="w-3.5 h-3.5" />
                      <span>Origin & Heritage</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                      {inspectItem.origin || 'Handcrafted to order by master artisans in Kerala.'}
                    </p>
                  </div>
                </div>

                {/* Details & Live Personalizer */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text)] border border-[var(--border)]">
                        {currentFestival.name}
                      </span>
                      {isPreBooking ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Pre-Booking Order
                        </span>
                      ) : inspectItem.badge ? (
                        <span className="text-[10px] font-semibold text-[var(--chandanam)]">
                          {inspectItem.badge}
                        </span>
                      ) : null}
                    </div>

                    <span
                      className="block text-[var(--chandanam)] mb-0.5"
                      style={{ fontFamily: "'Great Vibes', cursive", fontSize: '22px' }}
                    >
                      {currentFestival.calligraphy || 'Artisan Special'}
                    </span>

                    <h3 className="font-heading text-2xl font-bold text-[var(--text)] leading-tight mb-2">
                      {inspectItem.title || inspectItem.name}
                    </h3>

                    <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">
                      {inspectItem.description}
                    </p>

                    {/* Inclusions Checklist */}
                    {inspectItem.highlights && (
                      <div className="mb-5">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text)] mb-2">
                          What is Included in This Hamper:
                        </h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {inspectItem.highlights.map((h, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 bg-[var(--bg-subtle)]/50 p-1.5 rounded-lg"
                            >
                              <FontAwesomeIcon icon={faCheck} className="text-[9px] text-[var(--olive)]" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Live Custom Calligraphy Note Customizer */}
                    <div className="mb-6 p-3.5 rounded-2xl bg-[var(--bg-subtle)]/60 border border-[var(--border)]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)] mb-2">
                        <FontAwesomeIcon icon={faFeatherPointed} className="text-[var(--olive)]" />
                        <span>Personalize Complimentary Gift Card</span>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">
                            Recipient Name / Message For:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ananya & Arjun"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:border-[var(--olive)] text-[var(--text)]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">
                              Letter Script:
                            </label>
                            <select
                              value={letterLanguage}
                              onChange={(e) => setLetterLanguage(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] cursor-pointer"
                            >
                              <option value="English">English Classic</option>
                              <option value="Malayalam">Malayalam (മലയാളം)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-medium text-[var(--text-muted)] block mb-1">
                              Wax Seal Color:
                            </label>
                            <select
                              value={waxSealColor}
                              onChange={(e) => setWaxSealColor(e.target.value)}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)] cursor-pointer"
                            >
                              <option value="Gold">Antique Gold</option>
                              <option value="Forest Olive">Forest Olive</option>
                              <option value="Royal Maroon">Royal Maroon</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                      {inspectItem.showPrice !== false ? (
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Total Price:</span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-2xl font-bold text-[var(--text)]">
                              ₹{inspectItem.price?.toLocaleString()}
                            </span>
                            {inspectItem.originalPrice && inspectItem.originalPrice > inspectItem.price && (
                              <span className="text-xs text-[var(--text-muted)] line-through">
                                ₹{inspectItem.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-[var(--text-muted)] block">Pricing:</span>
                          <span className="text-lg font-bold text-[var(--olive)]">
                            Price on Request
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            handleAddToCart(inspectItem, null, {
                              recipient: recipientName,
                              lang: letterLanguage,
                              seal: waxSealColor,
                            });
                            setInspectItem(null);
                          }}
                          className={`${isPreBooking ? 'bg-amber-600 hover:bg-amber-700 text-white rounded-full' : 'gold-btn'} px-5 py-2.5 text-xs font-semibold tracking-wide inline-flex items-center gap-1.5 cursor-pointer`}
                        >
                          <FontAwesomeIcon icon={isPreBooking ? faClock : faBagShopping} className="text-xs" />
                          <span>{isPreBooking ? 'Pre-Book Hamper' : 'Add to Bag'}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleWhatsAppOrder(inspectItem, null, {
                              recipient: recipientName,
                              lang: letterLanguage,
                              seal: waxSealColor,
                            });
                            setInspectItem(null);
                          }}
                          className="px-4 py-2.5 rounded-full text-xs font-medium bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--olive)]/50 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
