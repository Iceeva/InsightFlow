import { Worker } from 'bullmq';
import Redis from 'ioredis';
import prisma from '@/lib/prisma';
import { detectAnomalies, detectSpikes } from './ai-engine';
import { notify } from './notification-service';
import logger from '@/lib/logger';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ─── Event Processing Worker ────────────────────
const eventWorker = new Worker('events', async (job) => {
  const { event, ip, userAgent } = job.data;

  // Parse User-Agent
  const ua = new UAParser(userAgent);
  const browser = ua.getBrowser().name || null;
  const os = ua.getOS().name || null;
  const device = ua.getDevice().type || 'Desktop';

  // GeoIP lookup
  let country = null, city = null, region = null;
  if (ip && ip !== '127.0.0.1') {
    const geo = geoip.lookup(ip);
    if (geo) {
      country = geo.country;
      city = geo.city;
      region = geo.region;
    }
  }

  // Parse URL for path
  let path = event.url ? new URL(event.url).pathname : null;

  await prisma.event.create({
    data: {
      name: event.name,
      projectId: event.projectId,
      sessionId: event.sessionId,
      distinctId: event.distinctId,
      properties: event.properties || {},
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
      country, city, region, browser, os, device,
      url: event.url,
      path,
      referrer: event.referrer,
      utmSource: event.utm?.source,
      utmMedium: event.utm?.medium,
      utmCampaign: event.utm?.campaign,
      utmTerm: event.utm?.term,
      utmContent: event.utm?.content,
    },
  });

  logger.debug(`Processed event: ${event.name}`, { projectId: event.projectId });
}, { connection, concurrency: 10 });

// ─── Analytics Worker (AI) ──────────────────────
const analyticsWorker = new Worker('analytics', async (job) => {
  const { projectId, type } = job.data;

  if (type === 'anomaly_check') {
    const anomalies = await detectAnomalies(projectId);
    if (anomalies.some(a => a.severity === 'high')) {
      // Find workspace owner to notify
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: { where: { role: 'OWNER' }, include: { user: true } } } } },
      });

      if (project?.workspace.members[0]) {
        await notify({
          userId: project.workspace.members[0].userId,
          type: 'ANOMALY',
          title: 'Anomaly Detected',
          body: `${anomalies.filter(a => a.severity === 'high').length} high-severity anomalies detected in ${project.name}`,
          channels: ['IN_APP', 'EMAIL'],
        });
      }
    }
  }

  if (type === 'spike_check') {
    const spikes = await detectSpikes(projectId);
    if (spikes.length > 0) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { workspace: { include: { members: { where: { role: 'OWNER' } } } } },
      });

      if (project?.workspace.members[0]) {
        await notify({
          userId: project.workspace.members[0].userId,
          type: 'ALERT',
          title: 'Traffic Spike Detected',
          body: `${spikes.length} traffic spike(s) - peak at ${spikes[0].multiplier}x baseline`,
          channels: ['IN_APP', 'SLACK'],
        });
      }
    }
  }
}, { connection, concurrency: 2 });

// ─── Notification Worker ────────────────────────
const notificationWorker = new Worker('notifications', async (job) => {
  await notify(job.data);
}, { connection, concurrency: 5 });

// Error handlers
[eventWorker, analyticsWorker, notificationWorker].forEach(w => {
  w.on('failed', (job, err) => logger.error(`Job ${job?.name} failed`, { error: err.message }));
  w.on('completed', (job) => logger.debug(`Job ${job.name} completed`));
});

logger.info('🏭 Workers started: events, analytics, notifications');
