import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Token } from './Token';
import { Business } from './Business';
import { BookingWorker } from './BookingWorker';
import { VerificationToken } from './VerificationToken';
import bcrypt from 'bcryptjs';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false }) 
  password!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastPasswordChange!: Date;

  @OneToOne(() => VerificationToken, token => token.user, { cascade: true })
  verificationToken?: VerificationToken;

  @OneToMany(() => Token, (token) => token.user)
  tokens!: Token[];

  @Column({ default: 'owner' })
  role!: 'owner' | 'worker' | 'suspended';

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

  async getWorkerStatus(): Promise<string> {
    console.log('Worker status:', this.email, this.role, this.verificationToken, this.lastPasswordChange.getTime(), this.createdAt.getTime());
    if (this.role === 'suspended') {
      return 'suspended';
    } else if (this.verificationToken && this.lastPasswordChange.getTime() === this.createdAt.getTime()) {
      return 'unverified';
    } else if (this.verificationToken && this.lastPasswordChange.getTime() !== this.createdAt.getTime()) {
      return 'password-reset';
    } else {
      return 'active';
    }
  }

  async getOwnerStatus(): Promise<string> {
    if (this.role === 'suspended') {
      return 'suspended';
    } else if (this.verificationToken && this.lastPasswordChange.getTime() === this.createdAt.getTime()) {
      return 'unverified';
    } else {
      return 'active';
    }
  }
  

}
