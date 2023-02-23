import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Goal {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'The name of the goal' })
  @Column()
  name: string;
}
