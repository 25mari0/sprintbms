import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  token!: string; // hashed refresh token

  @Column({ type: 'text' }) // To store the salt
  salt!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.tokens)
  user!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  // Additional fields if needed, like:
  // @Column({ type: 'text', nullable: true })
  // deviceInfo?: string; // To store info about the device where the token was issued
  // to-do: fingerprinting
}
