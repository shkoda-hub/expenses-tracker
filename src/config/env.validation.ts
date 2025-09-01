import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  ACCESS_TOKEN_EXPIRATION_TIME: string;

  @IsString()
  REFRESH_TOKEN_EXPIRATION_TIME: string;

  @IsString()
  MONGO_ROOT_USERNAME: string;

  @IsString()
  MONGO_ROOT_PASSWORD: string;

  @IsString()
  MONGO_DATABASE: string;

  @IsString()
  MONGO_HOST: string;

  @IsNumber()
  MONGO_PORT: number;

  @IsString()
  REDIS_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
