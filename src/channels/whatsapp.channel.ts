import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { TwilioConfig } from '../interfaces/notification-config.interface';

/**
 * WhatsApp notification channel using Twilio
 */
@Injectable()
export class WhatsAppChannel implements ChannelInterface {
  private client: Twilio;

  constructor(private config: TwilioConfig) {
    if (this.isConfigured()) {
      this.client = new Twilio(config.accountSid, config.authToken);
    }
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'WhatsApp channel is not configured',
          {},
          'whatsapp',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid WhatsApp number (whatsapp:+phone format required)',
          { recipient },
          'whatsapp',
        );
      }

      const body = this.formatMessageBody(message);

      const result = await this.client.messages.create({
        body,
        from: this.config.whatsappFrom || `whatsapp:${this.config.fromNumber}`,
        to: recipient,
      });

      return NotificationResponse.success(
        result.sid,
        { status: result.status, dateCreated: result.dateCreated },
        'whatsapp',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'whatsapp',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // WhatsApp format validation (whatsapp:+phone)
    const whatsappRegex = /^whatsapp:\+[1-9]\d{1,14}$/;
    return whatsappRegex.test(recipient);
  }

  getName(): string {
    return 'whatsapp';
  }

  isConfigured(): boolean {
    return !!(
      this.config?.accountSid &&
      this.config?.authToken &&
      (this.config?.whatsappFrom || this.config?.fromNumber)
    );
  }

  private formatMessageBody(message: NotificationMessage): string {
    let body = `*${message.title}*\n\n${message.body}`;
    
    if (message.data && Object.keys(message.data).length > 0) {
      body += '\n\n_Details:_';
      for (const [key, value] of Object.entries(message.data)) {
        body += `\n• *${key}:* ${value}`;
      }
    }
    
    return body;
  }
}
