'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faWandMagicSparkles, faGift, faPercent } from '@fortawesome/free-solid-svg-icons';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';

export default function AmazonQuadGrid() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const dealProducts = products.filter((p) => p.active && (p.originalPrice > p.price || p.tag)).slice(0, 4);
  const budgetProducts = products.filter((p) => p.active && p.price <= 1500).slice(0, 4);
  const showcaseCategories = categories.filter((c) => c.enabled).slice(0, 4);

  if (dealProducts.length === 0 && budgetProducts.length === 0 && showcaseCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-12 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Mega Deals of the Day (Amazon 4-box layout) */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs hover:border-[var(--olive)]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--maroon)] bg-[var(--maroon)]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FontAwesomeIcon icon={faBolt} className="text-[9px]" /> Limited Deal
                </span>
                <span className="text-xs font-bold text-[var(--olive)]">Up to 35% Off</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-3 leading-snug">
                Today's Gift Deals
              </h3>

              {/* 4 Mini Thumbnails */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {dealProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group/item bg-[var(--bg-subtle)] rounded-xl p-2 border border-[var(--border)]/70 hover:border-[var(--olive)] transition-all"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-1.5 bg-white">
                      <img
                        src={p.images?.[0] || p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover/item:scale-108 transition-transform"
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--text)] line-clamp-1 group-hover/item:text-[var(--olive)]">
                      {p.name}
                    </p>
                    <p className="text-[10.5px] font-bold text-[var(--olive)]">
                      ₹{p.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/deals"
              className="text-xs font-bold text-[var(--olive)] hover:underline flex items-center gap-1.5 pt-2 border-t border-[var(--border)]/60"
            >
              <span>See all deals & offers</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>
          </div>

          {/* Card 2: Shop by Curated Categories */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs hover:border-[var(--olive)]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--chandanam-dark)] bg-[var(--chandanam-soft)] px-2 py-0.5 rounded-full mb-1.5 inline-block">
                Top Categories
              </span>
              <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-3 leading-snug">
                Curated by Category
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {showcaseCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group/item bg-[var(--bg-subtle)] rounded-xl p-2 border border-[var(--border)]/70 hover:border-[var(--olive)] transition-all"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-1.5 bg-white">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover/item:scale-108 transition-transform"
                      />
                    </div>
                    <p className="text-[10.5px] font-semibold text-[var(--text)] line-clamp-1 group-hover/item:text-[var(--olive)]">
                      {cat.name}
                    </p>
                    <span className="text-[9.5px] text-[var(--text-muted)]">Explore</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/shop"
              className="text-xs font-bold text-[var(--olive)] hover:underline flex items-center gap-1.5 pt-2 border-t border-[var(--border)]/60"
            >
              <span>Explore all collections</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>
          </div>

          {/* Card 3: Affordable Luxury Under ₹1,499 */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs hover:border-[var(--olive)]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded-full mb-1.5 inline-block">
                Pocket Friendly
              </span>
              <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-3 leading-snug">
                Gifts Under ₹1,499
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {budgetProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group/item bg-[var(--bg-subtle)] rounded-xl p-2 border border-[var(--border)]/70 hover:border-[var(--olive)] transition-all"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-1.5 bg-white">
                      <img
                        src={p.images?.[0] || p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover/item:scale-108 transition-transform"
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-[var(--text)] line-clamp-1 group-hover/item:text-[var(--olive)]">
                      {p.name}
                    </p>
                    <p className="text-[10.5px] font-bold text-[var(--olive)]">
                      ₹{p.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/shop"
              className="text-xs font-bold text-[var(--olive)] hover:underline flex items-center gap-1.5 pt-2 border-t border-[var(--border)]/60"
            >
              <span>Shop budget gifts</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>
          </div>

          {/* Card 4: Custom Hamper Studio Spotlight */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs hover:border-[var(--olive)]/40 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--chandanam-dark)] bg-[var(--chandanam-soft)] px-2 py-0.5 rounded-full mb-1.5 inline-block">
                Interactive Studio
              </span>
              <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-3 leading-snug">
                Build a Custom Hamper
              </h3>

              <div className="rounded-xl overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border)]/80 p-2.5 mb-3 space-y-2">
                <div className="aspect-[16/9] rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                    alt="Custom Hamper"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-[var(--text)]">1. Select Box Packaging</p>
                  <p className="text-xs font-bold text-[var(--text)]">2. Pick Gourmet & Keepsakes</p>
                  <p className="text-xs font-bold text-[var(--text)]">3. Add Handwritten Letter</p>
                </div>
              </div>
            </div>

            <Link
              href="/custom-gift"
              className="gold-btn w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[11px]" />
              <span>Start Building Now</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
