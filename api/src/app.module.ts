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
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailVerification } from './users/entities/email-verification.entity';

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
          entities: [Goal, User, EmailVerification],
          synchronize: true,
        };
      },
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
      preview: true,
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
    // MailerModule.forRoot({
    //   transport: {
    //     host: 'localhost',
    //     port: 1025,
    //     ignoreTLS: true,
    //     secure: false,
    //     auth: {
    //       user: process.env.MAILDEV_INCOMING_USER,
    //       pass: process.env.MAILDEV_INCOMING_PASS,
    //     },
    //   },
    //   defaults: {
    //     from: '"No Reply" <no-reply@localhost>',
    //   },
    //   preview: true,
    //   template: {
    //     dir: process.cwd() + '/template/',
    //     adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
    //     options: {
    //       strict: true,
    //     },
    //   },
    // }),
    AuthModule,
    UsersModule,
  ],
  providers: [AppResolver],
  controllers: [AppController],
})
export class AppModule {}
