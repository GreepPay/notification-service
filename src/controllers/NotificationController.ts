import type { BunRequest } from "../routes/router";
import { NotificationService } from "../services/NotificationService";

export class NotificationController {
  private notificationService = new NotificationService();

  async create(request: BunRequest) {
    return await this.notificationService.sendNotification(request);
  }

  async broadcast(request: BunRequest) {
    return await this.notificationService.sendBroadcastNotification(request);
  }

  async updateStatus(request: BunRequest) {
    return await this.notificationService.updateNotificationStatus(request);
  }

  async delete(request: BunRequest) {
    return await this.notificationService.deleteNotification(request);
  }
}