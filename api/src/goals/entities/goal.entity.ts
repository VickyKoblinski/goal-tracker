import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Goal {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ description: 'The name of the goal' })
  @Column()
  name: string;

  @Field((type) => Goal, {
    description: 'The parent goal',
    nullable: true,
    defaultValue: null,
  })
  @ManyToOne(() => Goal, (goal) => goal.children)
  parent: Goal;

  @Column({ nullable: true })
  parentId: number;

  @Field((type) => [Goal], {
    description: 'Subtasks',
    nullable: true,
  })
  @OneToMany(() => Goal, (goal) => goal.parent)
  children: Goal[];
}
