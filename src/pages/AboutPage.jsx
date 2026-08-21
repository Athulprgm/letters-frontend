'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function AboutPage() {
  const { settings } = useSettingsStore();

  const milestones = [
    { year: '2020', title: 'The Genesis', desc: 'LETTERS was founded in Kerala with a mission to bring personalized, handcrafted elegance to celebratory gifting.' },
    { year: '2022', title: 'Curated Hampers', desc: 'Introduced luxury wooden and velvet hampers for engagements, weddings, and festive seasons.' },
    { year: '2024', title: 'Everlasting Bouquets', desc: 'Expanded into artistic chocolate bouquets, fresh preserved florals, and spiritual Ajwa gift sets.' },
    { year: '2026', title: 'WhatsApp Atelier', desc: 'Serving thousands of delighted patrons across India with personal concierge ordering.' },
  ];

  return (
    <div className="min-h-screen pt-10 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="max-w-3xl mb-16 pb-8 border-b border-[var(--border)]">
          <span
            className="block mb-2 text-[var(--chandanam)]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '28px', letterSpacing: '0.02em' }}
          >
            Heritage &amp; Story
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight tracking-tight mb-4">
            Making Moments Memorable Since {settings.establishedYear}
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            Welcome to {settings.brandName} — an artisan gifting atelier dedicated to the craft of connection, thoughtfulness, and lifelong memories.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight mb-2">
              A Gift is More Than an Object.
            </h2>
            <span
              className="block mb-4 text-[var(--accent-secondary)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(24px, 2.5vw, 32px)', letterSpacing: '0.02em' }}
            >
              It is a Letter Written to the Heart.
            </span>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              When we started {settings.brandName} in {settings.establishedYear}, we noticed that commercial gifting had become impersonal. We wanted to restore the genuine joy of giving — where every ribbon is hand-tied, every chocolate is selected with care, and every note expresses real love.
            </p>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Today, {settings.brandName} creates signature hampers for engagements, weddings, corporate milestones, Islamic holidays, birthdays, and private celebrations across India.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/shop" className="gold-btn px-7 py-3.5 text-[11px] font-semibold tracking-[0.06em]">
                Browse Collection
              </Link>
              <Link href="/custom-gift" className="outline-btn px-6 py-3.5 text-[11px] font-semibold tracking-[0.06em]">
                Design Custom Hamper
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--bg-subtle)]">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80"
                  alt="LETTERS Gifting Atelier"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 sm:p-12 mb-16">
          <div className="mb-8 pb-4 border-b border-[var(--border)]">
            <span
              className="block text-[var(--chandanam)] mb-0.5"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px', letterSpacing: '0.02em' }}
            >
              Our Journey
            </span>
            <h3 className="font-heading text-xl font-bold text-[var(--text)]">From inception to cherished gifting partner</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {milestones.map((m, i) => (
              <div key={i} className="relative pl-5 border-l-2 border-[var(--border)] hover:border-[var(--olive)] transition-colors duration-300">
                <span className="font-heading text-xl font-bold text-[var(--olive)] block mb-1">{m.year}</span>
                <h4 className="font-semibold text-sm text-[var(--text)] mb-2">{m.title}</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10">
          <FontAwesomeIcon icon={faGift} className="text-[var(--chandanam)] mx-auto mb-4 text-2xl block" />
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
            Ready to Celebrate Someone Special?
          </h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
            Let us craft a bespoke hamper that expresses your heartfelt wishes with timeless elegance.
          </p>
          <Link
            href="/shop"
            className="gold-btn px-8 py-4 text-[11px] font-semibold tracking-[0.06em] inline-flex items-center gap-2"
          >
            <span>Explore Gifts</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>

      </div>
    </div>
  );
}
