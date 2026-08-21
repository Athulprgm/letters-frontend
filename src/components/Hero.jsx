'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '../store/settingsStore';
import { motion } from 'framer-motion';
import { DoodleSparkle, DoodleOliveBranch, DoodleSwirl, DoodleWavyUnderline } from './Doodles';

export default function Hero() {
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const handleWhatsApp = () => {
    const msg = `Hello ${settings.brandName}, I'd like to inquire about your bespoke gift hampers.`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <section className="relative min-h-[90vh] bg-[var(--bg)] overflow-hidden select-none">

      {/* Subtle corner doodles */}
      <div className="absolute top-10 left-8 text-[#C8A97E]/30 pointer-events-none hidden lg:block">
        <DoodleSparkle className="w-5 h-5" />
      </div>
      <div className="absolute bottom-24 left-16 text-[#3E5337]/20 pointer-events-none hidden lg:block" style={{ transform: 'rotate(-15deg)' }}>
        <DoodleOliveBranch className="w-10 h-10" />
      </div>
      <div className="absolute top-1/3 left-[36%] text-[#C8A97E]/25 pointer-events-none hidden xl:block">
        <DoodleSparkle className="w-3.5 h-3.5" />
      </div>

      {/* Full-bleed right image */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[60%] pointer-events-none">
        <Image
          src="/hero-bg.png"
          alt="LETTERS luxury gift hamper"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover object-[center_20%] lg:object-right select-none"
          style={{ filter: 'saturate(1.45) contrast(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6EE] via-[#FAF6EE]/80 lg:via-[#FAF6EE]/50 lg:to-[#FAF6EE]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF6EE] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 min-h-[90vh] flex items-center">
        <motion.div
          className="w-full lg:w-[46%] py-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Calligraphy eyebrow */}
          <div className="flex items-center gap-2.5 mb-6">
            <DoodleSwirl className="w-8 h-5 text-[#C8A97E]" />
            <span
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '22px', color: '#8A7060', letterSpacing: '0.02em' }}
            >
              Bespoke Gifting Studio
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-heading font-bold text-[2.6rem] sm:text-[3.4rem] lg:text-[3.9rem] text-[#1B2718] leading-[1.05] tracking-tight mb-3">
            Handcrafted
            <br />
            Gift Hampers
          </h1>
          {/* Calligraphy italic line */}
          <div className="mb-7 relative inline-block">
            <span
              className="text-[#3E5337]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '0.02em' }}
            >
              &amp; Bespoke Bouquets
            </span>
            <DoodleWavyUnderline className="absolute -bottom-2 left-0 w-full h-3 text-[#C8A97E]/60" />
          </div>

          {/* Body */}
          <p className="text-[#5C6B56] text-[14.5px] leading-[1.8] mb-9 max-w-[340px]">
            Made to order in Kerala, delivered across India. Bespoke hampers, handwritten keepsake notes, artisan chocolates &amp; botanical treats.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2E4029] text-[#FAF6EE] text-[11.5px] font-semibold tracking-[0.06em] hover:bg-[#1F2E1B] transition-colors shadow-sm active:scale-[0.98]"
            >
              Shop Hampers
              <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
            </Link>

            <Link
              href="/custom-gift"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[#2E4029] text-[11.5px] font-semibold tracking-[0.06em] border border-[#C8BCAA] hover:border-[#2E4029] transition-colors active:scale-[0.98]"
            >
              Custom Hamper
            </Link>

            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-4 py-3.5 text-[11.5px] font-medium text-[#3E5337] hover:text-[#1F2E1B] transition-colors"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] text-base" />
              WhatsApp
            </button>
          </div>

          {/* Trust strip */}
          <div className="border-t border-[#DDD4C4] pt-6 flex flex-wrap gap-x-7 gap-y-2">
            {['Artisan Curated', 'Live Photo Preview', 'Nationwide Delivery'].map((t) => (
              <span key={t} className="text-[10.5px] text-[#8A7A6A] font-medium flex items-center gap-1.5">
                <DoodleSparkle className="w-2.5 h-2.5 text-[#C8A97E]" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
