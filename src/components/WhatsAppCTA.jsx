'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useSettingsStore } from '../store/settingsStore';

export default function WhatsAppCTA() {
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const handleStartChat = () => {
    const msg = `Hello ${settings.brandName}, I would like to explore your bespoke gift hampers and bouquet options!`;
    window.open(getWhatsAppUrl(msg), '_blank');
  };

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg-subtle)] border-t border-[var(--border)]/50 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 sm:p-14 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            
            {/* Left Copy */}
            <div className="max-w-xl">
              <span
                className="block mb-2 text-[var(--chandanam)]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '26px', letterSpacing: '0.02em' }}
              >
                Direct Studio Concierge
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] leading-[1.15] mb-4">
                Have a Custom Gift <br />
                <span className="italic font-normal text-[var(--olive)]">
                  Idea in Mind?
                </span>
              </h2>

              <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
                Connect directly with our gifting curators on WhatsApp. From bespoke wedding favors to personalized anniversary hampers, we respond quickly with catalogs, live previews, and pricing.
              </p>
            </div>

            {/* Right Action */}
            <div className="flex flex-col items-start sm:items-center gap-3">
              <button
                onClick={handleStartChat}
                className="flex items-center gap-2.5 px-8 py-4 text-[12px] font-semibold tracking-[0.05em] rounded-full bg-[var(--olive)] text-white hover:bg-[var(--olive-hover)] transition-all cursor-pointer shadow-md active:scale-95"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                <span>Chat on WhatsApp</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
              </button>

              <p className="text-xs text-[var(--text-muted)] font-medium">
                Usually responds within 15 mins · {settings.phoneNumber}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
