'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { createOrder, generateWhatsAppMessage } = useOrderStore();
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const showPrices = settings.showPricesGlobally === true;
  const inquiryLabel = settings.priceInquiryLabel || 'Price on Request';

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
    const whatsappMessage = generateWhatsAppMessage(createdOrder);
    const whatsappUrl = getWhatsAppUrl(whatsappMessage);

    return (
      <div className="min-h-screen pt-10 pb-24 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Main Confirmation Card */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 sm:p-10 text-center shadow-lg relative overflow-hidden">
            
            {/* Top Celebration Glow */}
            <div className="w-16 h-16 bg-emerald-500/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#25D366]/30 shadow-inner animate-pulse">
              <FontAwesomeIcon icon={faCircleCheck} className="text-3xl" />
            </div>

            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '28px' }}
            >
              Order Recorded in Atelier
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2">
              Thank You, {createdOrder.customerName}!
            </h1>
            <p className="text-xs sm:text-[13px] text-[var(--text-muted)] max-w-md mx-auto leading-relaxed mb-6">
              Your gift order is registered in our database. Complete your order placement by sending the details to our WhatsApp atelier concierge.
            </p>

            {/* Prominent High-Priority WhatsApp Dispatch Box */}
            <div className="bg-gradient-to-br from-[#1E2E1D] via-[#142313] to-[#1E2E1D] text-[#FAF6EE] rounded-2xl p-6 mb-6 border-2 border-[#25D366]/50 shadow-xl text-left relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest bg-[#25D366] text-black px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-xs" />
                  <span>Step 2: Send on WhatsApp</span>
                </span>
                <span className="text-[11px] text-[#25D366] font-mono font-bold">
                  Ref: #{createdOrder.id}
                </span>
              </div>

              <h3 className="font-heading text-base sm:text-lg font-bold text-[#FFFCF5] mb-1">
                Send Order to LETTERS WhatsApp Atelier
              </h3>
              <p className="text-xs text-[#FAF6EE]/80 mb-5 leading-relaxed">
                Click below to open WhatsApp with your pre-filled order details to confirm customization, packing, and dispatch schedule.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 text-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                  <span>Send Order on WhatsApp Now</span>
                </a>

                <button
                  type="button"
                  onClick={copyOrderId}
                  className="w-full sm:w-auto py-3 px-4 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#FAF6EE] border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-[#25D366]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCopy} />
                      <span>Copy Ref ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Reference Box */}
            <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4 max-w-xl mx-auto mb-6 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Order Reference ID
                </span>
                <p className="font-mono text-sm font-bold text-[var(--text)]">#{createdOrder.id}</p>
              </div>
              <div className="text-right text-[11px] text-[var(--text-muted)]">
                <span>Atelier Concierge: </span>
                <strong className="text-[var(--text)]">{settings.phoneNumber || '+91 75590 85513'}</strong>
              </div>
            </div>

            {/* Order Summary Details */}
            <div className="bg-[var(--bg)] rounded-2xl border border-[var(--border)] p-6 text-left max-w-xl mx-auto mb-6 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <h2 className="font-heading font-bold text-sm text-[var(--text)]">
                  Order Summary ({createdOrder.items.length} items)
                </h2>
                <span className="text-[10.5px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  Ready for Dispatch
                </span>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {createdOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[var(--text)] text-xs py-1 border-b border-[var(--border)]/40 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium truncate max-w-[240px]">{item.name} × {item.quantity}</span>
                    </div>
                    {showPrices ? (
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[var(--olive)]">{inquiryLabel}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex justify-between font-bold text-sm text-[var(--text)]">
                <span>{showPrices ? 'Total Payable:' : 'Pricing Status:'}</span>
                <span className="font-heading text-base text-[var(--olive)]">
                  {showPrices ? `₹${createdOrder.total}` : inquiryLabel}
                </span>
              </div>

              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1">
                <p><strong>Customer:</strong> {createdOrder.customerName} ({createdOrder.phone})</p>
                <p><strong>Address:</strong> {createdOrder.address}{createdOrder.pincode ? `, PIN: ${createdOrder.pincode}` : ''}</p>
                <p><strong>Preferred Delivery:</strong> {createdOrder.deliveryDate}</p>
                <p><strong>Occasion:</strong> {createdOrder.occasion}</p>
              </div>
            </div>

            {/* WhatsApp Message Preview Box */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 text-left max-w-xl mx-auto mb-6">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] font-bold text-[var(--text)] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" />
                  <span>WhatsApp Message Preview</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(whatsappMessage);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[10.5px] font-semibold text-[var(--olive)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCopy} />
                  <span>{copied ? 'Copied Text' : 'Copy Message'}</span>
                </button>
              </div>
              <pre className="text-[10.5px] text-[var(--text-muted)] whitespace-pre-wrap font-sans bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] max-h-36 overflow-y-auto leading-relaxed">
                {whatsappMessage}
              </pre>
            </div>

            {/* Actions Bottom Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 text-xs font-bold rounded-full bg-[#25D366] text-black hover:bg-[#1EBE5D] transition-all cursor-pointer shadow-md active:scale-95"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                <span>Open WhatsApp Chat Again</span>
              </a>

              <Link
                href="/shop"
                className="w-full sm:w-auto secondary-pill-btn py-3.5 px-7 text-xs font-semibold text-center"
              >
                Browse More Curations
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
                        {showPrices ? `₹${(item.price * item.quantity).toLocaleString()}` : inquiryLabel}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{showPrices ? 'Items Subtotal' : 'Selected Items'}</span>
                    <span className="font-semibold text-[var(--text)]">
                      {showPrices ? `₹${subtotal.toLocaleString()}` : `${items.reduce((s, i) => s + i.quantity, 0)} Items`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Delivery Packaging</span>
                    <span className="font-semibold text-emerald-600">
                      Complimentary Express
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {showPrices ? 'Total Payable' : 'Pricing Status'}
                  </span>
                  <span className="font-heading text-xl sm:text-2xl font-bold text-[var(--text)]">
                    {showPrices ? `₹${total.toLocaleString()}` : inquiryLabel}
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
