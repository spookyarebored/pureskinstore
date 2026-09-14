// ===========================================
// PureSkin Store — Bot Entry Point
// ===========================================

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
} from 'discord.js';
import { botConfig } from './config';
import { handleReady } from './events/ready';
import { handleInteraction } from './events/interactionCreate';
import * as ticketCommand from './commands/ticket';

async function start() {
  console.log('🚀 Starting PureSkin Store Bot...');

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  // --- Register Slash Commands ---
  const rest = new REST({ version: '10' }).setToken(botConfig.token);

  try {
    console.log('📝 Registering slash commands...');
    
    await rest.put(
      Routes.applicationGuildCommands(botConfig.clientId, botConfig.guildId),
      {
        body: [ticketCommand.data.toJSON()],
      }
    );

    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }

  // --- Events ---
  client.once('ready', () => handleReady(client));
  client.on('interactionCreate', handleInteraction);

  // --- Login ---
  await client.login(botConfig.token);
}

start().catch((error) => {
  console.error('❌ Failed to start bot:', error);
  process.exit(1);
});
