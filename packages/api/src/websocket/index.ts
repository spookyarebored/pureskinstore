// ===========================================
// PureSkin Store — WebSocket Server
// ===========================================

import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initWebSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.webUrl,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
}

/**
 * Get the Socket.io instance
 */
export function getIO(): SocketIOServer | null {
  return io;
}
