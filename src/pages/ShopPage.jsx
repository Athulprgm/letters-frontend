'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faGift,
  faXmark,
  faSlidersH,
  faFilter,
  faRotateRight,
  faCheck,
  faThLarge,
  faTh,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { useProductStore } from '@/src/store/productStore';
import { useCategoryStore } from '@/src/store/categoryStore';
import ProductCard from '@/src/components/ProductCard';

export default function ShopPage() {
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [customizableOnly, setCustomizableOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3); // 3 or 4 columns on desktop

  const occasions = ['All', 'Birthday', 'Wedding & Engagement', 'Anniversary', 'Festive', 'Corporate'];

  const categoryList = useMemo(() => {
    return ['All', ...categories.filter((c) => c.enabled).map((c) => c.name)];
  }, [categories]);

  // Compute category counts for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts = { All: products.filter((p) => p.active).length };
    categories.forEach((cat) => {
      counts[cat.name] = products.filter(
        (p) => p.active && (p.category === cat.name || p.categorySlug === cat.slug)
      ).length;
    });
    return counts;
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.active) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (p.price > maxPrice) return false;
        if (inStockOnly && (!p.stock || p.stock <= 0)) return false;
        if (customizableOnly && !p.customizable) return false;
        if (selectedOccasion !== 'All') {
          const occ = selectedOccasion.toLowerCase();
          const matchDesc = (p.description || '').toLowerCase().includes(occ);
          const matchCat = (p.category || '').toLowerCase().includes(occ);
          const matchName = (p.name || '').toLowerCase().includes(occ);
          const matchTags = (p.tag || '').toLowerCase().includes(occ);
          if (!matchDesc && !matchCat && !matchName && !matchTags) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = (p.description || '').toLowerCase().includes(q);
          const matchesCat = (p.category || '').toLowerCase().includes(q);
          const matchesTag = (p.tag || '').toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat && !matchesTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy, maxPrice, selectedOccasion, inStockOnly, customizableOnly]);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery !== '' ||
    maxPrice < 5000 ||
    selectedOccasion !== 'All' ||
    inStockOnly ||
    customizableOnly;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMaxPrice(5000);
    setSelectedOccasion('All');
    setInStockOnly(false);
    setCustomizableOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen pt-8 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-[var(--border)] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
            >
              Atelier Curations
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] leading-tight tracking-tight mb-2">
              The Gifting Catalog
            </h1>
            <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-xl leading-relaxed">
              Explore handcrafted hampers, bespoke floral arrangements, chocolates, and personalized keepsakes made with love in Kerala.
            </p>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden gold-btn px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 self-start cursor-pointer shadow-xs"
          >
            <FontAwesomeIcon icon={faFilter} className="text-[11px]" />
            <span>Filters ({hasActiveFilters ? 'Active' : 'All'})</span>
          </button>
        </div>

        {/* E-Commerce Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
              
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-5">
                <span className="font-heading text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <FontAwesomeIcon icon={faSlidersH} className="text-xs text-[var(--olive)]" />
                  Filter Catalog
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-[var(--maroon)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className="text-[9px]" /> Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider block mb-2.5">
                  Categories
                </label>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {categoryList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-colors text-left cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[var(--olive)] text-white font-semibold shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        {categoryCounts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6 pt-5 border-t border-[var(--border)]">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-[var(--text)] uppercase tracking-wider text-[11px]">Max Budget</span>
                  <span className="font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                    ₹{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--olive)] cursor-pointer mb-3"
                />
                {/* Quick Budget Chips */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '< ₹1.5k', val: 1500 },
                    { label: '< ₹3k', val: 3000 },
                    { label: 'All', val: 5000 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => setMaxPrice(chip.val)}
                      className={`text-[10px] py-1 px-1 rounded-md border text-center font-medium cursor-pointer transition-colors ${
                        maxPrice === chip.val
                          ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div className="mb-6 pt-5 border-t border-[var(--border)]">
                <label className="text-[11px] font-bold text-[var(--text)] uppercase tracking-wider block mb-2.5">
                  Shop by Occasion
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {occasions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setSelectedOccasion(occ)}
                      className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        selectedOccasion === occ
                          ? 'bg-[var(--olive)] text-white border-[var(--olive)] font-medium'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--olive)]/40 bg-transparent'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-5 border-t border-[var(--border)] space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-[var(--text)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--olive)] cursor-pointer"
                  />
                  <span>In-Stock Ready Gifts</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[var(--text)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={customizableOnly}
                    onChange={(e) => setCustomizableOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--olive)] cursor-pointer"
                  />
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[var(--chandanam)] text-[10px]" />
                    Customizable Keepsakes
                  </span>
                </label>
              </div>

            </div>
          </aside>

          {/* RIGHT MAIN CATALOG AREA */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs"
                />
                <input
                  type="text"
                  placeholder="Search gifts, hampers, flowers, chocolates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-warm pl-10 pr-10 text-xs sm:text-sm py-2.5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                )}
              </div>

              {/* Controls: Sort & Grid View */}
              <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                <div className="flex-1 md:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-warm text-xs py-2.5 cursor-pointer"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="rating">Top Customer Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                {/* Grid Density Toggle (Desktop) */}
                <div className="hidden sm:flex items-center bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      gridCols === 3 ? 'bg-[var(--card)] text-[var(--olive)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                    title="3 Columns Grid"
                  >
                    <FontAwesomeIcon icon={faThLarge} />
                  </button>
                  <button
                    onClick={() => setGridCols(4)}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      gridCols === 4 ? 'bg-[var(--card)] text-[var(--olive)] shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                    title="4 Columns Grid"
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </button>
                </div>
              </div>

            </div>

            {/* Active Filter Chips & Counter */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)] px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  Showing <strong className="text-[var(--text)]">{filteredProducts.length}</strong>{' '}
                  {filteredProducts.length === 1 ? 'gift curation' : 'gift curations'}
                </span>

                {/* Filter Badges */}
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-[10.5px] px-2.5 py-0.5 rounded-full shadow-2xs">
                    Cat: {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                    </button>
                  </span>
                )}

                {selectedOccasion !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-[10.5px] px-2.5 py-0.5 rounded-full shadow-2xs">
                    Occasion: {selectedOccasion}
                    <button onClick={() => setSelectedOccasion('All')} className="hover:text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                    </button>
                  </span>
                )}

                {maxPrice < 5000 && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-[10.5px] px-2.5 py-0.5 rounded-full shadow-2xs">
                    Max: ₹{maxPrice}
                    <button onClick={() => setMaxPrice(5000)} className="hover:text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] text-[10.5px] px-2.5 py-0.5 rounded-full shadow-2xs">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-red-500 cursor-pointer">
                      <FontAwesomeIcon icon={faXmark} className="text-[9px]" />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[var(--maroon)] hover:underline font-semibold cursor-pointer text-xs"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-5 sm:gap-6`}
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                <FontAwesomeIcon icon={faGift} className="mx-auto text-[var(--chandanam)] mb-4 text-4xl opacity-50" />
                <h3 className="font-heading text-xl font-bold text-[var(--text)] mb-2">No Matching Gifts Found</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                  We couldn't find any hampers or gifts matching your current search and filter settings.
                </p>
                <button
                  onClick={resetFilters}
                  className="gold-btn px-6 py-3 text-xs font-semibold tracking-wide cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* MOBILE FILTER MODAL / DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end lg:hidden">
          <div className="bg-[var(--card)] w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <h3 className="font-heading text-lg font-bold text-[var(--text)]">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* Mobile Category List */}
              <div>
                <label className="text-xs font-bold text-[var(--text)] uppercase tracking-wider block mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {categoryList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-lg text-left ${
                        selectedCategory === cat
                          ? 'bg-[var(--olive)] text-white font-semibold'
                          : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px]">{categoryCounts[cat] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price Slider */}
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-[var(--text)]">Max Budget</span>
                  <span className="font-bold text-[var(--olive)]">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--olive)]"
                />
              </div>

              {/* Mobile Occasions */}
              <div className="pt-4 border-t border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--text)] uppercase tracking-wider block mb-2">
                  Occasion
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {occasions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setSelectedOccasion(occ)}
                      className={`text-[10.5px] px-2.5 py-1 rounded-full border ${
                        selectedOccasion === occ
                          ? 'bg-[var(--olive)] text-white border-[var(--olive)]'
                          : 'border-[var(--border)] text-[var(--text-muted)]'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border)] flex gap-3">
              <button
                onClick={resetFilters}
                className="outline-btn flex-1 py-3 text-xs font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="gold-btn flex-1 py-3 text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

