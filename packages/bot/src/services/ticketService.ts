// ===========================================
// PureSkin Store — Bot Ticket Service
// ===========================================

import {
  Guild,
  GuildMember,
  TextChannel,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
} from 'discord.js';
import { prisma } from '@pureskin/database';
import { botConfig } from '../config';
import { ticketChannelName, COLORS } from '@pureskin/shared';
import type { TicketCategory } from '@pureskin/shared';
import { createTicketEmbed, createTicketClosedEmbed } from '../utils/embeds';

/**
 * Create a new ticket channel and save to database
 */
export async function createTicketChannel(
  guild: Guild,
  member: GuildMember,
  category: TicketCategory
): Promise<{ channel: TextChannel; ticketNumber: number } | null> {
  try {
    // Find or create user in DB
    let user = await prisma.user.findUnique({
      where: { discordId: member.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          discordId: member.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          avatar: member.user.avatar,
          role: 'USER',
        },
      });
    }

    // Check for existing open ticket
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        creatorId: user.id,
        status: 'OPEN',
      },
    });

    if (existingTicket) {
      return null; // User already has an open ticket
    }

    // Create the ticket in DB first to get the number
    const ticket = await prisma.ticket.create({
      data: {
        category,
        creatorId: user.id,
        channelId: 'pending', // Will update after channel creation
      },
    });

    // Create the channel
    const channelName = ticketChannelName(member.user.username);
    
    const permissionOverwrites = [
      {
        id: guild.id, // @everyone - deny
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id, // Ticket creator - allow
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
        ],
      },
      {
        id: botConfig.staffRoleId, // Staff role - allow
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ];

    // Add owner role if configured
    if (botConfig.ownerRoleId) {
      permissionOverwrites.push({
        id: botConfig.ownerRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.AttachFiles,
        ],
      });
    }

    // Resolve parent category
    let parent: CategoryChannel | undefined;
    if (botConfig.ticketCategoryId) {
      const cat = await guild.channels.fetch(botConfig.ticketCategoryId);
      if (cat && cat.type === ChannelType.GuildCategory) {
        parent = cat as CategoryChannel;
      }
    }

    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: parent || undefined,
      permissionOverwrites,
      topic: `Ticket #${ticket.ticketNumber} — ${member.user.username}`,
    });

    // Update ticket with channel ID
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { channelId: channel.id },
    });

    // Send ticket embed in the channel
    const embed = createTicketEmbed({
      username: member.user.username,
      userId: member.id,
      category,
      ticketNumber: ticket.ticketNumber,
      createdAt: ticket.createdAt,
    });

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Fermer le ticket')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_transcript')
        .setLabel('Transcrire le ticket')
        .setEmoji('📁')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ticket_delete')
        .setLabel('Supprimer le ticket')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [buttons] });

    return { channel, ticketNumber: ticket.ticketNumber };
  } catch (error) {
    console.error('❌ Failed to create ticket:', error);
    throw error;
  }
}

/**
 * Close a ticket (remove user write permissions)
 */
export async function closeTicketChannel(
  channel: TextChannel,
  closedById: string
): Promise<boolean> {
  try {
    // Find ticket in DB
    const ticket = await prisma.ticket.findUnique({
      where: { channelId: channel.id },
      include: { creator: true },
    });

    if (!ticket || ticket.status !== 'OPEN') return false;

    // Remove send messages permission for creator
    await channel.permissionOverwrites.edit(ticket.creator.discordId, {
      SendMessages: false,
    });

    // Update DB
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    // Send closed embed
    const embed = createTicketClosedEmbed(closedById);
    
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_transcript')
        .setLabel('Transcrire le ticket')
        .setEmoji('📁')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('ticket_delete')
        .setLabel('Supprimer le ticket')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({ embeds: [embed], components: [buttons] });

    return true;
  } catch (error) {
    console.error('❌ Failed to close ticket:', error);
    return false;
  }
}

/**
 * Delete a ticket channel
 */
export async function deleteTicketChannel(channel: TextChannel): Promise<boolean> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { channelId: channel.id },
    });

    if (ticket) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'DELETED' },
      });
    }

    await channel.delete('Ticket supprimé');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete ticket:', error);
    return false;
  }
}
