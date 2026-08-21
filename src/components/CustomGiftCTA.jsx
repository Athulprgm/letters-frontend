'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useSettingsStore } from '../store/settingsStore';
import { DoodleWavyUnderline, DoodleSparkle, DoodleGiftBox } from './Doodles';

const benefits = [
  'Handcrafted pinewood, velvet, or wicker packaging',
  'Curate artisan chocolates, florals & fragrances',
  'Personalized name engraving & keepsake note card',
  'Direct WhatsApp photo preview before dispatch',
];

export default function CustomGiftCTA() {
  const { settings } = useSettingsStore();

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] border-t border-[var(--border)]/40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-sm">

          {/* Doodle watermarks */}
          <div className="absolute top-6 right-8 text-[var(--chandanam)]/12 pointer-events-none hidden lg:block">
            <DoodleGiftBox className="w-20 h-20" />
          </div>
          <div className="absolute bottom-6 right-28 text-[var(--olive)]/10 pointer-events-none hidden lg:block">
            <DoodleSparkle className="w-6 h-6" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left */}
            <div className="lg:col-span-7 relative z-10">
              <span
                className="block mb-2 text-[var(--chandanam)]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
              >
                Bespoke Atelier Studio
              </span>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] leading-tight mb-2">
                Design Your Own
              </h2>
              <div className="relative inline-block mb-6">
                <span
                  className="text-[var(--olive)]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(28px, 3vw, 42px)', letterSpacing: '0.02em' }}
                >
                  Personalized Gift Hamper
                </span>
                <DoodleWavyUnderline className="absolute -bottom-1 left-0 w-full h-3 text-[#E5A04D]/50" />
              </div>

              <p className="text-[var(--text-muted)] text-[14px] leading-[1.8] mb-8 max-w-xl">
                Have a specific theme, celebration, or recipient in mind? Our gift specialists handcraft one-of-a-kind curations filled with heartfelt details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 text-[var(--olive)] text-[8px] mt-0.5">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <span className="text-[12.5px] text-[var(--text)] leading-snug">{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/custom-gift" className="gold-btn px-8 py-3.5 text-[11px] font-semibold tracking-[0.05em] flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faGift} className="text-xs" />
                  Open Hamper Studio
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>
                <Link href="/contact" className="secondary-pill-btn px-6 py-3.5 text-[11px] font-medium">
                  Speak with a Curator
                </Link>
              </div>
            </div>

            {/* Right image */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm bg-[var(--card)] p-1.5">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-subtle)] group">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
                    alt="Custom Gift Box Creation"
                    className="w-full h-full object-cover group-hover:scale-104 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="font-brand-calligraphy text-white/95 text-xl tracking-wide font-normal"
                      style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}
                    >
                      {settings.brandName && settings.brandName.toUpperCase() === 'LETTERS' ? 'Letters' : (settings.brandName || 'Letters')} · Est. {settings.establishedYear}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
