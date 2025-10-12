import { Injectable } from '@nestjs/common';
import {
  ChannelInterface,
  NotificationMessage,
  NotificationResponse,
} from '../src';

/**
 * Example custom channel implementation for Push Notifications
 */
@Injectable()
export class PushNotificationChannel implements ChannelInterface {
  private apiKey: string;
  private apiUrl = 'https://api.pushservice.com/send';

  constructor(config: { apiKey: string }) {
    this.apiKey = config.apiKey;
  }

  async send(
    recipient: string,
    message: NotificationMessage,
  ): Promise<NotificationResponse> {
    try {
      if (!this.isConfigured()) {
        return NotificationResponse.failure(
          'Push notification channel is not configured',
          {},
          'push',
        );
      }

      if (!this.validateRecipient(recipient)) {
        return NotificationResponse.failure(
          'Invalid device token',
          { recipient },
          'push',
        );
      }

      // Simulate API call to push notification service
      const payload = {
        to: recipient,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: message.data || {},
      };

      // In a real implementation, you would use a library like 'axios' or 'node-fetch'
      // const response = await axios.post(this.apiUrl, payload, {
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // Simulated response
      const result = {
        id: 'push_' + Date.now(),
        status: 'sent',
      };

      return NotificationResponse.success(
        result.id,
        { status: result.status },
        'push',
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'push',
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    // Validate device token format
    // This is a simple example - adjust based on your push service
    return !!recipient && recipient.length > 10;
  }

  getName(): string {
    return 'push';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

/**
 * Example: Registering and using the custom channel
 */
import { Module, Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationModule, NotificationService } from '../src';

@Module({
  imports: [
    NotificationModule.forRoot({
      // Your existing channel configurations
      email: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: 'test@test.com',
          pass: 'password',
        },
      },
    }),
  ],
  providers: [
    {
      provide: PushNotificationChannel,
      useFactory: () => new PushNotificationChannel({ apiKey: 'your-api-key' }),
    },
    CustomChannelService,
  ],
})
export class CustomChannelModule {}

@Injectable()
export class CustomChannelService implements OnModuleInit {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly pushChannel: PushNotificationChannel,
  ) {}

  onModuleInit() {
    // Register the custom channel when the module initializes
    this.notificationService.registerChannel(this.pushChannel);
  }

  async sendPushNotification(deviceToken: string, title: string, body: string) {
    const message = NotificationMessage.create(title, body).withData({
      timestamp: Date.now(),
      priority: 'high',
    });

    const response = await this.notificationService.send(
      deviceToken,
      message,
      'push',
    );

    return {
      success: response.isSuccess(),
      messageId: response.messageId,
      error: response.error,
    };
  }
}
