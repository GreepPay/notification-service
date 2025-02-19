import { BaseService } from "./BaseService";
import { NotificationTemplateSchema } from "../models/schemas";
import type { NotificationTemplateEntity } from "../forms/notificationTemplate";
import HttpResponse from "../common/HttpResponse";
import type { BunRequest } from "../routes/router";

export class NotificationTemplateService extends BaseService<NotificationTemplateEntity> {
  constructor() {
    super(NotificationTemplateSchema);
  }

  async createTemplate(request: BunRequest) {
    try {
      const { name, type, subject, content, metadata } = await request.json() as Partial<NotificationTemplateEntity>;

      if (!name) {
        return HttpResponse.failure("Template name is required", 400);
      }
      if (!type || !["email", "push"].includes(type)) {
        return HttpResponse.failure("Valid notification type is required", 400);
      }
      if (!subject) {
        return HttpResponse.failure("Subject is required", 400);
      }
      if (!content) {
        return HttpResponse.failure("Content is required", 400);
      }

      // Check if template name already exists
      const existingTemplate = await this.repository.findOne({
        where: { name }
      });

      if (existingTemplate) {
        return HttpResponse.failure("Template with this name already exists", 409);
      }

      const template = await this.create({
        name,
        type,
        subject,
        content,
        metadata
      });

      return HttpResponse.success("Template created successfully", template);
    } catch (error) {
      console.error("Error creating template:", error);
      return HttpResponse.failure("Failed to create template", 500);
    }
  }

  async updateTemplate(request: BunRequest) {
    try {
      const { id, name, type, subject, content, metadata } = await request.json() as Partial<NotificationTemplateEntity> & { id: number };

      if (!id) {
        return HttpResponse.failure("Template ID is required", 400);
      }

      const template = await this.repository.findOne({
        where: { id }
      });

      if (!template) {
        return HttpResponse.failure("Template not found", 404);
      }

      if (name) {
        const existingTemplate = await this.repository.findOne({
          where: { name }
        });

        if (existingTemplate && existingTemplate.id !== id) {
          return HttpResponse.failure("Template with this name already exists", 409);
        }
      }

      const updatedTemplate = await this.repository.save({
        ...template,
        ...(name && { name }),
        ...(type && { type }),
        ...(subject && { subject }),
        ...(content && { content }),
        ...(metadata && { metadata })
      });

      return HttpResponse.success("Template updated successfully", updatedTemplate);
    } catch (error) {
      console.error("Error updating template:", error);
      return HttpResponse.failure("Failed to update template", 500);
    }
  }

  async getTemplates(request: BunRequest) {
    try {
      const { type } = request.query;
      
      const where = type ? { type } : {};
      const templates = await this.repository.find({ where });
      
      return HttpResponse.success("Templates retrieved successfully", templates);
    } catch (error) {
      console.error("Error retrieving templates:", error);
      return HttpResponse.failure("Failed to retrieve templates", 500);
    }
  }

  async deleteTemplate(request: BunRequest) {
    try {
      const { id } = await request.json() as { id: number };

      if (!id) {
        return HttpResponse.failure("Template ID is required", 400);
      }

      const template = await this.repository.findOne({
        where: { id }
      });

      if (!template) {
        return HttpResponse.failure("Template not found", 404);
      }

      await this.repository.remove(template);
      return HttpResponse.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
      return HttpResponse.failure("Failed to delete template", 500);
    }
  }
}