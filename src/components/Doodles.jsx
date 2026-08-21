'use client';

// Modern, handcrafted minimal vector doodles for LETTERS Atelier

export function DoodleSparkle({ className = "w-6 h-6 text-[#E5A04D]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C12.5 6 18 11.5 24 12C18 12.5 12.5 18 12 24C11.5 18 6 12.5 0 12C6 11.5 11.5 6 12 0Z" />
    </svg>
  );
}

export function DoodleStarburst({ className = "w-8 h-8 text-[#E5A04D]" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M16 2V30M2 16H30M6.1 6.1L25.9 25.9M6.1 25.9L25.9 6.1" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function DoodleWavyUnderline({ className = "w-36 h-4 text-[#3E5337]" }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className}>
      <path d="M2 7C14 2 22 11 34 6C46 1 54 10 66 5C78 1 86 10 98 5C106 2 114 6 118 7" />
    </svg>
  );
}

export function DoodleDoubleUnderline({ className = "w-32 h-3 text-[#E5A04D]" }) {
  return (
    <svg viewBox="0 0 100 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M1 3C25 1 75 1 99 3" />
      <path d="M8 6.5C32 5 68 5 92 6.5" opacity="0.6" />
    </svg>
  );
}

export function DoodleCurvedArrow({ className = "w-16 h-12 text-[#3E5337]" }) {
  return (
    <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 32C18 35 38 32 48 18C52 12 50 8 46 8C40 8 36 16 42 24C46 30 54 28 56 22" />
      <path d="M50 16L56 22L57 14" />
    </svg>
  );
}

export function DoodleOliveBranch({ className = "w-10 h-10 text-[#3E5337]" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <path d="M6 34C14 26 24 16 34 6" />
      {/* Leaves */}
      <path d="M14 26C12 21 15 17 20 18C20 23 17 27 14 26Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M22 18C20 13 23 9 28 10C28 15 25 19 22 18Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M18 22C23 20 27 23 26 28C21 28 18 25 18 22Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M26 14C31 12 35 15 34 20C29 20 26 17 26 14Z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="34" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

export function DoodleGiftBox({ className = "w-8 h-8 text-[#721C28]" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="12" width="22" height="15" rx="2" fill="currentColor" fillOpacity="0.08" />
      <path d="M3 8H29V12H3V8Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M16 8V27" />
      <path d="M11 8C11 4 16 3 16 8" />
      <path d="M21 8C21 4 16 3 16 8" />
    </svg>
  );
}

export function DoodleHeart({ className = "w-6 h-6 text-[#721C28]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

export function DoodleSeal({ className = "w-14 h-14 text-[#721C28]" }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.4" className={className}>
      <circle cx="30" cy="30" r="26" strokeDasharray="3 3" />
      <circle cx="30" cy="30" r="22" />
      <path d="M22 30L27 35L38 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DoodleSwirl({ className = "w-10 h-6 text-[#E5A04D]" }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <path d="M4 14C8 6 16 4 22 10C28 16 34 16 38 10" />
      <circle cx="38" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}
