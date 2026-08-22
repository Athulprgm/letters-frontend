import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faGift, faArrowRight, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { useCategoryStore } from '@/src/store/categoryStore';
import { useProductStore } from '@/src/store/productStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import ProductCard from '@/src/components/ProductCard';

export default function CategoryPage(props) {
  const routerParams = useParams();
  const slug = props.params?.slug || routerParams?.slug;

  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const { settings } = useSettingsStore();
  const showPrices = settings.showPricesGlobally !== false;

  const [sortBy, setSortBy] = useState('featured');

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.slug === slug || c.id === slug);
  }, [categories, slug]);

  const otherCategories = useMemo(() => {
    return categories.filter((c) => c.enabled && c.slug !== slug);
  }, [categories, slug]);

  const matchingProducts = useMemo(() => {
    return products
      .filter(
        (p) =>
          p.active &&
          (p.categorySlug === slug ||
            (currentCategory && p.category.toLowerCase() === currentCategory.name.toLowerCase()))
      )
      .sort((a, b) => {
        if (showPrices && sortBy === 'price-low') return a.price - b.price;
        if (showPrices && sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, slug, currentCategory, sortBy, showPrices]);

  if (!currentCategory) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <FontAwesomeIcon icon={faGift} className="text-[var(--olive)] text-3xl mb-4" />
        <h2 className="font-heading text-2xl font-bold text-[var(--text)] mb-2">Category Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">The category you are looking for does not exist or has been updated.</p>
        <Link href="/shop" className="gold-btn px-6 py-3 text-xs font-semibold tracking-wide cursor-pointer">
          Explore All Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--text)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold">{currentCategory.name}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden mb-12 shadow-xs relative">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            
            <div className="md:col-span-7 p-8 sm:p-12 relative z-10">
              <span
                className="block mb-2 text-[var(--chandanam)]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
              >
                {currentCategory.group || 'Curated Collection'}
              </span>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] leading-tight mb-3">
                {currentCategory.name}
              </h1>

              <p className="text-[var(--text-muted)] text-xs sm:text-sm leading-relaxed max-w-xl mb-6">
                {currentCategory.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--olive)] hover:text-[var(--olive-hover)] transition-colors group"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-[10px] group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back to full catalog</span>
                </Link>
                <span className="text-[var(--border)]">•</span>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {matchingProducts.length} items available
                </span>
              </div>
            </div>

            <div className="md:col-span-5 h-64 md:h-full min-h-[260px] relative overflow-hidden bg-[var(--bg-subtle)] border-t md:border-t-0 md:border-l border-[var(--border)]">
              <img
                src={currentCategory.image}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Products Grid Header & Sort */}
        <div className="mb-8 pb-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-[var(--text)]">
            Curations in {currentCategory.name}
            <span className="text-xs text-[var(--text-muted)] font-normal ml-2">({matchingProducts.length} items)</span>
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-warm text-xs py-1.5 px-3 w-44 cursor-pointer"
            >
              <option value="featured">Featured Picks</option>
              <option value="rating">Top Customer Rated</option>
              {showPrices && (
                <>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {matchingProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <p className="text-xs text-[var(--text-muted)] mb-4">No products are currently available in this category.</p>
            <Link href="/shop" className="gold-btn px-6 py-2.5 text-xs font-semibold">
              Browse Other Gifts
            </Link>
          </div>
        )}

        {/* Explore Other Collections Section */}
        {otherCategories.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--border)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span
                  className="block text-[var(--chandanam)] text-sm mb-0.5"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '20px' }}
                >
                  Discover More
                </span>
                <h3 className="font-heading text-lg font-bold text-[var(--text)]">
                  Explore Other Gifting Collections
                </h3>
              </div>
              <Link href="/shop" className="text-xs font-semibold text-[var(--olive)] hover:underline flex items-center gap-1">
                View All <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {otherCategories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] hover:border-[var(--olive)]/50 transition-all text-center flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border)]">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text)] group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

