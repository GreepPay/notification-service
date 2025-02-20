import { AppDataSource } from "../data-source";
import { NotificationTemplateSchema, DeviceTokenSchema } from "../models/schemas";
import type { NotificationEntity } from "../forms/notification";
import type { NotificationTemplateEntity } from "../forms/notificationTemplate";
import type { DeviceTokenEntity } from "../forms/deviceToken";
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';

export class NotificationDeliveryService {
  private templateRepository;
  private deviceTokenRepository;
  private emailTransporter;
  private firebaseMessaging;

  constructor() {
    this.templateRepository = AppDataSource.getRepository(NotificationTemplateSchema);
    this.deviceTokenRepository = AppDataSource.getRepository(DeviceTokenSchema);

    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false }
    });

    // Verify the connection
    this.emailTransporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('SMTP server is ready to take our messages');
      }
    });

    // Initialize Firebase Admin
    try {
      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      this.firebaseMessaging = getMessaging(app);
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }

  private async getTemplate(templateId: number): Promise<NotificationTemplateEntity | null> {
    return await this.templateRepository.findOne({
      where: { id: templateId }
    });
  }

  private processTemplateContent(content: string, data: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private async getUserDeviceTokens(auth_user_id: string): Promise<DeviceTokenEntity[]> {
    return await this.deviceTokenRepository.find({
      where: {
        auth_user_id,
        is_active: true
      }
    });
  }

  async sendEmailNotification(
    notification: NotificationEntity,
    template: NotificationTemplateEntity,
    data: Record<string, any>
  ) {
    try {
      const processedContent = this.processTemplateContent(template.content, data);
      const processedSubject = this.processTemplateContent(template.subject, data);
  
      // Debug logs
      console.log('Email Details:', {
        from: process.env.SMTP_FROM,
        to: notification.email,
        subject: processedSubject,
        content: processedContent
      });
  
      if (!notification.email) {
        throw new Error('Recipient email address is missing');
      }
  
      const mailOptions = {
        from: {
          name: 'Greep',
          address: process.env.SMTP_FROM || ''
        },
        to: notification.email,
        subject: processedSubject,
        html: processedContent,
      };
  
      // Validate mail options
      if (!mailOptions.to || !mailOptions.from.address) {
        throw new Error(`Invalid email configuration: to=${mailOptions.to}, from=${mailOptions.from.address}`);
      }
  
      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result);
  
      return {
        success: true,
        delivery_status: 'delivered'
      };
    } catch (error) {
      console.error('Email sending error details:', {
        notification_email: notification.email,
        template_id: template.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        success: false,
        delivery_status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendPushNotification(
    notification: NotificationEntity,
    template: NotificationTemplateEntity,
    data: Record<string, any>
  ) {
    try {
      const deviceTokens = await this.getUserDeviceTokens(notification.auth_user_id);

      if (!deviceTokens.length) {
        return {
          success: false,
          delivery_status: 'failed',
          error: 'No active device tokens found'
        };
      }

      const processedContent = this.processTemplateContent(template.content, data);
      const processedTitle = this.processTemplateContent(template.subject, data);

      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens.map(dt => dt.token),
        notification: {
          title: processedTitle,
          body: processedContent,
        },
        data: {
          ...data,
          notificationId: notification.id.toString(),
          type: notification.type,
        },
        android: {
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              priority: 5,
            },
          },
        },
      };

      const response = await this.firebaseMessaging.sendEachForMulticast(message);

      if (response.failureCount > 0) {
        const failedTokens = deviceTokens.filter((_, index) => !response.responses[index].success);
        await this.handleFailedTokens(failedTokens);
      }

      return {
        success: response.successCount > 0,
        delivery_status: response.successCount > 0 ? 'delivered' : 'failed',
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        delivery_status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleFailedTokens(failedTokens: DeviceTokenEntity[]) {
    // Deactivate failed tokens
    for (const token of failedTokens) {
      await this.deviceTokenRepository.update(
        { id: token.id },
        { is_active: false }
      );
    }
  }

  async deliverNotification(
    notification: NotificationEntity,
    templateId: number,
    data: Record<string, any>
  ) {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      let deliveryResult;

      if (notification.type === 'email') {
        deliveryResult = await this.sendEmailNotification(notification, template, data);
      } else if (notification.type === 'push') {
        deliveryResult = await this.sendPushNotification(notification, template, data);
      } else {
        throw new Error('Invalid notification type');
      }

      return deliveryResult;
    } catch (error) {
      console.error('Error delivering notification:', error);
      return {
        success: false,
        delivery_status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}