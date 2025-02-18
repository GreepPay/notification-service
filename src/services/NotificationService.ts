import { BaseService } from "./BaseService";
import { NotificationSchema } from "../models/schemas";
import type { NotificationEntity } from "../forms/notification";
import HttpResponse from "../common/HttpResponse";
import type { BunRequest } from "../routes/router";
import { NotificationDeliveryService } from "./NotificationDeliverService";

export class NotificationService extends BaseService<NotificationEntity> {
  private deliveryService: NotificationDeliveryService;
  
  constructor() {
    super(NotificationSchema);
    this.deliveryService = new NotificationDeliveryService();
  }

  async sendNotification(request: BunRequest) {
    try {
      const { 
        auth_user_id, 
        type, 
        email, 
        template_id,
        template_data 
      } = await request.json() as {
        auth_user_id: string;
        type: 'email' | 'push';
        email?: string;
        template_id: number;
        template_data: Record<string, any>;
      };

      // Validate required fields
      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!type || !["email", "push"].includes(type)) {
        return HttpResponse.failure("Valid notification type (email or push) is required", 400);
      }
      if (!template_id) {
        return HttpResponse.failure("template_id is required", 400);
      }
      if (type === "email" && !email) {
        return HttpResponse.failure("Email is required for email notifications", 400);
      }

      // Create notification record
      const notification = await this.create({
        auth_user_id,
        type,
        email,
        title: 'Processing...', // Will be updated from template
        content: 'Processing...', // Will be updated from template
        is_read: false,
        delivery_status: "pending"
      });

      // Deliver the notification
      const deliveryResult = await this.deliveryService.deliverNotification(
        notification,
        template_id,
        template_data
      );

      // Update notification status
      const updatedNotification = await this.repository.save({
        ...notification,
        delivery_status: deliveryResult.delivery_status
      });

      if (!deliveryResult.success) {
        updatedNotification
        return HttpResponse.failure(
          `Failed to deliver notification: ${deliveryResult.error}`,
          500,
        ); 
      }

      return HttpResponse.success(
        "Notification sent successfully",
        updatedNotification
      );

    } catch (error) {
      console.error("Error sending notification:", error);
      return HttpResponse.failure("Failed to send notification", 500);
    }
  }

  async updateNotificationStatus(request: BunRequest) {
    try {
      const { auth_user_id, notification_id, is_read } = await request.json() as {
        auth_user_id: string;
        notification_id: number;
        is_read: boolean;
      };

      // Validate required fields
      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!notification_id) {
        return HttpResponse.failure("notification_id is required", 400);
      }
      if (typeof is_read !== "boolean") {
        return HttpResponse.failure("is_read status is required", 400);
      }

      // Find notification
      const notification = await this.repository.findOne({
        where: { id: notification_id, auth_user_id }
      });

      if (!notification) {
        return HttpResponse.failure("Notification not found", 404);
      }

      // Update notification
      const updatedNotification = await this.repository.save({
        ...notification,
        is_read
      });

      return HttpResponse.success("Notification status updated successfully", updatedNotification);
    } catch (error) {
      console.error("Error updating notification status:", error);
      return HttpResponse.failure("Failed to update notification status", 500);
    }
  }


  async deleteNotification(request: BunRequest) {
    try {
      const { auth_user_id, notification_id } = await request.json() as {
        auth_user_id: string;
        notification_id: number;
      };

      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!notification_id) {
        return HttpResponse.failure("notification_id is required", 400);
      }

      const notification = await this.repository.findOne({
        where: { id: notification_id, auth_user_id }
      });

      if (!notification) {
        return HttpResponse.failure("Notification not found", 404);
      }

      await this.repository.remove(notification);
      return HttpResponse.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
      return HttpResponse.failure("Failed to delete notification", 500);
    }
  }
}