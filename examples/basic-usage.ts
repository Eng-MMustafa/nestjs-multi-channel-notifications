import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule, NotificationService, NotificationMessage } from '../src';

/**
 * Example module showing how to set up the notification package
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    NotificationModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        email: {
          host: configService.get('EMAIL_HOST'),
          port: parseInt(configService.get('EMAIL_PORT')),
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
        slack: {
          botToken: configService.get('SLACK_BOT_TOKEN'),
        },
        telegram: {
          botToken: configService.get('TELEGRAM_BOT_TOKEN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ExampleService],
})
export class ExampleModule {}

/**
 * Example service demonstrating various notification use cases
 */
@Injectable()
export class ExampleService {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(email: string, name: string) {
    const message = NotificationMessage.create(
      'Welcome to Our Platform!',
      `Hi ${name},\n\nThank you for joining our platform. We're excited to have you!`
    ).withData({
      registrationDate: new Date().toISOString(),
      userId: Math.random().toString(36).substr(2, 9),
    });

    return await this.notificationService.send(email, message, 'email');
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phoneNumber: string, otp: string) {
    const message = NotificationMessage.create(
      'Verification Code',
      `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.`
    );

    return await this.notificationService.send(phoneNumber, message, 'sms');
  }

  /**
   * Send order confirmation via multiple channels
   */
  async sendOrderConfirmation(
    email: string,
    phone: string,
    orderDetails: any
  ) {
    const message = NotificationMessage.create(
      'Order Confirmation',
      `Your order #${orderDetails.orderId} has been confirmed!`
    ).withData({
      orderId: orderDetails.orderId,
      amount: orderDetails.amount,
      items: orderDetails.items,
      estimatedDelivery: orderDetails.estimatedDelivery,
    });

    // Send via email
    const emailResponse = await this.notificationService.send(
      email,
      message,
      'email'
    );

    // Send via SMS
    const smsResponse = await this.notificationService.send(
      phone,
      message,
      'sms'
    );

    return {
      email: emailResponse.isSuccess(),
      sms: smsResponse.isSuccess(),
    };
  }

  /**
   * Send critical alert to admin via multiple channels
   */
  async sendCriticalAlert(alert: string, details: any) {
    const message = NotificationMessage.create(
      '🚨 Critical Alert',
      alert
    ).withData(details);

    const channels = ['email', 'slack', 'sms'];
    const adminEmail = 'admin@example.com';
    const adminPhone = '+1234567890';
    const slackChannel = '#alerts';

    const results = {
      email: await this.notificationService.send(adminEmail, message, 'email'),
      slack: await this.notificationService.send(slackChannel, message, 'slack'),
      sms: await this.notificationService.send(adminPhone, message, 'sms'),
    };

    return results;
  }

  /**
   * Send deployment notification to team
   */
  async notifyDeployment(version: string, environment: string) {
    const message = NotificationMessage.create(
      `🚀 Deployment: v${version}`,
      `Successfully deployed version ${version} to ${environment}`
    ).withData({
      version,
      environment,
      deployedAt: new Date().toISOString(),
      deployedBy: 'CI/CD Pipeline',
    });

    // Send to Slack
    const slackChannels = ['#deployments', '#engineering'];
    const slackResults = await this.notificationService.sendToMany(
      slackChannels,
      message,
      'slack'
    );

    // Send to Discord
    const discordResult = await this.notificationService.send(
      'general',
      message,
      'discord'
    );

    return {
      slack: slackResults.every((r) => r.isSuccess()),
      discord: discordResult.isSuccess(),
    };
  }

  /**
   * Send invoice via email with PDF attachment
   */
  async sendInvoice(email: string, invoiceNumber: string, pdfPath: string) {
    const message = NotificationMessage.create(
      `Invoice ${invoiceNumber}`,
      'Thank you for your business. Please find attached your invoice.'
    )
      .withAttachments([pdfPath])
      .withData({
        invoiceNumber,
        generatedAt: new Date().toISOString(),
      });

    return await this.notificationService.send(email, message, 'email');
  }

  /**
   * Send password reset link
   */
  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;
    
    const message = NotificationMessage.create(
      'Password Reset Request',
      `You have requested to reset your password. Click the link below to continue:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`
    ).withData({
      requestedAt: new Date().toISOString(),
      expiresIn: '1 hour',
    });

    return await this.notificationService.send(email, message, 'email');
  }

  /**
   * Send daily report to stakeholders
   */
  async sendDailyReport(report: any) {
    const message = NotificationMessage.create(
      '📊 Daily Report',
      'Here is your daily summary'
    ).withData(report);

    const stakeholders = [
      'ceo@example.com',
      'cto@example.com',
      'manager@example.com',
    ];

    const results = await this.notificationService.sendToMany(
      stakeholders,
      message,
      'email'
    );

    // Also send to Teams
    await this.notificationService.send('', message, 'teams');

    return {
      emailsSent: results.filter((r) => r.isSuccess()).length,
      totalRecipients: stakeholders.length,
    };
  }

  /**
   * Get available and configured channels
   */
  getChannelInfo() {
    return {
      available: this.notificationService.getAvailableChannels(),
      configured: this.notificationService.getConfiguredChannels(),
    };
  }
}

/**
 * Example usage in a controller
 */
import { Controller, Post, Body } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post('welcome')
  async sendWelcome(@Body() body: { email: string; name: string }) {
    const result = await this.exampleService.sendWelcomeEmail(
      body.email,
      body.name
    );
    return {
      success: result.isSuccess(),
      messageId: result.messageId,
      error: result.error,
    };
  }

  @Post('otp')
  async sendOTP(@Body() body: { phone: string; otp: string }) {
    const result = await this.exampleService.sendOTP(body.phone, body.otp);
    return {
      success: result.isSuccess(),
      messageId: result.messageId,
      error: result.error,
    };
  }

  @Post('order-confirmation')
  async confirmOrder(@Body() body: any) {
    return await this.exampleService.sendOrderConfirmation(
      body.email,
      body.phone,
      body.orderDetails
    );
  }

  @Post('channels')
  getChannels() {
    return this.exampleService.getChannelInfo();
  }
}
