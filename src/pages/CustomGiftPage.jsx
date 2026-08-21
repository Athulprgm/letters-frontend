'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWandMagicSparkles,
  faCheck,
  faBagShopping,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/store/cartStore';
import { useSettingsStore } from '@/src/store/settingsStore';

const hamperBases = [];
const availableItems = [];

function StepNumber({ n }) {
  return (
    <span className="w-7 h-7 rounded-full bg-[var(--olive)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </span>
  );
}

export default function CustomGiftPage() {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('Birthday');
  const [messageCard, setMessageCard] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const toggleItem = (item) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totalAmount = (selectedBase?.price || 0) + selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleAddToCart = () => {
    const customProduct = {
      id: `custom-hamper-${selectedBase.id}-${selectedItems.map((i) => i.id).join('-')}`,
      name: `Custom Curated Gift Hamper (${selectedBase.name})`,
      slug: 'custom-gift-hamper',
      price: totalAmount,
      image: selectedBase.image,
      category: 'Customized Gift',
    };
    addToCart(customProduct, 1, {
      recipientName,
      occasion,
      personalizedMessage: messageCard,
      specialInstructions: `Base: ${selectedBase.name} | Items: ${selectedItems.map((i) => i.name).join(', ')} | Notes: ${specialNotes}`,
    });
    router.push('/cart');
  };

  const handleWhatsAppOrder = () => {
    const itemsList = selectedItems.map((i, idx) => `  ${idx + 1}. ${i.name} (₹${i.price})`).join('\n');
    const message = `*${settings.orderMessagePrefix || 'New Order — LETTERS'}*
✦ *CUSTOM GIFT HAMPER INQUIRY* ✦

*Base Packaging:*
• ${selectedBase.name} (₹${selectedBase.price})

*Selected Items:*
${itemsList || '  None'}

*Occasion:* ${occasion}
*Recipient Name:* ${recipientName || 'Not specified'}

*Message for Card:*
"${messageCard || 'None'}"

*Special Notes / Requests:*
${specialNotes || 'None'}

*Calculated Total:* ₹${totalAmount}

Please review my custom configuration and confirm delivery timeline.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="min-h-screen pt-10 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 pb-7 border-b border-[var(--border)]">
          <span
            className="block mb-2 text-[var(--chandanam)]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
          >
            Bespoke Custom Studio
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight tracking-tight mb-3">
            Build Your Custom Gift
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            Craft a one-of-a-kind hamper tailored to your recipient. Pick the packaging, curate the contents, write your message, and order via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {hamperBases.length === 0 ? (
            <div className="lg:col-span-12 text-center py-20 bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-sm">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-4xl text-[var(--chandanam)] mb-4" />
              <h3 className="font-heading text-2xl font-bold text-[var(--text)] mb-2">Our Custom Studio is Being Upgraded</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mb-6">We are currently adding new bespoke options. Please check back soon or contact us on WhatsApp to curate a personalized gift.</p>
              <button onClick={() => window.open(getWhatsAppUrl('Hello LETTERS, I want to create a custom hamper!'), '_blank')} className="gold-btn px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider">
                Contact on WhatsApp
              </button>
            </div>
          ) : (
            <>
              {/* Configurator Steps */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Step 1: Base */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-7">
              <div className="flex items-center gap-3 mb-6">
                <StepNumber n={1} />
                <div>
                  <h2 className="font-heading text-lg font-bold text-[var(--text)]">Select Hamper Packaging</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {hamperBases.map((base) => (
                  <div
                    key={base.id}
                    onClick={() => setSelectedBase(base)}
                    className={`cursor-pointer rounded-xl border-2 p-1.5 transition-all ${
                      selectedBase.id === base.id
                        ? 'border-[var(--olive)] bg-[var(--bg-subtle)]'
                        : 'border-[var(--border)] hover:border-[var(--border-dark)]/50 bg-[var(--card)]'
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-lg mb-3 bg-[var(--bg)]">
                      <img src={base.image} alt={base.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-1 pb-1">
                      <h3 className="font-semibold text-sm text-[var(--text)] mb-0.5">{base.name}</h3>
                      <p className="text-[10.5px] text-[var(--text-muted)] mb-2">{base.desc}</p>
                      <span className="text-sm font-bold text-[var(--olive)] font-heading">₹{base.price}</span>
                    </div>
                    {selectedBase.id === base.id && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--olive)] px-1">
                        <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Items */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-7">
              <div className="flex items-center gap-3 mb-6">
                <StepNumber n={2} />
                <div>
                  <h2 className="font-heading text-lg font-bold text-[var(--text)]">
                    Curate Items & Keepsakes
                    <span className="ml-2 text-xs font-medium text-[var(--text-muted)]">({selectedItems.length} selected)</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableItems.map((item) => {
                  const isSelected = !!selectedItems.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      className={`cursor-pointer rounded-xl border px-4 py-3 transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[var(--olive)] bg-[var(--bg-subtle)]'
                          : 'border-[var(--border)] hover:border-[var(--border-dark)]/40 bg-[var(--card)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                            isSelected ? 'bg-[var(--olive)] border-[var(--olive)] text-white' : 'border-[var(--border-dark)]/40'
                          }`}
                        >
                          {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[8px]" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">{item.name}</p>
                          <span className="text-[9px] text-[var(--chandanam)] font-semibold">{item.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[var(--text)] whitespace-nowrap">₹{item.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Personalization */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-7 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <StepNumber n={3} />
                <h2 className="font-heading text-lg font-bold text-[var(--text)]">Personalization Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria / Sister / Dr. John"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="input-warm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="input-warm cursor-pointer"
                  >
                    <option value="Birthday">Birthday Celebration</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Engagement">Engagement / Wedding</option>
                    <option value="Festival">Festive Celebration</option>
                    <option value="Islamic Celebration">Islamic Celebration / Eid</option>
                    <option value="Congratulations">Congratulations</option>
                    <option value="Thank You">Thank You</option>
                    <option value="Just Because">Just Because</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Heartfelt Card Message</label>
                <textarea
                  rows={3}
                  placeholder="Write the message you want us to handwrite on the gold-foil greeting card..."
                  value={messageCard}
                  onChange={(e) => setMessageCard(e.target.value)}
                  className="input-warm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">Special Notes / Custom Requirements</label>
                <input
                  type="text"
                  placeholder="Any specific requests? (e.g. ribbon color preference, eggless items)"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="input-warm"
                />
              </div>
            </div>

          </div>

          {/* Right: Live Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-5 shadow-sm">
              
              <div className="pb-3 border-b border-[var(--border)]">
                <h2 className="font-heading text-lg font-bold text-[var(--text)]">Hamper Summary</h2>
                <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">Live pricing breakdown</p>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[var(--text)]">
                  <span className="font-semibold truncate max-w-[180px]">{selectedBase.name}</span>
                  <span className="font-bold">₹{selectedBase.price}</span>
                </div>
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-[var(--text-muted)] text-[11px]">
                    <span className="truncate max-w-[180px]">· {item.name}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
                {selectedItems.length === 0 && (
                  <p className="text-[10.5px] text-[var(--chandanam)] font-semibold">No items selected yet</p>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-baseline">
                <span className="text-xs font-semibold text-[var(--text)]">Total</span>
                <span className="font-heading text-2xl font-bold text-[var(--text)]">₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 text-[11px] font-semibold tracking-[0.05em] rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-base" /> Order on WhatsApp
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full gold-btn py-3.5 px-4 text-[11px] font-semibold tracking-[0.05em] flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                  <span>Add to Cart</span>
                </button>
              </div>

              <p className="text-[9.5px] text-center text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                Our curator will confirm dispatch details over WhatsApp.
              </p>

            </div>
          </div>
          </>
        )}

        </div>

      </div>
    </div>
  );
}
