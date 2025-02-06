import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Token } from './Token';
import { Business } from './Business';
import { BookingWorker } from './BookingWorker';
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
  mustChangePassword!: boolean; // flag is set to true, on worker creation && if owner resets the worker's pw

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPasswordChange!: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[]; // array of Token entities

  @Column({ default: 'owner' })
  role!: 'owner' | 'worker';

  @ManyToOne(() => Business, (business) => business.users)
  @JoinColumn({ name: 'business_id' })
  business?: Business; // Nullable because not all users (like owners) might have a business linked yet

  @OneToMany(() => BookingWorker, (bookingWorker) => bookingWorker.worker)
  bookingWorkers!: BookingWorker[];

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
