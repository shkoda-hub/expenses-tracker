import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Category } from '../../shared/enums/categories.enum';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../shared/enums/currencies.enum';

export class CreateExpenseDTO {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @ApiProperty({ example: 'supermarket Ashan' })
  merchant: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 200 })
  amount: number;

  @IsEnum(Currency)
  @ApiProperty({ example: 'USD' })
  currency: Currency;

  @IsString()
  @Length(5, 50)
  @Transform(({ value }) => (value as string).trim())
  @ApiProperty({ example: 'milk and bread' })
  description: string;

  @IsEnum(Category)
  @IsOptional()
  @Transform(({ value }) => (value as string).trim())
  @ApiProperty({ example: 'products-and-supermarkets' })
  category: Category;
}
