/**
 * InsightFlow React SDK
 * React hooks and provider for InsightFlow analytics.
 *
 * Usage:
 *   import { InsightFlowProvider, useTrack } from '@insightflow/react';
 *
 *   <InsightFlowProvider apiKey="your-key">
 *     <App />
 *   </InsightFlowProvider>
 *
 *   const track = useTrack();
 *   track('button_click', { button: 'signup' });
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { InsightFlow } from '../js';

interface InsightFlowContextValue {
  track: (name: string, properties?: Record<string, any>) => void;
  identify: (distinctId: string, traits?: Record<string, any>) => void;
  reset: () => void;
}

const InsightFlowContext = createContext<InsightFlowContextValue | null>(null);

interface ProviderProps {
  apiKey: string;
  host?: string;
  autoTrack?: boolean;
  debug?: boolean;
  children: React.ReactNode;
}

export function InsightFlowProvider({ apiKey, host, autoTrack = true, debug = false, children }: ProviderProps) {
  const clientRef = useRef<InsightFlow | null>(null);

  useEffect(() => {
    clientRef.current = new InsightFlow({ apiKey, host, autoTrack, debug });
    return () => {
      clientRef.current?.destroy();
    };
  }, [apiKey, host, autoTrack, debug]);

  const track = useCallback((name: string, properties?: Record<string, any>) => {
    clientRef.current?.track(name, properties);
  }, []);

  const identify = useCallback((distinctId: string, traits?: Record<string, any>) => {
    clientRef.current?.identify(distinctId, traits);
  }, []);

  const reset = useCallback(() => {
    clientRef.current?.reset();
  }, []);

  const value = useMemo(() => ({ track, identify, reset }), [track, identify, reset]);

  return (
    <InsightFlowContext.Provider value={value}>
      {children}
    </InsightFlowContext.Provider>
  );
}

export function useInsightFlow(): InsightFlowContextValue {
  const ctx = useContext(InsightFlowContext);
  if (!ctx) throw new Error('useInsightFlow must be used within InsightFlowProvider');
  return ctx;
}

export function useTrack() {
  const { track } = useInsightFlow();
  return track;
}

export function useIdentify() {
  const { identify } = useInsightFlow();
  return identify;
}

// Track component renders as a side effect
export function TrackView({ name, properties }: { name: string; properties?: Record<string, any> }) {
  const track = useTrack();
  useEffect(() => {
    track(name, properties);
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
