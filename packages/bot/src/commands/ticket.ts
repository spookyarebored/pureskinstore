// ===========================================
// PureSkin Store — /ticket Command
// ===========================================

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { createTicketPanelEmbed } from '../utils/embeds';

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Envoyer le panel de tickets');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = createTicketPanelEmbed();

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('🎫 Ouvrir un ticket')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({
    embeds: [embed],
    components: [button],
  });
}
