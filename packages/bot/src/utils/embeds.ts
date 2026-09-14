// ===========================================
// PureSkin Store — Embed Builders
// ===========================================

import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { COLORS, TICKET_CATEGORIES, ACCOUNT_STATUSES } from '@pureskin/shared';
import type { TicketCategory } from '@pureskin/shared';

/**
 * Create the ticket panel embed (sent with /ticket command)
 */
export function createTicketPanelEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.PRIMARY as ColorResolvable)
    .setTitle('🎫 Système de Tickets — PureSkin Store')
    .setDescription(
      '> Besoin d\'aide ou envie d\'acheter un compte ?\n' +
      '> Cliquez sur le bouton ci-dessous pour ouvrir un ticket.\n\n' +
      '**Catégories disponibles :**\n' +
      '🛒 Acheter un compte FN\n' +
      '🔐 Problème de connexion au compte\n' +
      '🔄 Échange'
    )
    .setFooter({ text: 'PureSkin Store — Support' })
    .setTimestamp();
}

/**
 * Create the ticket info embed (sent inside the ticket channel)
 */
export function createTicketEmbed(data: {
  username: string;
  userId: string;
  category: TicketCategory;
  ticketNumber: number;
  createdAt: Date;
}): EmbedBuilder {
  const categoryInfo = TICKET_CATEGORIES[data.category];

  return new EmbedBuilder()
    .setColor(COLORS.PRIMARY as ColorResolvable)
    .setTitle(`🎫 Ticket #${data.ticketNumber}`)
    .setDescription(
      `> Un membre du staff vous répondra bientôt.\n\n` +
      `**Merci de décrire votre demande en détail.**`
    )
    .addFields(
      { name: '👤 Utilisateur', value: `<@${data.userId}>`, inline: true },
      { name: `${categoryInfo.emoji} Catégorie`, value: categoryInfo.description, inline: true },
      { name: '📅 Créé le', value: `<t:${Math.floor(data.createdAt.getTime() / 1000)}:F>`, inline: true },
      { name: '🔢 Numéro', value: `#${data.ticketNumber}`, inline: true }
    )
    .setFooter({ text: 'PureSkin Store — Ticket' })
    .setTimestamp();
}

/**
 * Create the ticket closed embed
 */
export function createTicketClosedEmbed(closedBy: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR as ColorResolvable)
    .setTitle('🔒 Ticket fermé')
    .setDescription(
      `Ce ticket a été fermé par <@${closedBy}>.\n\n` +
      `Le staff peut supprimer ce ticket ou générer une transcription.`
    )
    .setTimestamp();
}

/**
 * Create the log embed for Discord log channel
 */
export function createLogEmbed(data: {
  title: string;
  description: string;
  color?: number;
}): EmbedBuilder {
  return new EmbedBuilder()
    .setColor((data.color || COLORS.INFO) as ColorResolvable)
    .setTitle(data.title)
    .setDescription(data.description)
    .setTimestamp();
}
