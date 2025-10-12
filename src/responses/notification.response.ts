/**
 * Notification response class
 */
export class NotificationResponse {
  constructor(
    public readonly success: boolean,
    public readonly messageId?: string,
    public readonly error?: string,
    public readonly data?: any,
    public readonly channel?: string
  ) {}

  /**
   * Create a successful response
   */
  static success(
    messageId: string,
    data?: any,
    channel?: string
  ): NotificationResponse {
    return new NotificationResponse(true, messageId, undefined, data, channel);
  }

  /**
   * Create a failure response
   */
  static failure(
    error: string,
    data?: any,
    channel?: string
  ): NotificationResponse {
    return new NotificationResponse(false, undefined, error, data, channel);
  }

  /**
   * Check if the notification was sent successfully
   */
  isSuccess(): boolean {
    return this.success;
  }

  /**
   * Check if the notification failed
   */
  isFailure(): boolean {
    return !this.success;
  }
}
