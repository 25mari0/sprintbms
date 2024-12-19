import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from './Business';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer' })
  estimated_time_minutes!: number;

  @ManyToOne(() => Business, (business) => business.id)
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
