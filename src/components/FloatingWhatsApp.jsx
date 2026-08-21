'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '../store/settingsStore';

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) {
    return null;
  }

  const handleFloatingClick = () => {
    const message = `Hello ${settings.brandName}, I would like to inquire about placing an order!`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
      <button
        onClick={handleFloatingClick}
        className="w-13 h-13 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group"
        aria-label="Direct WhatsApp Concierge"
        title="Chat with our gifting concierge on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-2xl group-hover:rotate-6 transition-transform duration-300" />
      </button>
    </div>
  );
}
