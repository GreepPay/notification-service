import type { BunRequest } from "../routes/router";
import { NotificationTemplateService } from "../services/NotificationTemplateService";

export class NotificationTemplateController {
  private templateService = new NotificationTemplateService();

  async create(request: BunRequest) {
    return await this.templateService.createTemplate(request);
  }

  async update(request: BunRequest) {
    return await this.templateService.updateTemplate(request);
  }

  async getAll(request: BunRequest) {
    return await this.templateService.getTemplates(request);
  }

  async delete(request: BunRequest) {
    return await this.templateService.deleteTemplate(request);
  }
}