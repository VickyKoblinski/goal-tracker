import { EmailVerification } from './email-verification.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  ValueTransformer,
} from 'typeorm';
import { hashPassword } from '@/auth/encrypt';
import { IsEmail } from 'class-validator';

const toBcryptHash: ValueTransformer = {
  from: (databasePassword: string) => databasePassword,
  to: (entityPassword: string) =>
    entityPassword && hashPassword(entityPassword),
};

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'User ID' })
  id: string;

  @Column({ unique: true })
  @Field(() => ID, { description: 'Username' })
  username: string;

  @Column({ unique: true })
  @IsEmail()
  @Field(() => String, { description: "User's email address" })
  email: string;

  @Column({
    transformer: toBcryptHash,
  })
  password: string;

  @OneToOne(
    () => EmailVerification,
    (emailVerification) => emailVerification.id,
    {
      eager: true,
      cascade: true,
    },
  )
  @Field(() => EmailVerification, { description: 'Email verification status' })
  @JoinColumn()
  emailVerification: EmailVerification;
}
