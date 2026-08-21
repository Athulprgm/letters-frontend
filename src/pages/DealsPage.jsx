'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faFire,
  faClock,
  faSearch,
  faArrowRight,
  faCheck,
  faBagShopping,
  faTag,
  faSliders,
  faShieldHalved,
  faTruckFast,
  faGift,
  faLeaf,
  faArrowRotateLeft,
  faPercent,
  faBox,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProductStore } from '@/src/store/productStore';
import { useCartStore } from '@/src/store/cartStore';
import { useFestivalStore } from '@/src/store/festivalStore';
import { useSaleBannerStore } from '@/src/store/saleBannerStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { DoodleSparkle, DoodleOliveBranch, DoodleSwirl, DoodleStarburst } from '@/src/components/Doodles';

export default function DealsPage() {
  const { products } = useProductStore();
  const { festivals, showcaseFestival, fetchFestivals } = useFestivalStore();
  const { saleBanner, fetchSaleBanner } = useSaleBannerStore();
  const { getWhatsAppUrl } = useSettingsStore();
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('discount-high');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchSaleBanner();
    fetchFestivals();
  }, [fetchSaleBanner, fetchFestivals]);

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

  // Aggregate all deals from products + active festival hampers
  const allDeals = useMemo(() => {
    const selectedIds = saleBanner?.selectedProductIds;

    const prods = products
      .filter((p) => {
        if (!p.active) return false;
        if (selectedIds && selectedIds.length > 0) {
          return selectedIds.includes(p.id);
        }
        return true;
      })
      .map((p) => {
        const orig = p.originalPrice || Math.round(p.price * 1.3);
        const discountPct = orig > p.price ? Math.round(((orig - p.price) / orig) * 100) : 25;
        const claimedPct = Math.min(95, 65 + ((p.id.charCodeAt?.(0) || 5) % 30));
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          originalPrice: orig,
          discountPercent: discountPct,
          image: p.images?.[0] || p.image,
          description: p.description,
          slug: p.slug,
          isFestival: false,
          showPrice: p.showPrice !== false,
          tag: p.tag || (discountPct >= 25 ? 'Lightning Deal' : 'Special Offer'),
          claimedPercent: claimedPct,
          stockLeft: Math.max(2, 10 - Math.floor(claimedPct / 10)),
        };
      });

    // Extract products from all published festivals or showcase festival
    const festivalProductList = [];
    (festivals || []).forEach((fest) => {
      if (fest.status !== 'draft' && fest.active !== false && Array.isArray(fest.products)) {
        fest.products
          .filter((h) => h.active !== false && h.enabled !== false)
          .forEach((h) => {
            const orig = h.originalPrice || Math.round(h.price * 1.25);
            const discountPct = h.discountPercent || (orig > h.price ? Math.round(((orig - h.price) / orig) * 100) : 20);
            festivalProductList.push({
              id: h.id,
              name: h.title || h.name,
              category: fest.name || 'Festival Hamper',
              price: h.price,
              originalPrice: orig,
              discountPercent: discountPct,
              image: h.image || (h.images && h.images[0]),
              description: h.description,
              slug: (h.title || h.name).toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
              isFestival: true,
              festivalType: fest.id,
              showPrice: h.showPrice !== false,
              tag: h.badge || 'Festival Special',
              claimedPercent: 88,
              stockLeft: 3,
            });
          });
      }
    });

    return [...festivalProductList, ...prods];
  }, [products, festivals, saleBanner]);

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    let list = allDeals.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'festival') return item.isFestival;
      if (selectedFilter === 'under-999') return item.price <= 999;
      if (selectedFilter === 'chocolates') return item.category.toLowerCase().includes('chocolate');
      if (selectedFilter === 'frames') return item.category.toLowerCase().includes('frame');
      if (selectedFilter === 'bouquets') return item.category.toLowerCase().includes('bouquet') || item.category.toLowerCase().includes('flower');
      if (selectedFilter === 'lightning') return item.discountPercent >= 25;
      return true;
    });

    if (sortBy === 'discount-high') {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [allDeals, selectedFilter, sortBy, searchQuery]);

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const productObj = {
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      images: [item.image],
      image: item.image,
      category: item.category,
      slug: item.slug,
    };
    addToCart(productObj, 1);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1600);
  };

  const handleWhatsAppDeal = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const msg = `*Flash Deal Order — LETTERS*\nItem: ${item.name}\nOffer Price: ₹${item.price} (Original MRP: ₹${item.originalPrice})\nDiscount: ${item.discountPercent}% OFF\nLink: ${origin}/product/${item.slug}\n\nHello LETTERS team! I want to claim this Mega Sale deal. Please confirm live photo preview and dispatch.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen pt-0 pb-24 transition-colors duration-300">
      
      {/* ========================================================================= */}
      {/* 1. ARTISANAL MINIMAL MEGA SALE BANNER HEADER (TOUCHES NAVBAR) */}
      {/* ========================================================================= */}
      <div className="w-full bg-[#1C2519] text-[#FAF6EE] border-b border-[#C8A97E]/30 py-10 sm:py-14 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
        
        {/* Clean Background Image with Gentle Soft Text Legibility Gradient */}
        {saleBanner?.image ? (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={saleBanner.image}
              alt={saleBanner.title || 'Sale Banner'}
              className="w-full h-full object-cover object-center select-none"
            />
            {/* Soft, gentle text-side gradient for clean readability without overpowering the image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
          </div>
        ) : null}

        {/* Delicate Hand-Drawn Botanical Accents */}
        <div className="absolute -right-6 -bottom-6 text-[#C8A97E]/10 pointer-events-none">
          <DoodleOliveBranch className="w-56 h-56" />
        </div>
        <div className="absolute top-4 left-6 text-[#C8A97E]/15 pointer-events-none">
          <DoodleSparkle className="w-4 h-4" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Title, Eyebrow & Description */}
          <div className="text-center lg:text-left space-y-3.5 max-w-2xl" suppressHydrationWarning>
            
            {/* Handcrafted Eyebrow */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <DoodleSwirl className="w-6 h-3 text-[#C8A97E]" />
              <span
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px', color: '#D4B886' }}
                suppressHydrationWarning
              >
                {saleBanner?.calligraphy || 'Seasonal Atelier Curations'}
              </span>
            </div>

            {/* Event Tag & Offer Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2" suppressHydrationWarning>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-[#2E3C29] text-[#E8DFC8] border border-[#C8A97E]/30 shadow-xs" suppressHydrationWarning>
                <FontAwesomeIcon icon={faTag} className="text-[#C8A97E] text-[9px]" />
                <span suppressHydrationWarning>{saleBanner?.tag || 'LIMITED SEASONAL DROP'}</span>
              </span>
              <span className="text-[11px] font-semibold text-[#FBE4B8] bg-[#721C28]/85 px-3 py-0.5 rounded-full border border-white/10 shadow-xs" suppressHydrationWarning>
                {saleBanner?.discountOffer || 'UP TO 40% OFF'}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-normal text-[#FAF6EE] tracking-tight leading-tight" suppressHydrationWarning>
              {saleBanner?.title || 'The Celebration Deals Hub'}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-[13.5px] text-[#FAF6EE]/80 leading-relaxed max-w-xl font-light" suppressHydrationWarning>
              {saleBanner?.description || 'Grab limited-stock atelier curations on Belgian chocolate hampers, preserved florals, handcrafted frames & festive gifts.'}
            </p>
          </div>

          {/* Right Side: Minimalist Handcrafted Countdown Card */}
          <div className="shrink-0 bg-[#FAF6EE]/95 text-[#232D20] p-4 sm:p-5 rounded-2xl border border-[#C8A97E]/40 shadow-xl backdrop-blur-sm space-y-2.5 text-center min-w-[280px]" suppressHydrationWarning>
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#6E5A44]">
              <FontAwesomeIcon icon={faClock} className="text-[#721C28] text-xs" />
              <span>Offer Concludes In</span>
            </div>

            <div className="flex items-center justify-center gap-2 font-mono" suppressHydrationWarning>
              <div className="bg-[#EFE8DA] text-[#232D20] px-2.5 py-1.5 rounded-lg text-sm font-bold min-w-[42px] border border-[#C8A97E]/20" suppressHydrationWarning>
                {String(timeLeft.days).padStart(2, '0')}
                <span className="block text-[8px] font-sans font-semibold text-[#8A7A66] -mt-0.5 tracking-wider">DAYS</span>
              </div>
              <span className="text-[#8A7A66] font-bold text-sm">:</span>
              <div className="bg-[#EFE8DA] text-[#232D20] px-2.5 py-1.5 rounded-lg text-sm font-bold min-w-[42px] border border-[#C8A97E]/20" suppressHydrationWarning>
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="block text-[8px] font-sans font-semibold text-[#8A7A66] -mt-0.5 tracking-wider">HRS</span>
              </div>
              <span className="text-[#8A7A66] font-bold text-sm">:</span>
              <div className="bg-[#EFE8DA] text-[#232D20] px-2.5 py-1.5 rounded-lg text-sm font-bold min-w-[42px] border border-[#C8A97E]/20" suppressHydrationWarning>
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="block text-[8px] font-sans font-semibold text-[#8A7A66] -mt-0.5 tracking-wider">MIN</span>
              </div>
              <span className="text-[#8A7A66] font-bold text-sm">:</span>
              <div className="bg-[#721C28] text-white px-2.5 py-1.5 rounded-lg text-sm font-bold min-w-[42px] shadow-xs" suppressHydrationWarning>
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="block text-[8px] font-sans font-semibold text-[#FAF6EE]/80 -mt-0.5 tracking-wider">SEC</span>
              </div>
            </div>
            
            <p className="text-[10px] text-[#8A7A66] tracking-wide pt-0.5">
              Handwritten keepsakes included with every order
            </p>
          </div>

        </div>
      </div>

      {/* Main Deals Content Body */}
      <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-12 pt-8">

        {/* ========================================================================= */}
        {/* 2. VALUE PROPOSITIONS STRIP (Amazon / Flipkart Style Assurance) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: faGift, title: 'Free Calligraphy Note', sub: 'With Every Single Order' },
            { icon: faWhatsapp, title: 'Live WhatsApp Preview', sub: 'Photos Sent Before Dispatch' },
            { icon: faTruckFast, title: 'Express Pan-India', sub: 'Shockproof Packaging' },
            { icon: faShieldHalved, title: '100% Handcrafted', sub: 'Made in Kerala Atelier' },
          ].map((feat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--chandanam-soft)] text-[var(--chandanam-dark)] flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={feat.icon} className="text-xs" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-[var(--text)] truncate">{feat.title}</h4>
                <p className="text-[10.5px] text-[var(--text-muted)] truncate">{feat.sub}</p>
              </div>
            </div>
          ))}
        </div>


        {/* ========================================================================= */}
        {/* 4. SEARCH, FILTER TABS & SORTING CONTROLS */}
        {/* ========================================================================= */}
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search input */}
            <div className="relative w-full lg:max-w-xs">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search deals (e.g. Onam, Chocolate, Frame)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--chandanam)]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Deals', icon: faTag },
                { id: 'lightning', label: 'Lightning Deals', icon: faBolt },
                { id: 'festival', label: 'Festival Hampers', icon: faGift },
                { id: 'under-999', label: 'Under ₹999', icon: faPercent },
                { id: 'chocolates', label: 'Chocolates', icon: faBox },
                { id: 'frames', label: 'Frames', icon: faImage },
                { id: 'bouquets', label: 'Bouquets', icon: faLeaf },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    selectedFilter === tab.id
                      ? 'bg-[var(--text)] text-[var(--bg)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg-subtle)]'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                <strong>{filteredDeals.length}</strong> items
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text)] focus:outline-none cursor-pointer"
              >
                <option value="discount-high">Highest Discount %</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. DEALS PRODUCT GRID (Amazon / Flipkart Style Deal Cards) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDeals.map((item, idx) => {
            const isAdded = addedIds[item.id];
            const savings = item.originalPrice - item.price;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="card-minimal flex flex-col justify-between h-full group bg-[var(--card)] overflow-hidden border hover:border-[var(--chandanam)]/70 hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                  <Link href={`/product/${item.slug}`} className="block w-full h-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                  </Link>

                  {/* Amazon/Flipkart Discount Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-[#721C28] text-white text-[10.5px] font-black px-2.5 py-0.5 rounded-md shadow-md tracking-wider">
                      {item.discountPercent}% OFF
                    </span>
                    <span className="bg-black/75 backdrop-blur-md text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {item.tag}
                    </span>
                  </div>

                  {/* 1-Click WhatsApp Instant Order Button Overlay */}
                  <button
                    onClick={(e) => handleWhatsAppDeal(item, e)}
                    className="absolute bottom-3 right-3 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-[10.5px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform translate-y-1 group-hover:translate-y-0"
                    title="Instant WhatsApp Order"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-xs" />
                    <span>WhatsApp Order</span>
                  </button>
                </div>

                {/* Card Details */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[var(--chandanam)]"
                        style={{ fontFamily: "'Great Vibes', cursive", fontSize: '16px' }}
                      >
                        {item.category}
                      </span>
                      <span className="text-[9px] font-bold text-[#5A7249] bg-[#5A7249]/10 px-1.5 py-0.5 rounded">
                        Limited Time Deal
                      </span>
                    </div>

                    <Link href={`/product/${item.slug}`} className="block group-hover:text-[var(--maroon)] transition-colors">
                      <h2 className="font-heading text-[0.95rem] font-bold text-[var(--text)] leading-snug line-clamp-1 mb-1">
                        {item.name}
                      </h2>
                    </Link>

                    <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    {/* Price & Savings Display */}
                    <div className="space-y-1 mb-3">
                      {item.showPrice ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-xl font-black text-[var(--maroon)]">
                              ₹{item.price?.toLocaleString()}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-[var(--text-muted)] line-through">
                                ₹{item.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {savings > 0 && (
                            <p className="text-[10px] font-bold text-[#5A7249]">
                              You Save: ₹{savings.toLocaleString()} ({item.discountPercent}% Off)
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold text-[var(--chandanam-dark)] bg-[var(--chandanam-soft)] px-2 py-0.5 rounded">
                          Price On Request / WhatsApp Quote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Add to Cart & WhatsApp) */}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]/60">
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
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
                      onClick={(e) => handleWhatsAppDeal(item, e)}
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

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-16 bg-[var(--card)] rounded-3xl border border-[var(--border)]">
            <FontAwesomeIcon icon={faTag} className="text-3xl text-[var(--text-muted)] mb-3" />
            <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-1">No deals matched your search</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="gold-btn px-5 py-2 text-xs font-bold uppercase rounded-full cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
