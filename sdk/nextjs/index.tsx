/**
 * InsightFlow Next.js SDK
 * Optimized for Next.js App Router with automatic page tracking.
 *
 * Usage:
 *   // app/layout.tsx
 *   import { InsightFlowScript } from '@insightflow/nextjs';
 *   <InsightFlowScript apiKey="your-key" />
 *
 *   // In components
 *   import { useTrack } from '@insightflow/nextjs';
 *   const track = useTrack();
 *   track('signup');
 */

'use client';

import React, { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { InsightFlowProvider, useTrack as useBaseTrack, useInsightFlow as useBaseInsightFlow, useIdentify } from '../react';

interface ScriptProps {
  apiKey: string;
  host?: string;
  debug?: boolean;
  children: React.ReactNode;
}

// Auto-tracks route changes in Next.js App Router
function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const track = useBaseTrack();

  useEffect(() => {
    track('$pageview', {
      $path: pathname,
      $url: window.location.href,
      $title: document.title,
      $search: searchParams.toString(),
    });
  }, [pathname, searchParams, track]);

  return null;
}

export function InsightFlowScript({ apiKey, host, debug, children }: ScriptProps) {
  return (
    <InsightFlowProvider apiKey={apiKey} host={host} autoTrack={false} debug={debug}>
      <RouteTracker />
      {children}
    </InsightFlowProvider>
  );
}

// Re-export hooks
export { useBaseTrack as useTrack, useBaseInsightFlow as useInsightFlow, useIdentify };
