'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useSettingsStore } from '../store/settingsStore';

const igPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', span: 'md:col-span-2 md:row-span-2', likes: '1.8k' },
  { id: 2, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80', span: '', likes: '940' },
  { id: 3, image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80', span: '', likes: '1.2k' },
  { id: 4, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', span: '', likes: '820' },
  { id: 5, image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=800&q=80', span: '', likes: '1.1k' },
];

export default function InstagramGallery() {
  const { settings } = useSettingsStore();

  return (
    <section id="instagram" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] border-t border-[var(--border)]/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="block mb-1.5 text-[var(--chandanam)]"
              style={{ fontFamily: "'Great Vibes', cursive", fontSize: '22px', letterSpacing: '0.02em' }}
            >
              @LettersGifting
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-[var(--text)] leading-tight">
              Moments from Our Atelier
            </h2>
          </div>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors group"
          >
            <FontAwesomeIcon icon={faInstagram} className="text-sm" />
            <span>Follow on Instagram</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[220px]">
          {igPosts.map((post) => (
            <div
              key={post.id}
              className={`group relative overflow-hidden rounded-xl bg-[var(--card)] border border-[var(--border)] ${post.span}`}
            >
              <img
                src={post.image}
                alt="LETTERS Atelier Creation"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-white font-semibold text-xs rounded-xl">
                <FontAwesomeIcon icon={faInstagram} className="text-sm" /> {post.likes}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
