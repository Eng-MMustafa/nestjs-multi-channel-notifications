/**
 * Configuration interface for the notification module
 */
export interface NotificationModuleOptions {
  /**
   * Email configuration
   */
  email?: EmailConfig;

  /**
   * Twilio configuration (for SMS, WhatsApp, Voice)
   */
  twilio?: TwilioConfig;

  /**
   * Slack configuration
   */
  slack?: SlackConfig;

  /**
   * Discord configuration
   */
  discord?: DiscordConfig;

  /**
   * Microsoft Teams configuration
   */
  teams?: TeamsConfig;

  /**
   * Telegram configuration
   */
  telegram?: TelegramConfig;

  /**
   * Facebook Messenger configuration
   */
  messenger?: MessengerConfig;
}

export interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from?: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  whatsappFrom?: string;
}

export interface SlackConfig {
  botToken: string;
}

export interface DiscordConfig {
  botToken: string;
  guildId?: string;
}

export interface TeamsConfig {
  webhookUrl: string;
}

export interface TelegramConfig {
  botToken: string;
}

export interface MessengerConfig {
  pageAccessToken: string;
}
