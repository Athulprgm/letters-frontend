'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Dynamic SEO Title, Description, and OpenGraph manager for SPA navigation.
 */
export default function SEOHead({ title, description, keywords, image, canonicalUrl }) {
  const location = useLocation();

  useEffect(() => {
    // Dynamic Page Titles based on Route
    const defaultTitle = 'LETTERS Gifting Studio | Luxury Hampers, Handcrafted Bouquets & Custom Keepsakes';
    const defaultDescription = 'Thoughtfully curated luxury gift hampers, handcrafted floral bouquets, personalized keepsakes and bespoke celebration gifting in Kerala with express Pan-India delivery.';

    let pageTitle = title;
    let pageDesc = description || defaultDescription;

    if (!pageTitle) {
      const path = location.pathname;
      if (path === '/') {
        pageTitle = 'LETTERS | Luxury Hampers & Bespoke Gifting Studio';
      } else if (path === '/shop') {
        pageTitle = 'Shop All Gifts & Curated Hampers | LETTERS';
      } else if (path === '/deals') {
        pageTitle = 'Exclusive Gifting Deals & Limited-Time Offers | LETTERS';
      } else if (path === '/custom-gift') {
        pageTitle = 'Create a Custom Gift Hamper | LETTERS Bespoke Studio';
      } else if (path === '/about') {
        pageTitle = 'Our Story & Craftsmanship | LETTERS Gifting Studio';
      } else if (path === '/contact') {
        pageTitle = 'Contact Us & WhatsApp Concierge | LETTERS';
      } else if (path === '/cart') {
        pageTitle = 'Your Gifting Bag | LETTERS';
      } else if (path === '/checkout') {
        pageTitle = 'Secure Checkout | LETTERS';
      } else if (path.startsWith('/admin')) {
        pageTitle = 'Admin Portal | LETTERS Gifting Studio';
      } else {
        pageTitle = defaultTitle;
      }
    }

    document.title = pageTitle;

    // Update Meta Description
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', pageDesc);

    // Update OG Title
    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', pageTitle);
    }

    // Update OG Description
    let ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute('content', pageDesc);
    }

    // Update OG URL
    let ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag && typeof window !== 'undefined') {
      ogUrlTag.setAttribute('content', window.location.href);
    }
  }, [location.pathname, title, description, keywords, image, canonicalUrl]);

  return null;
}
