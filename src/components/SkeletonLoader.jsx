'use client';

import React from 'react';

/**
 * Reusable animated shimmer skeleton components matching LETTERS luxury branding.
 */

export function SkeletonShimmer({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-stone-200/80 dark:bg-stone-800/60 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 dark:before:via-white/10 before:to-transparent ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden p-3 sm:p-4 space-y-3 shadow-xs">
      {/* Product Image Skeleton */}
      <SkeletonShimmer className="w-full aspect-[4/5] rounded-xl" />

      {/* Category Subtitle */}
      <SkeletonShimmer className="w-1/3 h-3 rounded-md" />

      {/* Product Title */}
      <SkeletonShimmer className="w-4/5 h-4 rounded-md" />

      {/* Price & Action Row */}
      <div className="flex items-center justify-between pt-2">
        <SkeletonShimmer className="w-1/3 h-5 rounded-md" />
        <SkeletonShimmer className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`prod-skel-${i}`} />
      ))}
    </div>
  );
}

export function CategoryCircleSkeleton({ count = 6 }) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 overflow-x-auto py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`cat-circ-${i}`} className="flex flex-col items-center space-y-2 flex-shrink-0">
          <SkeletonShimmer className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[var(--border)]" />
          <SkeletonShimmer className="w-14 h-3 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function FeaturedCategoriesSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`cat-card-${i}`} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 overflow-hidden">
          <SkeletonShimmer className="w-full aspect-square rounded-xl" />
          <SkeletonShimmer className="w-2/3 h-4 rounded-md mx-auto" />
          <SkeletonShimmer className="w-1/2 h-3 rounded-md mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen pt-8 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Skeleton */}
        <SkeletonShimmer className="w-48 h-4 rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <SkeletonShimmer className="w-full aspect-square rounded-3xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonShimmer key={`thumb-${i}`} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-6 space-y-6">
            <SkeletonShimmer className="w-32 h-4 rounded-md" />
            <SkeletonShimmer className="w-3/4 h-8 rounded-lg" />
            <SkeletonShimmer className="w-40 h-7 rounded-md" />
            <SkeletonShimmer className="w-full h-24 rounded-2xl" />

            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
              <SkeletonShimmer className="w-full h-12 rounded-xl" />
              <SkeletonShimmer className="w-full h-12 rounded-xl" />
              <SkeletonShimmer className="w-full h-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FestivalSectionSkeleton() {
  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-12 bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto space-y-8">
        <SkeletonShimmer className="w-full h-64 sm:h-80 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={`fest-skel-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  Shimmer: SkeletonShimmer,
  ProductCard: ProductCardSkeleton,
  ProductGrid: ProductGridSkeleton,
  CategoryCircle: CategoryCircleSkeleton,
  FeaturedCategories: FeaturedCategoriesSkeleton,
  ProductDetail: ProductDetailSkeleton,
  FestivalSection: FestivalSectionSkeleton,
};
