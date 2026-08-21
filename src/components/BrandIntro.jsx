'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faStar, faScissors } from '@fortawesome/free-solid-svg-icons';

const features = [
  {
    icon: faHeart,
    title: 'Crafted with Love',
    desc: 'Every stitch and arrangement is made by hand with genuine care and passion for gifting.',
  },
  {
    icon: faStar,
    title: 'Premium Quality',
    desc: 'Using only the finest materials, artisanal chocolates, and preserved blooms.',
  },
  {
    icon: faScissors,
    title: 'Bespoke Artistry',
    desc: 'Each hamper is tailored to order with personalized engraving and attention to detail.',
  },
];

function FeatureCard({ icon, title, desc, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="card-minimal p-8 flex flex-col items-center text-center gap-4 bg-[var(--card)] border border-[var(--border)]"
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent-hover)]">
        <FontAwesomeIcon icon={icon} className="text-xl" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[var(--text)]">{title}</h3>
      <p className="text-[var(--text-muted)] text-sm leading-relaxed font-normal">{desc}</p>
    </motion.div>
  );
}

export default function BrandIntro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="brand" className="relative py-28 px-6 overflow-hidden bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <p className="text-[11px] tracking-[0.4em] text-[var(--accent-secondary)] uppercase mb-4 font-bold">Our Promise</p>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-[var(--text)] leading-tight mb-6">
            Luxury Born from the<br />
            <em className="font-normal italic text-[var(--accent-hover)]">Art of Handcraft</em>
          </h2>
          <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            LETTERS creates premium gifting experiences blending emotional warmth, artisanal delicacy, and timeless elegance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={0.15 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}
