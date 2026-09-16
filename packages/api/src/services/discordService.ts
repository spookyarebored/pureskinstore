// ===========================================
// PureSkin Store — Discord Service (API side)
// ===========================================

import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../config';
import { COLORS } from '@pureskin/shared';

let client: Client | null = null;

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

export function getDiscordClient(): Client | null {
  return client;
}

export async function getGuildChannels() {
  const c = await initDiscordClient();
  const guild = await c.guilds.fetch(config.guildId);
  const channels = await guild.channels.fetch();

  return channels
    .filter((ch) => ch !== null && ch.type === 0)
    .map((ch) => ({
      id: ch!.id,
      name: ch!.name,
      type: ch!.type,
    }));
}

type RestockVariant = {
  name: string;
  price: number;
  stock: number;
};

export async function sendRestockEmbed(data: {
  channelId: string;
  title: string;
  description?: string;
  priceFrom: number;
  accountCount: number;
  imageUrl?: string;
  variants?: RestockVariant[];
}): Promise<string | null> {
  const c = await initDiscordClient();
  const channel = await c.channels.fetch(data.channelId);

  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error('Channel introuvable ou non textuel');
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.RESTOCK)
    .setTitle(data.title || 'FA Fortnite Accounts Restocked')
    .setDescription(data.description || 'Our product **FA Fortnite Accounts** has just been restocked!\n[Buy Now](https://discord.com)');

  if (data.variants?.length) {
    for (const variant of data.variants) {
      embed.addFields(
        { name: '**Variant**', value: variant.name || 'Sans nom', inline: false },
        { name: '**Price**', value: `$${variant.price.toFixed(2)}`, inline: true },
        { name: '**Stock**', value: String(variant.stock), inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
      );
    }
  } else {
    embed.addFields(
      { name: '**Variant**', value: 'Fortnite Accounts', inline: false },
      { name: '**Price**', value: `$${data.priceFrom.toFixed(2)}`, inline: true },
      { name: '**Stock**', value: String(data.accountCount), inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
    );
  }

  if (data.imageUrl) {
    embed.setImage(data.imageUrl);
  }

  embed.setFooter({ text: 'PureSkin Store' });

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket_buy')
      .setLabel('🛒 Buy Now')
      .setStyle(ButtonStyle.Success)
  );

  const message = await channel.send({
    content: '@everyone',
    embeds: [embed],
    components: [button],
    allowedMentions: { parse: ['everyone'] },
  });
  return message.id;
}

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
