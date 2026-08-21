'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useProductStore } from '../store/productStore';
import ProductCard from './ProductCard';
import { DoodleStarburst } from './Doodles';

export default function FeaturedProducts() {
  const { products } = useProductStore();
  const [activeTab, setActiveTab] = useState('All');

  const filterTabs = ['All', 'Signature Hampers', 'Bouquets & Florals', 'Bespoke Keepsakes'];

  const activeProducts = products.filter((p) => p.active);
  if (activeProducts.length === 0) {
    return null;
  }

  const filteredProducts = products
    .filter((p) => {
      if (!p.active) return false;
      if (activeTab === 'All') return true;
      if (activeTab === 'Signature Hampers')
        return p.category.toLowerCase().includes('hamper') || p.category.toLowerCase().includes('engagement') || p.category.toLowerCase().includes('chocolate');
      if (activeTab === 'Bouquets & Florals')
        return p.category.toLowerCase().includes('bouquet') || p.category.toLowerCase().includes('flower');
      if (activeTab === 'Bespoke Keepsakes')
        return p.category.toLowerCase().includes('frame') || p.category.toLowerCase().includes('prayer') || p.customizable;
      return true;
    })
    .slice(0, 8);

  return (
    <section id="featured" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg-subtle)] border-t border-[var(--border)]/40 transition-colors duration-300 relative overflow-hidden">

      {/* Background starburst */}
      <div className="absolute -bottom-4 right-8 text-[var(--chandanam)]/10 pointer-events-none hidden lg:block">
        <DoodleStarburst className="w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
            >
              Most Cherished Curations
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight tracking-tight">
              Curated with Care
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10.5px] px-4 py-2 rounded-full transition-all duration-200 font-semibold cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[var(--text)] text-[var(--bg)]'
                    : 'text-[var(--text-muted)] bg-[var(--card)] border border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/shop"
            className="gold-btn px-9 py-4 text-[11px] font-semibold tracking-[0.06em] inline-flex items-center gap-3 shadow-md"
          >
            <span>Explore Full Catalog</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
