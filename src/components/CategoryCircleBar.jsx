'use client';

import Link from 'next/link';
import { useCategoryStore } from '../store/categoryStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faWandMagicSparkles, faGift } from '@fortawesome/free-solid-svg-icons';

export default function CategoryCircleBar() {
  const { categories } = useCategoryStore();

  const enabledCats = categories.filter((c) => c.enabled);

  return (
    <section className="bg-[var(--bg-subtle)] border-b border-[var(--border)] py-3 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-7 overflow-x-auto scrollbar-none pb-1">
        
        {/* Quick Deal Icon Circle */}
        <Link
          href="/deals"
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
        >
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[var(--maroon)] text-white flex items-center justify-center border-2 border-white shadow-xs group-hover:scale-108 transition-transform">
            <FontAwesomeIcon icon={faBolt} className="text-lg animate-pulse" />
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--maroon)] tracking-tight group-hover:underline text-center">
            Mega Deals
          </span>
        </Link>

        {/* Custom Hamper Builder Circle */}
        <Link
          href="/custom-gift"
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
        >
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[var(--olive)] text-white flex items-center justify-center border-2 border-white shadow-xs group-hover:scale-108 transition-transform">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-base text-[var(--chandanam)]" />
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--olive)] tracking-tight group-hover:underline text-center">
            Custom Studio
          </span>
        </Link>

        {/* Real Categories Circles */}
        {enabledCats.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden bg-[var(--card)] border-2 border-[var(--border)] group-hover:border-[var(--olive)] shadow-2xs group-hover:scale-108 transition-all duration-300">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="text-[10.5px] sm:text-[11px] font-semibold text-[var(--text)] tracking-tight group-hover:text-[var(--olive)] group-hover:underline text-center max-w-[75px] truncate">
              {cat.name.replace('Hampers', '').replace('Gift', '').trim() || cat.name}
            </span>
          </Link>
        ))}

        {/* All Products */}
        <Link
          href="/shop"
          className="flex flex-col items-center gap-1.5 flex-shrink-0 group cursor-pointer"
        >
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[var(--card)] text-[var(--text)] flex items-center justify-center border-2 border-[var(--border)] shadow-2xs group-hover:scale-108 group-hover:border-[var(--olive)] transition-all">
            <FontAwesomeIcon icon={faGift} className="text-base text-[var(--olive)]" />
          </div>
          <span className="text-[10.5px] sm:text-[11px] font-bold text-[var(--text)] tracking-tight group-hover:underline text-center">
            All Gifts
          </span>
        </Link>

      </div>
    </section>
  );
}
