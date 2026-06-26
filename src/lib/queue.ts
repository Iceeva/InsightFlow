import { Queue } from 'bullmq';
import redis from './redis';

export const eventQueue = new Queue('events', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 86400, count: 10000 },
    removeOnFail: { age: 604800, count: 5000 },
  },
});

export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

export const analyticsQueue = new Queue('analytics', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { age: 3600 },
  },
});

export const aiQueue = new Queue('ai', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    timeout: 60000,
  },
});
