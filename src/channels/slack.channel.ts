import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { SlackConfig } from '../interfaces/notification-config.interface';

/**
 * Slack notification channel
 */
@Injectable()
export class SlackChannel implements ChannelInterface {
  private client: WebClient;

  constructor(private config: SlackConfig) {
    if (this.isConfigured()) {
      this.client = new WebClient(config.botToken);
    }
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Slack channel is not configured',
          {},
          'slack',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid Slack recipient (use #channel or @user)',
          { recipient },
          'slack',
        );
      }

      const blocks = this.buildMessageBlocks(message);

      const result = await this.client.chat.postMessage({
        channel: recipient,
        text: message.title,
        blocks,
      });

      return NotificationResponse.success(
        result.ts as string,
        { channel: result.channel },
        'slack',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'slack',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // Channel (#channel) or user (@user) format
    return /^[#@]/.test(recipient) || /^[a-zA-Z0-9_-]+$/.test(recipient);
  }

  getName(): string {
    return 'slack';
  }

  isConfigured(): boolean {
    return !!this.config?.botToken;
  }

  private buildMessageBlocks(message: NotificationMessage): any[] {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: message.title,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message.body,
        },
      },
    ];

    if (message.data && Object.keys(message.data).length > 0) {
      const fields = Object.entries(message.data).map(([key, value]) => ({
        type: 'mrkdwn',
        text: `*${key}:*\n${value}`,
      }));

      blocks.push({
        type: 'section',
        fields,
      });
    }

    return blocks;
  }
}
