import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @Transform(({ value }) => (value as string).toLowerCase().trim())
  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @IsString()
  @Length(8, 20)
  @Transform(({ value }) => (value as string).trim())
  @ApiProperty({ example: 'qwerty123' })
  password: string;

  @IsString()
  @Length(5, 15)
  @ApiProperty({ example: 'qwerty123' })
  userName: string;
}
