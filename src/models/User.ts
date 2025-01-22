import { Entity, Column } from 'typeorm';
import { BaseModel } from './BaseModel';

@Entity()
export class User extends BaseModel {
  @Column()
  name!: string;

  @Column()
  email!: string;
}