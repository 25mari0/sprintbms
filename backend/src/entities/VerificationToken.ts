import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  token!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @OneToOne(() => User, user => user.verificationToken)
  @JoinColumn()
  user!: User;
}