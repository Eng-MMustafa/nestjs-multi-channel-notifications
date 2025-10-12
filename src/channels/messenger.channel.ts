import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { MessengerConfig } from '../interfaces/notification-config.interface';

/**
 * Facebook Messenger notification channel
 */
@Injectable()
export class MessengerChannel implements ChannelInterface {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0/me/messages';

  constructor(private config: MessengerConfig) {}

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Messenger channel is not configured',
          {},
          'messenger',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid Facebook user ID (numeric ID required)',
          { recipient },
          'messenger',
        );
      }

      const messageText = this.formatMessage(message);

      const payload = {
        recipient: { id: recipient },
        message: { text: messageText },
      };

      const response = await axios.post(this.apiUrl, payload, {
        params: {
          access_token: this.config.pageAccessToken,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return NotificationResponse.success(
        response.data.message_id,
        { recipientId: response.data.recipient_id },
        'messenger',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.response?.data?.error?.message || error.message,
        { error },
        'messenger',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // Facebook user ID (numeric)
    return /^\d+$/.test(recipient);
  }

  getName(): string {
    return 'messenger';
  }

  isConfigured(): boolean {
    return !!this.config?.pageAccessToken;
  }

  private formatMessage(message: NotificationMessage): string {
    let text = `${message.title}\n\n${message.body}`;

    if (message.data && Object.keys(message.data).length > 0) {
      text += '\n\n📋 Details:';
      for (const [key, value] of Object.entries(message.data)) {
        text += `\n• ${key}: ${value}`;
      }
    }

    return text;
  }
}
