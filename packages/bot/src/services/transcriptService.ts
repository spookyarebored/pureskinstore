// ===========================================
// PureSkin Store — Transcript Service
// ===========================================

import { TextChannel, Collection, Message } from 'discord.js';

/**
 * Generate a text transcript of a ticket channel
 */
export async function generateTranscript(channel: TextChannel): Promise<string> {
  const messages: Message[] = [];
  let lastId: string | undefined;

  // Fetch all messages (100 at a time)
  while (true) {
    const fetched: Collection<string, Message> = await channel.messages.fetch({
      limit: 100,
      ...(lastId ? { before: lastId } : {}),
    });

    if (fetched.size === 0) break;

    messages.push(...fetched.values());
    lastId = fetched.last()?.id;

    if (fetched.size < 100) break;
  }

  // Sort chronologically
  messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  // Format transcript
  const lines = messages
    .filter((msg) => !msg.author.bot || msg.embeds.length === 0) // Skip bot embeds
    .map((msg) => {
      const timestamp = msg.createdAt.toLocaleString('fr-FR');
      const content = msg.content || '[Embed/Attachment]';
      return `[${timestamp}] ${msg.author.username} : ${content}`;
    });

  const header = [
    '='.repeat(60),
    `Transcription du ticket: ${channel.name}`,
    `Date de transcription: ${new Date().toLocaleString('fr-FR')}`,
    `Nombre de messages: ${lines.length}`,
    '='.repeat(60),
    '',
  ];

  return [...header, ...lines].join('\n');
}
