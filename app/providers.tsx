'use client';

import { FontLoader } from '@gfm-heart/components';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FontLoader url="https://cdn.gofundme.com/fonts" weights={['Bold', 'Medium', 'Regular']} />
      {children}
    </>
  );
}
