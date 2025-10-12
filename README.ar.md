# 🚀 NestJS إشعارات متعددة القنوات

[![npm version](https://badge.fury.io/js/%40eng-mmustafa%2Fnestjs-multi-channel-notifications.svg)](https://www.npmjs.com/package/@eng-mmustafa/nestjs-multi-channel-notifications)
[![npm downloads](https://img.shields.io/npm/dm/@eng-mmustafa/nestjs-multi-channel-notifications.svg)](https://www.npmjs.com/package/@eng-mmustafa/nestjs-multi-channel-notifications)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/Eng-MMustafa/nestjs-multi-channel-notifications.svg)](https://github.com/Eng-MMustafa/nestjs-multi-channel-notifications)

مكتبة شاملة لـ NestJS تمكنك من إرسال الإشعارات عبر قنوات متعددة من واجهة موحدة. أرسل رسائل البريد الإلكتروني، SMS، WhatsApp، Slack، Discord والمزيد مع واجهة برمجية متسقة.

## 📡 القنوات المدعومة

- ✉️ **البريد الإلكتروني** - عبر Nodemailer
- 📱 **SMS** - عبر Twilio
- 💬 **WhatsApp** - عبر Twilio
- 📞 **المكالمات الصوتية** - عبر Twilio
- 💼 **Slack** - عبر Slack Web API
- 🎮 **Discord** - عبر Discord.js
- 👥 **Microsoft Teams** - عبر Webhooks
- 📢 **Telegram** - عبر Telegraf
- 📨 **Facebook Messenger** - عبر Graph API

## 📦 التثبيت

```bash
npm install @eng-mmustafa/nestjs-multi-channel-notifications
```

تثبيت التبعيات الأساسية:

```bash
npm install @nestjs/common @nestjs/core reflect-metadata rxjs
```

## ⚙️ الإعدادات

### الإعداد الأساسي

قم باستيراد الوحدة في `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { NotificationModule } from '@eng-mmustafa/nestjs-multi-channel-notifications';

@Module({
  imports: [
    NotificationModule.forRoot({
      email: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password',
        },
        from: 'noreply@yourapp.com',
      },
      twilio: {
        accountSid: 'your_account_sid',
        authToken: 'your_auth_token',
        fromNumber: '+1234567890',
        whatsappFrom: 'whatsapp:+1234567890',
      },
      slack: {
        botToken: 'xoxb-your-slack-token',
      },
    }),
  ],
})
export class AppModule {}
```

## 🎯 أمثلة الاستخدام

### الاستخدام الأساسي

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService, NotificationMessage } from '@eng-mmustafa/nestjs-multi-channel-notifications';

@Injectable()
export class UserService {
  constructor(private readonly notificationService: NotificationService) {}

  async sendWelcomeEmail(email: string, name: string) {
    const message = NotificationMessage.create(
      'مرحباً بك في تطبيقنا!',
      `أهلاً ${name}، سعداء بانضمامك!`
    );

    const response = await this.notificationService.send(
      email,
      message,
      'email'
    );

    if (response.isSuccess()) {
      console.log('تم إرسال البريد بنجاح:', response.messageId);
    } else {
      console.error('فشل إرسال البريد:', response.error);
    }

    return response;
  }
}
```

### 📧 أمثلة البريد الإلكتروني

```typescript
// بريد إلكتروني بسيط
const message = NotificationMessage.create(
  'تأكيد الحساب',
  'يرجى تأكيد عنوان بريدك الإلكتروني.'
);

await this.notificationService.send('user@example.com', message, 'email');

// بريد مع مرفقات
const messageWithAttachments = NotificationMessage.create(
  'حزمة الترحيب',
  'مرحباً بك في منصتنا!'
).withAttachments([
  '/path/to/welcome-guide.pdf',
  '/path/to/terms.pdf'
]);

await this.notificationService.send('user@example.com', messageWithAttachments, 'email');
```

### 💬 أمثلة SMS

```typescript
// رسالة SMS بسيطة
const message = NotificationMessage.create(
  'تنبيه أمني',
  'تم الوصول إلى حسابك من جهاز جديد.'
);

await this.notificationService.send('+1234567890', message, 'sms');
```

### 📱 أمثلة WhatsApp

```typescript
// رسالة WhatsApp بسيطة
const message = NotificationMessage.create(
  'تحديث الطلب',
  'تم شحن طلبك رقم #12345!'
);

await this.notificationService.send('whatsapp:+1234567890', message, 'whatsapp');
```

### 💼 أمثلة Slack

```typescript
// إرسال إلى قناة
const message = NotificationMessage.create(
  'اكتمل النشر',
  'تم نشر التطبيق على الإنتاج بنجاح!'
);

await this.notificationService.send('#general', message, 'slack');
```

### 🎮 أمثلة Discord

```typescript
// إرسال إلى قناة
const message = NotificationMessage.create(
  'حالة الخادم',
  'جميع الأنظمة تعمل بشكل طبيعي.'
).withData({
  uptime: '99.9%',
  responseTime: '150ms'
});

await this.notificationService.send('general', message, 'discord');
```

## 🔧 ميزات متقدمة

### الإرسال لعدة مستلمين

```typescript
const message = NotificationMessage.create(
  'صيانة النظام',
  'صيانة مجدولة خلال ساعة واحدة.'
);

const recipients = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

const responses = await this.notificationService.sendToMany(
  recipients,
  message,
  'email'
);
```

### الإرسال عبر قنوات متعددة

```typescript
const message = NotificationMessage.create(
  'تنبيه حرج',
  'خادم الإنتاج متوقف!'
);

const results = await this.notificationService.sendToMultipleChannels(
  'admin@example.com',
  message,
  ['email', 'sms', 'slack']
);
```

### إنشاء قناة مخصصة

```typescript
import { Injectable } from '@nestjs/common';
import { ChannelInterface, NotificationMessage, NotificationResponse } from '@nestjs-notifications/multi-channel';

@Injectable()
export class MyCustomChannel implements ChannelInterface {
  async send(recipient: string, message: NotificationMessage): Promise<NotificationResponse> {
    try {
      // منطق الإرسال المخصص هنا
      const result = await this.sendMessage(recipient, message);
      
      return NotificationResponse.success(
        result.id,
        result,
        'custom'
      );
    } catch (error) {
      return NotificationResponse.failure(
        error.message,
        { error },
        'custom'
      );
    }
  }

  validateRecipient(recipient: string): boolean {
    return !!recipient && recipient.length > 0;
  }

  getName(): string {
    return 'custom';
  }

  isConfigured(): boolean {
    return true;
  }

  private async sendMessage(recipient: string, message: NotificationMessage) {
    // تنفيذ المنطق المخصص
    return { id: 'custom_' + Date.now() };
  }
}
```

## 📝 ملاحظات خاصة بالقنوات

### البريد الإلكتروني
- يدعم تنسيق HTML
- يدعم المرفقات
- يستخدم Nodemailer

### SMS و WhatsApp والمكالمات الصوتية
- يتطلب حساب Twilio
- يجب أن تكون أرقام الهواتف بتنسيق E.164 (`+1234567890`)
- WhatsApp يتطلب بادئة `whatsapp:`
- الحد الأقصى لنص SMS: 1600 حرف
- الحد الأقصى للرسالة الصوتية: 1000 حرف

### Slack
- يتطلب رمز bot مع الصلاحيات المناسبة
- يدعم القنوات (`#channel`) والمستخدمين (`@user`)

### Discord
- يتطلب رمز bot ومعرف السيرفر
- يدعم أسماء القنوات ومعرفات المستخدمين

### Teams
- يستخدم webhooks واردة
- يدعم Adaptive Cards

### Telegram
- يتطلب رمز bot من BotFather
- يدعم أسماء المستخدمين (`@username`) أو معرفات المحادثة

### Messenger
- يتطلب Facebook Page Access Token
- يجب أن يكون المستلم معرف مستخدم Facebook رقمي

## 📄 الترخيص

MIT

## 🤝 المساهمة

المساهمات مرحب بها! لا تتردد في إرسال Pull Request.

---

صنع بـ ❤️ لمجتمع NestJS
