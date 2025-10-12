/**
 * Notification message class
 */
export class NotificationMessage {
  constructor(
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, any>,
    public readonly attachments?: string[],
    public readonly options?: Record<string, any>
  ) {}

  /**
   * Create a new notification message
   */
  static create(title: string, body: string): NotificationMessage {
    return new NotificationMessage(title, body);
  }

  /**
   * Add additional data to the message
   */
  withData(data: Record<string, any>): NotificationMessage {
    return new NotificationMessage(
      this.title,
      this.body,
      data,
      this.attachments,
      this.options
    );
  }

  /**
   * Add attachments to the message
   */
  withAttachments(attachments: string[]): NotificationMessage {
    return new NotificationMessage(
      this.title,
      this.body,
      this.data,
      attachments,
      this.options
    );
  }

  /**
   * Add options to the message
   */
  withOptions(options: Record<string, any>): NotificationMessage {
    return new NotificationMessage(
      this.title,
      this.body,
      this.data,
      this.attachments,
      options
    );
  }
}
