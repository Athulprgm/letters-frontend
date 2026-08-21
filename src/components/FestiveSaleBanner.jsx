'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faFire,
  faGift,
  faTag,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faClock,
  faCheck,
  faBagShopping,
  faSparkles,
  faTruckFast,
  faCamera,
  faShieldHalved,
  faPercent,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { DoodleSparkle, DoodleSwirl, DoodleStarburst } from './Doodles';

export default function FestiveSaleBanner() {
  const { products } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [addedIds, setAddedIds] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Dynamic live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 16,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Amazon / Flipkart Big Billion & Festive Sale Billboard Slides
  const slides = useMemo(
    () => [
      {
        id: 'onam-sale',
        festival: 'onam',
        eventTag: 'GRAND ONAM UTSAV • BIG BILLION CELEBRATION',
        discountBadge: 'FLAT 25% OFF',
        calligraphy: 'Thiruvonam Traditions',
        title: 'Royal Onam Kasavu & Treats Hamper',
        subheading: 'Handcrafted Brass Nilavilakku, Palada Payasam, Honey Banana Chips & Sharkara Varatti',
        price: '₹1,899',
        originalPrice: '₹2,299',
        saveAmount: 'Save ₹400',
        claimedPercent: 88,
        stockLeft: 4,
        categorySlug: 'festival-hamper',
        bgGradient: 'from-[#1E1912] via-[#352516] to-[#1F291C]',
        accentPill: 'bg-[#CD8632] text-[#1F291C]',
        image: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=1200&q=85',
        highlights: ['Kasavu Border Box', 'Brass Nilavilakku', 'Jasmine Candle', 'Palada Payasam Mix'],
      },
      {
        id: 'xmas-sale',
        festival: 'xmas',
        eventTag: 'CHRISTMAS & NEW YEAR DROP • BIG FESTIVE DAYS',
        discountBadge: 'UP TO 35% OFF',
        calligraphy: 'Winter Warmth & Joy',
        title: 'Noël Winter Christmas Luxe Hamper',
        subheading: 'Aged Dark Rich Plum Cake, Hot Cocoa Blend, Belgian Cinnamon Truffles & Pinecone Candle',
        price: '₹1,999',
        originalPrice: '₹2,450',
        saveAmount: 'Save ₹451',
        claimedPercent: 92,
        stockLeft: 3,
        categorySlug: 'festival-hamper',
        bgGradient: 'from-[#2A1017] via-[#4A1521] to-[#1F291C]',
        accentPill: 'bg-[#8F2636] text-[#FAF6EE]',
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=85',
        highlights: ['Rich Aged Plum Cake', 'Hot Cocoa Blend', 'Belgian Truffles', 'Calligraphy Scroll'],
      },
      {
        id: 'vishu-sale',
        festival: 'vishu',
        eventTag: 'VISHU KANI GRAND SALE • AUSPICIOUS CURATIONS',
        discountBadge: 'MIN 20% OFF',
        calligraphy: 'Vishu Kani Blessings',
        title: 'Vishu Kani Bell-Metal Uruli Hamper',
        subheading: 'Authentic Bell-Metal Uruli, Kanikkonna Floral Keepsake, California Nuts & Wild Honey',
        price: '₹1,799',
        originalPrice: '₹2,150',
        saveAmount: 'Save ₹351',
        claimedPercent: 76,
        stockLeft: 6,
        categorySlug: 'festival-hamper',
        bgGradient: 'from-[#211E15] via-[#3A321E] to-[#1C2618]',
        accentPill: 'bg-[#D4922A] text-[#1F291C]',
        image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=1200&q=85',
        highlights: ['Bell-Metal Uruli', 'Kanikkonna Charm', 'Organic Wild Honey', 'California Dry Fruits'],
      },
      {
        id: 'bakrid-sale',
        festival: 'bakrid',
        eventTag: 'EID & BAKRID BARAKAH SPECIAL • FESTIVE DROP',
        discountBadge: 'SPECIAL EDITION',
        calligraphy: 'Barakah & Grace',
        title: 'Barakah Eid & Bakrid Royal Hamper',
        subheading: 'Madinah Ajwa Dates in Gold Tin, Crystal Tasbeeh, Arabian Baklava & Royal Oud Attar',
        price: '₹1,899',
        originalPrice: '₹2,299',
        saveAmount: 'Save ₹400',
        claimedPercent: 85,
        stockLeft: 5,
        categorySlug: 'festival-hamper',
        bgGradient: 'from-[#17241A] via-[#243B2A] to-[#2B231A]',
        accentPill: 'bg-[#5B744B] text-[#FAF6EE]',
        image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=85',
        highlights: ['Madinah Ajwa Dates', 'Crystal Tasbeeh', 'Royal Oud Attar', 'Arabian Baklava'],
      },
    ],
    []
  );

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const handleNextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Filter products for Lightning Deals Grid
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.active) return false;
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const fest = p.festivalType;

        if (activeTab === 'onam') {
          return fest === 'onam' || name.includes('onam') || desc.includes('kasavu');
        }
        if (activeTab === 'xmas') {
          return fest === 'xmas' || name.includes('christmas') || name.includes('noël') || desc.includes('plum');
        }
        if (activeTab === 'vishu') {
          return fest === 'vishu' || name.includes('vishu') || desc.includes('uruli') || cat.includes('nuts');
        }
        if (activeTab === 'bakrid') {
          return fest === 'bakrid' || name.includes('eid') || name.includes('bakrid') || cat.includes('islamic');
        }
        if (activeTab === 'chocolates') {
          return cat.includes('chocolate');
        }

        // 'all' tab shows curated sale & festival hampers
        return (
          cat.includes('festival') ||
          cat.includes('islamic') ||
          cat.includes('hamper') ||
          p.originalPrice > p.price
        );
      })
      .slice(0, 8);
  }, [products, activeTab]);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1600);
  };

  const handleWhatsAppOrder = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const msg = `*Festive Deal Inquiry — LETTERS*\nItem: ${product.name}\nOffer Price: ₹${product.price} (Original: ₹${product.originalPrice || product.price})\nLink: ${origin}/product/${product.slug}\n\nHello LETTERS team! I would like to claim this Festive Sale Deal directly. Please share dispatch time and live photo preview.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  const current = slides[currentSlide];

  return (
    <section
      id="festive-sale"
      className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[var(--bg)] via-[var(--bg-subtle)] to-[var(--bg)] border-y border-[var(--border)]/70 relative overflow-hidden select-none"
    >
      {/* Background Animated Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--chandanam)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--maroon)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ========================================================================= */}
        {/* 1. AMAZON / FLIPKART STYLE TOP MEGA SALE TICKER & ANIMATED COUNTDOWN */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6 rounded-2xl bg-gradient-to-r from-[#1B2418] via-[#2D3F28] to-[#45141D] p-3.5 sm:p-4 text-[#FAF6EE] shadow-lg border border-[#E5A04D]/30 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Sale Headline */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E5A04D] to-[#CD8632] text-[#1F291C] font-bold text-sm shadow-md animate-bounce">
              <FontAwesomeIcon icon={faBolt} />
            </span>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase bg-[#721C28] text-white px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                  BIG CELEBRATION SALE LIVE
                </span>
                <span className="text-[11.5px] text-[#F3B868] font-semibold flex items-center gap-1">
                  <FontAwesomeIcon icon={faFire} className="text-[#E5A04D] text-xs" />
                  Onam • Christmas • Vishu • Eid &amp; Bakrid Editions
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#FAF6EE]/90 mt-0.5 font-medium">
                Flat discounts up to 35% OFF + Free Handwritten Calligraphy Letter with every hamper
              </p>
            </div>
          </div>

          {/* Flipkart / Amazon Style Dynamic Countdown Boxes */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shrink-0 shadow-inner">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F3B868]">
              <FontAwesomeIcon icon={faClock} className="animate-spin text-xs" style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">ENDS IN:</span>
            </div>

            <div className="flex items-center gap-1 font-mono">
              <div className="bg-[#FAF6EE] text-[#1F291C] px-2 py-1 rounded-md text-xs font-black shadow-xs min-w-[28px] text-center">
                {String(timeLeft.days).padStart(2, '0')}
                <span className="block text-[7.5px] font-sans font-bold text-[#5E6A56] -mt-0.5">DAYS</span>
              </div>
              <span className="text-[#F3B868] font-bold">:</span>
              <div className="bg-[#FAF6EE] text-[#1F291C] px-2 py-1 rounded-md text-xs font-black shadow-xs min-w-[28px] text-center">
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="block text-[7.5px] font-sans font-bold text-[#5E6A56] -mt-0.5">HRS</span>
              </div>
              <span className="text-[#F3B868] font-bold">:</span>
              <div className="bg-[#FAF6EE] text-[#1F291C] px-2 py-1 rounded-md text-xs font-black shadow-xs min-w-[28px] text-center">
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="block text-[7.5px] font-sans font-bold text-[#5E6A56] -mt-0.5">MIN</span>
              </div>
              <span className="text-[#F3B868] font-bold">:</span>
              <div className="bg-[#E5A04D] text-[#1F291C] px-2 py-1 rounded-md text-xs font-black shadow-xs min-w-[28px] text-center animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="block text-[7.5px] font-sans font-bold text-[#1F291C] -mt-0.5">SEC</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. GRAND HERO ANIMATED SALE BILLBOARD CAROUSEL (Framer Motion Transitions) */}
        {/* ========================================================================= */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-[var(--border)] mb-10 bg-[#1F291C] group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] flex flex-col justify-between overflow-hidden"
            >
              {/* Background Image with saturated grading & luxury depth */}
              <div className="absolute inset-0 z-0">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
                />
                {/* Multi-layered cinematic gradient for maximum text contrast */}
                <div className={`absolute inset-0 bg-gradient-to-r ${current.bgGradient} opacity-92 mix-blend-multiply`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(229,160,77,0.25),transparent_70%)]" />
              </div>

              {/* Top Banner Status Bar */}
              <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold tracking-wider uppercase bg-white/20 backdrop-blur-md text-[#FAF6EE] border border-white/25 shadow-sm">
                    <FontAwesomeIcon icon={faFire} className="text-[#E5A04D] text-xs" />
                    {current.eventTag}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-md ${current.accentPill}`}>
                    <FontAwesomeIcon icon={faTag} className="text-[10px]" />
                    {current.discountBadge}
                  </span>
                </div>

                {/* Claim counter badge */}
                <div className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-[#FAF6EE] font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E5A04D] animate-ping" />
                  <span>🔥 {current.claimedPercent}% Claimed • {current.stockLeft} Left at this price</span>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-4 max-w-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <DoodleSwirl className="w-7 h-4 text-[#E5A04D]" />
                  <span
                    className="text-[#F3B868]"
                    style={{ fontFamily: "'Great Vibes', cursive", fontSize: '28px' }}
                  >
                    {current.calligraphy}
                  </span>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FFFCF5] leading-[1.1] tracking-tight mb-3 drop-shadow-md">
                  {current.title}
                </h2>

                <p className="text-[#FAF6EE]/90 text-sm sm:text-[14.5px] leading-relaxed mb-5 max-w-xl">
                  {current.subheading}
                </p>

                {/* Highlights tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {current.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-[#FAF6EE] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5"
                    >
                      <DoodleSparkle className="w-2.5 h-2.5 text-[#E5A04D]" />
                      {h}
                    </span>
                  ))}
                </div>

                {/* Price & Savings Pill */}
                <div className="flex flex-wrap items-baseline gap-3 mb-7">
                  <span className="font-heading text-3xl font-extrabold text-[#E5A04D]">
                    {current.price}
                  </span>
                  <span className="text-sm text-[#FAF6EE]/60 line-through">
                    {current.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-[#FAF6EE] bg-[#721C28] px-2.5 py-0.5 rounded-full border border-white/20">
                    {current.saveAmount}
                  </span>
                  <span className="text-[11.5px] text-[#F3B868] font-medium hidden sm:inline">
                    • Free Luxury Packaging &amp; Live Photo Preview
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href={`/category/${current.categorySlug}`}
                    className="chandanam-btn px-7 py-3.5 text-xs font-bold tracking-wider uppercase shadow-lg inline-flex items-center gap-2.5 active:scale-95 transform transition-transform"
                  >
                    <span>Claim Festive Deal</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                  </Link>

                  <button
                    onClick={() => {
                      const msg = `Hello LETTERS! I want to claim the ${current.title} festive deal (${current.price}) with live WhatsApp preview.`;
                      window.open(getWhatsAppUrl(msg), '_blank');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-[#FAF6EE] backdrop-blur-md border border-white/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-base" />
                    <span>WhatsApp 1-Click Order</span>
                  </button>
                </div>
              </div>

              {/* Bottom Progress Bar & Slide Thumbs */}
              <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15 bg-black/35 backdrop-blur-md">
                {/* Stock progress bar */}
                <div className="w-full sm:max-w-xs space-y-1">
                  <div className="flex justify-between text-[10.5px] font-semibold text-[#FAF6EE]/80">
                    <span>⚡ Lightning Deal Progress</span>
                    <span className="text-[#E5A04D] font-bold">{current.claimedPercent}% Sold</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#E5A04D] via-[#F3B868] to-[#CD8632] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${current.claimedPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Carousel Nav Thumbs / Tabs */}
                <div className="flex items-center gap-2">
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setIsAutoPlaying(false);
                        setCurrentSlide(idx);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-300 cursor-pointer ${
                        currentSlide === idx
                          ? 'bg-[#E5A04D] text-[#1F291C] shadow-md font-bold'
                          : 'bg-white/15 text-white/80 hover:bg-white/25'
                      }`}
                    >
                      {s.festival === 'onam'
                        ? '🌼 Onam'
                        : s.festival === 'xmas'
                        ? '🎄 Christmas'
                        : s.festival === 'vishu'
                        ? '🌸 Vishu'
                        : '🌙 Eid/Bakrid'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-md"
            aria-label="Previous Slide"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer shadow-md"
            aria-label="Next Slide"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. FLIPKART / AMAZON STYLE 4-CARD DEALS BENTO ROW (Animated on Hover) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-14">
          {[
            {
              id: 'onam',
              title: 'Onam Kasavu Specials',
              sub: 'Brass Nilavilakku & Sweets',
              offer: 'Min 25% Off',
              tag: 'Thiruvonam Edition',
              img: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?auto=format&fit=crop&w=600&q=80',
              accentColor: 'border-[#CD8632]/50 hover:border-[#CD8632]',
              badgeBg: 'bg-[#CD8632] text-[#1F291C]',
            },
            {
              id: 'xmas',
              title: 'Christmas (X-Mas) Drop',
              sub: 'Rich Plum Cake & Truffles',
              offer: 'Up to 35% Off',
              tag: 'Noël Winter Specials',
              img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80',
              accentColor: 'border-[#721C28]/50 hover:border-[#721C28]',
              badgeBg: 'bg-[#721C28] text-white',
            },
            {
              id: 'vishu',
              title: 'Vishu Kani Crates',
              sub: 'Bell-Metal Uruli & Nuts',
              offer: 'Starts ₹1,799',
              tag: 'Auspicious Vishu',
              img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
              accentColor: 'border-[#D4922A]/50 hover:border-[#D4922A]',
              badgeBg: 'bg-[#D4922A] text-[#1F291C]',
            },
            {
              id: 'bakrid',
              title: 'Eid & Bakrid Barakah',
              sub: 'Madinah Dates & Oud Attar',
              offer: 'Special Drop',
              tag: 'Spiritual Keepsakes',
              img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
              accentColor: 'border-[#3A4F34]/50 hover:border-[#3A4F34]',
              badgeBg: 'bg-[#3A4F34] text-white',
            },
          ].map((card) => (
            <motion.button
              key={card.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(card.id)}
              className={`group text-left card-minimal p-3.5 sm:p-4 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between border ${
                activeTab === card.id
                  ? 'border-[var(--text)] ring-2 ring-[var(--chandanam)]/40 bg-[var(--card)] shadow-md'
                  : `bg-[var(--card)] ${card.accentColor} hover:shadow-lg`
              }`}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[var(--bg-subtle)] mb-3">
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm ${card.badgeBg}`}>
                  {card.offer}
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] font-semibold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                  {card.tag}
                </span>
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--text)] group-hover:text-[var(--maroon)] transition-colors leading-snug">
                  {card.title}
                </h4>
                <p className="text-[var(--text-muted)] text-[11px] mt-0.5 line-clamp-1">
                  {card.sub}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10.5px] font-bold text-[var(--chandanam-dark)]">
                  <span>Explore Deals</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[8.5px] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 4. LIGHTNING DEALS OF THE DAY (Interactive Grid & Animated Tabs) */}
        {/* ========================================================================= */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-8 lg:p-10 shadow-sm relative">
          
          {/* Spotlight Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 pb-6 border-b border-[var(--border)]/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#721C28] text-white text-[10px]">
                  <FontAwesomeIcon icon={faFire} />
                </span>
                <span
                  className="text-[var(--chandanam)]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px' }}
                >
                  Lightning Deals of the Day
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                {activeTab === 'all'
                  ? 'All Festive Hamper Offers'
                  : activeTab === 'onam'
                  ? 'Onam Grand Festival Deals'
                  : activeTab === 'xmas'
                  ? 'Christmas & New Year Specials'
                  : activeTab === 'vishu'
                  ? 'Vishu Kani Blessed Hampers'
                  : 'Eid & Bakrid Royal Curations'}
              </h3>
            </div>

            {/* Filter Tabs with Active Animated Pill */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[var(--bg-subtle)] p-1.5 rounded-full border border-[var(--border)]">
              {[
                { id: 'all', label: '🔥 All Deals' },
                { id: 'onam', label: '🌼 Onam' },
                { id: 'xmas', label: '🎄 Christmas' },
                { id: 'vishu', label: '🌸 Vishu' },
                { id: 'bakrid', label: '🌙 Eid & Bakrid' },
                { id: 'chocolates', label: '🍫 Chocolates' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[11px] font-semibold px-4 py-2 rounded-full transition-all duration-200 cursor-pointer relative ${
                    activeTab === tab.id
                      ? 'bg-[var(--text)] text-[var(--bg)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product, idx) => {
              const isAdded = addedIds[product.id];
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 20;

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="card-minimal flex flex-col justify-between h-full group bg-[var(--card)] overflow-hidden border hover:border-[var(--chandanam)]/70 hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
                      <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                    </Link>

                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      <span className="bg-[#721C28] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
                        {discountPercent}% OFF
                      </span>
                      {product.tag && (
                        <span className="bg-white/90 backdrop-blur-md text-[var(--text)] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[var(--border)] shadow-xs">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Stock Alert */}
                    <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-md text-[#F3B868] text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                      <FontAwesomeIcon icon={faClock} className="text-[7.5px] text-[#E5A04D]" />
                      <span>Limited Deal</span>
                    </div>

                    {/* Quick WhatsApp Pill on hover */}
                    <button
                      onClick={(e) => handleWhatsAppOrder(product, e)}
                      className="absolute bottom-3 right-3 bg-[#25D366] text-white px-3 py-1 rounded-full text-[10.5px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform translate-y-1 group-hover:translate-y-0"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-xs" />
                      <span>1-Click Order</span>
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className="text-[var(--chandanam)]"
                          style={{ fontFamily: "'Great Vibes', cursive", fontSize: '16px' }}
                        >
                          {product.category}
                        </span>
                        <span className="text-[9px] font-bold text-[#5A7249] bg-[#5A7249]/10 px-1.5 py-0.5 rounded">
                          Verified Deal
                        </span>
                      </div>

                      <Link href={`/product/${product.slug}`} className="block group-hover:text-[var(--maroon)] transition-colors">
                        <h4 className="font-heading text-[0.95rem] font-bold text-[var(--text)] leading-snug line-clamp-1 mb-1">
                          {product.name}
                        </h4>
                      </Link>

                      <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Pricing Block */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-heading text-lg font-bold text-[var(--maroon)]">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-[var(--text-muted)] line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-[#5A7249]">
                          Save ₹{((product.originalPrice || Math.round(product.price * 1.25)) - product.price).toLocaleString()}
                        </span>
                      </div>

                      {/* Claim progress bar */}
                      <div className="space-y-1 mb-1">
                        <div className="flex justify-between text-[9.5px] font-bold text-[var(--text-muted)]">
                          <span>Deal Sold</span>
                          <span className="text-[var(--maroon)]">85% Claimed</span>
                        </div>
                        <div className="w-full h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#E5A04D] to-[#721C28] rounded-full w-[85%]" />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]/60">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[11px] font-semibold active:scale-95 transition-all duration-300 cursor-pointer ${
                          isAdded
                            ? 'bg-[#5A7249] text-white shadow-sm'
                            : 'bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] shadow-xs'
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
                        onClick={(e) => handleWhatsAppOrder(product, e)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-[11px] font-medium bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--chandanam)] active:scale-95 transition-all duration-300 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-xs" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Bottom Custom Gifting Bar */}
          <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h5 className="font-heading text-base font-bold text-[var(--text)]">
                Planning Bulk Corporate or Wedding Festive Hampers?
              </h5>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Custom box logo engraving, personalized theme curation &amp; special volume festive discounts.
              </p>
            </div>
            <Link
              href="/custom-gift"
              className="gold-btn px-6 py-3 text-xs font-semibold tracking-wider uppercase shrink-0 shadow-md inline-flex items-center gap-2"
            >
              <span>Custom Curation Inquiry</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. FESTIVE TRUST & ASSURANCES STRIP */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-center sm:text-left">
          {[
            { icon: faCamera, title: 'Live WhatsApp Preview', desc: 'Photos shared before dispatch' },
            { icon: faTruckFast, title: 'Pan-India Express', desc: 'Secure shockproof packing' },
            { icon: faGift, title: 'Handwritten Calligraphy', desc: 'Complimentary luxury cards' },
            { icon: faShieldHalved, title: 'Handmade in Kerala', desc: '100% authentic artisanal quality' },
          ].map((perk, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row items-center sm:items-start gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--chandanam-soft)] text-[var(--chandanam-dark)] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={perk.icon} className="text-xs" />
              </div>
              <div>
                <h6 className="text-xs font-bold text-[var(--text)]">{perk.title}</h6>
                <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
