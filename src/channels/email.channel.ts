import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ChannelInterface } from '../interfaces/channel.interface';
import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';
import { EmailConfig } from '../interfaces/notification-config.interface';

/**
 * Email notification channel using nodemailer
 */
@Injectable()
export class EmailChannel implements ChannelInterface {
  private transporter: nodemailer.Transporter;

  constructor(private config: EmailConfig) {
    if (this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: config.host || 'smtp.gmail.com',
        port: config.port || 587,
        secure: config.secure || false,
        auth: config.auth,
      });
    }
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Email channel is not configured',
          {},
          'email',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid email address',
          { recipient },
          'email',
        );
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.config.from || this.config.auth?.user,
        to: recipient,
        subject: message.title,
        text: message.body,
        html: this.generateHtmlBody(message),
        attachments: message.attachments?.map((path) => ({ path })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      return NotificationResponse.success(
        result.messageId,
        { response: result.response },
        'email',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'email',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  getName(): string {
    return 'email';
  }

  isConfigured(): boolean {
    return !!(this.config?.auth?.user && this.config?.auth?.pass);
  }

  private generateHtmlBody(message: NotificationMessage): string {
    let html = `<h2>${message.title}</h2><p>${message.body}</p>`;
    
    if (message.data && Object.keys(message.data).length > 0) {
      html += '<hr><h3>Additional Information:</h3><ul>';
      for (const [key, value] of Object.entries(message.data)) {
        html += `<li><strong>${key}:</strong> ${value}</li>`;
      }
      html += '</ul>';
    }
    
    return html;
  }
}
