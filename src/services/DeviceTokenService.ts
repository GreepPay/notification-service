import { BaseService } from "./BaseService";
import { DeviceTokenSchema } from "../models/schemas";
import type { DeviceTokenEntity } from "../forms/deviceToken";
import HttpResponse from "../common/HttpResponse";
import type { BunRequest } from "../routes/router";

export class DeviceTokenService extends BaseService<DeviceTokenEntity> {
  constructor() {
    super(DeviceTokenSchema);
  }

  async registerDeviceToken(request: BunRequest) {
    try {
      const { auth_user_id, device_type, token } = await request.json() as Partial<DeviceTokenEntity>;
  
      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!device_type || !["ios", "android", "web"].includes(device_type)) {
        return HttpResponse.failure("Valid device type is required", 400);
      }
      if (!token) {
        return HttpResponse.failure("Token is required", 400);
      }
  
      // Check if token already exists
      const existingToken = await this.repository.findOne({
        where: { token }
      });
  
      if (existingToken && existingToken.auth_user_id !== auth_user_id) {
        // If token exists but belongs to different user, return error
        return HttpResponse.failure("Token is already registered to another user", 409);
      }
  
      if (existingToken) {
        // Update existing token only if it belongs to the same user
        const updatedToken = await this.repository.save({
          ...existingToken,
          device_type,
          is_active: true
        });
        return HttpResponse.success("Device token updated successfully", updatedToken);
      }
  
      // Create new token
      const deviceToken = await this.create({
        auth_user_id,
        device_type,
        token,
        is_active: true
      });
  
      return HttpResponse.success("Device token registered successfully", deviceToken);
    } catch (error) {
      console.error("Error registering device token:", error);
      return HttpResponse.failure("Failed to register device token", 500);
    }
  }

  async updateDeviceToken(request: BunRequest) {
    try {
      const { auth_user_id, token, is_active } = await request.json() as Partial<DeviceTokenEntity>;

      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!token) {
        return HttpResponse.failure("Token is required", 400);
      }

      const deviceToken = await this.repository.findOne({
        where: { token, auth_user_id }
      });

      if (!deviceToken) {
        return HttpResponse.failure("Device token not found", 404);
      }

      const updatedToken = await this.repository.save({
        ...deviceToken,
        is_active: is_active ?? deviceToken.is_active
      });

      return HttpResponse.success("Device token updated successfully", updatedToken);
    } catch (error) {
      console.error("Error updating device token:", error);
      return HttpResponse.failure("Failed to update device token", 500);
    }
  }

  async deleteDeviceToken(request: BunRequest) {
    try {
      const { auth_user_id, token } = await request.json() as Partial<DeviceTokenEntity>;
  
      if (!auth_user_id) {
        return HttpResponse.failure("auth_user_id is required", 400);
      }
      if (!token) {
        return HttpResponse.failure("Token is required", 400);
      }
  
      const deviceToken = await this.repository.findOne({
        where: { token, auth_user_id }
      });
  
      if (!deviceToken) {
        return HttpResponse.failure("Device token not found", 404);
      }
  
      await this.repository.remove(deviceToken);
      return HttpResponse.success("Device token deleted successfully");
    } catch (error) {
      console.error("Error deleting device token:", error);
      return HttpResponse.failure("Failed to delete device token", 500);
    }
  }
}