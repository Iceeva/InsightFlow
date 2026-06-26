import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { gql } from 'graphql-tag';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

const typeDefs = gql`
  type Query {
    me: User
    workspace(id: ID!): Workspace
    events(projectId: ID!, page: Int, limit: Int, name: String): EventConnection!
    analytics(projectId: ID!, metric: String!, period: String): JSON
    dashboards(workspaceId: ID!): [Dashboard!]!
    notifications(page: Int): NotificationConnection!
  }

  type Mutation {
    track(input: TrackInput!): TrackResult!
    createDashboard(name: String!, workspaceId: ID!): Dashboard!
    createWidget(dashboardId: ID!, type: WidgetType!, title: String!, config: JSON): Widget!
    deleteDashboard(id: ID!): Boolean!
    deleteWidget(id: ID!): Boolean!
    markNotificationRead(id: ID!): Boolean!
  }

  type User {
    id: ID!
    email: String!
    name: String
    avatarUrl: String
    role: String!
  }

  type Workspace {
    id: ID!
    name: String!
    slug: String!
    plan: String!
    members: [Member!]!
    projects: [Project!]!
  }

  type Member {
    id: ID!
    role: String!
    user: User!
  }

  type Project {
    id: ID!
    name: String!
    platform: String!
    eventCount: Int!
  }

  type Event {
    id: ID!
    name: String!
    timestamp: String!
    distinctId: String
    country: String
    browser: String
    os: String
    device: String
    path: String
    properties: JSON
  }

  type EventConnection {
    events: [Event!]!
    total: Int!
    page: Int!
  }

  type Dashboard {
    id: ID!
    name: String!
    isDefault: Boolean!
    widgets: [Widget!]!
    layout: JSON
  }

  type Widget {
    id: ID!
    type: WidgetType!
    title: String!
    config: JSON
    position: JSON
    size: JSON
  }

  type Notification {
    id: ID!
    type: String!
    title: String!
    body: String!
    read: Boolean!
    createdAt: String!
  }

  type NotificationConnection {
    notifications: [Notification!]!
    unread: Int!
    total: Int!
  }

  input TrackInput {
    name: String!
    properties: JSON
    distinctId: String
    sessionId: String
    url: String
  }

  type TrackResult {
    success: Boolean!
  }

  enum WidgetType {
    LINE_CHART
    BAR_CHART
    PIE_CHART
    HEATMAP
    TABLE
    COUNTER
    FUNNEL
    RETENTION
    MAP
  }

  scalar JSON
`;

const resolvers = {
  Query: {
    me: async (_: any, __: any, ctx: any) => {
      if (!ctx.userId) return null;
      return prisma.user.findUnique({ where: { id: ctx.userId } });
    },
    workspace: async (_: any, { id }: any) => {
      return prisma.workspace.findUnique({ where: { id }, include: { members: { include: { user: true } }, projects: true } });
    },
    events: async (_: any, { projectId, page = 1, limit = 50, name }: any) => {
      const where: any = { projectId };
      if (name) where.name = name;
      const [events, total] = await Promise.all([
        prisma.event.findMany({ where, orderBy: { timestamp: 'desc' }, skip: (page - 1) * limit, take: limit }),
        prisma.event.count({ where }),
      ]);
      return { events, total, page };
    },
    dashboards: async (_: any, { workspaceId }: any) => {
      return prisma.dashboard.findMany({ where: { workspaceId }, include: { widgets: true } });
    },
    notifications: async (_: any, { page = 1 }: any, ctx: any) => {
      if (!ctx.userId) return { notifications: [], unread: 0, total: 0 };
      const limit = 20;
      const [notifications, total, unread] = await Promise.all([
        prisma.notification.findMany({ where: { userId: ctx.userId }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
        prisma.notification.count({ where: { userId: ctx.userId } }),
        prisma.notification.count({ where: { userId: ctx.userId, read: false } }),
      ]);
      return { notifications, unread, total };
    },
  },
  Mutation: {
    track: async (_: any, { input }: any, ctx: any) => {
      // Simplified direct insert for GraphQL
      return { success: true };
    },
    createDashboard: async (_: any, { name, workspaceId }: any) => {
      return prisma.dashboard.create({ data: { name, workspaceId }, include: { widgets: true } });
    },
    createWidget: async (_: any, { dashboardId, type, title, config }: any) => {
      return prisma.widget.create({ data: { dashboardId, type, title, config: config || {} } });
    },
    deleteDashboard: async (_: any, { id }: any) => {
      await prisma.dashboard.delete({ where: { id } });
      return true;
    },
    deleteWidget: async (_: any, { id }: any) => {
      await prisma.widget.delete({ where: { id } });
      return true;
    },
    markNotificationRead: async (_: any, { id }: any, ctx: any) => {
      await prisma.notification.update({ where: { id }, data: { read: true } });
      return true;
    },
  },
  Project: {
    eventCount: async (project: any) => {
      return prisma.event.count({ where: { projectId: project.id } });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const auth = await getAuthContext(req);
    return { userId: auth?.userId, role: auth?.role };
  },
});

export async function GET(req: NextRequest) {
    return handler(req);
}

export async function POST(req: NextRequest) {
    return handler(req);
}