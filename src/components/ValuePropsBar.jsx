'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { useFestivalStore, getFestivalStatus } from '../store/festivalStore';

export default function ValuePropsBar() {
  const { showcaseFestival, fetchFestivals } = useFestivalStore();

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  const currentFestival = showcaseFestival;
  const status = currentFestival ? (currentFestival.computedStatus || getFestivalStatus(currentFestival)) : 'INACTIVE';
  const isPreBooking = status === 'PRE_BOOKING';
  const isActive = status === 'ACTIVE';

  const activeFestivalItems = useMemo(() => {
    if (!currentFestival || !Array.isArray(currentFestival.products)) return [];
    return currentFestival.products.filter((it) => it.active !== false && it.enabled !== false);
  }, [currentFestival]);

  if (!currentFestival || (!isActive && !isPreBooking)) {
    return null;
  }

  return (
    <aside
      aria-label="Festival Hampers Live Notification"
      className="relative z-20 bg-gradient-to-r from-[#1C2519] via-[#283623] to-[#1C2519] text-[#FAF6EE] border-y border-[#3E5337] py-3.5 px-4 sm:px-6 lg:px-12 select-none shadow-xs transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5 text-center md:text-left font-sans-ui">
        
        {/* Left: Festive Badge & Announcement */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5 font-sans-ui ${
            isPreBooking ? 'bg-amber-500 text-black font-extrabold' : 'bg-[var(--chandanam)] text-[#1C2519]'
          }`}>
            <FontAwesomeIcon icon={isPreBooking ? faClock : faWandMagicSparkles} className="text-[9px]" />
            {isPreBooking ? 'PRE-BOOKING OPEN' : (currentFestival.badge || 'FESTIVAL SPECIAL')}
          </span>

          <p className="text-xs sm:text-[13.5px] font-semibold text-[#FAF6EE] tracking-wide">
            {currentFestival.title || `${currentFestival.name} Hamper Atelier`}
            <span className="opacity-75 font-normal ml-2 hidden lg:inline">
              — {isPreBooking ? `Reserve handcrafted hampers in advance before ${currentFestival.startDate}.` : (currentFestival.subtitle || 'Reserve your handcrafted festive gift boxes before stocks end.')}
            </span>
          </p>
        </div>

        {/* Right: Active Festival Thumbnails Preview & High-Contrast CTA Button */}
        <div className="flex items-center gap-3.5 shrink-0">
          {/* Overlapping Product Thumbnails */}
          {activeFestivalItems.length > 0 && (
            <div className="hidden sm:flex items-center -space-x-2.5 overflow-hidden py-0.5">
              {activeFestivalItems.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/80 shadow-xs bg-white flex-shrink-0"
                >
                  <img src={item.image || (item.images && item.images[0])} alt={item.title || item.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <Link
            href="#festival"
            className="px-4.5 py-1.5 rounded-full bg-white text-[#1C2519] hover:bg-[#F5EFE4] text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-103 cursor-pointer"
          >
            <span>{isPreBooking ? 'Pre-Book Hampers' : 'Explore Festival Hampers'}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[9px] text-[var(--olive)]" />
          </Link>
        </div>

      </div>
    </aside>
  );
}

