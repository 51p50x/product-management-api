import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { Product } from './products/entities/product.entity';
import { ProductsModule } from './products/products.module';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.database');

        if (!username || !password || !database) {
          throw new Error(
            'Database credentials (username, password, database) are required',
          );
        }

        return {
          type: 'postgres' as const,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username,
          password,
          database,
          entities: [Product],
          synchronize: configService.get<string>('nodeEnv') === 'development',
          logging: configService.get<string>('nodeEnv') === 'development',
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    ProductsModule,
    ReportsModule,
    SyncModule,
  ],
})
export class AppModule {}
