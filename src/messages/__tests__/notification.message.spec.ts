import { NotificationMessage } from '../notification.message';

describe('NotificationMessage', () => {
  describe('create', () => {
    it('should create a basic message', () => {
      const message = NotificationMessage.create('Title', 'Body');

      expect(message.title).toBe('Title');
      expect(message.body).toBe('Body');
      expect(message.data).toBeUndefined();
      expect(message.attachments).toBeUndefined();
      expect(message.options).toBeUndefined();
    });
  });

  describe('withData', () => {
    it('should add data to message', () => {
      const message = NotificationMessage.create('Title', 'Body').withData({
        userId: 123,
        action: 'test',
      });

      expect(message.data).toEqual({ userId: 123, action: 'test' });
      expect(message.title).toBe('Title');
      expect(message.body).toBe('Body');
    });
  });

  describe('withAttachments', () => {
    it('should add attachments to message', () => {
      const message = NotificationMessage.create('Title', 'Body').withAttachments([
        '/path/to/file1.pdf',
        '/path/to/file2.pdf',
      ]);

      expect(message.attachments).toEqual([
        '/path/to/file1.pdf',
        '/path/to/file2.pdf',
      ]);
      expect(message.title).toBe('Title');
      expect(message.body).toBe('Body');
    });
  });

  describe('withOptions', () => {
    it('should add options to message', () => {
      const message = NotificationMessage.create('Title', 'Body').withOptions({
        priority: 'high',
        ttl: 3600,
      });

      expect(message.options).toEqual({ priority: 'high', ttl: 3600 });
      expect(message.title).toBe('Title');
      expect(message.body).toBe('Body');
    });
  });

  describe('chaining methods', () => {
    it('should allow chaining multiple methods', () => {
      const message = NotificationMessage.create('Title', 'Body')
        .withData({ userId: 123 })
        .withAttachments(['/file.pdf'])
        .withOptions({ priority: 'high' });

      expect(message.title).toBe('Title');
      expect(message.body).toBe('Body');
      expect(message.data).toEqual({ userId: 123 });
      expect(message.attachments).toEqual(['/file.pdf']);
      expect(message.options).toEqual({ priority: 'high' });
    });
  });
});
