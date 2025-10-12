import { NotificationResponse } from '../notification.response';

describe('NotificationResponse', () => {
  describe('success', () => {
    it('should create a successful response', () => {
      const response = NotificationResponse.success('msg_123', { foo: 'bar' }, 'email');

      expect(response.success).toBe(true);
      expect(response.messageId).toBe('msg_123');
      expect(response.data).toEqual({ foo: 'bar' });
      expect(response.channel).toBe('email');
      expect(response.error).toBeUndefined();
    });

    it('should work without optional parameters', () => {
      const response = NotificationResponse.success('msg_123');

      expect(response.success).toBe(true);
      expect(response.messageId).toBe('msg_123');
      expect(response.data).toBeUndefined();
      expect(response.channel).toBeUndefined();
    });
  });

  describe('failure', () => {
    it('should create a failure response', () => {
      const response = NotificationResponse.failure(
        'Something went wrong',
        { code: 500 },
        'email',
      );

      expect(response.success).toBe(false);
      expect(response.error).toBe('Something went wrong');
      expect(response.data).toEqual({ code: 500 });
      expect(response.channel).toBe('email');
      expect(response.messageId).toBeUndefined();
    });

    it('should work without optional parameters', () => {
      const response = NotificationResponse.failure('Error occurred');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Error occurred');
      expect(response.data).toBeUndefined();
      expect(response.channel).toBeUndefined();
    });
  });

  describe('isSuccess', () => {
    it('should return true for successful response', () => {
      const response = NotificationResponse.success('msg_123');
      expect(response.isSuccess()).toBe(true);
    });

    it('should return false for failed response', () => {
      const response = NotificationResponse.failure('Error');
      expect(response.isSuccess()).toBe(false);
    });
  });

  describe('isFailure', () => {
    it('should return false for successful response', () => {
      const response = NotificationResponse.success('msg_123');
      expect(response.isFailure()).toBe(false);
    });

    it('should return true for failed response', () => {
      const response = NotificationResponse.failure('Error');
      expect(response.isFailure()).toBe(true);
    });
  });
});
