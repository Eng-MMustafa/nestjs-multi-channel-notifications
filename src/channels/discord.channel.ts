import { Injectable } from '@nestjs/common';
import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from 'discord.js';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { DiscordConfig } from '../interfaces/notification-config.interface';

/**
 * Discord notification channel
 */
@Injectable()
export class DiscordChannel implements ChannelInterface {
  private client: Client;
  private isReady = false;

  constructor(private config: DiscordConfig) {
    if (this.isConfigured()) {
      this.initializeClient();
    }
  }

  private async initializeClient(): Promise<void> {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.client.once('ready', () => {
      this.isReady = true;
    });

    await this.client.login(this.config.botToken);
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Discord channel is not configured',
          {},
          'discord',
        );
      }

      if (!this.isReady) {
        return NotificationResponse.failure(
          'Discord client is not ready',
          {},
          'discord',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid Discord recipient',
          { recipient },
          'discord',
        );
      }

      const embed = this.buildEmbed(message);
      
      // Try to find channel by name or ID
      let channel: TextChannel;
      
      if (/^\d+$/.test(recipient)) {
        // User ID - send DM
        const user = await this.client.users.fetch(recipient);
        const dmChannel = await user.createDM();
        const sentMessage = await dmChannel.send({ embeds: [embed] });
        
        return NotificationResponse.success(
          sentMessage.id,
          { channelId: dmChannel.id },
          'discord',
        );
      } else {
        // Channel name
        const guild = this.config.guildId 
          ? await this.client.guilds.fetch(this.config.guildId)
          : this.client.guilds.cache.first();
          
        if (!guild) {
          return NotificationResponse.failure(
            'No guild found',
            {},
            'discord',
          );
        }

        const channels = await guild.channels.fetch();
        channel = channels.find(
          (ch) => ch?.name === recipient.replace('#', '') && ch instanceof TextChannel,
        ) as TextChannel;

        if (!channel) {
          return NotificationResponse.failure(
            `Channel ${recipient} not found`,
            {},
            'discord',
          );
        }

        const sentMessage = await channel.send({ embeds: [embed] });
        
        return NotificationResponse.success(
          sentMessage.id,
          { channelId: channel.id, guildId: guild.id },
          'discord',
        );
      }
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'discord',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    return !!recipient && recipient.length > 0;
  }

  getName(): string {
    return 'discord';
  }

  isConfigured(): boolean {
    return !!this.config?.botToken;
  }

  private buildEmbed(message: NotificationMessage): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(message.title)
      .setDescription(message.body)
      .setColor(0x5865f2)
      .setTimestamp();

    if (message.data && Object.keys(message.data).length > 0) {
      for (const [key, value] of Object.entries(message.data)) {
        embed.addFields({ name: key, value: String(value), inline: true });
      }
    }

    return embed;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
    }
  }
}
