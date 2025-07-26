'use client';

import { useEffect } from 'react';

export function BodyHydrationFix() {
  useEffect(() => {
    // Remove injected VS Code classes or reset body class
    document.body.className = '';
  }, []);

  return null;
}
