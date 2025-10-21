# 🚀 NestJS Multi-Channel Notifications

[![npm version](https://badge.fury.io/js/nestjs-multi-channel-notifications.svg)](https://www.npmjs.com/package/nestjs-multi-channel-notifications)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-multi-channel-notifications.svg)](https://www.npmjs.com/package/nestjs-multi-channel-notifications)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Eng-MMustafa/nestjs-multi-channel-notifications.svg)](https://github.com/Eng-MMustafa/nestjs-multi-channel-notifications)

A comprehensive NestJS package that enables you to send notifications across multiple channels from a single, unified interface. Send emails, SMS, WhatsApp messages, Slack notifications, Discord messages, and more with a consistent API.

## 📡 Supported Channels

- ✉️ **Email** - via Nodemailer
- 📱 **SMS** - via Twilio
- 💬 **WhatsApp** - via Twilio
- 📞 **Voice** - via Twilio
- 💼 **Slack** - via Slack Web API
- 🎮 **Discord** - via Discord.js
- 👥 **Microsoft Teams** - via Webhooks
- 📢 **Telegram** - via Telegraf
- 📨 **Facebook Messenger** - via Graph API

## 📦 Installation

### Using npm:
```bash
npm install nestjs-multi-channel-notifications
```

### Using yarn:
```bash
yarn add nestjs-multi-channel-notifications
```

### Install peer dependencies:

**Using npm:**
```bash
npm install @nestjs/common @nestjs/core reflect-metadata rxjs
```

**Using yarn:**
```bash
yarn add @nestjs/common @nestjs/core reflect-metadata rxjs
```

## ⚙️ Configuration

### Basic Setup

Import the module in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { NotificationModule } from 'nestjs-multi-channel-notifications';

@Module({
  imports: [
    NotificationModule.forRoot({
      email: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password',
        },
        from: 'noreply@yourapp.com',
      },
      twilio: {
        accountSid: 'your_account_sid',
        authToken: 'your_auth_token',
        fromNumber: '+1234567890',
        whatsappFrom: 'whatsapp:+1234567890',
      },
      slack: {
        botToken: 'xoxb-your-slack-token',
      },
      discord: {
        botToken: 'your_discord_token',
        guildId: 'your_guild_id',
      },
      teams: {
        webhookUrl: 'your_webhook_url',
      },
      telegram: {
        botToken: 'your_bot_token',
      },
      messenger: {
        pageAccessToken: 'your_page_token',
      },
    }),
  ],
})
export class AppModule {}
```

### Environment Variables Setup

Create a `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Twilio (SMS, WhatsApp, Voice)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890

# Slack
SLACK_BOT_TOKEN=xoxb-your-slack-token

# Discord
DISCORD_BOT_TOKEN=your_discord_token
DISCORD_GUILD_ID=your_guild_id

# Teams
TEAMS_WEBHOOK_URL=your_webhook_url

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Messenger
MESSENGER_PAGE_ACCESS_TOKEN=your_page_token
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule } from '@nestjs-notifications/multi-channel';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NotificationModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        email: {
          host: configService.get('EMAIL_HOST'),
          port: configService.get('EMAIL_PORT'),
          auth: {
            user: configService.get('EMAIL_USER'),
            pass: configService.get('EMAIL_PASS'),
          },
          from: configService.get('EMAIL_FROM'),
        },
        twilio: {
          accountSid: configService.get('TWILIO_ACCOUNT_SID'),
          authToken: configService.get('TWILIO_AUTH_TOKEN'),
          fromNumber: configService.get('TWILIO_FROM_NUMBER'),
          whatsappFrom: configService.get('TWILIO_WHATSAPP_FROM'),
        },
        // Add other channels...
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## 🎯 Usage Examples

### Basic Usage in a Service

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService, NotificationMessage } from 'nestjs-multi-channel-notifications';

@Injectable()
export class UserService {
  constructor(private readonly notificationService: NotificationService) {}

  async sendWelcomeEmail(email: string, name: string) {
    const message = NotificationMessage.create(
      'Welcome to Our App!',
      `Hi ${name}, welcome aboard!`
    );

    const response = await this.notificationService.send(
      email,
      message,
      'email'
    );

    if (response.isSuccess()) {
      console.log('Email sent successfully:', response.messageId);
    } else {
      console.error('Failed to send email:', response.error);
    }

    return response;
  }
}
```

### 📧 Email Examples

```typescript
import { NotificationService, NotificationMessage } from 'nestjs-multi-channel-notifications';

// Basic email
const message = NotificationMessage.create(
  'Account Verification',
  'Please verify your email address.'
);

await this.notificationService.send('user@example.com', message, 'email');

// Email with attachments
const messageWithAttachments = NotificationMessage.create(
  'Welcome Package',
  'Welcome to our platform!'
).withAttachments([
  '/path/to/welcome-guide.pdf',
  '/path/to/terms.pdf'
]);

await this.notificationService.send('user@example.com', messageWithAttachments, 'email');

// Email with additional data
const messageWithData = NotificationMessage.create(
  'Account Created',
  'Your account has been successfully created.'
).withData({
  userId: 123,
  plan: 'Premium',
  createdAt: new Date().toISOString()
});

await this.notificationService.send('user@example.com', messageWithData, 'email');
```

### 💬 SMS Examples

```typescript
// Basic SMS
const message = NotificationMessage.create(
  'Security Alert',
  'Your account was accessed from a new device.'
);

await this.notificationService.send('+1234567890', message, 'sms');

// SMS with additional data
const messageWithData = NotificationMessage.create(
  'Login Alert',
  'New login detected.'
).withData({
  ip: '192.168.1.1',
  device: 'iPhone',
  location: 'New York'
});

await this.notificationService.send('+1234567890', messageWithData, 'sms');
```

### 📱 WhatsApp Examples

```typescript
// Basic WhatsApp message
const message = NotificationMessage.create(
  'Order Update',
  'Your order #12345 has been shipped!'
);

await this.notificationService.send('whatsapp:+1234567890', message, 'whatsapp');

// WhatsApp with tracking data
const messageWithTracking = NotificationMessage.create(
  'Delivery Status',
  'Your package is on its way!'
).withData({
  tracking: 'TRK123456789',
  carrier: 'UPS',
  eta: '2 hours'
});

await this.notificationService.send('whatsapp:+1234567890', messageWithTracking, 'whatsapp');
```

### 📞 Voice Examples

```typescript
// Basic voice call
const message = NotificationMessage.create(
  'Emergency Alert',
  'This is an urgent security notification.'
);

await this.notificationService.send('+1234567890', message, 'voice');

// Voice with options
const messageWithOptions = NotificationMessage.create(
  'System Alert',
  'Your server is down.'
).withOptions({
  voice: 'alice',
  language: 'en-US'
});

await this.notificationService.send('+1234567890', messageWithOptions, 'voice');
```

### 💼 Slack Examples

```typescript
// Send to channel
const message = NotificationMessage.create(
  'Deployment Complete',
  'App deployed to production successfully!'
);

await this.notificationService.send('#general', message, 'slack');

// Send to user
await this.notificationService.send('@username', message, 'slack');

// Slack with deployment data
const messageWithData = NotificationMessage.create(
  'Release v2.1.0',
  'New version deployed successfully.'
).withData({
  environment: 'production',
  commit: 'abc123',
  deployTime: '2 minutes'
});

await this.notificationService.send('#deployments', messageWithData, 'slack');

// Send to multiple channels
const channels = ['#general', '#engineering', '@admin'];
const responses = await this.notificationService.sendToMany(
  channels,
  message,
  'slack'
);
```

### 🎮 Discord Examples

```typescript
// Send to channel
const message = NotificationMessage.create(
  'Server Status',
  'All systems operational.'
).withData({
  uptime: '99.9%',
  responseTime: '150ms'
});

await this.notificationService.send('general', message, 'discord');

// Send DM to user (use user ID)
await this.notificationService.send('123456789', message, 'discord');

// Send to multiple channels
const channels = ['general', 'alerts', 'dev-team'];
const responses = await this.notificationService.sendToMany(
  channels,
  message,
  'discord'
);
```

### 👥 Teams Examples

```typescript
// Basic Teams message
const message = NotificationMessage.create(
  'Meeting Reminder',
  'Team standup in 15 minutes.'
);

await this.notificationService.send('webhook', message, 'teams');

// Teams with meeting details
const messageWithDetails = NotificationMessage.create(
  'Project Update',
  'Weekly project status update.'
).withData({
  progress: '75%',
  deadline: '2024-01-15',
  teamSize: '8 people'
});

await this.notificationService.send('', messageWithDetails, 'teams');
```

### 📢 Telegram Examples

```typescript
// Send to username
const message = NotificationMessage.create(
  'Price Alert',
  'Bitcoin reached $50,000!'
);

await this.notificationService.send('@username', message, 'telegram');

// Send to chat ID
await this.notificationService.send('123456789', message, 'telegram');

// Telegram with price data
const messageWithData = NotificationMessage.create(
  'Market Update',
  'Cryptocurrency prices updated.'
).withData({
  btcPrice: '$50,125',
  change: '+2.5%',
  volume: '$2.1B'
});

await this.notificationService.send('@username', messageWithData, 'telegram');
```

### 📨 Messenger Examples

```typescript
// Basic Messenger message
const message = NotificationMessage.create(
  'New Message',
  'You have a message from support.'
);

await this.notificationService.send('1234567890', message, 'messenger');

// Messenger with support ticket data
const messageWithData = NotificationMessage.create(
  'Support Ticket #456',
  'Your ticket has been updated.'
).withData({
  status: 'In Progress',
  agent: 'John Doe',
  priority: 'High'
});

await this.notificationService.send('1234567890', messageWithData, 'messenger');
```

## 🔧 Advanced Features

### Send to Multiple Recipients

```typescript
const message = NotificationMessage.create(
  'System Maintenance',
  'Scheduled maintenance in 1 hour.'
);

const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

const responses = await this.notificationService.sendToMany(
  recipients,
  message,
  'email'
);

// Check results
responses.forEach((response, index) => {
  if (response.isSuccess()) {
    console.log(`Sent to ${recipients[index]}`);
  } else {
    console.error(`Failed to send to ${recipients[index]}: ${response.error}`);
  }
});
```

### Send to Multiple Channels

```typescript
const message = NotificationMessage.create(
  'Critical Alert',
  'Production server is down!'
);

const results = await this.notificationService.sendToMultipleChannels(
  'admin@example.com',
  message,
  ['email', 'sms', 'slack']
);

// Check results for each channel
Object.entries(results).forEach(([channel, response]) => {
  console.log(`${channel}: ${response.isSuccess() ? 'Success' : 'Failed'}`);
});
```

### Get Available Channels

```typescript
const availableChannels = this.notificationService.getAvailableChannels();
console.log('Available channels:', availableChannels);

const configuredChannels = this.notificationService.getConfiguredChannels();
console.log('Configured channels:', configuredChannels);
```

### Custom Channel Implementation

Create your own custom channel:

```typescript
import { Injectable } from '@nestjs/common';
import { ChannelInterface, NotificationMessage, NotificationResponse } from '@nestjs-notifications/multi-channel';

@Injectable()
export class MyCustomChannel implements ChannelInterface {
  async send(recipient: string, message: NotificationMessage): Promise<NotificationResponse> {
    try {
      // Your custom sending logic here
      const result = await this.sendMessage(recipient, message);
      
      return NotificationResponse.success(
        result.id,
        result,
        'custom'
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'custom'
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    return !!recipient && recipient.length > 0;
  }

  getName(): string {
    return 'custom';
  }

  isConfigured(): boolean {
    return true; // Check your configuration
  }

  private async sendMessage(recipient: string, message: NotificationMessage) {
    // Implement your custom logic
    return { id: 'custom_' + Date.now() };
  }
}
```

Register your custom channel:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationService } from '@nestjs-notifications/multi-channel';
import { MyCustomChannel } from './my-custom.channel';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly customChannel: MyCustomChannel,
  ) {}

  onModuleInit() {
    this.notificationService.registerChannel(this.customChannel);
  }
}
```

## 🧪 Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService, NotificationModule, NotificationMessage } from '@nestjs-notifications/multi-channel';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NotificationModule.forRoot({
          email: {
            host: 'smtp.test.com',
            port: 587,
            auth: {
              user: 'test@test.com',
              pass: 'test',
            },
          },
        }),
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should send email notification', async () => {
    const message = NotificationMessage.create('Test', 'Test message');
    const response = await service.send('test@example.com', message, 'email');
    
    expect(response).toBeDefined();
  });
});
```

## 📋 API Reference

### NotificationService

#### Methods

- `send(recipient: string, message: NotificationMessage, channel: string): Promise<NotificationResponse>`
  - Send a notification through a specific channel

- `sendToMany(recipients: string[], message: NotificationMessage, channel: string): Promise<NotificationResponse[]>`
  - Send to multiple recipients on the same channel

- `sendToMultipleChannels(recipient: string, message: NotificationMessage, channels: string[]): Promise<Record<string, NotificationResponse>>`
  - Send through multiple channels

- `getAvailableChannels(): string[]`
  - Get all available channels

- `getConfiguredChannels(): string[]`
  - Get all properly configured channels

- `hasChannel(channel: string): boolean`
  - Check if a channel is available

- `registerChannel(channel: ChannelInterface): void`
  - Register a custom channel

### NotificationMessage

#### Methods

- `static create(title: string, body: string): NotificationMessage`
  - Create a new notification message

- `withData(data: Record<string, any>): NotificationMessage`
  - Add additional data

- `withAttachments(attachments: string[]): NotificationMessage`
  - Add file attachments (Email only)

- `withOptions(options: Record<string, any>): NotificationMessage`
  - Add channel-specific options

### NotificationResponse

#### Properties

- `success: boolean` - Whether the notification was sent successfully
- `messageId?: string` - The message ID from the provider
- `error?: string` - Error message if failed
- `data?: any` - Additional response data
- `channel?: string` - The channel used

#### Methods

- `isSuccess(): boolean` - Check if successful
- `isFailure(): boolean` - Check if failed

## 📝 Channel-Specific Notes

### Email
- Supports HTML formatting
- Supports attachments
- Uses Nodemailer

### SMS & WhatsApp & Voice
- Requires Twilio account
- Phone numbers must be in E.164 format (`+1234567890`)
- WhatsApp requires `whatsapp:` prefix
- SMS body max: 1600 characters
- Voice message max: 1000 characters

### Slack
- Requires bot token with proper scopes
- Supports channels (`#channel`) and users (`@user`)
- Uses Block Kit for rich formatting

### Discord
- Requires bot token and guild ID
- Supports both channel names and user IDs
- Uses embeds for rich formatting

### Teams
- Uses incoming webhooks
- Supports Adaptive Cards
- Recipient parameter is ignored (uses webhook)

### Telegram
- Requires bot token from BotFather
- Supports usernames (`@username`) or chat IDs
- Supports Markdown formatting

### Messenger
- Requires Facebook Page Access Token
- Recipient must be numeric Facebook user ID
- Limited to existing conversations

## 🔐 Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use app-specific passwords** - For email services
3. **Rotate tokens regularly** - For all services
4. **Limit bot permissions** - Only grant necessary scopes
5. **Validate recipients** - Before sending notifications
6. **Rate limiting** - Implement rate limiting in production
7. **Error handling** - Always check response status

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find a bug or have a feature request, please open an issue on GitHub.

## 📧 Support

For support, email mhammed24010@gmail.com or open an issue on GitHub.

## 🌟 Star Us!

If you find this package helpful, please give us a star on GitHub!

---

Made with ❤️ for the NestJS community
