import prisma from '@/lib/prisma';
import { emitToWorkspace } from '@/lib/socket';
import nodemailer from 'nodemailer';
import logger from '@/lib/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

interface NotifyOptions {
  userId: string;
  type: 'ALERT' | 'ANOMALY' | 'REPORT' | 'INVITATION' | 'SYSTEM';
  title: string;
  body: string;
  data?: Record<string, any>;
  channels?: ('IN_APP' | 'EMAIL' | 'PUSH' | 'SLACK')[];
}

export async function notify(options: NotifyOptions) {
  const channels = options.channels || ['IN_APP'];

  for (const channel of channels) {
    try {
      switch (channel) {
        case 'IN_APP':
          await createInAppNotification(options);
          break;
        case 'EMAIL':
          await sendEmailNotification(options);
          break;
        case 'SLACK':
          await sendSlackNotification(options);
          break;
        case 'PUSH':
          // Web Push implementation placeholder
          logger.info('Push notification not yet configured');
          break;
      }
    } catch (error) {
      logger.error(`Failed to send ${channel} notification`, { error, userId: options.userId });
    }
  }
}

async function createInAppNotification(options: NotifyOptions) {
  const notification = await prisma.notification.create({
    data: {
      userId: options.userId,
      type: options.type,
      title: options.title,
      body: options.body,
      data: options.data,
      channel: 'IN_APP',
    },
  });

  // Get user's workspace memberships to emit to relevant rooms
  const memberships = await prisma.member.findMany({
    where: { userId: options.userId },
    select: { workspaceId: true },
  });

  for (const m of memberships) {
    emitToWorkspace(m.workspaceId, 'notification:new', notification);
  }

  return notification;
}

async function sendEmailNotification(options: NotifyOptions) {
  const user = await prisma.user.findUnique({ where: { id: options.userId } });
  if (!user?.email) return;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'InsightFlow <noreply@insightflow.io>',
    to: user.email,
    subject: `[InsightFlow] ${options.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">InsightFlow</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111; margin: 0 0 8px;">${options.title}</h2>
          <p style="color: #6b7280; line-height: 1.6;">${options.body}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
             style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #6366f1; color: white; border-radius: 8px; text-decoration: none;">
            View Dashboard
          </a>
        </div>
      </div>
    `,
  });
}

async function sendSlackNotification(options: NotifyOptions) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const emoji = options.type === 'ANOMALY' ? '⚠️' : options.type === 'ALERT' ? '🚨' : 'ℹ️';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: `${emoji} ${options.title}` } },
        { type: 'section', text: { type: 'mrkdwn', text: options.body } },
      ],
    }),
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
