'use client';

import { motion } from 'framer-motion';
import { BarChart3, Zap, Shield, Globe, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LandingPage() {
  const { t } = useI18n();

  const features = [
    { icon: Zap, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
    { icon: BarChart3, titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
    { icon: Sparkles, titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
    { icon: Shield, titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
    { icon: Globe, titleKey: 'landing.feature5Title', descKey: 'landing.feature5Desc' },
    { icon: BarChart3, titleKey: 'landing.feature6Title', descKey: 'landing.feature6Desc' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{t('common.appName')}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">{t('nav.features')}</a>
            <a href="#pricing" className="hover:text-foreground transition">{t('nav.pricing')}</a>
            <a href="#docs" className="hover:text-foreground transition">{t('nav.docs')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
              {t('nav.login')}
            </Link>
            <Link href="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition">
              {t('nav.startFree')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {t('landing.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              {t('landing.heroTitle')}
              <span className="text-primary">{t('landing.heroTitleAccent')}</span>
              {t('landing.heroTitleEnd')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="group bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                {t('landing.getStartedFree')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="#demo" className="px-6 py-3 rounded-xl font-medium text-sm border border-border hover:bg-accent transition">
                {t('landing.liveDemo')}
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden"
          >
            <div className="h-8 bg-muted flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="p-8 grid grid-cols-3 gap-4">
              {[
                { label: t('landing.previewTotalEvents'), value: '2.4M', change: '+12%' },
                { label: t('landing.previewUniqueUsers'), value: '148K', change: '+8%' },
                { label: t('landing.previewAvgSession'), value: '4m 32s', change: '+3%' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl bg-muted/50 p-4 text-left">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-500 mt-1">{stat.change}</p>
                </div>
              ))}
              <div className="col-span-2 rounded-xl bg-muted/50 p-4 h-40 flex items-end gap-1">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${20 + Math.random() * 80}%` }} />
                ))}
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground mb-2">{t('landing.previewTopEvents')}</p>
                {['PageView', 'Signup', 'Purchase', 'Click'].map((e, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <span>{e}</span>
                    <span className="text-muted-foreground">{Math.floor(Math.random() * 5000)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.featuresTitle')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">{t('landing.featuresSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">{t('common.appName')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('landing.footerCopy')}</p>
        </div>
      </footer>
    </div>
  );
}
