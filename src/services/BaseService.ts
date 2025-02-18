import { Repository, EntitySchema, type DeepPartial, type FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../data-source';

export class BaseService<T extends object> {
  protected repository: Repository<T>;

  constructor(schema: EntitySchema<T>) {
    this.repository = AppDataSource.getRepository<T>(schema);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(authUserId: string, data: DeepPartial<T>): Promise<T | null> {
    const where: FindOptionsWhere<T> = { auth_user_id: authUserId } as unknown as FindOptionsWhere<T>;
    
    const updateResult = await this.repository.update(where, data as any);
    
    if (updateResult.affected === 0) {
        return null;
    }

    return await this.repository.findOne({ where }) ?? null;
}

async delete(authUserId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const where: FindOptionsWhere<T> = { auth_user_id: authUserId } as unknown as FindOptionsWhere<T>;
    
    const result = await this.repository.delete(where);

    if ((result.affected ?? 0) === 0) {
      return { success: false, message: "User profile not found or already deleted" };
    }

    return { success: true, message: "User profile deleted successfully" };
  } catch (error) {
    console.error("Error deleting user profile:", error);
    return { success: false, message: "Failed to delete user profile" };
  }
}


  async findAll(): Promise<T[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<T | null> {
    const where: FindOptionsWhere<T> = { id } as unknown as FindOptionsWhere<T>;
    return await this.repository.findOne({ where }) ?? null;
  }

  async findByField(field: keyof T, value: string): Promise<T | null> {
    const where: FindOptionsWhere<T> = { [field]: value } as unknown as FindOptionsWhere<T>;
    return await this.repository.findOne({ where }) ?? null;
  }  
}