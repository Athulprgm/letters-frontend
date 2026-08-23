'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan,
  faBagShopping,
  faArrowRight,
  faArrowLeft,
  faGift,
  faTruckFast,
  faTag,
  faCheck,
  faPercent,
  faShieldHalved,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCartStore } from '@/src/store/cartStore';
import { useOrderStore } from '@/src/store/orderStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { confirmDialog } from '@/src/store/confirmStore';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, getSubtotal, addToCart } = useCartStore();
  const { createOrder } = useOrderStore();
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = getSubtotal();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'LETTERS10') {
      const discount = Math.round(subtotal * 0.10);
      setAppliedCoupon({ code, discount, label: '10% Welcome Discount' });
      setCouponCode('');
    } else if (code === 'FESTIVE15') {
      const discount = Math.round(subtotal * 0.15);
      setAppliedCoupon({ code, discount, label: '15% Festive Privilege' });
      setCouponCode('');
    } else {
      setCouponError('Invalid promo code. Try LETTERS10 or FESTIVE15');
    }
  };

  const handleRemoveItem = async (cartItemId, name) => {
    const isConfirmed = await confirmDialog({
      title: 'Remove Item',
      message: `Are you sure you want to remove "${name || 'this item'}" from your gifting bag?`,
      confirmText: 'Remove',
      cancelText: 'Keep Item',
      type: 'danger',
    });
    if (isConfirmed) {
      removeFromCart(cartItemId);
    }
  };

  const showPrices = settings.showPricesGlobally !== false;
  const inquiryLabel = settings.priceInquiryLabel || 'Price on Request';

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedShipping = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? estimatedShipping : 0));

  const handleWhatsAppQuickCart = async () => {
    if (items.length === 0) return;

    let itemsText = '';
    let customSummary = '';
    items.forEach((item, index) => {
      const priceStr = showPrices ? ` — ₹${item.price * item.quantity}` : '';
      itemsText += `${index + 1}. ${item.name} × ${item.quantity}${priceStr}\n`;
      if (item.customization?.recipientName || item.customization?.personalizedMessage) {
        const line = `• ${item.name}: For ${item.customization.recipientName || 'Recipient'}${item.customization.personalizedMessage ? ` (Msg: "${item.customization.personalizedMessage}")` : ''}\n`;
        itemsText += `   ↳ For: ${item.customization.recipientName || 'N/A'}${item.customization.personalizedMessage ? ` | Msg: "${item.customization.personalizedMessage}"` : ''}\n`;
        customSummary += line;
      }
    });

    const newOrder = await createOrder({
      customerName: 'WhatsApp Cart Patron',
      phone: '',
      whatsappNumber: '',
      address: 'Express WhatsApp Checkout',
      pincode: '',
      deliveryDate: 'Standard Delivery',
      occasion: 'Special Occasion',
      items: items,
      subtotal: subtotal,
      total: finalTotal,
      customization: customSummary.trim() || 'Standard Atelier Gift Packaging',
      specialInstructions: appliedCoupon ? `Applied Coupon: ${appliedCoupon.code} (-₹${discountAmount})` : 'Cart WhatsApp Order',
    });

    const totalText = showPrices ? `*Subtotal:* ₹${subtotal}\n${appliedCoupon ? `*Discount (${appliedCoupon.code}):* -₹${discountAmount}\n` : ''}*Estimated Total:* ₹${finalTotal}` : `*Pricing:* ${inquiryLabel} / Custom Quote`;

    const message = `*${settings.orderMessagePrefix || 'Bag Inquiry — LETTERS'}*
Order Reference: #${newOrder.id}
✦ *SHOPPING CART INQUIRY* ✦

*Cart Items:*
${itemsText}
${totalText}

Hello LETTERS Concierge, please share custom quote and confirmation for these items in my gifting bag!`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[var(--bg)]">
        <div className="w-20 h-20 bg-[var(--card)] rounded-2xl border border-[var(--border)] flex items-center justify-center mb-6 shadow-xs">
          <FontAwesomeIcon icon={faBagShopping} className="text-3xl text-[var(--olive)]" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[var(--text)] mb-2">Your Gifting Bag is Empty</h2>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-8 leading-relaxed">
          Looks like you haven't added any luxury hampers or gifts to your cart yet. Explore our latest curations!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="gold-btn px-8 py-3.5 text-xs font-semibold">
            Explore All Gifts
          </Link>
          <Link href="/custom-gift" className="outline-btn px-6 py-3.5 text-xs font-semibold">
            Design Custom Hamper
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px' }}
            >
              Your Selection
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)]">
              Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-[var(--text-muted)] hover:text-rose-600 transition-colors flex items-center gap-1.5 font-medium cursor-pointer self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faTrashCan} className="text-xs" /> Clear Bag
          </button>
        </div>

        {/* Cart Dual Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {items.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
              >
                {/* Product Thumbnail & Basic Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span
                      className="block text-[var(--chandanam)] leading-tight"
                      style={{ fontFamily: "'Great Vibes', cursive", fontSize: '16px' }}
                    >
                      {item.category}
                    </span>
                    <h3 className="font-heading font-bold text-sm text-[var(--text)] line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs font-bold text-[var(--olive)] font-heading">
                      {showPrices ? `₹${item.price.toLocaleString()} each` : inquiryLabel}
                    </p>

                    {/* Customization Details */}
                    {(item.customization?.recipientName || item.customization?.personalizedMessage || item.customization?.specialInstructions) && (
                      <div className="mt-1.5 text-[10.5px] text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border)] space-y-0.5">
                        {item.customization.recipientName && (
                          <p><strong className="text-[var(--text)]">Recipient:</strong> {item.customization.recipientName}</p>
                        )}
                        {item.customization.personalizedMessage && (
                          <p className="italic">"{item.customization.personalizedMessage}"</p>
                        )}
                        {item.customization.specialInstructions && (
                          <p><strong className="text-[var(--text)]">Note:</strong> {item.customization.specialInstructions}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Modifiers & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                  
                  {/* Quantity Counter */}
                  <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold hover:bg-[var(--bg-subtle)] text-[var(--text)] transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[var(--text)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-xs font-bold hover:bg-[var(--bg-subtle)] text-[var(--text)] transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal for line item */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-heading text-sm sm:text-base font-bold text-[var(--text)]">
                      {showPrices ? `₹${(item.price * item.quantity).toLocaleString()}` : inquiryLabel}
                    </span>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={() => handleRemoveItem(item.cartItemId, item.name)}
                    className="text-[var(--text-muted)] hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--olive)] hover:text-[var(--olive-hover)] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Continue Exploring Gifts
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary & Checkout */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            
            {/* Promo Code Input Box */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
              <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTag} className="text-[var(--chandanam)] text-xs" />
                Apply Atelier Promo Code
              </span>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                  <div>
                    <span className="font-bold">{appliedCoupon.code}</span>
                    <span className="text-[10px] block opacity-80">{appliedCoupon.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-₹{discountAmount}</span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. LETTERS10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-warm text-xs py-2 flex-1"
                  />
                  <button
                    type="submit"
                    className="gold-btn px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[10.5px] text-red-600 mt-2 font-medium">{couponError}</p>
              )}
            </div>

            {/* Order Total Breakdown */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-4 shadow-xs">
              <div className="border-b border-[var(--border)] pb-3">
                <h2 className="font-heading text-lg font-bold text-[var(--text)]">Order Summary</h2>
                <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
                  {showPrices ? 'Verified price calculation' : 'Gifting bag curation summary'}
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>Bag Items</span>
                  <span className="font-semibold text-[var(--text)]">
                    {showPrices ? `₹${subtotal.toLocaleString()}` : `${items.reduce((s, i) => s + i.quantity, 0)} Items Selected`}
                  </span>
                </div>

                {showPrices && appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>Pan-India Shipping</span>
                  <span className="text-[var(--olive)] font-bold bg-[var(--olive)]/10 px-2 py-0.5 rounded text-[11px]">
                    Complimentary Express
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-[var(--text)] block">
                    {showPrices ? 'Estimated Total' : 'Pricing Status'}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {showPrices ? 'Inclusive of all taxes' : 'Handwritten card included'}
                  </span>
                </div>
                <span className="font-heading text-2xl font-bold text-[var(--text)]">
                  {showPrices ? `₹${finalTotal.toLocaleString()}` : inquiryLabel}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full gold-btn py-3.5 px-6 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Proceed to Secure Checkout</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </button>

                <button
                  onClick={handleWhatsAppQuickCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 text-xs font-semibold rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors cursor-pointer shadow-xs"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                  Instant WhatsApp Checkout
                </button>
              </div>

              <div className="text-[10px] text-center text-[var(--text-muted)] pt-3 border-t border-[var(--border)] flex items-center justify-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[var(--olive)] text-xs" />
                <span>Damage-free guarantee & WhatsApp photo preview</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

