'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faArrowRight, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useSaleBannerStore } from '../store/saleBannerStore';
import { DoodleSparkle } from './Doodles';

export default function TopSaleAlertBar() {
  const { saleBanner, isLoaded, fetchSaleBanner } = useSaleBannerStore();

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

  // Never display on refresh/initial render until loaded and explicitly enabled by admin
  if (!isLoaded || !saleBanner?.enabled || !saleBanner?.showTopBar) {
    return null;
  }

  return (
    <aside
      aria-label="Announcement Sale Bar"
      className="relative z-30 bg-gradient-to-r from-[#1C2519] via-[#243120] to-[#1C2519] text-[#FAF6EE] border-b border-[#3E5337]/80 py-3.5 sm:py-4 px-4 sm:px-8 select-none transition-colors duration-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Left: Prominent Sale Offer & Message */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--chandanam)]/20 border border-[var(--chandanam)]/40 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faBolt} className="text-xs text-[var(--chandanam)] animate-pulse" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider bg-[var(--maroon)] text-white px-3 py-1 rounded-full shadow-xs">
            {saleBanner.discountOffer || 'UP TO 35% OFF'}
          </span>

          <p className="text-xs sm:text-[13.5px] font-semibold text-[#FAF6EE] tracking-wide">
            {saleBanner.topBarText || 'Big Celebration Sale Live • Up to 40% Off + Free Calligraphy Keepsake Letter'}
          </p>
        </div>

        {/* Right: Live Countdown Timer & Call to Action Button */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/15 text-xs">
            <FontAwesomeIcon icon={faClock} className="text-[var(--chandanam)] text-xs" />
            <span className="text-white/60 text-[11px] font-medium uppercase tracking-wider hidden sm:inline">Ends In:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-[#F3B868]">
              <span>{String(timeLeft.days).padStart(2, '0')}d</span>
              <span className="text-white/40">:</span>
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span className="text-white/40">:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span className="text-white/40">:</span>
              <span className="text-[var(--chandanam)]">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <Link
            href={saleBanner.ctaLink || '/deals'}
            className="px-4 py-1.5 rounded-full bg-[var(--chandanam)] text-[#1C2519] hover:bg-[#F3B868] text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 shadow-xs hover:scale-103 cursor-pointer"
          >
            <span>{saleBanner.ctaText || 'Explore Deals'}</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
          </Link>
        </div>

      </div>
    </aside>
  );
}
