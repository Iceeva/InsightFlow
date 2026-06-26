'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Shield, MoreVertical, Crown, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/context';

const demoMembers = [
  { id: '1', name: 'John Doe', email: 'john@company.com', role: 'OWNER', avatar: 'JD', joinedAt: '2024-01-15' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@company.com', role: 'ADMIN', avatar: 'SM', joinedAt: '2024-02-20' },
  { id: '3', name: 'Alex Chen', email: 'alex@company.com', role: 'MEMBER', avatar: 'AC', joinedAt: '2024-03-10' },
  { id: '4', name: 'Emily Park', email: 'emily@company.com', role: 'MEMBER', avatar: 'EP', joinedAt: '2024-04-05' },
  { id: '5', name: 'Mike Johnson', email: 'mike@company.com', role: 'VIEWER', avatar: 'MJ', joinedAt: '2024-05-12' },
];

const pendingInvites = [
  { email: 'newdev@company.com', role: 'MEMBER', sentAt: '2024-06-20' },
  { email: 'designer@company.com', role: 'VIEWER', sentAt: '2024-06-22' },
];

const roleColors: Record<string, string> = {
  OWNER: 'text-amber-500 bg-amber-500/10',
  ADMIN: 'text-purple-500 bg-purple-500/10',
  MEMBER: 'text-blue-500 bg-blue-500/10',
  VIEWER: 'text-gray-500 bg-gray-500/10',
};

const roleIcons: Record<string, typeof Crown> = {
  OWNER: Crown, ADMIN: Shield, MEMBER: UserCheck, VIEWER: Users,
};

export default function TeamPage() {
  const { t } = useI18n();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('team.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('team.subtitle')}</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" />
          {t('team.inviteMember')}
        </button>
      </div>

      {showInvite && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl border border-primary/30 bg-card p-5">
          <h3 className="font-medium mb-3">{t('team.inviteTitle')}</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" placeholder={t('team.emailPlaceholder')}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <select className="h-10 px-3 rounded-xl border border-input bg-transparent text-sm">
              <option>{t('team.roleMember')}</option>
              <option>{t('team.roleAdmin')}</option>
              <option>{t('team.roleViewer')}</option>
            </select>
            <button className="h-10 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
              {t('team.sendInvite')}
            </button>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-medium">{t('team.members')} ({demoMembers.length})</h3>
        </div>
        <div className="divide-y divide-border/50">
          {demoMembers.map((member, i) => {
            const RoleIcon = roleIcons[member.role] || Users;
            return (
              <motion.div key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/50 transition">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{member.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1', roleColors[member.role])}>
                  <RoleIcon className="w-3 h-3" />
                  {member.role}
                </span>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition">
                  <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-medium">{t('team.pendingInvitations')} ({pendingInvites.length})</h3>
        </div>
        <div className="divide-y divide-border/50">
          {pendingInvites.map((invite, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{invite.email}</p>
                <p className="text-xs text-muted-foreground">{t('team.sent')} {invite.sentAt}</p>
              </div>
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', roleColors[invite.role])}>
                {invite.role}
              </span>
              <button className="text-xs text-destructive hover:underline">{t('common.revoke')}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
