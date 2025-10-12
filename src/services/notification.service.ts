import { Injectable, Inject } from '@nestjs/common';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';

/**
 * Main notification service that manages all channels
 */
@Injectable()
export class NotificationService {
  private channels: Map<string, ChannelInterface> = new Map();

  constructor(
    @Inject('NOTIFICATION_CHANNELS')
    channels: ChannelInterface[],
  ) {
    channels.forEach((channel) => {
      this.channels.set(channel.getName(), channel);
    });
  }

  /**
   * Send a notification through a specific channel
   */
  async send(
    recipient: string,
    message: NotificationMessage,
    channel: string,
  ): Promise<NotificationResponse> {
    const channelInstance = this.channels.get(channel);

    if (!channelInstance) {
      return NotificationResponse.failure(
        `Channel '${channel}' is not registered`,
        { availableChannels: Array.from(this.channels.keys()) },
      );
    }

    if (!channelInstance.isConfigured()) {
      return NotificationResponse.failure(
        `Channel '${channel}' is not properly configured`,
        {},
        channel,
      );
    }

    return await channelInstance.send(recipient, message);
  }

  /**
   * Send a notification to multiple recipients on the same channel
   */
  async sendToMany(
    recipients: string[],
    message: NotificationMessage,
    channel: string,
  ): Promise<NotificationResponse[]> {
    const promises = recipients.map((recipient) =>
      this.send(recipient, message, channel),
    );
    return await Promise.all(promises);
  }

  /**
   * Send a notification through multiple channels
   */
  async sendToMultipleChannels(
    recipient: string,
    message: NotificationMessage,
    channels: string[],
  ): Promise<Record<string, NotificationResponse>> {
    const results: Record<string, NotificationResponse> = {};

    for (const channel of channels) {
      results[channel] = await this.send(recipient, message, channel);
    }

    return results;
  }

  /**
   * Get all available channels
   */
  getAvailableChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Get all configured channels
   */
  getConfiguredChannels(): string[] {
    return Array.from(this.channels.entries())
      .filter(([_, channel]) => channel.isConfigured())
      .map(([name]) => name);
  }

  /**
   * Check if a channel is available
   */
  hasChannel(channel: string): boolean {
    return this.channels.has(channel);
  }

  /**
   * Register a custom channel
   */
  registerChannel(channel: ChannelInterface): void {
    this.channels.set(channel.getName(), channel);
  }
}
