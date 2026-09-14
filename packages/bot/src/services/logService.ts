// ===========================================
// PureSkin Store — Bot Log Service
// ===========================================

import { TextChannel, EmbedBuilder, ColorResolvable, Client } from 'discord.js';
import { botConfig } from '../config';
import { COLORS } from '@pureskin/shared';

/**
 * Send a log message to the configured Discord log channel
 */
export async function sendLog(
  client: Client,
  data: {
    title: string;
    description: string;
    color?: number;
  }
): Promise<void> {
  if (!botConfig.logChannelId) return;

  try {
    const channel = await client.channels.fetch(botConfig.logChannelId);
    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor((data.color || COLORS.INFO) as ColorResolvable)
      .setTitle(data.title)
      .setDescription(data.description)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('❌ Failed to send log:', error);
  }
}
