import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './auth';
import logger from './logger';

let io: Server | null = null;

export function initSocketServer(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    const payload = verifyToken(token);
    if (!payload) return next(new Error('Invalid token'));
    (socket as any).userId = payload.userId;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info(`Socket connected: ${userId}`);

    // Join user's workspace rooms
    socket.on('join:workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      logger.debug(`User ${userId} joined workspace:${workspaceId}`);
    });

    socket.on('join:dashboard', (dashboardId: string) => {
      socket.join(`dashboard:${dashboardId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  logger.info('🔌 WebSocket server initialized');
  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitToWorkspace(workspaceId: string, event: string, data: unknown) {
  io?.to(`workspace:${workspaceId}`).emit(event, data);
}

export function emitToDashboard(dashboardId: string, event: string, data: unknown) {
  io?.to(`dashboard:${dashboardId}`).emit(event, data);
}
