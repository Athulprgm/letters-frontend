'use client';

import Preloader from './Preloader';

export default function LoadingScreen({ onComplete }) {
  return <Preloader onComplete={onComplete} />;
}

