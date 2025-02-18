import { AppDataSource } from "../data-source";
import { NotificationTemplateSchema, DeviceTokenSchema } from "../models/schemas";
import type { NotificationEntity } from "../forms/notification";
import type { NotificationTemplateEntity } from "../forms/notificationTemplate";
import type { DeviceTokenEntity } from "../forms/deviceToken";
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

export class NotificationDeliveryService {
  private templateRepository;
  private deviceTokenRepository;
  private emailTransporter;

  constructor() {
    this.templateRepository = AppDataSource.getRepository(NotificationTemplateSchema);
    this.deviceTokenRepository = AppDataSource.getRepository(DeviceTokenSchema);
    
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
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

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: notification.email,
        subject: processedSubject,
        html: processedContent,
      });

      return {
        success: true,
        delivery_status: 'delivered'
      };
    } catch (error) {
      console.error('Error sending email:', error);
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
          priority: 'high',
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

      const response = await admin.messaging().sendMulticast(message);

      if (response.failureCount > 0) {
        // Handle failed tokens
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