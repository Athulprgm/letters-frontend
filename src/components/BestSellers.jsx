'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useSettingsStore } from '../store/settingsStore';
import { DoodleSparkle } from './Doodles';

const bestSellers = [
  {
    id: 1,
    name: 'Artisanal Royal Chocolate Hamper',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    rating: '4.9',
    desc: 'Belgian truffles, dark chocolate bars & almond rochers in ivory keepsake box.',
  },
  {
    id: 2,
    name: 'Blush Velvet Rose Bouquet',
    price: '₹899',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    rating: '4.9',
    desc: 'Fresh preserved blush roses, baby breath, and silk ribbon with Korean wrap.',
  },
  {
    id: 3,
    name: 'Forever Together Engagement Hamper',
    price: '₹2,499',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    rating: '5.0',
    desc: 'Custom engraved champagne flutes, scented candles & gourmet treats.',
  },
];

export default function BestSellers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const handleQuickWhatsAppOrder = (product) => {
    const message = `Hello ${settings.brandName}, I'm interested in ordering this bestseller: *${product.name}* (${product.price}). Please share delivery details.`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <section id="bestsellers" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-300 border-t border-[var(--border)]/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <span
              className="block mb-1 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
            >
              Customer Favorites
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-[var(--text)] leading-tight tracking-tight">
              Cherished Best Sellers
            </h2>
          </div>
          <p className="max-w-md text-xs text-[var(--text-muted)] font-normal leading-relaxed">
            Our most highly praised creations. Click 'Quick WhatsApp Order' to instantly secure your piece with our studio curators.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative flex flex-col card-minimal overflow-hidden shadow-xs bg-[var(--card)] justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-semibold bg-white/90 backdrop-blur-md text-[var(--text)] px-3 py-1 rounded-full shadow-xs border border-[var(--border)]">
                  <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" /> {item.rating}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow justify-between gap-5">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200">
                      {item.name}
                    </h3>
                    <span className="font-heading text-base font-bold text-[var(--olive)] whitespace-nowrap">{item.price}</span>
                  </div>
                  <p className="text-[var(--text-muted)] text-[11.5px] leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                {/* Quick WhatsApp Order Button */}
                <button
                  onClick={() => handleQuickWhatsAppOrder(item)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[11px] font-semibold rounded-full bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)] active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="text-base text-[#25D366]" />
                  <span>Quick WhatsApp Order</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
