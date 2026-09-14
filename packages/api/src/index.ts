// ===========================================
// PureSkin Store — API Entry Point
// ===========================================

import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { initWebSocket } from './websocket';
import { initDiscordClient } from './services/discordService';

async function start() {
  try {
    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket
    initWebSocket(httpServer);

    // Initialize Discord client (for sending messages)
    await initDiscordClient();

    // Start listening
    httpServer.listen(config.port, () => {
      console.log(`🚀 PureSkin Store API running on port ${config.port}`);
      console.log(`🌐 Web panel: ${config.webUrl}`);
      console.log(`📡 API: ${config.apiUrl}`);
    });
  } catch (error) {
    console.error('❌ Failed to start API:', error);
    process.exit(1);
  }
}

start();
