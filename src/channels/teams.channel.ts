import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { TeamsConfig } from '../interfaces/notification-config.interface';

/**
 * Microsoft Teams notification channel using webhook
 */
@Injectable()
export class TeamsChannel implements ChannelInterface {
  constructor(private config: TeamsConfig) {}

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Teams channel is not configured',
          {},
          'teams',
        );
      }

      const card = this.buildAdaptiveCard(message);

      const response = await axios.post(this.config.webhookUrl, card, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return NotificationResponse.success(
        'teams_' + Date.now(),
        { status: response.status },
        'teams',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'teams',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // Teams uses webhook, so recipient is not strictly validated
    return true;
  }

  getName(): string {
    return 'teams';
  }

  isConfigured(): boolean {
    return !!this.config?.webhookUrl;
  }

  private buildAdaptiveCard(message: NotificationMessage): any {
    const card: any = {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.4',
            body: [
              {
                type: 'TextBlock',
                text: message.title,
                size: 'Large',
                weight: 'Bolder',
              },
              {
                type: 'TextBlock',
                text: message.body,
                wrap: true,
              },
            ],
          },
        },
      ],
    };

    if (message.data && Object.keys(message.data).length > 0) {
      const facts = Object.entries(message.data).map(([key, value]) => ({
        title: key,
        value: String(value),
      }));

      card.attachments[0].content.body.push({
        type: 'FactSet',
        facts,
      });
    }

    return card;
  }
}
