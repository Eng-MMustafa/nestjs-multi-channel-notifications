import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { TelegramConfig } from '../interfaces/notification-config.interface';

/**
 * Telegram notification channel
 */
@Injectable()
export class TelegramChannel implements ChannelInterface {
  private bot: Telegraf;

  constructor(private config: TelegramConfig) {
    if (this.isConfigured()) {
      this.bot = new Telegraf(config.botToken);
    }
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Telegram channel is not configured',
          {},
          'telegram',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid Telegram recipient (use @username or chat_id)',
          { recipient },
          'telegram',
        );
      }

      const chatId = recipient.startsWith('@') ? recipient : recipient;
      const messageText = this.formatMessage(message);

      const result = await this.bot.telegram.sendMessage(chatId, messageText, {
        parse_mode: 'Markdown',
      });

      return NotificationResponse.success(
        result.message_id.toString(),
        { chatId: result.chat.id },
        'telegram',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'telegram',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // Username (@username) or numeric chat ID
    return /^@[a-zA-Z0-9_]{5,}$/.test(recipient) || /^-?\d+$/.test(recipient);
  }

  getName(): string {
    return 'telegram';
  }

  isConfigured(): boolean {
    return !!this.config?.botToken;
  }

  private formatMessage(message: NotificationMessage): string {
    let text = `*${this.escapeMarkdown(message.title)}*\n\n${this.escapeMarkdown(message.body)}`;

    if (message.data && Object.keys(message.data).length > 0) {
      text += '\n\n_Details:_';
      for (const [key, value] of Object.entries(message.data)) {
        text += `\n• *${this.escapeMarkdown(key)}:* ${this.escapeMarkdown(String(value))}`;
      }
    }

    return text;
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }
}
