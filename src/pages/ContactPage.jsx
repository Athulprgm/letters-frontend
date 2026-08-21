'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faCircleCheck,
  faClock,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useSettingsStore } from '@/src/store/settingsStore';

const faqs = [
  {
    q: 'How does WhatsApp ordering work?',
    a: 'Select your preferred gift or build a custom hamper, fill out the delivery details, and click "Order on WhatsApp". Our system creates a saved order record and opens WhatsApp with your prefilled message to finalize delivery with our concierge.',
  },
  {
    q: 'Can I add personal photos to frames or hampers?',
    a: 'Yes. For photo frames and personalized memory boxes, you can send your photos directly to us on WhatsApp after placing the order, and we will print and mount them.',
  },
  {
    q: 'What is the delivery timeline?',
    a: 'Standard orders are dispatched within 24–48 hours. Express same-day or next-day delivery is available for select local regions. We recommend placing custom engagement and wedding hampers 3–5 days in advance.',
  },
  {
    q: 'What payment modes are accepted?',
    a: 'We accept UPI (GPay, PhonePe, Paytm), Bank Transfers, and Cash on Delivery for select verified delivery pin codes.',
  },
];

const contactItems = [
  { icon: faPhone, label: 'Call / WhatsApp', primary: null, secondary: '9:00 AM – 9:00 PM IST', key: 'phoneNumber' },
  { icon: faEnvelope, label: 'Email Us', secondary: 'Response within 24 hours', key: 'email' },
  { icon: faLocationDot, label: 'Studio Location', secondary: 'Kerala, India', key: 'address' },
];

export default function ContactPage() {
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    occasion: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const message = `*${settings.orderMessagePrefix || 'New Order — LETTERS'}*
✦ *STUDIO CONTACT INQUIRY* ✦

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email || 'N/A'}
Topic: ${form.occasion}

Message:
"${form.message}"`;

    setTimeout(() => {
      window.open(getWhatsAppUrl(message), '_blank');
    }, 400);
  };

  return (
    <div className="min-h-screen pt-10 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 pb-8 border-b border-[var(--border)]">
          <span
            className="block mb-2 text-[var(--chandanam)]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '28px', letterSpacing: '0.02em' }}
          >
            Studio Concierge
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight tracking-tight mb-4">
            Get in Touch with {settings.brandName}
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            Have questions about custom hampers, event gifting, or order status? We are always here to assist you warmly.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          
          {/* Left: Info Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-7 space-y-6">
              <h2 className="font-heading text-lg font-bold text-[var(--text)] pb-3 border-b border-[var(--border)]">Studio Details</h2>
              
              <div className="space-y-5">
                {[
                  { icon: faPhone, label: 'Call / WhatsApp', value: settings.phoneNumber, note: '9:00 AM – 9:00 PM IST' },
                  { icon: faEnvelope, label: 'Email Us', value: settings.email, note: 'Response within 24 hours' },
                  { icon: faLocationDot, label: 'Studio Location', value: settings.address, note: 'Kerala, India' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 text-[var(--olive)] text-xs mt-0.5">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">{item.label}</h3>
                      <p className="text-sm font-semibold text-[var(--text)] mt-0.5">{item.value}</p>
                      <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => window.open(getWhatsAppUrl(`Hello ${settings.brandName}, I would like to inquire about placing a gift order!`), '_blank')}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 text-[11px] font-semibold tracking-[0.05em] rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-base" /> Instant WhatsApp Chat
                </button>
              </div>
            </div>

            <div className="p-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] flex items-start gap-3">
              <FontAwesomeIcon icon={faClock} className="text-[var(--chandanam)] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Operating 7 days a week for festive and wedding seasons. Orders accepted online 24/7.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-7">
            <h2 className="font-heading text-xl font-bold text-[var(--text)] mb-1">Send an Inquiry</h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-7">
              Fill out your requirements and we'll open WhatsApp with your pre-formatted note.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-warm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="youremail@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Occasion</label>
                  <select
                    value={form.occasion}
                    onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                    className="input-warm cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Custom Engagement Hamper">Custom Engagement Hamper</option>
                    <option value="Wedding Bulk Favors">Wedding Bulk Favors</option>
                    <option value="Birthday Surprise Box">Birthday Surprise Box</option>
                    <option value="Corporate Gifting">Corporate Gifting</option>
                    <option value="Flower / Chocolate Bouquet">Flower / Chocolate Bouquet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Message / Custom Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the gift you have in mind, required delivery date, recipient details..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-warm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full gold-btn py-4 px-6 text-[11px] font-semibold tracking-[0.06em] flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                <span>Send via WhatsApp</span>
              </button>

              {submitted && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-xs" /> Opening WhatsApp with your inquiry...
                </div>
              )}
            </form>
          </div>

        </div>

        {/* FAQs */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-[var(--text)] mb-2">Frequently Asked Questions</h2>
          <p className="text-xs text-[var(--text-muted)] mb-8">Everything you need to know about our gifting process</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-[var(--border)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left bg-[var(--bg)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-sm text-[var(--text)]">{faq.q}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-[10px] text-[var(--text-muted)] flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg)]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
