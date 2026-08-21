'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 2500, suffix: '+', label: 'Hampers Curated', sub: 'Across Kerala & India' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', sub: 'Verified 5-Star Reviews' },
  { value: 20, suffix: '+', label: 'Districts Reached', sub: 'Safe Tracked Express' },
  { value: 100, suffix: '%', label: 'Handcrafted', sub: 'Artisan Made to Order' },
];

function CountUp({ target, suffix, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 50));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <>{count.toLocaleString()}{suffix}</>;
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-12 border-t border-[var(--border)]/50 bg-[var(--card)] transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="block text-[var(--chandanam)] mb-1"
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
          >
            Atelier Milestones
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight">
            Loved Across Thousands of Celebrations
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border)] shadow-xs flex flex-col items-center justify-center group hover:border-[var(--olive)]/40 transition-colors"
            >
              <p className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--olive)] mb-1 group-hover:scale-105 transition-transform">
                <CountUp target={s.value} suffix={s.suffix} inView={inView} />
              </p>
              <p className="text-xs font-bold tracking-[0.12em] uppercase text-[var(--text)] mb-0.5">
                {s.label}
              </p>
              <span className="text-[11px] text-[var(--text-muted)] font-normal">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

