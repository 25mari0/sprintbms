import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity()
@Unique(['userId']) // prevents multiple refresh tokens for the same user
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  token!: string; // hashed refresh token

  @Column({ type: 'text' }) // To store the salt
  salt!: string;

  @Column()
  userId!: string;

  @Column({ type: 'text', nullable: false })
  ipAddress!: string; // To store the IP address where the token was issued

  @Column({ type: 'text', nullable: false })
  location!: string; // To store the location where the token was issued

  @ManyToOne(() => User, (user) => user.tokens)
  user!: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

}
