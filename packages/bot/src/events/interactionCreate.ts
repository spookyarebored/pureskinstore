// ===========================================
// PureSkin Store — Interaction Handler
// ===========================================

import {
  Interaction,
  StringSelectMenuInteraction,
  ButtonInteraction,
  TextChannel,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  AttachmentBuilder,
} from 'discord.js';
import { TICKET_CATEGORIES, COLORS } from '@pureskin/shared';
import type { TicketCategory } from '@pureskin/shared';
import * as ticketCommand from '../commands/ticket';
import {
  createTicketChannel,
  closeTicketChannel,
  deleteTicketChannel,
} from '../services/ticketService';
import { generateTranscript } from '../services/transcriptService';
import { sendLog } from '../services/logService';
import { isStaff } from '../utils/permissions';
import { prisma } from '@pureskin/database';

export async function handleInteraction(interaction: Interaction): Promise<void> {
  // --- Slash Commands ---
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'ticket') {
      await ticketCommand.execute(interaction);
    }
    return;
  }

  // --- Buttons ---
  if (interaction.isButton()) {
    await handleButton(interaction);
    return;
  }

  // --- Select Menus ---
  if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
    return;
  }
}

async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  // Open ticket button → show category select menu
  if (customId === 'open_ticket' || customId === 'open_ticket_buy') {
    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_category_select')
        .setPlaceholder('Sélectionnez une catégorie...')
        .addOptions(
          Object.values(TICKET_CATEGORIES).map((cat) => ({
            label: cat.label,
            value: cat.value,
            emoji: cat.emoji,
            description: cat.description,
          }))
        )
    );

    // If coming from restock button, pre-select BUY_ACCOUNT
    if (customId === 'open_ticket_buy') {
      await interaction.reply({
        content: '🛒 Sélectionnez la catégorie de votre ticket :',
        components: [selectMenu],
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '📋 Sélectionnez la catégorie de votre ticket :',
        components: [selectMenu],
        ephemeral: true,
      });
    }
    return;
  }

  // Close ticket
  if (customId === 'ticket_close') {
    if (!interaction.guild || !interaction.member) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!isStaff(member)) {
      await interaction.reply({
        content: '❌ Seul le staff peut fermer un ticket.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const channel = interaction.channel as TextChannel;
    const success = await closeTicketChannel(channel, interaction.user.id);

    if (success) {
      await interaction.editReply('✅ Ticket fermé avec succès.');

      // Log
      await sendLog(interaction.client, {
        title: '🔒 Ticket fermé',
        description: `**${channel.name}** fermé par <@${interaction.user.id}>`,
        color: COLORS.WARNING,
      });

      // DB log
      const ticket = await prisma.ticket.findUnique({
        where: { channelId: channel.id },
      });
      if (ticket) {
        await prisma.log.create({
          data: {
            action: 'TICKET_CLOSED',
            details: JSON.stringify({
              ticketNumber: ticket.ticketNumber,
              channelName: channel.name,
              closedBy: interaction.user.username,
            }),
          },
        });
      }
    } else {
      await interaction.editReply('❌ Ce ticket est déjà fermé ou introuvable.');
    }
    return;
  }

  // Transcript ticket
  if (customId === 'ticket_transcript') {
    if (!interaction.guild || !interaction.member) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!isStaff(member)) {
      await interaction.reply({
        content: '❌ Seul le staff peut transcrire un ticket.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const channel = interaction.channel as TextChannel;
    const transcript = await generateTranscript(channel);

    const buffer = Buffer.from(transcript, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, {
      name: `transcript-${channel.name}.txt`,
    });

    await interaction.editReply({
      content: '📁 Transcription générée :',
      files: [attachment],
    });
    return;
  }

  // Delete ticket
  if (customId === 'ticket_delete') {
    if (!interaction.guild || !interaction.member) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!isStaff(member)) {
      await interaction.reply({
        content: '❌ Seul le staff peut supprimer un ticket.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel as TextChannel;

    await interaction.reply('🗑️ Ce ticket sera supprimé dans 5 secondes...');

    // Log before deletion
    await sendLog(interaction.client, {
      title: '🗑️ Ticket supprimé',
      description: `**${channel.name}** supprimé par <@${interaction.user.id}>`,
      color: COLORS.ERROR,
    });

    const ticket = await prisma.ticket.findUnique({
      where: { channelId: channel.id },
    });
    if (ticket) {
      await prisma.log.create({
        data: {
          action: 'TICKET_DELETED',
          details: JSON.stringify({
            ticketNumber: ticket.ticketNumber,
            channelName: channel.name,
            deletedBy: interaction.user.username,
          }),
        },
      });
    }

    setTimeout(async () => {
      await deleteTicketChannel(channel);
    }, 5000);
    return;
  }
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  const { customId, values } = interaction;

  if (customId === 'ticket_category_select') {
    if (!interaction.guild || !interaction.member) return;

    const category = values[0] as TicketCategory;
    
    await interaction.deferReply({ ephemeral: true });

    const member = await interaction.guild.members.fetch(interaction.user.id);

    try {
      const result = await createTicketChannel(
        interaction.guild,
        member,
        category
      );

      if (!result) {
        await interaction.editReply(
          '❌ Vous avez déjà un ticket ouvert. Veuillez le fermer avant d\'en ouvrir un nouveau.'
        );
        return;
      }

      await interaction.editReply(
        `✅ Votre ticket a été créé : <#${result.channel.id}>`
      );

      // Log
      await sendLog(interaction.client, {
        title: '🎫 Ticket créé',
        description: `**Ticket #${result.ticketNumber}** créé par <@${interaction.user.id}>\nCatégorie : ${TICKET_CATEGORIES[category].label}`,
        color: COLORS.SUCCESS,
      });

      // DB log
      await prisma.log.create({
        data: {
          action: 'TICKET_CREATED',
          details: JSON.stringify({
            ticketNumber: result.ticketNumber,
            category,
            createdBy: interaction.user.username,
          }),
        },
      });
    } catch (error) {
      console.error('❌ Ticket creation error:', error);
      await interaction.editReply(
        '❌ Une erreur est survenue lors de la création du ticket.'
      );
    }
    return;
  }
}
