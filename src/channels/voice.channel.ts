import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { TwilioConfig } from '../interfaces/notification-config.interface';

/**
 * Voice call notification channel using Twilio
 */
@Injectable()
export class VoiceChannel implements ChannelInterface {
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
          'Voice channel is not configured',
          {},
          'voice',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid phone number (E.164 format required)',
          { recipient },
          'voice',
        );
      }

      const voiceMessage = this.formatVoiceMessage(message);

      if (voiceMessage.length > 1000) {
        return NotificationResponse.failure(
          'Voice message exceeds maximum length of 1000 characters',
          { length: voiceMessage.length },
          'voice',
        );
      }

      const twiml = this.generateTwiML(voiceMessage, message.options);

      const result = await this.client.calls.create({
        twiml,
        to: recipient,
        from: this.config.fromNumber,
      });

      return NotificationResponse.success(
        result.sid,
        { status: result.status, direction: result.direction },
        'voice',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'voice',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(recipient);
  }

  getName(): string {
    return 'voice';
  }

  isConfigured(): boolean {
    return !!(
      this.config?.accountSid &&
      this.config?.authToken &&
      this.config?.fromNumber
    );
  }

  private formatVoiceMessage(message: NotificationMessage): string {
    return `${message.title}. ${message.body}`;
  }

  private generateTwiML(message: string, options?: Record<string, any>): string {
    const voice = options?.voice || 'alice';
    const language = options?.language || 'en-US';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${this.escapeXml(message)}</Say>
</Response>`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
