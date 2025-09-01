import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import { ExpensesModule } from './expenses/expenses.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsModule } from './analytics/analytics.module';
import { ClassifierModule } from './classifier/classifier.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    UsersModule,
    ExpensesModule,
    AnalyticsModule,
    ClassifierModule,
    AuthModule,
    ClassifierModule,
    RedisModule,

    ConfigModule.forRoot({
      envFilePath: '.env',
      validate,
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_ROOT_USERNAME')}:${configService.get('MONGO_ROOT_PASSWORD')}@${configService.get('MONGO_HOST', 'localhost')}:${configService.get('MONGO_PORT', 27017)}/${configService.get('MONGO_DATABASE')}?authSource=admin`,
      }),
    }),
  ],
})
export class AppModule {}
