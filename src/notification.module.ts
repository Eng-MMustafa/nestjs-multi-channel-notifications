import { Module, DynamicModule, Provider } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationModuleOptions } from './interfaces/notification-config.interface';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';
import { WhatsAppChannel } from './channels/whatsapp.channel';
import { VoiceChannel } from './channels/voice.channel';
import { SlackChannel } from './channels/slack.channel';
import { DiscordChannel } from './channels/discord.channel';
import { TeamsChannel } from './channels/teams.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { MessengerChannel } from './channels/messenger.channel';

@Module({})
export class NotificationModule {
  /**
   * Register the notification module with options
   */
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    const channelProviders: Provider[] = [];

    // Register Email channel
    if (options.email) {
      channelProviders.push({
        provide: EmailChannel,
        useFactory: () => new EmailChannel(options.email!),
      });
    }

    // Register SMS channel
    if (options.twilio) {
      channelProviders.push({
        provide: SmsChannel,
        useFactory: () => new SmsChannel(options.twilio!),
      });

      // Register WhatsApp channel
      channelProviders.push({
        provide: WhatsAppChannel,
        useFactory: () => new WhatsAppChannel(options.twilio!),
      });

      // Register Voice channel
      channelProviders.push({
        provide: VoiceChannel,
        useFactory: () => new VoiceChannel(options.twilio!),
      });
    }

    // Register Slack channel
    if (options.slack) {
      channelProviders.push({
        provide: SlackChannel,
        useFactory: () => new SlackChannel(options.slack!),
      });
    }

    // Register Discord channel
    if (options.discord) {
      channelProviders.push({
        provide: DiscordChannel,
        useFactory: () => new DiscordChannel(options.discord!),
      });
    }

    // Register Teams channel
    if (options.teams) {
      channelProviders.push({
        provide: TeamsChannel,
        useFactory: () => new TeamsChannel(options.teams!),
      });
    }

    // Register Telegram channel
    if (options.telegram) {
      channelProviders.push({
        provide: TelegramChannel,
        useFactory: () => new TelegramChannel(options.telegram!),
      });
    }

    // Register Messenger channel
    if (options.messenger) {
      channelProviders.push({
        provide: MessengerChannel,
        useFactory: () => new MessengerChannel(options.messenger!),
      });
    }

    return {
      module: NotificationModule,
      providers: [
        ...channelProviders,
        {
          provide: 'NOTIFICATION_CHANNELS',
          useFactory: (
            ...channels: any[]
          ) => {
            return channels.filter((c) => c !== undefined);
          },
          inject: [
            EmailChannel,
            SmsChannel,
            WhatsAppChannel,
            VoiceChannel,
            SlackChannel,
            DiscordChannel,
            TeamsChannel,
            TelegramChannel,
            MessengerChannel,
          ].filter((channel) => {
            // Only inject channels that are provided
            if (channel === EmailChannel) return !!options.email;
            if (channel === SmsChannel || channel === WhatsAppChannel || channel === VoiceChannel) {
              return !!options.twilio;
            }
            if (channel === SlackChannel) return !!options.slack;
            if (channel === DiscordChannel) return !!options.discord;
            if (channel === TeamsChannel) return !!options.teams;
            if (channel === TelegramChannel) return !!options.telegram;
            if (channel === MessengerChannel) return !!options.messenger;
            return false;
          }),
        },
        NotificationService,
      ],
      exports: [NotificationService],
    };
  }

  /**
   * Register the notification module asynchronously
   */
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<NotificationModuleOptions> | NotificationModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: NotificationModule,
      providers: [
        {
          provide: 'NOTIFICATION_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: NotificationService,
          useFactory: async (moduleOptions: NotificationModuleOptions) => {
            const module = NotificationModule.forRoot(moduleOptions);
            const providers = module.providers as Provider[];
            // This is a simplified async implementation
            // In production, you'd want to properly handle async initialization
            return providers.find((p) => (p as any).provide === NotificationService);
          },
          inject: ['NOTIFICATION_OPTIONS'],
        },
      ],
      exports: [NotificationService],
    };
  }
}
