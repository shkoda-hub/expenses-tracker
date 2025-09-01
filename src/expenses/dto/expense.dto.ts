import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../shared/enums/currencies.enum';
import { Types } from 'mongoose';

@Exclude()
export class ExpenseDto {
  @Expose()
  @Transform(({ obj }) =>
    (obj as { _id: Types.ObjectId | string })._id.toString(),
  )
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  merchant: string;

  @Expose()
  @ApiProperty()
  amount: number;

  @Expose()
  @ApiProperty()
  currency: Currency;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  category: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose({ groups: ['internal'] })
  userId: string;
}
