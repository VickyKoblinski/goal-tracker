import { ObjectType, Field, ID } from '@nestjs/graphql';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@ObjectType()
@Entity()
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
