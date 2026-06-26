'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Globe, Palette, Save, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

export default function SettingsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<string>('profile');

  const tabs = [
    { id: 'profile', labelKey: 'settings.profile', icon: User },
    { id: 'workspace', labelKey: 'settings.workspace', icon: Globe },
    { id: 'notifications', labelKey: 'settings.notifications', icon: Bell },
    { id: 'security', labelKey: 'settings.security', icon: Shield },
    { id: 'appearance', labelKey: 'settings.appearance', icon: Palette },
  ];

  const notifs = [
    { titleKey: 'settings.notif1Title', descKey: 'settings.notif1Desc', enabled: true },
    { titleKey: 'settings.notif2Title', descKey: 'settings.notif2Desc', enabled: true },
    { titleKey: 'settings.notif3Title', descKey: 'settings.notif3Desc', enabled: false },
    { titleKey: 'settings.notif4Title', descKey: 'settings.notif4Desc', enabled: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex gap-6">
        <div className="w-48 space-y-1 flex-shrink-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left',
                activeTab === tab.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
              <tab.icon className="w-4 h-4" />
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-2xl">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.profileInfo')}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">JD</span>
                    </div>
                    <button aria-label={t('settings.changeAvatar')} className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@company.com</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="profile-name" className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('settings.nameLabel')}</label>
                    <input id="profile-name" type="text" defaultValue="John Doe" placeholder={t('settings.nameLabel')} className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label htmlFor="profile-email" className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('settings.emailLabel')}</label>
                    <input id="profile-email" type="email" defaultValue="john@company.com" placeholder={t('settings.emailLabel')} className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                  <Save className="w-3.5 h-3.5" />
                  {t('settings.saveChanges')}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.workspaceSettings')}</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('settings.workspaceNameLabel')}</label>
                    <input type="text" defaultValue="Acme Inc" className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('settings.slugLabel')}</label>
                    <input type="text" defaultValue="acme-inc" className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                  <Save className="w-3.5 h-3.5" />
                  {t('settings.save')}
                </button>
              </div>
              <div className="rounded-2xl border border-destructive/30 bg-card p-6">
                <h3 className="font-semibold text-destructive mb-2">{t('settings.dangerZone')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('settings.dangerZoneDesc')}</p>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:bg-destructive/90 transition">
                  {t('settings.deleteWorkspace')}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.notifPrefs')}</h3>
                <div className="space-y-4">
                  {notifs.map((pref, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium">{t(pref.titleKey)}</p>
                        <p className="text-xs text-muted-foreground">{t(pref.descKey)}</p>
                      </div>
                      <button type="button" aria-pressed={pref.enabled} className={cn('w-10 h-5 rounded-full transition relative', pref.enabled ? 'bg-primary' : 'bg-muted')}>
                        <div className={cn('w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all', pref.enabled ? 'left-5' : 'left-0.5')} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.twoFATitle')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('settings.twoFADesc')}</p>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                  {t('settings.enable2FA')}
                </button>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.changePassword')}</h3>
                <div className="grid gap-3 max-w-sm">
                  <input type="password" placeholder={t('settings.currentPassword')} className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  <input type="password" placeholder={t('settings.newPassword')} className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  <input type="password" placeholder={t('settings.confirmPassword')} className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
                  <button className="h-10 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                    {t('settings.updatePassword')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('settings.themeTitle')}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['light', 'dark', 'system'] as const).map(theme => (
                    <button key={theme} className="p-3 rounded-xl border border-border hover:border-primary transition text-center">
                      <div className={cn('w-full h-16 rounded-lg mb-2',
                        theme === 'dark' ? 'bg-zinc-900' : theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gradient-to-r from-white to-zinc-900')} />
                      <span className="text-xs capitalize">
                        {theme === 'light' ? t('settings.themeLight') : theme === 'dark' ? t('settings.themeDark') : t('settings.themeSystem')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
