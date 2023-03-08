import { AppController } from './app.controller';
import { Goal } from './goals/entities/goal.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { GoalsModule } from './goals/goals.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppResolver } from './app.resolver';
import { User } from './users/entities/user.entity';
import { EmailVerification } from './users/entities/email-verification.entity';
import { SendGridService } from './sendgrid/sendgrid.service';
import { ResetPassword } from './users/entities/reset-password.entity';

@Module({
  imports: [
    GoalsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          entities: [Goal, User, EmailVerification, ResetPassword],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [AppResolver, SendGridService],
  controllers: [AppController],
})
export class AppModule {}
