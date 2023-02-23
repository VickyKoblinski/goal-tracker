import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int, { description: 'Example field (placeholder)' })
  @Column()
  exampleField: number;
}
