'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Ethical Sourcing',
    desc: 'Finest sustainable premium artisanal gifts & ingredients.',
  },
  {
    num: '02',
    title: 'Bespoke Artistry',
    desc: 'Meticulous curation and custom engraving by master artisans.',
  },
  {
    num: '03',
    title: 'Luxury Unboxing',
    desc: 'Eco-friendly, unforgettable keepsake packaging with wax seals.',
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="process" className="py-28 px-6 md:px-12 bg-[var(--card)] transition-colors duration-300 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <p className="text-xs tracking-[0.4em] text-[var(--accent)] uppercase mb-3 font-bold">
              Artisanal Craft
            </p>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-[var(--text)] leading-tight tracking-tight">
              The Curation Cycle
            </h2>
          </div>
          <div className="max-w-md text-xs text-[var(--text-muted)] font-medium leading-relaxed">
            True luxury cannot be rushed. Our commitment to artisanal craftsmanship ensures each hamper holds genuine, lasting value.
          </div>
        </motion.div>

        {/* 3-Step Minimalist Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col p-8 bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-500 group shadow-sm rounded-3xl"
            >
              {/* Decorative Top Accent */}
              <div className="absolute top-0 left-8 w-12 h-[2px] bg-[var(--accent)] group-hover:w-20 transition-all duration-500" />

              {/* Number */}
              <div className="flex items-baseline justify-between mb-8 pt-4">
                <span className="font-heading text-4xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {step.num}
                </span>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                  Phase {i + 1}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold text-[var(--text)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                {step.title}
              </h3>

              <p className="text-[var(--text-muted)] text-xs leading-relaxed font-medium mt-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
