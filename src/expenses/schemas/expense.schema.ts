import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from '../../shared/enums/categories.enum';
import { Currency } from '../../shared/enums/currencies.enum';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({ collection: 'expenses', timestamps: true })
export class Expense {
  @Prop({ type: String, required: true })
  merchant: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ enum: Currency, required: true })
  currency: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ enum: Category, index: true, required: true })
  category: Category;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
