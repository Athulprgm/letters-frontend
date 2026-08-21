'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faClock, faArrowRight, faBagShopping, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

export default function FlashDealsRow() {
  const { products } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [addedIds, setAddedIds] = useState({});

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 38,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealItems = products
    .filter((p) => p.active)
    .slice(0, 6)
    .map((p, idx) => {
      const orig = p.originalPrice || Math.round(p.price * 1.3);
      const discount = Math.round(((orig - p.price) / orig) * 100);
      const claimed = 65 + ((idx * 7) % 30);
      return { ...p, originalPrice: orig, discount, claimed };
    });

  if (dealItems.length === 0) {
    return null;
  }

  const handleAdd = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item, 1);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-12 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sm:p-6 shadow-xs">
          
          {/* Header with Timer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--maroon)] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <FontAwesomeIcon icon={faBolt} className="text-sm animate-pulse" />
              </span>
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--text)] leading-none">
                  Today's Lightning Deals
                </h2>
                <span className="text-[11px] text-[var(--text-muted)]">Limited quantities available at special atelier prices</span>
              </div>
            </div>

            {/* Countdown Ticker */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--bg-subtle)] px-3 py-1.5 rounded-full border border-[var(--border)] text-xs">
              <FontAwesomeIcon icon={faClock} className="text-[var(--maroon)] text-xs" />
              <span className="text-[var(--text-muted)] font-medium">Ends in:</span>
              <span className="font-mono font-bold text-[var(--text)]">
                {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Deals Horizontal Scroll */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dealItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between bg-[var(--bg-subtle)]/70 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--olive)]/50 transition-all shadow-2xs"
              >
                <div>
                  <Link href={`/product/${item.slug}`} className="block relative aspect-square rounded-lg overflow-hidden bg-white mb-2">
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-[var(--maroon)] text-white px-1.5 py-0.5 rounded shadow-2xs">
                      {item.discount}% OFF
                    </span>
                  </Link>

                  <Link href={`/product/${item.slug}`} className="block">
                    <h4 className="text-xs font-bold text-[var(--text)] line-clamp-1 group-hover:text-[var(--olive)] mb-1">
                      {item.name}
                    </h4>
                  </Link>

                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="font-heading text-sm font-bold text-[var(--text)]">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>


                <button
                  onClick={(e) => handleAdd(e, item)}
                  className={`w-full py-1.5 rounded-lg text-[10.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addedIds[item.id]
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)] shadow-2xs'
                  }`}
                >
                  {addedIds[item.id] ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Added
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faBagShopping} className="text-[9px]" /> Add to Bag
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
