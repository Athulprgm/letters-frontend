'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useSettingsStore } from '../store/settingsStore';
import { DoodleHeart, DoodleSparkle } from './Doodles';

const reviews = [
  {
    id: 1,
    name: 'Dr. Zoya K.',
    location: 'Calicut, Kerala',
    occasion: 'Engagement Hamper',
    comment: 'The engagement hamper for my sister was magnificent! The custom engraved keepsake glasses and botanical fragrance stole everyone\'s attention. Thank you LETTERS!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Anand & Reshma',
    location: 'Kochi, Kerala',
    occasion: 'Anniversary Gift',
    comment: 'Ordering through WhatsApp was so effortless. They accommodated all my custom message card requests and delivered right on time.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Nikhil Varghese',
    location: 'Bangalore',
    occasion: 'Chocolate Bouquet',
    comment: 'The Ferrero Rocher bouquet was breathtaking. Far exceeded my expectations in terms of beauty, finish, and ribbon detailing.',
    rating: 5,
  },
];

export default function Testimonials() {
  const { settings } = useSettingsStore();

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg-subtle)] border-t border-[var(--border)]/40 transition-colors duration-200 relative overflow-hidden">

      {/* Doodle accent */}
      <div className="absolute top-8 right-12 text-[var(--maroon)]/10 pointer-events-none hidden lg:block">
        <DoodleHeart className="w-14 h-14" />
      </div>
      <div className="absolute bottom-10 left-10 text-[var(--chandanam)]/20 pointer-events-none hidden lg:block">
        <DoodleSparkle className="w-6 h-6" />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span
            className="block mb-2 text-[var(--maroon)]"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '28px', letterSpacing: '0.02em' }}
          >
            Heartfelt Patron Stories
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight mb-3">
            Loved Across India
          </h2>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed">
            Real stories from patrons who entrusted their celebrations to {settings.brandName} since {settings.establishedYear}.
          </p>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="p-7 flex flex-col justify-between bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:shadow-md transition-shadow duration-300"
            >
              <div>
                {/* Quote mark in Great Vibes */}
                <span
                  className="block text-[var(--chandanam)] opacity-50 leading-none mb-3 select-none"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '52px' }}
                >
                  "
                </span>

                <div className="flex gap-0.5 mb-4">
                  {[...Array(r.rating)].map((_, idx) => (
                    <FontAwesomeIcon key={idx} icon={faStar} className="text-xs text-amber-400" />
                  ))}
                </div>

                <p className="font-heading text-[14.5px] text-[var(--text)] italic leading-relaxed mb-6">
                  {r.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-xs text-[var(--text)]">{r.name}</h3>
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-[9px]" />
                  </div>
                  <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">{r.location}</p>
                </div>
                <span
                  className="text-[var(--chandanam)]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '13px' }}
                >
                  {r.occasion}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
