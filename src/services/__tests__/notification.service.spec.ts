import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import { NotificationMessage } from '../../messages/notification.message';
import { ChannelInterface } from '../../interfaces/channel.interface';
import { NotificationResponse } from '../../responses/notification.response';

class MockChannel implements ChannelInterface {
  constructor(private name: string, private configured: boolean = true) {}

  async send(recipient: string, message: NotificationMessage): Promise<NotificationResponse> {
    return NotificationResponse.success('mock_' + Date.now(), {}, this.name);
  }

  validateRecipient(recipient: string): boolean {
    return !!recipient;
  }

  getName(): string {
    return this.name;
  }

  isConfigured(): boolean {
    return this.configured;
  }
}

describe('NotificationService', () => {
  let service: NotificationService;
  let mockEmailChannel: MockChannel;
  let mockSmsChannel: MockChannel;

  beforeEach(async () => {
    mockEmailChannel = new MockChannel('email');
    mockSmsChannel = new MockChannel('sms');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'NOTIFICATION_CHANNELS',
          useValue: [mockEmailChannel, mockSmsChannel],
        },
        NotificationService,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send notification through specified channel', async () => {
      const message = NotificationMessage.create('Test', 'Test message');
      const response = await service.send('test@example.com', message, 'email');

      expect(response.isSuccess()).toBe(true);
      expect(response.channel).toBe('email');
    });

    it('should return error for non-existent channel', async () => {
      const message = NotificationMessage.create('Test', 'Test message');
      const response = await service.send('recipient', message, 'nonexistent');

      expect(response.isFailure()).toBe(true);
      expect(response.error).toContain('not registered');
    });

    it('should return error for unconfigured channel', async () => {
      const unconfiguredChannel = new MockChannel('unconfigured', false);
      service.registerChannel(unconfiguredChannel);

      const message = NotificationMessage.create('Test', 'Test message');
      const response = await service.send('recipient', message, 'unconfigured');

      expect(response.isFailure()).toBe(true);
      expect(response.error).toContain('not properly configured');
    });
  });

  describe('sendToMany', () => {
    it('should send to multiple recipients', async () => {
      const message = NotificationMessage.create('Test', 'Test message');
      const recipients = ['test1@example.com', 'test2@example.com', 'test3@example.com'];

      const responses = await service.sendToMany(recipients, message, 'email');

      expect(responses).toHaveLength(3);
      expect(responses.every((r) => r.isSuccess())).toBe(true);
    });
  });

  describe('sendToMultipleChannels', () => {
    it('should send through multiple channels', async () => {
      const message = NotificationMessage.create('Test', 'Test message');
      const channels = ['email', 'sms'];

      const results = await service.sendToMultipleChannels(
        'recipient',
        message,
        channels,
      );

      expect(Object.keys(results)).toEqual(['email', 'sms']);
      expect(results.email.isSuccess()).toBe(true);
      expect(results.sms.isSuccess()).toBe(true);
    });
  });

  describe('getAvailableChannels', () => {
    it('should return all available channels', () => {
      const channels = service.getAvailableChannels();
      expect(channels).toContain('email');
      expect(channels).toContain('sms');
    });
  });

  describe('getConfiguredChannels', () => {
    it('should return only configured channels', () => {
      const channels = service.getConfiguredChannels();
      expect(channels).toContain('email');
      expect(channels).toContain('sms');
    });
  });

  describe('hasChannel', () => {
    it('should return true for existing channel', () => {
      expect(service.hasChannel('email')).toBe(true);
    });

    it('should return false for non-existing channel', () => {
      expect(service.hasChannel('nonexistent')).toBe(false);
    });
  });

  describe('registerChannel', () => {
    it('should register a custom channel', () => {
      const customChannel = new MockChannel('custom');
      service.registerChannel(customChannel);

      expect(service.hasChannel('custom')).toBe(true);
    });
  });
});
