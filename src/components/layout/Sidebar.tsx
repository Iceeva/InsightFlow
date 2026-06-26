'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, Activity, Zap, LayoutDashboard, Filter, RotateCcw,
  Settings, Users, Key, Bell, ChevronDown, LogOut, Sparkles,
  PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useI18n } from '@/i18n/context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, workspace, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();

  const navItems = [
    { href: '/analytics', label: t('nav.analytics'), icon: Activity },
    { href: '/events', label: t('nav.events'), icon: Zap },
    { href: '/dashboards', label: t('nav.dashboards'), icon: LayoutDashboard },
    { href: '/funnels', label: t('nav.funnels'), icon: Filter },
    { href: '/retention', label: t('nav.retention'), icon: RotateCcw },
    { href: '/ai', label: t('nav.aiInsights'), icon: Sparkles, badge: t('common.new') },
  ];

  const settingsItems = [
    { href: '/team', label: t('nav.team'), icon: Users },
    { href: '/api-keys', label: t('nav.apiKeys'), icon: Key },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <aside className={cn(
      'h-screen flex flex-col border-r border-border bg-sidebar transition-all duration-300 sticky top-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <Link href="/analytics" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-sm">{t('common.appName')}</span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition">
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace selector */}
      {!collapsed && workspace && (
        <div className="px-3 py-3 border-b border-border/50">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition text-left">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary">{workspace.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{workspace.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{workspace.plan.toLowerCase()}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <p className={cn('text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2', collapsed ? 'px-2' : 'px-3')}>
          {collapsed ? '•' : t('nav.analytics')}
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition relative group',
                active ? 'bg-sidebar-accent text-primary font-medium' : 'text-sidebar-foreground/70 hover:bg-accent hover:text-foreground'
              )}
            >
              {active && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-0.5 h-5 bg-primary rounded-r" />
              )}
              <item.icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-primary')} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className={cn('text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2', collapsed ? 'px-2' : 'px-3')}>
            {collapsed ? '•' : t('nav.settings')}
          </p>
          {settingsItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                  active ? 'bg-sidebar-accent text-primary font-medium' : 'text-sidebar-foreground/70 hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border/50 p-3">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{user?.name?.[0] || user?.email?.[0] || '?'}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || user?.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="text-muted-foreground hover:text-destructive transition" title={t('nav.logout')}>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
