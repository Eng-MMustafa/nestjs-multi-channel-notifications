import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { TwilioConfig } from '../interfaces/notification-config.interface';

/**
 * SMS notification channel using Twilio
 */
@Injectable()
export class SmsChannel implements ChannelInterface {
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
          'SMS channel is not configured',
          {},
          'sms',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid phone number (E.164 format required)',
          { recipient },
          'sms',
        );
      }

      const body = this.formatMessageBody(message);

      if (body.length > 1600) {
        return NotificationResponse.failure(
          'SMS body exceeds maximum length of 1600 characters',
          { length: body.length },
          'sms',
        );
      }

      const result = await this.client.messages.create({
        body,
        from: this.config.fromNumber,
        to: recipient,
      });

      return NotificationResponse.success(
        result.sid,
        { status: result.status, dateCreated: result.dateCreated },
        'sms',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'sms',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(recipient);
  }

  getName(): string {
    return 'sms';
  }

  isConfigured(): boolean {
    return !!(
      this.config?.accountSid &&
      this.config?.authToken &&
      this.config?.fromNumber
    );
  }

  private formatMessageBody(message: NotificationMessage): string {
    let body = `${message.title}\n\n${message.body}`;
    
    if (message.data && Object.keys(message.data).length > 0) {
      body += '\n\n';
      for (const [key, value] of Object.entries(message.data)) {
        body += `${key}: ${value}\n`;
      }
    }
    
    return body;
  }
}
