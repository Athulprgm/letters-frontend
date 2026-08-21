'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faClock,
  faCheck,
  faBagShopping,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { useSaleBannerStore } from '../store/saleBannerStore';
import { DoodleSparkle, DoodleOliveBranch, DoodleSwirl } from './Doodles';

export default function SalesDiscountSection() {
  const { products } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { settings, getWhatsAppUrl } = useSettingsStore();
  const { saleBanner, isLoaded, fetchSaleBanner } = useSaleBannerStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [addedIds, setAddedIds] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchSaleBanner();
  }, [fetchSaleBanner]);

  // Live countdown timer calculated against saleBanner.endDate
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!saleBanner?.endDate) return;

    const calculate = () => {
      const target = new Date(saleBanner.endDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [saleBanner?.endDate]);

  // Minimalist Sale Banner Slides
  const saleSlides = useMemo(() => {
    const adminSlide = {
      id: 'admin-sale-slide',
      tag: saleBanner?.tag || 'Seasonal Gifting Offer',
      badge: saleBanner?.discountOffer || 'Up to 35% Off',
      calligraphy: saleBanner?.calligraphy || 'Exclusive Flash Drop',
      title: saleBanner?.title || 'Artisanal Hampers & Keepsakes Sale',
      description:
        saleBanner?.description ||
        'Thoughtfully curated Belgian chocolate hampers, flower arrangements, and custom engraved keepsakes at seasonal offer prices.',
      priceNote: saleBanner?.priceNote || 'Starting at ₹699 • Handwritten note included',
      ctaText: saleBanner?.ctaText || 'Explore Deals',
      ctaLink: saleBanner?.ctaLink || '/deals',
      image: saleBanner?.image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=85',
      highlights: ['Belgian Chocolates', 'Preserved Florals', 'Custom Keepsakes'],
    };

    const chocolateSlide = {
      id: 'chocolate-slide',
      tag: 'Gourmet Selection',
      badge: 'Min 20% Off',
      calligraphy: 'Artisanal Indulgence',
      title: 'Belgian Truffle & Cocoa Curations',
      description:
        'Decadent hazelnut praline truffles paired with gold-dusted chocolate medallions and floral gift wrapping.',
      priceNote: 'Curations from ₹999 • Luxury temperature packing',
      ctaText: 'View Chocolates',
      ctaLink: '/category/chocolate-hamper',
      image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=1200&q=85',
      highlights: ['Belgian Truffles', 'Handmade in Kerala', 'Pan-India Express'],
    };

    const framesSlide = {
      id: 'frames-slide',
      tag: 'Keepsakes & Memories',
      badge: 'Starts ₹699',
      calligraphy: 'Timeless Keepsakes',
      title: 'Floating Glass & Wooden Photo Frames',
      description:
        'Solid pinewood and brass-finished floating glass frames with high-definition photo print included and dried botanical pressings.',
      priceNote: 'High-definition photo print included with every order',
      ctaText: 'View Frames',
      ctaLink: '/category/photo-frames',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=85',
      highlights: ['Floating Brass Frames', 'HD Photo Prints', 'Dried Botanical Accents'],
    };

    return [adminSlide, chocolateSlide, framesSlide];
  }, [saleBanner]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % saleSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, saleSlides.length]);

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % saleSlides.length);
  };

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + saleSlides.length) % saleSlides.length);
  };

  // If section is disabled by admin, hide completely
  if (isLoaded && !saleBanner.enabled) {
    return null;
  }

  // Filtered products for discount grid
  const discountedProducts = products
    .filter((p) => {
      if (!p.active) return false;
      
      const selectedIds = saleBanner?.selectedProductIds;
      if (selectedIds && selectedIds.length > 0) {
        if (!selectedIds.includes(p.id)) return false;
      }

      const cat = (p.category || '').toLowerCase();
      if (activeTab === 'under-999') return p.price <= 999;
      if (activeTab === 'chocolates') return cat.includes('chocolate');
      if (activeTab === 'keepsakes') return cat.includes('frame') || p.customizable;
      if (activeTab === 'bouquets') return cat.includes('bouquet') || cat.includes('flower');

      return true;
    })
    .slice(0, 8);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const handleWhatsAppDeal = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const msg = `*Seasonal Offer Inquiry — LETTERS*\nItem: ${product.name}\nOffer Price: ₹${product.price} (Original: ₹${product.originalPrice || product.price})\nLink: ${origin}/product/${product.slug}\n\nHello LETTERS team! I would like to inquire about this offer with live photo preview.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  const current = saleSlides[currentSlide] || saleSlides[0];

  return (
    <section
      id="sales-discounts"
      className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg-subtle)] border-t border-[var(--border)]/40 relative overflow-hidden transition-colors duration-300 select-none"
    >
      {/* Subtle Corner Doodles */}
      <div className="absolute top-10 right-10 text-[var(--chandanam)]/10 pointer-events-none hidden lg:block">
        <DoodleOliveBranch className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 left-8 text-[var(--olive)]/10 pointer-events-none hidden lg:block">
        <DoodleSparkle className="w-10 h-10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ========================================================================= */}
        {/* MINIMAL SECTION HEADER */}
        {/* ========================================================================= */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border)]/50">
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
            >
              Curated Offers &amp; Savings
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight tracking-tight">
              The Seasonal Discount Studio
            </h2>
            <p className="text-[var(--text-muted)] text-[13.5px] mt-1 max-w-xl leading-relaxed">
              Discover limited-edition seasonal discounts on handcrafted hampers, floral curations, and personalized keepsakes.
            </p>
          </div>

          {/* Minimalist Countdown Pill */}
          <div className="inline-flex items-center gap-3 bg-[var(--card)] px-4 py-2 rounded-full border border-[var(--border)] shadow-xs shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
              <FontAwesomeIcon icon={faClock} className="text-[var(--chandanam)] text-xs" />
              <span>Offer Window:</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[var(--text)]">
              <span>{String(timeLeft.days).padStart(2, '0')}d</span>
              <span className="text-[var(--border)]">:</span>
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span className="text-[var(--border)]">:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span className="text-[var(--border)]">:</span>
              <span className="text-[var(--chandanam-dark)]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MINIMAL HERO BANNER CAROUSEL (Framer Motion) */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)] mb-12 shadow-sm group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45 }}
              className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[420px] lg:min-h-[440px]"
            >
              {/* Left Content */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--bg-subtle)] text-[var(--text)] border border-[var(--border)]">
                      {current.tag}
                    </span>
                    <span className="text-[10.5px] font-semibold text-[var(--maroon)] bg-[var(--maroon-light)] px-2.5 py-0.5 rounded-full">
                      {current.badge}
                    </span>
                  </div>

                  <span
                    className="block mb-1 text-[var(--chandanam)]"
                    style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px' }}
                  >
                    {current.calligraphy}
                  </span>

                  <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] leading-tight mb-3">
                    {current.title}
                  </h3>

                  <p className="text-[var(--text-muted)] text-xs sm:text-[13.5px] leading-relaxed max-w-lg mb-6">
                    {current.description}
                  </p>

                  <div className="text-xs text-[var(--text-muted)] font-medium mb-8 flex items-center gap-1.5">
                    <DoodleSparkle className="w-3 h-3 text-[var(--chandanam)]" />
                    <span>{current.priceNote}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]/40">
                  <div className="flex items-center gap-3">
                    <Link
                      href={current.ctaLink}
                      className="gold-btn px-6 py-3 text-[11px] font-semibold tracking-wide inline-flex items-center gap-2 shadow-xs"
                    >
                      <span>{current.ctaText}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                    </Link>

                    <button
                      onClick={() => {
                        const msg = `Hello LETTERS! I would like to inquire about the ${current.title} offer.`;
                        window.open(getWhatsAppUrl(msg), '_blank');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-medium text-[var(--text)] bg-[var(--card)] border border-[var(--border)] hover:border-[var(--olive)]/50 active:scale-98 transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-sm" />
                      <span>Inquire on WhatsApp</span>
                    </button>
                  </div>

                  {/* Dot Selectors */}
                  <div className="flex items-center gap-2">
                    {saleSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrentSlide(i);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          currentSlide === i
                            ? 'w-6 bg-[var(--text)]'
                            : 'w-2 bg-[var(--border)] hover:bg-[var(--text-muted)]'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="lg:col-span-5 h-72 sm:h-80 lg:h-full relative overflow-hidden bg-[var(--bg-subtle)] border-t lg:border-t-0 lg:border-l border-[var(--border)]">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10.5px] font-semibold text-[var(--text)] border border-[var(--border)] shadow-xs">
                  ✨ {current.badge}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--card)]/90 hover:bg-[var(--card)] text-[var(--text)] border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-xs"
            aria-label="Previous"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[10px]" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--card)]/90 hover:bg-[var(--card)] text-[var(--text)] border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-xs"
            aria-label="Next"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 4-CARD MINIMAL BENTO ROW */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-14">
          {[
            {
              id: 'under-999',
              title: 'Curations Under ₹999',
              sub: 'Bouquets & Mini Boxes',
              tag: 'Budget Friendly',
              img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80',
            },
            {
              id: 'chocolates',
              title: 'Artisan Chocolates',
              sub: 'Belgian Truffles & Rochers',
              tag: 'Min 20% Off',
              img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&q=80',
            },
            {
              id: 'keepsakes',
              title: 'Floating Photo Frames',
              sub: 'Prints & Brass Glass',
              tag: 'From ₹699',
              img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80',
            },
            {
              id: 'bouquets',
              title: 'Everlasting Florals',
              sub: 'Preserved Sunflowers & Roses',
              tag: 'Fresh Blooms',
              img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
            },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id)}
              className={`group text-left card-minimal p-3.5 sm:p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                activeTab === item.id
                  ? 'border-[var(--text)] ring-1 ring-[var(--text)] bg-[var(--card)]'
                  : 'bg-[var(--card)] hover:border-[var(--olive)]/50'
              }`}
            >
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-[var(--bg-subtle)] mb-3">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 text-[9px] font-semibold bg-white/90 backdrop-blur-sm text-[var(--text)] px-2 py-0.5 rounded shadow-2xs">
                  {item.tag}
                </span>
              </div>
              <div>
                <h4 className="font-heading text-[13.5px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-[var(--text-muted)] text-[11px] mt-0.5">
                  {item.sub}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* DISCOUNTED PRODUCTS GRID */}
        {/* ========================================================================= */}
        <div className="mb-12">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span
                className="block mb-0.5 text-[var(--chandanam)]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '22px' }}
              >
                Seasonal Atelier Curations
              </span>
              <h3 className="font-heading text-2xl font-bold text-[var(--text)]">
                {activeTab === 'all'
                  ? 'All Discounted Curations'
                  : activeTab === 'under-999'
                  ? 'Curations Under ₹999'
                  : activeTab === 'chocolates'
                  ? 'Gourmet Chocolate Offers'
                  : activeTab === 'keepsakes'
                  ? 'Photo Frame Keepsakes'
                  : 'Floral & Bouquet Offers'}
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Offers' },
                { id: 'under-999', label: 'Under ₹999' },
                { id: 'chocolates', label: 'Chocolates' },
                { id: 'keepsakes', label: 'Frames' },
                { id: 'bouquets', label: 'Bouquets' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[10.5px] px-3.5 py-1.5 rounded-full transition-all duration-200 font-semibold cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[var(--text)] text-[var(--bg)] shadow-xs'
                      : 'text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {discountedProducts.map((product) => {
              const isAdded = addedIds[product.id];
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <article
                  key={product.id}
                  className="card-minimal flex flex-col justify-between h-full group bg-[var(--card)] overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
                      />
                    </Link>

                    {product.tag && (
                      <span className="absolute top-3 left-3 text-[10px] font-semibold bg-white/90 backdrop-blur-md text-[var(--text)] px-2.5 py-0.5 rounded-full border border-[var(--border)] shadow-xs">
                        {product.tag}
                      </span>
                    )}

                    {discountPercent > 0 && (
                      <span className="absolute top-3 right-3 text-[9.5px] font-bold bg-[#721C28] text-white px-2 py-0.5 rounded-full shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className="text-[var(--chandanam)]"
                          style={{ fontFamily: "'Great Vibes', cursive", fontSize: '15px' }}
                        >
                          {product.category}
                        </span>
                        <span className="text-[9.5px] font-medium text-[var(--olive)]">In Stock</span>
                      </div>

                      <Link href={`/product/${product.slug}`} className="block group-hover:text-[var(--accent)] transition-colors">
                        <h4 className="font-heading text-[0.95rem] font-bold text-[var(--text)] leading-snug line-clamp-1 mb-1">
                          {product.name}
                        </h4>
                      </Link>

                      <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      <div className="flex items-baseline gap-2">
                        {product.showPrice !== false ? (
                          <>
                            <span className="font-heading text-lg font-bold text-[var(--text)]">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[11px] text-[var(--text-muted)] line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-bold text-[var(--chandanam-dark)] bg-[var(--chandanam-soft)] px-2 py-0.5 rounded">
                            Price On Request
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]/60">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10.5px] font-semibold active:scale-95 transition-all duration-300 cursor-pointer ${
                          isAdded
                            ? 'bg-[var(--olive)] text-white shadow-sm'
                            : 'bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)] shadow-xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Added
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faBagShopping} className="text-[9px]" /> Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={(e) => handleWhatsAppDeal(product, e)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[10.5px] font-medium bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--olive)]/50 active:scale-95 transition-all duration-300 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-xs" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
