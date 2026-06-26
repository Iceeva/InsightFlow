import { PrismaClient, WidgetType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding InsightFlow...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@insightflow.io' },
    update: {},
    create: {
      email: ' ',
      name: 'Admin User',
      passwordHash: await bcrypt.hash('admin123456', 12),
      emailVerified: new Date(),
      role: 'ADMIN',
    },
  });

  // Create demo user
  const demo = await prisma.user.upsert({
    where: { email: 'demo@insightflow.io' },
    update: {},
    create: {
      email: 'demo@insightflow.io',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('demo123456', 12),
      emailVerified: new Date(),
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      plan: 'PRO',
    },
  });

  // Add members
  await prisma.member.upsert({
    where: { userId_workspaceId: { userId: admin.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: admin.id, workspaceId: workspace.id, role: 'OWNER' },
  });

  await prisma.member.upsert({
    where: { userId_workspaceId: { userId: demo.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: demo.id, workspaceId: workspace.id, role: 'ADMIN' },
  });

  // Create team
  const team = await prisma.team.create({
    data: { name: 'Engineering', workspaceId: workspace.id },
  });

  // Create project
  const project = await prisma.project.create({
    data: { name: 'Main Website', workspaceId: workspace.id, platform: 'WEB' },
  });

  // Create API key
  await prisma.apiKey.create({
    data: {
      name: 'Production Key',
      key: `if_${randomUUID().replace(/-/g, '')}`,
      workspaceId: workspace.id,
      projectId: project.id,
      scopes: ['track', 'read'],
    },
  });

  // Create default dashboard
  const dashboard = await prisma.dashboard.create({
    data: {
      name: 'Overview',
      workspaceId: workspace.id,
      isDefault: true,
      layout: JSON.stringify([
        { i: 'w1', x: 0, y: 0, w: 4, h: 2 },
        { i: 'w2', x: 4, y: 0, w: 4, h: 2 },
        { i: 'w3', x: 8, y: 0, w: 4, h: 2 },
        { i: 'w4', x: 0, y: 2, w: 8, h: 4 },
        { i: 'w5', x: 8, y: 2, w: 4, h: 4 },
        { i: 'w6', x: 0, y: 6, w: 6, h: 4 },
        { i: 'w7', x: 6, y: 6, w: 6, h: 4 },
      ]),
    },
  });

  // Create widgets
  const widgets = [
    { type: WidgetType.COUNTER, title: 'Total Events', config: { metric: 'total_events', period: '30d' } },
    { type: WidgetType.COUNTER, title: 'Unique Users', config: { metric: 'unique_users', period: '30d' } },
    { type: WidgetType.COUNTER, title: 'Avg. Session', config: { metric: 'avg_session', period: '30d', format: 'duration' } },
    { type: WidgetType.LINE_CHART, title: 'Events Over Time', config: { metric: 'events', granularity: 'day', period: '30d' } },
    { type: WidgetType.PIE_CHART, title: 'Events by Type', config: { metric: 'events_by_name', period: '30d', limit: 8 } },
    { type: WidgetType.BAR_CHART, title: 'Top Pages', config: { metric: 'top_pages', period: '30d', limit: 10 } },
    { type: WidgetType.TABLE, title: 'Recent Events', config: { metric: 'recent_events', limit: 20 } },
  ];

  for (const w of widgets) {
    await prisma.widget.create({
      data: { dashboardId: dashboard.id, ...w, config: w.config },
    });
  }

  // Seed sample events (last 30 days)
  const eventNames = ['PageView', 'Signup', 'Login', 'Purchase', 'ButtonClick', 'FormSubmit', 'Search', 'Download'];
  const countries = ['FR', 'US', 'DE', 'GB', 'CA', 'JP', 'BR', 'AU'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const oses = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  const pages = ['/', '/pricing', '/features', '/docs', '/blog', '/about', '/signup', '/login'];

  const events = [];
  const now = Date.now();
  for (let i = 0; i < 5000; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now - daysAgo * 86400000 - hoursAgo * 3600000);
    events.push({
      name: eventNames[Math.floor(Math.random() * eventNames.length)],
      projectId: project.id,
      sessionId: `sess_${Math.floor(Math.random() * 500)}`,
      distinctId: `user_${Math.floor(Math.random() * 200)}`,
      properties: {},
      timestamp,
      country: countries[Math.floor(Math.random() * countries.length)],
      city: 'Unknown',
      os: oses[Math.floor(Math.random() * oses.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      path: pages[Math.floor(Math.random() * pages.length)],
      url: `https://example.com${pages[Math.floor(Math.random() * pages.length)]}`,
      utmSource: Math.random() > 0.7 ? 'google' : null,
      utmMedium: Math.random() > 0.7 ? 'cpc' : null,
    });
  }

  await prisma.event.createMany({ data: events });

  // Create funnel
  await prisma.funnel.create({
    data: {
      name: 'Signup Funnel',
      projectId: project.id,
      steps: JSON.stringify([
        { name: 'PageView', path: '/' },
        { name: 'PageView', path: '/pricing' },
        { name: 'Signup' },
        { name: 'Purchase' },
      ]),
    },
  });

  console.log('✅ Seeded: 2 users, 1 workspace, 1 project, 5000 events, 1 dashboard + 7 widgets');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
