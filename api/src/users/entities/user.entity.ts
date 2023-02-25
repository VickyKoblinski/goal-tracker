import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID, { description: 'User ID' })
  id: number;

  @Column()
  @Field(() => ID, { description: 'Username' })
  username: string;

  @Column()
  password: string;
}
