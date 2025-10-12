import { EmailChannel } from '../email.channel';
import { NotificationMessage } from '../../messages/notification.message';

describe('EmailChannel', () => {
  let channel: EmailChannel;

  beforeEach(() => {
    channel = new EmailChannel({
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'testpassword',
      },
      from: 'noreply@test.com',
    });
  });

  describe('validateRecipient', () => {
    it('should validate correct email addresses', () => {
      expect(channel.validateRecipient('test@example.com')).toBe(true);
      expect(channel.validateRecipient('user.name@example.co.uk')).toBe(true);
      expect(channel.validateRecipient('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(channel.validateRecipient('invalid')).toBe(false);
      expect(channel.validateRecipient('invalid@')).toBe(false);
      expect(channel.validateRecipient('@example.com')).toBe(false);
      expect(channel.validateRecipient('test@')).toBe(false);
    });
  });

  describe('getName', () => {
    it('should return "email"', () => {
      expect(channel.getName()).toBe('email');
    });
  });

  describe('isConfigured', () => {
    it('should return true when properly configured', () => {
      expect(channel.isConfigured()).toBe(true);
    });

    it('should return false when not configured', () => {
      const unconfiguredChannel = new EmailChannel({});
      expect(unconfiguredChannel.isConfigured()).toBe(false);
    });
  });

  describe('send', () => {
    it('should reject sending when not configured', async () => {
      const unconfiguredChannel = new EmailChannel({});
      const message = NotificationMessage.create('Test', 'Test message');
      
      const response = await unconfiguredChannel.send('test@example.com', message);
      
      expect(response.isFailure()).toBe(true);
      expect(response.error).toContain('not configured');
    });

    it('should reject invalid email address', async () => {
      const message = NotificationMessage.create('Test', 'Test message');
      
      const response = await channel.send('invalid-email', message);
      
      expect(response.isFailure()).toBe(true);
      expect(response.error).toContain('Invalid email address');
    });
  });
});
