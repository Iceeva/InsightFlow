# 📊 InsightFlow - SaaS Analytics Dashboard

> Real-time analytics platform for modern businesses. Track events, build custom dashboards, and gain insights with AI-powered analytics.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-teal) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-sky) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 📈 Analytics & Tracking
- **Real-time Event Tracking** - Sub-second event ingestion via REST API
- **Custom Dashboards** - Drag & drop widgets (charts, funnels, heatmaps, tables)
- **Funnel Analysis** - Multi-step conversion funnel visualization
- **Cohort Retention** - Week-over-week retention heatmap tables
- **Event Explorer** - Browse, search, and filter all tracked events

### 🤖 AI-Powered Insights
- **Trend Predictions** - Linear regression + moving average forecasting
- **Anomaly Detection** - Statistical Z-score based anomaly alerting
- **Spike Detection** - Real-time traffic spike identification
- **Auto-Insights** - Natural language summaries of your data

### 🔐 Enterprise Security
- **Authentication** - JWT + OAuth (Google/GitHub) + Magic Link
- **Two-Factor Auth** - TOTP-based 2FA with QR code setup
- **RBAC** - Owner, Admin, Member, Viewer roles
- **Audit Logs** - Full activity tracking for compliance
- **Rate Limiting** - Redis-based sliding window rate limiter

### 🏢 Multi-Tenant Architecture
- **Workspaces** - Isolated data per workspace
- **Teams** - Organize members into teams
- **Projects** - Multiple tracking projects per workspace
- **Invitations** - Email-based invite system

### 📡 Real-time & APIs
- **WebSocket** - Live event streaming via Socket.io
- **REST API** - Full CRUD for all resources
- **GraphQL** - Apollo Server with full schema
- **SDKs** - JavaScript, React, Vue, Next.js tracking SDKs

### 🔔 Notifications
- **In-App** - Real-time notification feed
- **Email** - SMTP email notifications
- **Slack** - Webhook-based Slack alerts
- **Push** - Web Push support (extensible)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.6 |
| **Styling** | TailwindCSS 3.4 + Shadcn UI patterns |
| **State** | Zustand + React Query |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Database** | PostgreSQL + Prisma 6 |
| **Cache** | Redis (ioredis) |
| **Queue** | BullMQ |
| **Real-time** | Socket.io |
| **Auth** | JWT (jose) + bcryptjs + otplib |
| **GraphQL** | Apollo Server |
| **Logging** | Winston |
| **Deploy** | Docker + Vercel |

## 📁 Project Structure

```
insightflow/
├── prisma/
│   ├── schema.prisma          # 13 models, multi-tenant
│   └── seed.ts                # Demo data seeder
├── sdk/
│   ├── js/                    # Core JavaScript SDK
│   ├── react/                 # React Provider + hooks
│   ├── vue/                   # Vue 3 plugin + composables
│   └── nextjs/                # Next.js App Router optimized
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Login, Register, Refresh, 2FA
│   │   │   ├── track/         # Event ingestion endpoint
│   │   │   ├── events/        # Event browsing
│   │   │   ├── analytics/     # Analytics queries
│   │   │   ├── dashboards/    # Dashboard CRUD
│   │   │   ├── widgets/       # Widget CRUD
│   │   │   ├── ai/            # AI insights API
│   │   │   ├── team/          # Team management
│   │   │   ├── notifications/ # Notification feed
│   │   │   ├── graphql/       # Apollo GraphQL endpoint
│   │   │   └── sdk/           # API key management
│   │   ├── (auth)/            # Login, Register pages
│   │   ├── (dashboard)/       # All dashboard pages
│   │   │   ├── analytics/     # Main analytics overview
│   │   │   ├── events/        # Event explorer
│   │   │   ├── dashboards/    # Custom dashboards (drag & drop)
│   │   │   ├── funnels/       # Conversion funnels
│   │   │   ├── retention/     # Cohort retention
│   │   │   ├── ai/            # AI insights page
│   │   │   ├── team/          # Team management
│   │   │   ├── api-keys/      # API key management
│   │   │   └── settings/      # Profile, workspace, security
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── charts/            # LineChart, BarChart, PieChart
│   │   ├── layout/            # Sidebar, Header
│   │   └── ui/                # StatCard, reusable UI
│   ├── lib/
│   │   ├── auth.ts            # JWT, hashing, RBAC middleware
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── redis.ts           # Redis + caching + rate limiting
│   │   ├── queue.ts           # BullMQ queues
│   │   ├── socket.ts          # Socket.io server
│   │   ├── logger.ts          # Winston logger
│   │   ├── utils.ts           # Utilities
│   │   └── validations.ts     # Zod schemas
│   ├── services/
│   │   ├── analytics-engine.ts # Query engine for all metrics
│   │   ├── ai-engine.ts       # Predictions, anomalies, spikes
│   │   ├── notification-service.ts # Multi-channel notifications
│   │   └── worker.ts          # BullMQ workers
│   ├── stores/
│   │   ├── auth-store.ts      # Auth state (Zustand)
│   │   ├── dashboard-store.ts # Dashboard state
│   │   └── analytics-store.ts # Analytics filters/state
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── docker-compose.yml         # PostgreSQL + Redis + App
├── Dockerfile                 # Multi-stage Docker build
├── vercel.json                # Vercel deployment config
└── package.json               # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone & install
git clone <repo-url>
cd insightflow
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and Redis URLs

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run dev
```

### With Docker

```bash
docker-compose up -d
```

### Start Workers (separate terminal)

```bash
npm run worker
```

## 📡 API Quick Start

### Track Events

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "name": "page_view",
    "properties": { "path": "/pricing" },
    "distinctId": "user_123"
  }'
```

### Batch Events

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "events": [
      { "name": "page_view", "properties": { "path": "/" } },
      { "name": "signup", "properties": { "plan": "pro" } }
    ]
  }'
```

### SDK Integration

```javascript
import { InsightFlow } from '@insightflow/js';

const analytics = new InsightFlow({
  apiKey: 'isf_your_api_key',
  host: 'https://your-app.vercel.app',
});

// Track events
analytics.track('purchase', { amount: 29.99, plan: 'pro' });

// Identify users
analytics.identify('user_123', { name: 'John', email: 'john@example.com' });
```

## 📊 GraphQL

```graphql
query {
  events(projectId: "...", limit: 10) {
    events {
      name
      timestamp
      country
      browser
    }
    total
  }
  
  dashboards(workspaceId: "...") {
    name
    widgets {
      type
      title
      config
    }
  }
}
```

## 🐳 Deployment

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t insightflow .
docker run -p 3000:3000 insightflow
```

## 📄 Licence

MIT © 2026 InsightFlow - Tous droits réservés.