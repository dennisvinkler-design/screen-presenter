'use client';

import { ImageStoreProvider } from '@/store/imageStore';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ImageStoreProvider>
      {children}
    </ImageStoreProvider>
  );
}

