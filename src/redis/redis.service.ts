import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis;
  private readonly logger: Logger;

  constructor(@Inject() private readonly configService: ConfigService) {
    this.logger = new Logger(RedisService.name);
  }

  onModuleInit() {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL')!);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<'OK'>;
  async set<T>(key: string, value: T): Promise<'OK'>;

  async set<T>(key: string, value: T, ttl?: number): Promise<'OK' | undefined> {
    try {
      const raw = JSON.stringify(value);

      if (!ttl) {
        return this.redisClient.set(key, raw);
      }

      return this.redisClient.set(key, raw, 'EX', ttl);
    } catch (error) {
      this.logger.error(`Failed to set ${key}: ${error}`);
    }
  }

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisClient.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      this.logger.error(`Failed to get ${key}: ${error}`);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete ${key}: ${error}`);
    }
  }
}
