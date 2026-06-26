'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Mail, Lock, User, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/context';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(email, password, name);
      toast.success(t('auth.toastRegisterSuccess'));
      router.push('/analytics');
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('auth.toastRegisterFailed'));
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white space-y-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <BarChart3 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black">{t('common.appName')}</h1>
          <p className="text-lg text-white/70 max-w-md">{t('auth.registerBranding')}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <h2 className="text-2xl font-bold mb-1">{t('auth.createAccount')}</h2>
          <p className="text-sm text-muted-foreground mb-8">{t('auth.createAccountSubtitle')}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm">
              <Github className="w-4 h-4" /> GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">{t('common.or')}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.nameLabel')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t('auth.namePlaceholder')} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t('auth.emailPlaceholder')} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t('auth.passwordMinLength')} required minLength={8} />
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('auth.createAccountBtn')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.alreadyHaveAccount')} <Link href="/login" className="text-primary hover:underline font-medium">{t('auth.signIn2')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
