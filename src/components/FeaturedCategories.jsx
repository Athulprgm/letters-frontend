'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useCategoryStore } from '../store/categoryStore';
import { DoodleSparkle, DoodleOliveBranch } from './Doodles';

export default function FeaturedCategories() {
  const { categories } = useCategoryStore();
  const enabledCategories = categories.filter((c) => c.enabled);

  if (enabledCategories.length === 0) {
    return null;
  }

  return (
    <section id="categories" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-300 relative overflow-hidden">

      {/* Corner doodle */}
      <div className="absolute top-8 right-10 text-[var(--olive)]/10 pointer-events-none hidden lg:block">
        <DoodleOliveBranch className="w-20 h-20" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
            >
              Thoughtful Collections
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight tracking-tight">
              Curated by Sentiment
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors group"
          >
            <span>All Collections</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {enabledCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex flex-col card-minimal overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-subtle)]">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <span
                  className="block mb-1 text-[var(--chandanam)]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '16px' }}
                >
                  {cat.group}
                </span>
                <h3 className="font-heading text-base font-bold text-[var(--text)] mb-1.5 group-hover:text-[var(--accent)] transition-colors duration-300 leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed line-clamp-2 flex-grow">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--accent)] opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all duration-300">
                  <span>Explore</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[8px]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
