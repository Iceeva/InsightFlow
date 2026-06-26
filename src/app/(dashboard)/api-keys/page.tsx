'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Plus, Copy, Trash2, Check, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

const demoKeys = [
  { id: '1', name: 'production', key: 'isf_prod_a8f2...x9k4', scopes: ['track', 'read'], createdAt: '2024-03-15', lastUsed: '2h ago', active: true },
  { id: '2', name: 'development', key: 'isf_dev_b3c7...m2n8', scopes: ['track', 'read', 'write'], createdAt: '2024-05-20', lastUsed: '5m ago', active: true },
  { id: '3', name: 'testing', key: 'isf_test_f1d9...p5q2', scopes: ['track'], createdAt: '2024-06-01', lastUsed: 'Never', active: false },
];

export default function ApiKeysPage() {
  const { t } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSnippet, setShowSnippet] = useState(false);

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const keyNames: Record<string, string> = {
    production: t('apiKeys.production'),
    development: t('apiKeys.development'),
    testing: t('apiKeys.testing'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('apiKeys.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('apiKeys.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowSnippet(!showSnippet)}
            className="px-3 py-2 rounded-xl text-sm font-medium border border-border hover:bg-accent transition flex items-center gap-2">
            <Code className="w-3.5 h-3.5" />
            {t('apiKeys.quickStart')}
          </button>
          <button type="button" onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            {t('apiKeys.newKey')}
          </button>
        </div>
      </div>

      {showSnippet && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-sm font-medium">{t('apiKeys.quickStartTitle')}</span>
            <button type="button" onClick={() => copyKey('npm install @insightflow/js')} className="text-xs text-muted-foreground hover:text-foreground">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">
{`// Install SDK
npm install @insightflow/js

// Initialize
import { InsightFlow } from '@insightflow/js';

const analytics = new InsightFlow({
  apiKey: 'YOUR_API_KEY',
  host: 'https://your-instance.com'
});

// Track events
analytics.track('signup', {
  plan: 'pro',
  source: 'landing_page'
});

// Identify users
analytics.identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com'
});`}
          </pre>
        </motion.div>
      )}

      <div className="space-y-3">
        {demoKeys.map((apiKey, i) => (
          <motion.div key={apiKey.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 hover:border-primary/20 transition">
            <div className="flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', apiKey.active ? 'bg-primary/10' : 'bg-muted')}>
                <Key className={cn('w-5 h-5', apiKey.active ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{keyNames[apiKey.name] || apiKey.name}</h3>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                    apiKey.active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground')}>
                    {apiKey.active ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xs font-mono text-muted-foreground">{apiKey.key}</code>
                  <button type="button" onClick={() => copyKey(apiKey.key)} className="text-muted-foreground hover:text-foreground">
                    {copied === apiKey.key ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">{t('apiKeys.lastUsed')}: {apiKey.lastUsed}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  {apiKey.scopes.map(s => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <button type="button" aria-label="Delete API key" title="Delete API key" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
