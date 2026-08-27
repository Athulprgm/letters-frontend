'use client';

import { useState, useMemo, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faBolt,
  faFire,
  faClock,
  faPercent,
  faBagShopping,
  faSparkles,
  faGift,
  faCircleCheck,
  faArrowRight,
  faStar,
  faMagnifyingGlass,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useSaleBannerStore } from '../store/saleBannerStore';
import { useSettingsStore } from '../store/settingsStore';
import { getWhatsAppUrl } from '../utils/whatsapp';

export default function DealsPage() {
  const { products, isLoaded: productsLoaded } = useProductStore();
  const { saleBanner, isLoaded: saleLoaded } = useSaleBannerStore();
  const { settings } = useSettingsStore();
  const { addItem } = useCartStore();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedPopup, setAddedPopup] = useState(null);

  const showPrices = settings.showProductPrices !== false;
  const inquiryLabel = settings.priceInquiryLabel || 'Price on Request';

  // Real-Time Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!saleBanner?.endDate) return;

    const calculateTime = () => {
      const difference = new Date(saleBanner.endDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [saleBanner?.endDate]);

  // Aggregate deals from active sale campaign
  const saleDeals = useMemo(() => {
    if (!saleBanner?.enabled) return [];

    let saleProducts = [];
    const selectedIds = (saleBanner.selectedProductIds || []).map(String);

    if (selectedIds.length > 0) {
      saleProducts = products.filter((p) => selectedIds.includes(String(p.id)));
    }

    if (saleProducts.length === 0) {
      saleProducts = products.filter(
        (p) => (p.discount && p.discount > 0) || (p.originalPrice && p.originalPrice > p.price)
      );
    }

    return saleProducts.map((p) => {
      const discountVal = p.discount || (p.originalPrice && p.originalPrice > p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 15);
      return {
        ...p,
        computedDiscount: discountVal,
        displayBadge: `${discountVal}% OFF`,
      };
    });
  }, [products, saleBanner]);

  // Filtered & Sorted Deals
  const filteredDeals = useMemo(() => {
    let list = saleDeals.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.name || item.title || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });

    if (sortBy === 'price-low') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.computedDiscount || 0) - (a.computedDiscount || 0));
    }

    return list;
  }, [saleDeals, sortBy, searchQuery]);

  // Handle direct WhatsApp Concierge Order
  const handleWhatsAppOrder = (item) => {
    const brand = settings.brandName || 'LETTERS';
    const priceText = showPrices && item.price ? ` (₹${Number(item.price).toLocaleString()})` : '';
    const message = `Hello ${brand}! I would like to order "${item.name || item.title}"${priceText} from your sale campaign. Please confirm availability & delivery details.`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    addItem(item, 1);
    setAddedPopup(item.name || item.title);
    setTimeout(() => setAddedPopup(null), 3000);
  };

  // If sale is deleted or disabled by admin, redirect to shop
  if (!saleBanner?.enabled) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-20">
      
      {/* 1. HERO SALE BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C2519] via-[#2D3B28] to-[#172014] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-12 border-b border-[var(--border)]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--chandanam)]/20 border border-[var(--chandanam)]/40 text-[var(--chandanam)] text-xs font-bold uppercase tracking-widest mb-4">
                <FontAwesomeIcon icon={faFire} className="text-amber-400" />
                <span>{saleBanner.tag || 'Exclusive Sale Deals'}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {saleBanner.title || 'Limited-Time Gifting Deals'}
              </h1>

              <p className="text-white/80 text-sm sm:text-base mt-3 leading-relaxed">
                {saleBanner.description || 'Discover handcrafted floral curations, artisanal chocolate hampers, and bespoke celebration keepsakes with exclusive promotional offers.'}
              </p>

              {saleBanner.discountOffer && (
                <div className="mt-4 inline-block px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-sm shadow-md">
                  {saleBanner.discountOffer}
                </div>
              )}
            </div>

            {/* Countdown Box */}
            {saleBanner.endDate && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 shadow-xl flex flex-col items-center">
                <div className="flex items-center gap-2 text-[var(--chandanam)] text-xs font-extrabold uppercase tracking-wider mb-3">
                  <FontAwesomeIcon icon={faClock} />
                  <span>Deals End In</span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Mins', val: timeLeft.minutes },
                    { label: 'Secs', val: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <div key={idx} className="bg-black/30 rounded-xl px-2.5 py-2 min-w-[58px] border border-white/10">
                      <span className="font-heading text-xl sm:text-2xl font-black text-amber-300">
                        {String(unit.val).padStart(2, '0')}
                      </span>
                      <span className="block text-[9px] uppercase tracking-wider text-white/70 mt-0.5">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CONTROLS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold font-heading text-[var(--text)]">
              Today's Featured Deals
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Showing <strong>{filteredDeals.length}</strong> special promotional items
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--olive)]"
              />
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]" />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="popular">Popular Deals</option>
              <option value="discount">Highest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. DEALS PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6">
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDeals.map((item) => {
              const isItemPriceShown = showPrices && item.showPrice !== false;
              const formattedPrice = Number(item.price || 0).toLocaleString();
              const formattedOriginal = item.originalPrice ? Number(item.originalPrice).toLocaleString() : null;

              return (
                <div
                  key={item.id}
                  onClick={() => handleWhatsAppOrder(item)}
                  className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:border-[var(--olive)] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                >
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <FontAwesomeIcon icon={faPercent} className="text-[9px]" />
                      <span>{item.displayBadge}</span>
                    </span>
                  </div>

                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <span className="px-3 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                          <span>Order on WhatsApp</span>
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1 group-hover:text-[var(--olive)] transition-colors">
                        {item.name || item.title}
                      </h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                        {item.description || 'Handcrafted bespoke celebration curation.'}
                      </p>

                      {/* Pricing */}
                      <div className="mt-3 flex items-baseline gap-2">
                        {isItemPriceShown ? (
                          <>
                            <span className="font-heading text-base font-bold text-[var(--olive)]">
                              ₹{formattedPrice}
                            </span>
                            {formattedOriginal && (
                              <span className="text-xs text-[var(--text-muted)] line-through">
                                ₹{formattedOriginal}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-bold text-[var(--text-muted)] italic">
                            {inquiryLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppOrder(item);
                      }}
                      className="w-full py-2 rounded-xl bg-[var(--olive)] hover:bg-[var(--olive-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                      <span>Order</span>
                    </button>

                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="w-full py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--card)] text-[var(--text)] hover:text-[var(--olive)] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                    >
                      <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <FontAwesomeIcon icon={faGift} className="text-4xl text-[var(--text-muted)] mb-3" />
            <h3 className="text-base font-bold text-[var(--text)]">No matching deals found</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Try searching with another keyword or explore our full collection in the shop.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--olive)] text-white text-xs font-bold shadow-md hover:bg-[var(--olive-hover)]"
            >
              <span>Explore All Gifts</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        )}
      </section>

      {/* Added to Bag Toast */}
      {addedPopup && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#1C2519] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
          <span>Added "{addedPopup}" to your Bag!</span>
        </div>
      )}
    </div>
  );
}
