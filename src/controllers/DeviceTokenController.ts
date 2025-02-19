import type { BunRequest } from "../routes/router";
import { DeviceTokenService } from "../services/DeviceTokenService";

export class DeviceTokenController {
  private deviceTokenService = new DeviceTokenService();

  async register(request: BunRequest) {
    return await this.deviceTokenService.registerDeviceToken(request);
  }

  async update(request: BunRequest) {
    return await this.deviceTokenService.updateDeviceToken(request);
  }
}
