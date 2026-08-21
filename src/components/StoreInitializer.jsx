'use client';

import { useRef } from 'react';
import { useCategoryStore } from '@/src/store/categoryStore';

export default function StoreInitializer({ categories }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useCategoryStore.setState({ categories, isLoading: false });
    initialized.current = true;
  }
  
  return null;
}
