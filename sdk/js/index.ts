/**
 * InsightFlow JavaScript SDK
 * Track events, identify users, and manage sessions.
 *
 * Usage:
 *   import { InsightFlow } from '@insightflow/js';
 *   const analytics = new InsightFlow({ apiKey: 'your-api-key' });
 *   analytics.track('page_view', { path: '/home' });
 */

interface InsightFlowConfig {
  apiKey: string;
  host?: string;
  autoTrack?: boolean;
  debug?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

interface TrackProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface UserTraits {
  name?: string;
  email?: string;
  [key: string]: any;
}

export class InsightFlow {
  private config: Required<InsightFlowConfig>;
  private queue: { name: string; properties: TrackProperties; timestamp: string }[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private sessionId: string;
  private distinctId: string | null = null;

  constructor(config: InsightFlowConfig) {
    this.config = {
      host: 'https://api.insightflow.io',
      autoTrack: true,
      debug: false,
      batchSize: 10,
      flushInterval: 5000,
      ...config,
    };

    this.sessionId = this.generateId();

    // Auto-flush
    this.timer = setInterval(() => this.flush(), this.config.flushInterval);

    // Auto-track page views
    if (this.config.autoTrack && typeof window !== 'undefined') {
      this.trackPageView();
      window.addEventListener('popstate', () => this.trackPageView());
    }

    if (this.config.debug) {
      console.log('[InsightFlow] Initialized', { host: this.config.host, sessionId: this.sessionId });
    }
  }

  /**
   * Track an event
   */
  track(name: string, properties: TrackProperties = {}): void {
    const event = {
      name,
      properties: {
        ...properties,
        $url: typeof window !== 'undefined' ? window.location.href : undefined,
        $referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);

    if (this.config.debug) {
      console.log('[InsightFlow] Track:', name, properties);
    }

    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Identify a user
   */
  identify(distinctId: string, traits: UserTraits = {}): void {
    this.distinctId = distinctId;
    this.track('$identify', { $distinct_id: distinctId, ...traits });
  }

  /**
   * Track page view
   */
  trackPageView(properties: TrackProperties = {}): void {
    this.track('$pageview', {
      $url: typeof window !== 'undefined' ? window.location.href : undefined,
      $path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      $title: typeof document !== 'undefined' ? document.title : undefined,
      ...properties,
    });
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(`${this.config.host}/api/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          events: events.map(e => ({
            ...e,
            sessionId: this.sessionId,
            distinctId: this.distinctId,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (this.config.debug) {
        console.log(`[InsightFlow] Flushed ${events.length} events`);
      }
    } catch (error) {
      // Re-queue failed events
      this.queue.unshift(...events);
      if (this.config.debug) {
        console.error('[InsightFlow] Flush failed:', error);
      }
    }
  }

  /**
   * Reset session and user
   */
  reset(): void {
    this.distinctId = null;
    this.sessionId = this.generateId();
    this.queue = [];
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

export default InsightFlow;
