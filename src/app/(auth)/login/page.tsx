'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, Mail, Lock, Eye, EyeOff, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/context';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [code, setCode] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password, show2FA ? code : undefined);
      toast.success(t('auth.toastLoginSuccess'));
      router.push('/analytics');
    } catch (err: any) {
      if (err.response?.data?.requires2FA) {
        setShow2FA(true);
        toast.info(t('auth.toast2FARequired'));
      } else {
        toast.error(err.response?.data?.error || t('auth.toastLoginFailed'));
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
          >
            <BarChart3 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black">{t('common.appName')}</h1>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">{t('auth.loginBranding')}</p>
          <div className="flex justify-center gap-6 text-sm text-white/60">
            <span>{t('auth.loginBrandingBadge1')}</span>
            <span>{t('auth.loginBrandingBadge2')}</span>
            <span>{t('auth.loginBrandingBadge3')}</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">{t('common.appName')}</span>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="hidden lg:flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <h2 className="text-2xl font-bold mb-1">{t('auth.welcomeBack')}</h2>
          <p className="text-sm text-muted-foreground mb-8">{t('auth.signInSubtitle')}</p>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition text-sm">
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">{t('common.or')}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.emailLabel')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder={t('auth.emailPlaceholder')} required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder={t('auth.passwordPlaceholder')} required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {show2FA && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('auth.twoFALabel')}</label>
                <input
                  type="text" value={code} onChange={e => setCode(e.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-input bg-transparent text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder={t('auth.twoFAPlaceholder')} maxLength={6}
                />
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('auth.signIn')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">{t('auth.signUp')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
