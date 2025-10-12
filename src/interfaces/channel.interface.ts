import { NotificationMessage } from '../messages/notification.message';
import { NotificationResponse } from '../responses/notification.response';

/**
 * Interface for notification channels
 */
export interface ChannelInterface {
  /**
   * Send a notification through this channel
   */
  send(recipient: string, message: NotificationMessage): Promise<NotificationResponse>;

  /**
   * Validate the recipient format for this channel
   */
  validateRecipient(recipient: string): boolean;

  /**
   * Get the channel name
   */
  getName(): string;

  /**
   * Check if the channel is properly configured
   */
  isConfigured(): boolean;
}
