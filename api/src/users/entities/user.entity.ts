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

  @Column()
  @Field(() => ID, { description: 'Username' })
  username: string;

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
  @JoinColumn()
  emailVerification: EmailVerification;
}
