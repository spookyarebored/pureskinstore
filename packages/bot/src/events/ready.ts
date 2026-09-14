// ===========================================
// PureSkin Store — Ready Event
// ===========================================

import { Client, ActivityType } from 'discord.js';

export function handleReady(client: Client): void {
  console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
  console.log(`📡 Serveurs : ${client.guilds.cache.size}`);

  // Set bot activity
  client.user?.setActivity('PureSkin Store', {
    type: ActivityType.Watching,
  });
}
