import { AppDataSource } from "../data-source";
import {
  NotificationTemplateSchema,
  DeviceTokenSchema,
} from "../models/schemas";
import type { BroadcastNotificationOptions, NotificationEntity } from "../forms/notification";
import type { NotificationTemplateEntity } from "../forms/notificationTemplate";
import type { DeviceTokenEntity } from "../forms/deviceToken";
import { initializeApp, cert, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import nodemailer from "nodemailer";

export class NotificationDeliveryService {
  private templateRepository;
  private deviceTokenRepository;
  private emailTransporter;
  private firebaseMessaging: Messaging;
  private firebaseApp: App;

  constructor() {
    this.templateRepository = AppDataSource.getRepository(
      NotificationTemplateSchema
    );
    this.deviceTokenRepository = AppDataSource.getRepository(DeviceTokenSchema);

    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    this.emailTransporter.verify((error, success) => {
      if (error) {
        console.error("SMTP connection error:", error);
      } else {
        console.log("SMTP server is ready to take our messages");
      }
    });

    // Initialize Firebase
    try {
      console.log('Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);

      this.firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        })
      });

      this.firebaseMessaging = getMessaging(this.firebaseApp);
      console.log('Firebase Messaging initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  public async getTemplate(
    templateId: number
  ): Promise<NotificationTemplateEntity | null> {
    return await this.templateRepository.findOne({
      where: { id: templateId },
    });
  }

  private processTemplateContent(
    content: string,
    data: Record<string, any>
  ): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private async getUserDeviceTokens(
    auth_user_id: string
  ): Promise<DeviceTokenEntity[]> {
    return await this.deviceTokenRepository.find({
      where: {
        auth_user_id,
        is_active: true,
      },
    });
  }

  async sendEmailNotification(
    notification: NotificationEntity,
    template: NotificationTemplateEntity,
    data: Record<string, any>
  ) {
    try {
      const processedContent = this.processTemplateContent(
        template.content,
        data
      );
      const processedSubject = this.processTemplateContent(
        template.subject,
        data
      );

      console.log("Email Details:", {
        from: process.env.SMTP_FROM,
        to: notification.email,
        subject: processedSubject,
        content: processedContent,
      });

      if (!notification.email) {
        throw new Error("Recipient email address is missing");
      }

      const mailOptions = {
        from: `"Greep" <${process.env.SMTP_FROM}>`,
        to: notification.email,
        subject: processedSubject,
        html: processedContent,
      };

      if (!mailOptions.to || !mailOptions.from) {
        throw new Error(
          `Invalid email configuration: to=${mailOptions.to}, from=${mailOptions.from}`
        );
      }

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result);

      return {
        success: true,
        delivery_status: "delivered",
      };
    } catch (error) {
      console.error("Email sending error details:", {
        notification_email: notification.email,
        template_id: template.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        delivery_status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
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
  
      const validTokens = deviceTokens.filter(dt => {
        const token = dt.token.trim();
        return token.length > 0 && token.length <= 4096;
      });
  
      if (!validTokens.length) {
        return {
          success: false,
          delivery_status: 'failed',
          error: 'No valid device tokens found'
        };
      }
  
      const processedContent = this.processTemplateContent(template.content, data);
      const processedTitle = this.processTemplateContent(template.subject, data);
  
      console.log('Device token:', validTokens[0].token);
  
      const basicMessage = {
        token: validTokens[0].token.trim(),
        notification: {
          title: processedTitle,
          body: processedContent
        }
      };
  
      try {
        const response = await this.firebaseMessaging.send(basicMessage);
        console.log('Single device response:', response);
  
        return {
          success: true,
          delivery_status: 'delivered',
          successCount: 1,
          failureCount: 0
        };
      } catch (sendError) {
        console.error('Detailed Firebase error:', {
          error: sendError,
          message: basicMessage,
          token: validTokens[0].token
        });
  
        return {
          success: false,
          delivery_status: 'failed',
          error: sendError instanceof Error ? sendError.message : 'Failed to send notification'
        };
      }
    } catch (error) {
      console.error('Push notification error:', error);
      return {
        success: false,
        delivery_status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  

  private async handleFailedTokens(failedTokens: DeviceTokenEntity[]) {
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
        throw new Error("Template not found");
      }

      let deliveryResult;

      if (notification.type === "email") {
        deliveryResult = await this.sendEmailNotification(
          notification,
          template,
          data
        );
      } else if (notification.type === "push") {
        deliveryResult = await this.sendPushNotification(
          notification,
          template,
          data
        );
      } else {
        throw new Error("Invalid notification type");
      }

      return deliveryResult;
    } catch (error) {
      console.error("Error delivering notification:", error);
      return {
        success: false,
        delivery_status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendBroadcastNotification(
    userIds: string[],
    template: NotificationTemplateEntity,
    data: Record<string, any>,
    options: BroadcastNotificationOptions
  ) {
    try {
      // Get all device tokens for all users
      const allDeviceTokens = await Promise.all(
        userIds.map(userId => this.getUserDeviceTokens(userId))
      );
  
      // Flatten and filter valid tokens
      const validTokens = allDeviceTokens
        .flat()
        .filter(dt => dt.token.trim().length > 0 && dt.token.length <= 4096)
        .map(dt => dt.token.trim());
  
      if (!validTokens.length) {
        return {
          success: false,
          delivery_status: 'failed',
          error: 'No valid device tokens found for any user'
        };
      }
  
      const processedContent = this.processTemplateContent(template.content, data);
      const processedTitle = this.processTemplateContent(template.subject, data);
  
      // Split tokens into chunks of 500 (Firebase limit)
      const tokenChunks = this.chunkArray(validTokens, 500);
      let totalSuccess = 0;
      let totalFailure = 0;
      const errors: string[] = [];
  
      // Send to each chunk
      for (const tokens of tokenChunks) {
        const message = {
          tokens: tokens,
          notification: {
            title: processedTitle,
            body: processedContent
          },
          data: {
            ...this.sanitizeData(data),
            ...this.sanitizeData(options.additionalData || {}),
            type: options.notificationType
          },
          android: {
            priority: options.priority || 'high' as const
          }
        };
  
        try {
          const response = await this.firebaseMessaging.sendEachForMulticast(message);
          totalSuccess += response.successCount;
          totalFailure += response.failureCount;
  
          if (response.failureCount > 0) {
            const failedTokenEntities = allDeviceTokens
              .flat()
              .filter(dt => {
                const failedIndices = response.responses
                  .map((resp, index) => !resp.success ? index : -1)
                  .filter(index => index !== -1);
                return failedIndices.includes(tokens.indexOf(dt.token.trim()));
              });
          
            await this.handleFailedTokens(failedTokenEntities);
            
            const chunkErrors = response.responses
              .filter(resp => !resp.success && resp.error)
              .map(resp => resp.error?.message || 'Unknown error')
              .filter((message): message is string => message !== undefined);
            errors.push(...chunkErrors);
          }
        } catch (error) {
          console.error('Error sending chunk:', error);
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }
  
      return {
        success: totalSuccess > 0,
        delivery_status: totalFailure === 0 ? 'delivered' : 'partial',
        successCount: totalSuccess,
        failureCount: totalFailure,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Broadcast notification error:', error);
      return {
        success: false,
        delivery_status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private sanitizeData(data: Record<string, any>): Record<string, string> {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);
  }
}