// ===========================================
// PureSkin Store — Discord Service (API side)
// ===========================================

import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config';
import { COLORS } from '@pureskin/shared';

let client: Client | null = null;

/**
 * Initialize Discord client for API-side operations
 */
export async function initDiscordClient(): Promise<Client> {
  if (client?.isReady()) return client;

  client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  await client.login(config.discordToken);
  
  return new Promise((resolve) => {
    client!.once('ready', () => {
      console.log('✅ Discord client (API) ready');
      resolve(client!);
    });
  });
}

/**
 * Get Discord client instance
 */
export function getDiscordClient(): Client | null {
  return client;
}

/**
 * Get text channels from the configured guild
 */
export async function getGuildChannels() {
  const c = await initDiscordClient();
  const guild = await c.guilds.fetch(config.guildId);
  const channels = await guild.channels.fetch();
  
  return channels
    .filter((ch) => ch !== null && ch.type === 0) // Text channels only
    .map((ch) => ({
      id: ch!.id,
      name: ch!.name,
      type: ch!.type,
    }));
}

/**
 * Send a restock embed to a Discord channel
 */
export async function sendRestockEmbed(data: {
  channelId: string;
  title: string;
  description?: string;
  priceFrom: number;
  accountCount: number;
  imageUrl?: string;
}): Promise<string | null> {
  const c = await initDiscordClient();
  const channel = await c.channels.fetch(data.channelId);
  
  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error('Channel introuvable ou non textuel');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.RESTOCK)
    .setTitle(`🟢 ${data.title}`)
    .setDescription(data.description || '> De nouveaux comptes sont disponibles !')
    .addFields(
      { name: '📦 Comptes disponibles', value: `**${data.accountCount}**`, inline: true },
      { name: '💰 Prix à partir de', value: `**${data.priceFrom}€**`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { 
        name: '🛒 Comment acheter ?', 
        value: 'Ouvrez un ticket dans la catégorie **Acheter un compte FN**.' 
      }
    )
    .setTimestamp()
    .setFooter({ text: 'PureSkin Store — Restock' });

  if (data.imageUrl) {
    embed.setImage(data.imageUrl);
  }

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket_buy')
      .setLabel('🛒 Acheter')
      .setStyle(ButtonStyle.Success)
  );

  const message = await channel.send({ embeds: [embed], components: [button] });
  return message.id;
}

/**
 * Send a log message to the configured log channel
 */
export async function sendLogToDiscord(data: {
  title: string;
  description: string;
  color?: number;
}): Promise<void> {
  if (!config.logChannelId) return;

  try {
    const c = await initDiscordClient();
    const channel = await c.channels.fetch(config.logChannelId);
    
    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(data.color || COLORS.INFO)
      .setTitle(data.title)
      .setDescription(data.description)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('❌ Failed to send Discord log:', error);
  }
}
