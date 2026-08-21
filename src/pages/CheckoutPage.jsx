'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCircleCheck,
  faCopy,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useCartStore } from '@/src/store/cartStore';
import { useOrderStore } from '@/src/store/orderStore';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { createOrder, generateWhatsAppMessage } = useOrderStore();
  const { getWhatsAppUrl } = useSettingsStore();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    whatsappNumber: '',
    address: '',
    pincode: '',
    deliveryDate: '',
    occasion: 'Birthday',
    customMessage: '',
    specialInstructions: '',
  });

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= 2000 ? 0 : 80;
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'phone' && sameAsPhone) {
        updated.whatsappNumber = value;
      }
      return updated;
    });
  };

  const handlePhoneToggle = (e) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setForm((prev) => ({ ...prev, whatsappNumber: prev.phone }));
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Please provide your Full Name.');
      return;
    }
    if (!form.phone.trim() || form.phone.trim().length < 8) {
      setError('Please enter a valid Mobile Number.');
      return;
    }
    if (!form.address.trim()) {
      setError('Please provide the Delivery Address.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty. Please add gifts before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      let customizationSummary = '';
      if (form.customMessage) {
        customizationSummary += `Card Message: "${form.customMessage}"\n`;
      }
      items.forEach((item) => {
        if (item.customization?.recipientName || item.customization?.personalizedMessage) {
          customizationSummary += `• ${item.name}: For ${item.customization.recipientName || 'Recipient'}${item.customization.personalizedMessage ? ` (Msg: "${item.customization.personalizedMessage}")` : ''}\n`;
        }
      });
      if (!customizationSummary) {
        customizationSummary = 'Standard LETTERS Keepsake Greeting Card';
      }

      const newOrder = await createOrder({
        customerName: form.fullName.trim(),
        phone: form.phone.trim(),
        whatsappNumber: (sameAsPhone ? form.phone : form.whatsappNumber).trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        deliveryDate: form.deliveryDate || 'Earliest Available',
        occasion: form.occasion,
        items: items,
        subtotal: subtotal,
        total: total,
        customization: customizationSummary.trim(),
        specialInstructions: form.specialInstructions.trim() || 'None',
      });

      setCreatedOrder(newOrder);

      const whatsappText = generateWhatsAppMessage(newOrder);
      const whatsappUrl = getWhatsAppUrl(whatsappText);
      window.open(whatsappUrl, '_blank');

      clearCart();
    } catch (err) {
      console.error('Order creation failed:', err);
      setError('Failed to process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Order Confirmation State
  if (createdOrder) {
    return (
      <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 sm:p-12 text-center shadow-xs">
            
            {/* Celebration Icon */}
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200">
              <FontAwesomeIcon icon={faCircleCheck} className="text-2xl" />
            </div>

            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px' }}
            >
              Order Placed Successfully
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
              Thank You, {createdOrder.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed mb-8">
              Your order has been recorded. We have opened WhatsApp so you can finalize and confirm delivery with our studio curators.
            </p>

            {/* Order ID Box */}
            <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 max-w-md mx-auto mb-8 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Order Reference ID
                </span>
                <p className="font-mono text-sm font-bold text-[var(--text)]">{createdOrder.id}</p>
              </div>
              <button
                onClick={copyOrderId}
                className="px-3 py-1.5 bg-[var(--card)] rounded-lg border border-[var(--border)] text-xs text-[var(--text)] hover:border-[var(--olive)] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                {copied ? <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" /> : <FontAwesomeIcon icon={faCopy} className="text-xs" />}
                <span className="text-[10px] font-semibold">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Order Summary Details */}
            <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-6 text-left max-w-xl mx-auto mb-8 space-y-3 text-xs">
              <h2 className="font-heading font-bold text-sm text-[var(--text)] border-b border-[var(--border)] pb-2">
                Order Summary
              </h2>
              
              <div className="space-y-1.5">
                {createdOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[var(--text)] text-xs">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm text-[var(--text)]">
                <span>Total:</span>
                <span className="font-heading text-base text-[var(--olive)]">₹{createdOrder.total}</span>
              </div>

              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1">
                <p><strong>Address:</strong> {createdOrder.address}, PIN {createdOrder.pincode}</p>
                <p><strong>Preferred Date:</strong> {createdOrder.deliveryDate}</p>
                <p><strong>Occasion:</strong> {createdOrder.occasion}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.open(getWhatsAppUrl(generateWhatsAppMessage(createdOrder)), '_blank')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-7 text-xs font-semibold rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors cursor-pointer shadow-xs"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-base" /> Open WhatsApp Chat Again
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto secondary-pill-btn py-3.5 px-7 text-xs font-semibold text-center"
              >
                Return to Storefront
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  return (
    <div className="min-h-screen pt-8 pb-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--olive)] hover:text-[var(--olive-hover)] transition-colors mb-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to Cart
          </Link>
          <span
            className="block mb-1 text-[var(--chandanam)]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px' }}
          >
            Almost There
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)]">
            Checkout & WhatsApp Ordering
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Complete your recipient and delivery details to create your order and initiate WhatsApp fulfillment.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3.5 text-xs rounded-xl mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleOrderSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Customer & Delivery Details Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Section 1: Contact Info */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 space-y-4 shadow-xs">
                <h2 className="font-heading text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--olive)] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Your Contact Information
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    className="input-warm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={sameAsPhone}
                      name="whatsappNumber"
                      placeholder="e.g. +91 98765 43210"
                      value={form.whatsappNumber}
                      onChange={handleChange}
                      className={`input-warm ${
                        sameAsPhone ? 'bg-[var(--bg-subtle)] opacity-70 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sameAsPhone"
                    checked={sameAsPhone}
                    onChange={handlePhoneToggle}
                    className="accent-[var(--olive)] cursor-pointer rounded"
                  />
                  <label htmlFor="sameAsPhone" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                    WhatsApp number is same as mobile number
                  </label>
                </div>
              </div>

              {/* Section 2: Address */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 space-y-4 shadow-xs">
                <h2 className="font-heading text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--olive)] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Delivery Address & Occasion
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Complete Delivery Address *
                  </label>
                  <textarea
                    rows={3}
                    required
                    name="address"
                    placeholder="House/Flat No, Street, Landmark, City"
                    value={form.address}
                    onChange={handleChange}
                    className="input-warm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      name="pincode"
                      placeholder="e.g. 682036"
                      value={form.pincode}
                      onChange={handleChange}
                      className="input-warm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={form.deliveryDate}
                      onChange={handleChange}
                      className="input-warm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Occasion / Celebration
                  </label>
                  <select
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                    className="input-warm cursor-pointer"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Engagement">Engagement / Wedding</option>
                    <option value="Festival">Festival Celebration</option>
                    <option value="Islamic Celebration">Islamic Celebration / Eid</option>
                    <option value="Congratulations">Congratulations</option>
                    <option value="Thank You">Thank You</option>
                    <option value="Other">Special Moment</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Message */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 space-y-4 shadow-xs">
                <h2 className="font-heading text-base font-bold text-[var(--text)] mb-2 flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
                  <span className="w-6 h-6 rounded-full bg-[var(--olive)] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Keepsake Card & Notes
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Custom Message for Card
                  </label>
                  <textarea
                    rows={2}
                    name="customMessage"
                    placeholder="Enter message to be handwritten on greeting card..."
                    value={form.customMessage}
                    onChange={handleChange}
                    className="input-warm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Special Delivery Instructions
                  </label>
                  <input
                    type="text"
                    name="specialInstructions"
                    placeholder="e.g. Surprise gift - do not reveal sender until delivered"
                    value={form.specialInstructions}
                    onChange={handleChange}
                    className="input-warm"
                  />
                </div>
              </div>

            </div>

            {/* Right: Order Breakdown & WhatsApp Place Order CTA */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 space-y-6 shadow-xs">
                
                <div className="border-b border-[var(--border)] pb-3">
                  <h2 className="font-heading text-lg font-bold text-[var(--text)]">Order Items ({items.length})</h2>
                  <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">LETTERS Atelier Catalog</p>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex items-center justify-between gap-3 text-xs border-b border-[var(--border)]/60 pb-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover flex-shrink-0 rounded-lg border border-[var(--border)]" />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-[var(--text)] truncate text-[11.5px]">{item.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[var(--text)] whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[var(--text)]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Delivery Packaging</span>
                    <span className="font-semibold text-[var(--text)]">
                      {deliveryCharge === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-[var(--text)]">Total Payable</span>
                  <span className="font-heading text-2xl font-bold text-[var(--text)]">
                    ₹{total.toLocaleString()}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 text-xs font-semibold rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                  {submitting ? 'Saving...' : 'Place Order & Open WhatsApp'}
                </button>

                <div className="text-[10px] text-center text-[var(--text-muted)] space-y-0.5 pt-1">
                  <p>✓ Order is saved in atelier database</p>
                  <p>✓ Opens WhatsApp with prefilled order details</p>
                </div>

              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
