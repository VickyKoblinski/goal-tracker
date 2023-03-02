import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { IsDate } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { generateVerificationToken } from '@/auth/encrypt';

@ObjectType()
@Entity()
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'User ID' })
  @Expose()
  id: string;

  @Column({ default: false })
  @Field(() => Boolean, { description: 'Has email been verified?' })
  emailVerified: boolean;

  @Column()
  emailVerificationToken: string;

  @Column()
  @IsDate()
  issued: Date;

  @IsDate()
  @Column()
  @Exclude()
  expires: Date;

  @OneToOne(() => User, (user) => user.id)
  user: User;

  @BeforeInsert()
  async setDate() {
    this.issued = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // tomorrow
    this.expires = expires;
    this.emailVerificationToken = await generateVerificationToken();
  }
}
