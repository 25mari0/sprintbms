import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Token } from './Token';
import bcrypt from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false }) // ensure password is excluded by default
  password!: string;

  @Column({ default: false })
  mustChangePassword!: boolean; // flag is set to true, on worker creation or if owner resets the worker's pw

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[]; // array of Token entities

  @Column({ default: 'owner' })
  role!: 'owner' | 'worker';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPasswordChange!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
