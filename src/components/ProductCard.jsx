'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBagShopping,
  faEye,
  faCheck,
  faWandMagicSparkles,
  faStar,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';

export default function ProductCard({ product, index = 0 }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { getWhatsAppUrl } = useSettingsStore();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Generate consistent rating and review count based on product ID
  const rating = product.rating || 4.9;
  const reviewCount = product.reviewsCount || (14 + ((product.id?.charCodeAt?.(0) || 5) % 35));

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  const handleWhatsAppOrder = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const priceDisplay = product.showPrice === false ? 'Price on Request' : `₹${product.price}`;
    const message = `*New Order Inquiry — LETTERS*\nItem: ${product.name}\nCategory: ${product.category}\nPrice: ${priceDisplay}\nProduct Link: ${origin}/product/${product.slug}\n\nHello LETTERS team, I would like to inquire and order this item directly via WhatsApp. Please guide me with pricing, customization, and delivery details.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <article className="card-minimal flex flex-col justify-between h-full group bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[var(--olive)]/30">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.showPrice !== false && discountPercent > 0 && (
            <span className="text-[10px] font-bold bg-[var(--maroon)] text-white px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.tag && (
            <span className="text-[9.5px] font-semibold bg-white/95 backdrop-blur-md text-[var(--text)] px-2.5 py-0.5 rounded-full border border-[var(--border)] shadow-xs capitalize">
              {product.tag.toLowerCase()}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-20 cursor-pointer shadow-xs ${
            wishlisted
              ? 'bg-white text-[var(--maroon)] shadow-sm'
              : 'bg-white/85 backdrop-blur-md text-[var(--text-muted)] hover:text-[var(--maroon)] hover:bg-white'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <FontAwesomeIcon icon={wishlisted ? faHeart : faHeartRegular} className="text-xs" />
        </button>

        {/* Custom Ribbon */}
        {product.customizable && (
          <span className="absolute bottom-3 left-3 text-[9.5px] font-medium bg-white/90 backdrop-blur-md text-[var(--olive)] px-2 py-0.5 rounded-full border border-[var(--border)] flex items-center gap-1 shadow-xs z-10 pointer-events-none">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[var(--chandanam)] text-[8px]" />
            <span>Custom Card</span>
          </span>
        )}

        {/* Quick View Button */}
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20 backdrop-blur-[2px]"
        >
          <span className="bg-white/95 backdrop-blur-md text-[var(--text)] px-4 py-2 rounded-full text-[11px] font-semibold tracking-wide shadow-md flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <FontAwesomeIcon icon={faEye} className="text-[10px] text-[var(--olive)]" /> View Details
          </span>
        </Link>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between gap-3 bg-[var(--card)]">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="text-[var(--chandanam)] font-medium text-xs truncate"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '16px' }}
            >
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-[var(--chandanam-dark)] font-semibold">
              <FontAwesomeIcon icon={faStar} className="text-[9px] text-[var(--chandanam)]" />
              <span>{rating}</span>
              <span className="text-[var(--text-muted)] font-normal">({reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-[var(--accent)] transition-colors duration-200">
            <h3 className="font-heading text-[0.95rem] font-bold text-[var(--text)] leading-snug line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-[11.5px] text-[var(--text-muted)] line-clamp-2 leading-relaxed font-normal mb-2">
            {product.description}
          </p>

          {/* Price & Stock Badge */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]/60">
            {product.showPrice !== false ? (
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-base sm:text-lg font-bold text-[var(--text)]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[11px] text-[var(--text-muted)] line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[var(--olive)]">
                  Price on Request
                </span>
              </div>
            )}

            <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              In Stock
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Bag & WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-xs active:scale-95 ${
              added
                ? 'bg-emerald-700 text-white'
                : 'bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)]'
            }`}
          >
            {added ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                <span>Added</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                <span>Add to Bag</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-2.5 px-3 rounded-full text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 bg-[#25D366]/10 text-[#1E8A42] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white transition-all duration-200 cursor-pointer active:scale-95"
            title="Order directly on WhatsApp"
          >
            <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
            <span>Order</span>
          </button>
        </div>
      </div>
    </article>
  );
}
