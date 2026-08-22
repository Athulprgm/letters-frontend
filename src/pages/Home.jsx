import React from 'react';
import TopSaleAlertBar from '../components/TopSaleAlertBar';
import Hero from '../components/Hero';
import ValuePropsBar from '../components/ValuePropsBar';
import Marquee from '../components/Marquee';
import SalesDiscountSection from '../components/SalesDiscountSection';
import AmazonQuadGrid from '../components/AmazonQuadGrid';
import FlashDealsRow from '../components/FlashDealsRow';
import FeaturedCategories from '../components/FeaturedCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import FestivalHamperSection from '../components/FestivalHamperSection';
import CustomGiftCTA from '../components/CustomGiftCTA';
import WhatsAppCTA from '../components/WhatsAppCTA';

export default function HomePage() {
  return (
    <div className="bg-[var(--bg)] transition-colors duration-400 overflow-hidden">
      {/* 1. Sales Alert Banner */}
      <TopSaleAlertBar />

      {/* 2. Hero Section */}
      <Hero />
      <ValuePropsBar />
      <Marquee />

      {/* 3. Promotional Mega Sale Billboard (shows when enabled by Admin) */}
      <SalesDiscountSection />

      {/* 4. Amazon-Style 4-Tile Spotlight Grid */}
      <AmazonQuadGrid />

      {/* 5. Amazon-Style Lightning Flash Deals Row with Live Timer */}
      <FlashDealsRow />

      {/* 6. Full Category Showcase Grid */}
      <FeaturedCategories />

      {/* 7. Recommended Products / Bestseller Shelf */}
      <FeaturedProducts />

      {/* 8. Festival Product (shows if added & active) */}
      <FestivalHamperSection />

      {/* 9. Personalized Hamper Studio */}
      <CustomGiftCTA />

      {/* 10. Direct Studio Concierge */}
      <WhatsAppCTA />
    </div>
  );
}
