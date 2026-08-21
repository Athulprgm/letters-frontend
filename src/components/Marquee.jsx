'use client';

const items = [
  'Bespoke Hampers',
  '·',
  'Artisanal Bouquets',
  '·',
  'Engagement Curations',
  '·',
  'Belgian Chocolates',
  '·',
  'Personalized Keepsakes',
  '·',
  'Handcrafted in Kerala',
  '·',
  'WhatsApp Concierge',
  '·',
  'Est. 2020',
  '·',
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-3 border-b border-[var(--border)]/50 bg-[var(--bg-subtle)] transition-colors duration-300 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--bg-subtle)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg-subtle)] to-transparent z-10 pointer-events-none" />
      
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`inline-block px-4 text-[10.5px] font-medium tracking-[0.12em] ${
              item === '·'
                ? 'text-[var(--chandanam)] opacity-70 text-[8px]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
