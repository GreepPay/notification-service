import { User } from '../models/User';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return await User.find();
  }

  async createUser(name: string, email: string): Promise<User> {
    const user = User.create({ name, email });
    return await user.save();
  }
}