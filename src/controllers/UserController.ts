import { UserService } from '../services/UserService';

export class UserController {
  private userService = new UserService();

  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  async createUser(body: { name: string; email: string }) {
    const { name, email } = body;
    return await this.userService.createUser(name, email);
  }
}