/**
 * InsightFlow Vue 3 SDK
 * Vue plugin and composables for InsightFlow analytics.
 *
 * Usage:
 *   import { insightFlowPlugin, useInsightFlow } from '@insightflow/vue';
 *
 *   app.use(insightFlowPlugin, { apiKey: 'your-key' });
 *
 *   const { track } = useInsightFlow();
 *   track('button_click', { button: 'signup' });
 */

import { inject, type App, type InjectionKey, onMounted, onUnmounted } from 'vue';
import { InsightFlow } from '../js';

const INSIGHT_FLOW_KEY: InjectionKey<InsightFlow> = Symbol('insightflow');

interface PluginOptions {
  apiKey: string;
  host?: string;
  autoTrack?: boolean;
  debug?: boolean;
}

export const insightFlowPlugin = {
  install(app: App, options: PluginOptions) {
    const client = new InsightFlow(options);
    app.provide(INSIGHT_FLOW_KEY, client);
    app.config.globalProperties.$insightflow = client;
  },
};

export function useInsightFlow() {
  const client = inject(INSIGHT_FLOW_KEY);
  if (!client) throw new Error('InsightFlow plugin not installed');

  return {
    track: (name: string, properties?: Record<string, any>) => client.track(name, properties),
    identify: (distinctId: string, traits?: Record<string, any>) => client.identify(distinctId, traits),
    trackPageView: (properties?: Record<string, any>) => client.trackPageView(properties),
    reset: () => client.reset(),
  };
}

// Auto-track directive: v-track="'event_name'"
export const vTrack = {
  mounted(el: HTMLElement, binding: { value: string | { event: string; properties?: Record<string, any> } }) {
    const client = inject(INSIGHT_FLOW_KEY);
    if (!client) return;

    const handler = () => {
      if (typeof binding.value === 'string') {
        client.track(binding.value);
      } else {
        client.track(binding.value.event, binding.value.properties);
      }
    };

    el.addEventListener('click', handler);
    (el as any).__insightflow_handler = handler;
  },
  unmounted(el: HTMLElement) {
    if ((el as any).__insightflow_handler) {
      el.removeEventListener('click', (el as any).__insightflow_handler);
    }
  },
};
