'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faWandMagicSparkles,
  faAward,
  faShieldHalved,
  faArrowRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { useSettingsStore } from '../store/settingsStore';

export default function About() {
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const values = [
    {
      icon: faHeart,
      title: 'Emotive Artistry',
      desc: 'Gifts are tangible expressions of affection, gratitude, and lasting remembrance.',
      tag: 'Heartfelt',
    },
    {
      icon: faWandMagicSparkles,
      title: 'Artisanal Quality',
      desc: 'Hand-selected gourmet confections, preserved blooms, and bespoke keepsakes.',
      tag: 'Handcrafted',
    },
    {
      icon: faAward,
      title: 'Established 2020',
      desc: 'Half a decade of trusted gifting for weddings, festivals & family milestones.',
      tag: '5+ Years',
    },
    {
      icon: faShieldHalved,
      title: 'Personalized Touch',
      desc: 'Every order comes with handwritten notes, wax seals, and direct WhatsApp care.',
      tag: 'Made to Order',
    },
  ];

  const handleWhatsAppConsult = () => {
    const msg = `Hello ${settings.brandName || 'LETTERS'}, I would like to consult with your gifting curators about a custom curation!`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <section id="about" className="py-24 lg:py-32 px-6 sm:px-8 lg:px-12 bg-[var(--bg)] border-t border-[var(--border)] transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Creative Visual Composition */}
          <div className="lg:col-span-5 relative">
            {/* Main Luxury Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] bg-white p-2.5 shadow-sm">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--bg-subtle)] group">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85"
                  alt="LETTERS Gifting Atelier"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
                />
                
                {/* Soft gradient overlay for subtle contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[var(--border)]/80 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--chandanam)] block">
                      Kerala Atelier
                    </span>
                    <p className="font-heading text-lg text-[var(--text)] font-normal">
                      {settings.brandName || 'Letters'} Gifting Studio
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] font-normal">
                      "Making your moments unforgettable"
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--olive)] shadow-2xs">
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs text-[var(--olive)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Floating Badge */}
            <div className="absolute -top-4 -right-4 sm:-right-5 bg-[var(--card)] px-4 py-2.5 rounded-2xl border border-[var(--border)] shadow-md flex items-center gap-2.5 z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--olive)] animate-pulse" />
              <div className="text-left font-sans-ui">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text)]">100% Artisan Handcrafted</p>
                <p className="text-[9px] text-[var(--text-muted)]">Made to order with love</p>
              </div>
            </div>
          </div>

          {/* Right Editorial Story & Value Grid */}
          <div className="lg:col-span-7 space-y-7 text-left font-sans-ui">
            
            {/* Header */}
            <div>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--chandanam)] block mb-3 font-sans-ui">
                Our Brand Philosophy
              </span>

              <h2 className="font-heading text-4xl sm:text-5xl lg:text-[3.2rem] text-[var(--text)] leading-[1.12] tracking-tight font-normal">
                Thoughtful Gifting, <br />
                <span className="italic font-normal text-[var(--olive)]">
                  Crafted with Heart &amp; Intention
                </span>
              </h2>
            </div>

            <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Based in Kerala, LETTERS is a boutique bespoke gifting atelier founded with a passion for transforming heartfelt gestures into extraordinary sensorial experiences. From handwritten keepsake notes to curated artisanal delicacies, every creation is crafted to linger in memory.
            </p>

            {/* 4 Creative Value Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {values.map((v, idx) => (
                <div
                  key={idx}
                  className="group p-4 rounded-2xl bg-white border border-[var(--border)] hover:border-[var(--olive)]/50 transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]/70 flex items-center justify-center text-[var(--olive)] text-xs flex-shrink-0 group-hover:scale-105 group-hover:bg-[var(--olive)] group-hover:text-white transition-all">
                      <FontAwesomeIcon icon={v.icon} />
                    </div>
                    <span className="text-[9.5px] font-semibold text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                      {v.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--olive)] transition-colors mb-1">
                      {v.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-[var(--border)]/60">
              <button
                onClick={handleWhatsAppConsult}
                className="gold-btn px-7 py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                <span>Speak with Our Curators</span>
              </button>

              <Link
                href="/about"
                className="outline-btn px-6 py-3.5 text-xs font-semibold tracking-wide"
              >
                <span>Read Full Story</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
